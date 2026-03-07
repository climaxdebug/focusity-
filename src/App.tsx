import React, { useState, useEffect } from 'react';
import { ClassEvent, FreeSlot, FocusLog, DayOfWeek, UserStats, Task } from './types';
import { findFreeSlots } from './utils/scheduler';
import Timer from './components/Timer';
import Schedule from './components/Schedule';
import Log from './components/Log';
import Calendar from './components/Calendar';
import Tasks from './components/Tasks';
import { BookOpen, Timer as TimerIcon, History, LayoutDashboard, Flame, TrendingUp, Target, Calendar as CalendarIcon, CheckSquare, Download, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timer' | 'history' | 'calendar' | 'tasks'>('dashboard');
  const [classes, setClasses] = useState<ClassEvent[]>([]);
  const [logs, setLogs] = useState<FocusLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [timerTask, setTimerTask] = useState("");

  useEffect(() => {
    fetchClasses();
    fetchLogs();
    fetchStats();
    fetchTasks();
  }, []);

  const fetchClasses = async () => {
    const res = await fetch('/api/classes');
    const data = await res.json();
    setClasses(data);
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/logs');
    const data = await res.json();
    setLogs(data);
  };

  const fetchStats = async () => {
    const res = await fetch('/api/stats');
    const data = await res.json();
    setStats(data);
  };

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const handleAddClass = async (newClass: Omit<ClassEvent, 'id'>) => {
    await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass)
    });
    fetchClasses();
  };

  const handleDeleteClass = async (id: number) => {
    await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    fetchClasses();
  };

  const handleAddTask = async (name: string, priority: 'high' | 'medium' | 'low') => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, priority })
    });
    fetchTasks();
  };

  const handleToggleTask = async (id: number, done: boolean) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done })
    });
    fetchTasks();
  };

  const handleDeleteTask = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const handleUpdateGoal = async () => {
    const newGoal = prompt("Set daily sessions goal:", stats?.dailyGoal.toString());
    if (newGoal && !isNaN(parseInt(newGoal))) {
      await fetch('/api/stats/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: parseInt(newGoal) })
      });
      fetchStats();
    }
  };

  const handleExportCSV = () => {
    window.location.href = '/api/export/csv';
  };

  const handleLogSession = async (task: string, understanding: number, duration: number) => {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, understanding, duration })
    });
    fetchLogs();
    fetchStats();
    setActiveTab('history');
  };

  const startSessionFromSuggestion = (suggestion: string) => {
    setTimerTask(suggestion);
    setActiveTab('timer');
  };

  const suggestTaskForSlot = (minutes: number) => {
    const pendingHigh = tasks.find(t => !t.done && t.priority === 'high');
    if (pendingHigh) return pendingHigh.name;
    const pending = tasks.find(t => !t.done);
    if (pending) return pending.name;
    if (minutes >= 90) return "Deep work / project";
    if (minutes >= 45) return "Study / practice";
    return "Quick review or notes";
  };

  const todayClasses = classes.filter(c => c.day === selectedDay);
  const rawFreeSlots = findFreeSlots(todayClasses);
  const freeSlots = rawFreeSlots.map(slot => ({
    ...slot,
    suggestion: suggestTaskForSlot(slot.duration)
  }));

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-black/5 flex flex-col items-center py-8 z-50">
        <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mb-12">
          <BookOpen size={24} />
        </div>
        
        <div className="flex-1 flex flex-col gap-8">
          <NavItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard size={22} />} 
          />
          <NavItem 
            active={activeTab === 'timer'} 
            onClick={() => setActiveTab('timer')} 
            icon={<TimerIcon size={22} />} 
          />
          <NavItem 
            active={activeTab === 'tasks'} 
            onClick={() => setActiveTab('tasks')} 
            icon={<CheckSquare size={22} />} 
          />
          <NavItem 
            active={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')} 
            icon={<CalendarIcon size={22} />} 
          />
          <NavItem 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<History size={22} />} 
          />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pl-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-12 py-16">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-12"
              >
                <div className="lg:col-span-2 space-y-12">
                  <header className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2">
                        <span>Nairobi, Kenya</span>
                        <span className="opacity-30">•</span>
                        <span>{new Intl.DateTimeFormat('en-US', { 
                          timeZone: 'Africa/Nairobi', 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          hour12: false 
                        }).format(new Date())}</span>
                      </div>
                      <h1 className="text-4xl font-medium tracking-tight mb-4">StudyFlow</h1>
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {days.map(day => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                              selectedDay === day 
                                ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' 
                                : 'bg-white text-zinc-500 hover:bg-zinc-100'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {stats && (
                      <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl border border-orange-100">
                        <Flame size={20} className="fill-orange-600" />
                        <span className="text-lg font-bold">{stats.streak} Day Streak</span>
                      </div>
                    )}
                    <button 
                      onClick={handleUpdateGoal}
                      className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <Settings size={20} />
                    </button>
                  </div>
                </header>

                <div className="grid grid-cols-3 gap-4">
                  <StatCard 
                    icon={<Target className={stats && stats.today.sessions >= stats.dailyGoal ? "text-emerald-500" : "text-blue-500"} size={20} />}
                    label="Sessions Today"
                    value={stats ? `${stats.today.sessions}/${stats.dailyGoal}` : "0/0"}
                  />
                  <StatCard 
                    icon={<TrendingUp className="text-emerald-500" size={20} />}
                    label="Avg Understanding"
                    value={`${stats?.today.avgUnderstanding.toFixed(1) || 0}/5`}
                  />
                  <StatCard 
                    icon={<TimerIcon className="text-purple-500" size={20} />}
                    label="Focused Time"
                    value={`${stats?.today.totalMin || 0}m`}
                  />
                </div>

                  <Schedule 
                    classes={todayClasses} 
                    freeSlots={freeSlots}
                    onAddClass={handleAddClass}
                    onDeleteClass={handleDeleteClass}
                    onStartSession={startSessionFromSuggestion}
                  />
                </div>

                <div className="space-y-8">
                  <div className="sticky top-16">
                    <Timer onComplete={handleLogSession} initialTask={timerTask} />
                    
                    {stats && (
                      <div className="mt-8 bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Weekly Activity</h4>
                        <button 
                          onClick={handleExportCSV}
                          className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                          <Download size={12} /> Export
                        </button>
                      </div>
                        <div className="flex justify-between items-end h-24 gap-2">
                          {stats.activity.map((day, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                              <div 
                                className={`w-full rounded-lg transition-all ${
                                  day.count >= stats.dailyGoal ? 'bg-emerald-500' : 
                                  day.count >= stats.dailyGoal - 1 && stats.dailyGoal > 1 ? 'bg-blue-500' : 
                                  day.count > 0 ? 'bg-amber-400' : 
                                  'bg-zinc-100'
                                }`}
                                style={{ height: `${Math.min(day.count * (100 / (stats.dailyGoal + 1)) + 15, 100)}%` }}
                              />
                              <span className="text-[10px] font-mono text-zinc-400 uppercase">{day.dayName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 bg-zinc-900 rounded-3xl p-8 text-white">
                      <h4 className="text-xs font-mono uppercase tracking-widest opacity-50 mb-4">Quick Stats</h4>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <div className="text-3xl font-light mb-1">{logs.length}</div>
                          <div className="text-[10px] uppercase tracking-wider opacity-50">Sessions</div>
                        </div>
                        <div>
                          <div className="text-3xl font-light mb-1">
                            {logs.reduce((acc, curr) => acc + curr.duration, 0)}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider opacity-50">Minutes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'timer' && (
              <motion.div
                key="timer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-xl mx-auto pt-12"
              >
                <Timer onComplete={handleLogSession} initialTask={timerTask} />
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                <Calendar classes={classes} logs={logs} />
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <Tasks 
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <Log logs={logs} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-2xl transition-all relative group ${
        active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
      }`}
    >
      {icon}
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-zinc-900 rounded-r-full"
        />
      )}
    </button>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-medium">{value}</div>
    </div>
  );
}
