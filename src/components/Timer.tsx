import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimerProps {
  initialTask?: string;
  onComplete: (task: string, understanding: number, duration: number) => void;
}

export default function Timer({ initialTask, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [understanding, setUnderstanding] = useState(3);
  const [task, setTask] = useState(initialTask || "");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setIsFinished(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    const durationMinutes = Math.round((25 * 60 - timeLeft) / 60) || 1;
    onComplete(task || "Study Session", understanding, durationMinutes);
    resetTimer();
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 flex flex-col items-center">
      <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">Focus Session</div>
      
      {!isFinished ? (
        <>
          <input
            type="text"
            placeholder="What are you working on?"
            className="w-full text-center text-xl font-medium mb-8 bg-transparent border-b border-zinc-100 focus:border-zinc-900 outline-none pb-2"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="#f4f4f5"
                strokeWidth="8"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="#18181b"
                strokeWidth="8"
                strokeDasharray="754"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: 754 * (1 - timeLeft / (25 * 60)) }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <div className="text-6xl font-mono font-light tracking-tighter">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={toggleTimer}
              className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center"
        >
          <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
          <h3 className="text-2xl font-medium mb-2">Session Complete!</h3>
          <p className="text-zinc-500 mb-8 text-sm">How well did you understand the material?</p>
          
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => setUnderstanding(val)}
                className={`w-12 h-12 rounded-xl border transition-all ${
                  understanding === val 
                    ? 'bg-zinc-900 text-white border-zinc-900' 
                    : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-medium hover:bg-zinc-800 transition-colors"
          >
            Log Session
          </button>
        </motion.div>
      )}
    </div>
  );
}
