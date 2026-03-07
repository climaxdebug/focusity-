import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("studyflow.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    place TEXT,
    day TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS focus_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    understanding INTEGER,
    duration INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    streak INTEGER DEFAULT 0,
    last_focus_date TEXT,
    daily_goal INTEGER DEFAULT 2
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    done INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  INSERT OR IGNORE INTO user_stats (id, streak, daily_goal) VALUES (1, 0, 2);
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/classes", (req, res) => {
    const classes = db.prepare("SELECT * FROM classes ORDER BY start_time ASC").all();
    res.json(classes);
  });

  app.post("/api/classes", (req, res) => {
    const { name, start_time, end_time, place, day } = req.body;
    const info = db.prepare(
      "INSERT INTO classes (name, start_time, end_time, place, day) VALUES (?, ?, ?, ?, ?)"
    ).run(name, start_time, end_time, place, day);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/classes/:id", (req, res) => {
    db.prepare("DELETE FROM classes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY done ASC, priority DESC, created_at DESC").all();
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const { name, priority } = req.body;
    const info = db.prepare("INSERT INTO tasks (name, priority) VALUES (?, ?)").run(name, priority);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { done } = req.body;
    db.prepare("UPDATE tasks SET done = ? WHERE id = ?").run(done ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/logs", (req, res) => {
    const logs = db.prepare("SELECT * FROM focus_logs ORDER BY timestamp DESC LIMIT 50").all();
    res.json(logs);
  });

  app.get("/api/export/csv", (req, res) => {
    const logs = db.prepare("SELECT timestamp as Date, task as Task, understanding as Understanding, duration as Duration_min FROM focus_logs ORDER BY timestamp DESC").all();
    if (logs.length === 0) return res.status(404).send("No logs to export");
    
    const headers = Object.keys(logs[0]).join(",");
    const rows = logs.map(log => {
      return Object.values(log).map(val => {
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(",");
    }).join("\n");
    const csv = `${headers}\n${rows}`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=focus_progress.csv');
    res.send(csv);
  });

  app.post("/api/stats/goal", (req, res) => {
    const { goal } = req.body;
    db.prepare("UPDATE user_stats SET daily_goal = ? WHERE id = 1").run(goal);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    let stats = db.prepare("SELECT * FROM user_stats WHERE id = 1").get();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(new Date());

    // Reset streak if missed more than 1 day
    if (stats.last_focus_date && stats.last_focus_date !== todayStr) {
      const lastDate = new Date(stats.last_focus_date);
      const todayDate = new Date(todayStr);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays > 1) {
        db.prepare("UPDATE user_stats SET streak = 0 WHERE id = 1").run();
        stats = db.prepare("SELECT * FROM user_stats WHERE id = 1").get();
      }
    }
    
    // Get last 7 days of activity
    const activity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(date.getHours() + 3); // Rough Nairobi offset for day calculation
      date.setDate(date.getDate() - i);
      const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(date);
      
      const count = db.prepare(
        "SELECT COUNT(*) as count FROM focus_logs WHERE date(timestamp) = ?"
      ).get(dateStr).count;
      
      activity.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Africa/Nairobi' }),
        count
      });
    }

    // Today's stats
    const todayLogs = db.prepare(
      "SELECT duration, understanding FROM focus_logs WHERE date(timestamp) = ?"
    ).all(todayStr);

    const todayTotalMin = todayLogs.reduce((acc, curr) => acc + curr.duration, 0);
    const todayAvgUnderstanding = todayLogs.length > 0 
      ? todayLogs.reduce((acc, curr) => acc + curr.understanding, 0) / todayLogs.length 
      : 0;

    res.json({
      streak: stats.streak,
      dailyGoal: stats.daily_goal,
      activity,
      today: {
        totalMin: todayTotalMin,
        avgUnderstanding: todayAvgUnderstanding,
        sessions: todayLogs.length
      }
    });
  });

  app.post("/api/logs", (req, res) => {
    const { task, understanding, duration } = req.body;
    
    // Log the session
    db.prepare(
      "INSERT INTO focus_logs (task, understanding, duration) VALUES (?, ?, ?)"
    ).run(task, understanding, duration);

    // Update Streak
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(new Date());
    const stats = db.prepare("SELECT * FROM user_stats WHERE id = 1").get();
    
    let newStreak = stats.streak;
    if (stats.last_focus_date === todayStr) {
      // Already focused today, streak stays same
    } else if (!stats.last_focus_date) {
      newStreak = 1;
    } else {
      const lastDate = new Date(stats.last_focus_date);
      const todayDate = new Date(todayStr);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    db.prepare(
      "UPDATE user_stats SET streak = ?, last_focus_date = ? WHERE id = 1"
    ).run(newStreak, todayStr);

    res.json({ success: true, streak: newStreak });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
