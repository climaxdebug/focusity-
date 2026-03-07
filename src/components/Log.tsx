import React from 'react';
import { Calendar, Star } from 'lucide-react';
import { FocusLog } from '../types';

interface LogProps {
  logs: FocusLog[];
}

export default function Log({ logs }: LogProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight">Focus History</h2>
        <div className="text-xs font-mono text-zinc-400">{logs.length} sessions total</div>
      </div>

      <div className="space-y-3">
        {logs.length === 0 && (
          <div className="py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-100 rounded-3xl">
            No focus sessions logged yet.
          </div>
        )}

        {logs.map((log) => (
          <div key={log.id} className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                <Calendar size={18} />
              </div>
              <div>
                <div className="text-sm font-medium">{log.task}</div>
                <div className="text-xs text-zinc-400">
                  {new Date(log.timestamp).toLocaleDateString()} • {log.duration} min
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < log.understanding ? "fill-zinc-900 text-zinc-900" : "text-zinc-200"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
