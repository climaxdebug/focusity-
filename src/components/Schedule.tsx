import React, { useState } from 'react';
import { Plus, Trash2, Clock, MapPin, Sparkles } from 'lucide-react';
import { ClassEvent, FreeSlot } from '../types';

interface ScheduleProps {
  classes: ClassEvent[];
  freeSlots: FreeSlot[];
  onAddClass: (c: Omit<ClassEvent, 'id'>) => void;
  onDeleteClass: (id: number) => void;
  onStartSession: (suggestion: string) => void;
}

export default function Schedule({ classes, freeSlots, onAddClass, onDeleteClass, onStartSession }: ScheduleProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newClass, setNewClass] = useState<Omit<ClassEvent, 'id'>>({
    name: '',
    start_time: '09:00',
    end_time: '10:00',
    place: '',
    day: 'Monday'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClass(newClass);
    setIsAdding(false);
    setNewClass({ name: '', start_time: '09:00', end_time: '10:00', place: '', day: 'Monday' });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight">Today's Schedule</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus size={16} /> Add Class
        </button>
      </div>

      {isAdding && (
        <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Class Name</label>
              <input
                required
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 outline-none focus:border-zinc-900"
                value={newClass.name}
                onChange={e => setNewClass({ ...newClass, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Start Time</label>
              <input
                type="time"
                required
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 outline-none focus:border-zinc-900"
                value={newClass.start_time}
                onChange={e => setNewClass({ ...newClass, start_time: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">End Time</label>
              <input
                type="time"
                required
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 outline-none focus:border-zinc-900"
                value={newClass.end_time}
                onChange={e => setNewClass({ ...newClass, end_time: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Location</label>
              <input
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 outline-none focus:border-zinc-900"
                value={newClass.place}
                onChange={e => setNewClass({ ...newClass, place: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-medium">Save Class</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 bg-white border border-zinc-200 rounded-xl font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {classes.length === 0 && !isAdding && (
          <div className="py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-100 rounded-3xl">
            No classes scheduled for today.
          </div>
        )}
        
        {classes.map((cls) => (
          <div key={cls.id} className="group relative bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium mb-2">{cls.name}</h3>
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {cls.start_time} - {cls.end_time}</span>
                  {cls.place && <span className="flex items-center gap-1.5"><MapPin size={14} /> {cls.place}</span>}
                </div>
              </div>
              <button
                onClick={() => cls.id && onDeleteClass(cls.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-6">Free Slots & Suggestions</h3>
        <div className="grid gap-4">
          {freeSlots.map((slot, idx) => (
            <div key={idx} className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">{slot.suggestion}</div>
                  <div className="text-xs text-zinc-500">{slot.start} - {slot.end} ({slot.duration} min)</div>
                </div>
              </div>
              <button
                onClick={() => onStartSession(slot.suggestion)}
                className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium hover:border-zinc-900 transition-colors"
              >
                Start Session
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
