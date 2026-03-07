export interface ClassEvent {
  id?: number;
  name: string;
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  place: string;
  day: string;
}

export interface FreeSlot {
  start: string;
  end: string;
  duration: number; // minutes
  suggestion: string;
}

export interface FocusLog {
  id: number;
  task: string;
  understanding: number;
  duration: number;
  timestamp: string;
}

export interface Task {
  id: number;
  name: string;
  priority: 'high' | 'medium' | 'low';
  done: number;
  created_at: string;
}

export interface UserStats {
  streak: number;
  dailyGoal: number;
  activity: {
    date: string;
    dayName: string;
    count: number;
  }[];
  today: {
    totalMin: number;
    avgUnderstanding: number;
    sessions: number;
  };
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
