import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addWeeks, 
  subWeeks,
  parseISO,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, BookOpen, Timer } from 'lucide-react';
import { ClassEvent, FocusLog, DayOfWeek } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarProps {
  classes: ClassEvent[];
  logs: FocusLog[];
}

type ViewType = 'month' | 'week';

export default function Calendar({ classes, logs }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');

  const next = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  const prev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  const days = useMemo(() => {
    const start = view === 'month' ? startOfWeek(startOfMonth(currentDate)) : startOfWeek(currentDate);
    const end = view === 'month' ? endOfWeek(endOfMonth(currentDate)) : endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate, view]);

  const getEventsForDay = (day: Date) => {
    const dayName = format(day, 'EEEE') as DayOfWeek;
    const dayClasses = classes.filter(c => c.day === dayName);
    const dayLogs = logs.filter(l => isSameDay(parseISO(l.timestamp), day));
    
    return {
      classes: dayClasses.sort((a, b) => a.start_time.localeCompare(b.start_time)),
      logs: dayLogs
    };
  };

  return (
    <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-medium tracking-tight">
              {format(currentDate, view === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === 'month' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === 'week' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Week
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={prev} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 hover:bg-zinc-100 rounded-lg text-xs font-medium text-zinc-600 transition-colors"
            >
              Today
            </button>
            <button onClick={next} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 border-b border-zinc-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-mono uppercase tracking-widest text-zinc-400 border-r border-zinc-100 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className={`grid grid-cols-7 ${view === 'month' ? 'auto-rows-fr' : 'min-h-full'}`}>
          {days.map((day, idx) => {
            const { classes: dayClasses, logs: dayLogs } = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDay = isToday(day);

            return (
              <div 
                key={idx} 
                className={`min-h-[120px] p-2 border-r border-b border-zinc-100 last:border-r-0 group transition-colors ${
                  !isCurrentMonth && view === 'month' ? 'bg-zinc-50/30' : 'bg-white'
                } ${isTodayDay ? 'bg-zinc-50/50' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono ${
                    isTodayDay ? 'w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center' : 
                    isCurrentMonth ? 'text-zinc-900' : 'text-zinc-300'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayClasses.map((cls, i) => (
                    <div key={i} className="px-1.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-[10px] flex items-center gap-1 truncate text-zinc-700">
                      <BookOpen size={10} className="shrink-0" />
                      <span className="font-medium truncate">{cls.name}</span>
                      <span className="text-zinc-400 shrink-0">{cls.start_time}</span>
                    </div>
                  ))}
                  {dayLogs.map((log, i) => (
                    <div key={i} className="px-1.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] flex items-center gap-1 truncate text-emerald-700">
                      <Timer size={10} className="shrink-0" />
                      <span className="font-medium truncate">{log.task}</span>
                      <span className="text-emerald-400 shrink-0">{log.duration}m</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
