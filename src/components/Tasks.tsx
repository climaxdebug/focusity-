import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface TasksProps {
  tasks: Task[];
  onAddTask: (name: string, priority: 'high' | 'medium' | 'low') => void;
  onToggleTask: (id: number, done: boolean) => void;
  onDeleteTask: (id: number) => void;
}

export default function Tasks({ tasks, onAddTask, onToggleTask, onDeleteTask }: TasksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddTask(name, priority);
    setName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight">Tasks</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {isAdding && (
        <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Task Description</label>
              <input
                required
                autoFocus
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 outline-none focus:border-zinc-900"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Priority</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      priority === p 
                        ? 'bg-zinc-900 text-white border-zinc-900' 
                        : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-medium">Save Task</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 bg-white border border-zinc-200 rounded-xl font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {tasks.length === 0 && !isAdding && (
          <div className="py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-100 rounded-3xl">
            No tasks yet. Add one to get started!
          </div>
        )}

        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
              task.done ? 'bg-zinc-50 border-zinc-100 opacity-60' : 'bg-white border-black/5 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onToggleTask(task.id, !task.done)}
                className={`transition-colors ${task.done ? 'text-emerald-500' : 'text-zinc-300 hover:text-zinc-600'}`}
              >
                {task.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              <div>
                <div className={`text-sm font-medium ${task.done ? 'line-through text-zinc-400' : ''}`}>
                  {task.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    task.priority === 'high' ? 'bg-red-50 text-red-600' :
                    task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
