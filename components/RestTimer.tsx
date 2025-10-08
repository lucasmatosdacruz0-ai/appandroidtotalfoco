import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, RefreshCwIcon, XIcon, CheckCircle2Icon, ArrowRightIcon } from './icons.tsx';

interface RestTimerProps {
  onClose: () => void;
  onNextSet: () => void;
}

const presetTimes = [
  { label: '10s', seconds: 10 },
  { label: '30s', seconds: 30 },
  { label: '1 min', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '3 min', seconds: 180 },
  { label: '4 min', seconds: 240 },
];

const RestTimer: React.FC<RestTimerProps> = ({ onClose, onNextSet }) => {
  const [minutes, setMinutes] = useState('1');
  const [seconds, setSeconds] = useState('30');
  const [initialTime, setInitialTime] = useState(90);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initializeAudio = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  const playSound = () => {
    initializeAudio();
    const audioContext = audioContextRef.current!;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A6 note
    
    oscillator.start(audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
    oscillator.stop(audioContext.currentTime + 1);
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (timeLeft <= 0 && isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsActive(false);
      playSound();
      setIsFinished(true);
    }
  }, [timeLeft, isActive, onClose]);

  const handleStartCustom = () => {
    const totalSeconds = (parseInt(minutes, 10) || 0) * 60 + (parseInt(seconds, 10) || 0);
    if (totalSeconds <= 0) return;
    startTimer(totalSeconds);
  };

  const startTimer = (totalSeconds: number) => {
    initializeAudio();
    setIsFinished(false);
    setInitialTime(totalSeconds);
    setTimeLeft(totalSeconds);
    setIsActive(true);
  }

  const handleToggle = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
      setIsActive(false);
      setTimeLeft(initialTime);
      setIsFinished(false);
  };

  const isRunning = isActive || timeLeft < initialTime;

  const progress = (timeLeft / initialTime) * 100;
  const strokeDashoffset = 283 * (1 - progress / 100);

  const formatTime = (timeInSeconds: number) => {
      const mins = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
      const secs = (timeInSeconds % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      if (parseInt(val) < 60 || val === '') setMinutes(val);
  };

  const handleSecondChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      if (parseInt(val) < 60 || val === '') setSeconds(val);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 relative text-center" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
              <XIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Cronômetro de Descanso</h2>
          
          {isFinished ? (
            <div className="flex flex-col items-center justify-center animate-fade-in py-8">
              <CheckCircle2Icon className="w-20 h-20 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Descanso Concluído!</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">Prepare-se para a próxima.</p>
              <button
                  onClick={onNextSet}
                  className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                  Próxima Série <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="relative w-48 h-48 mx-auto mb-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-gray-200 dark:text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                      <circle
                          className="text-blue-500"
                          strokeWidth="10"
                          strokeDasharray="283"
                          strokeDashoffset={isRunning ? strokeDashoffset : 283}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="45"
                          cx="50"
                          cy="50"
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s linear' }}
                      />
                  </svg>
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <div className="text-5xl font-bold text-gray-800 dark:text-gray-100">
                          {formatTime(timeLeft)}
                      </div>
                  </div>
              </div>
              
              {isRunning ? (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button onClick={handleToggle} className="p-4 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                        {isActive ? <PauseIcon className="w-8 h-8 text-gray-800 dark:text-gray-100" /> : <PlayIcon className="w-8 h-8 text-gray-800 dark:text-gray-100" />}
                    </button>
                    <button onClick={resetTimer} className="p-4 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                        <RefreshCwIcon className="w-8 h-8 text-gray-800 dark:text-gray-100" />
                    </button>
                </div>
              ) : (
                <div className="mt-4 animate-fade-in">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Opções Rápidas</h3>
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {presetTimes.map(preset => (
                      <button 
                        key={preset.label}
                        onClick={() => startTimer(preset.seconds)}
                        className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold py-2 rounded-lg hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Ou insira um tempo:</h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <input type="tel" value={minutes} onChange={handleMinuteChange} className="w-20 p-2 text-2xl font-bold bg-gray-100 dark:bg-gray-700 text-center rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <span className="text-2xl font-bold text-gray-400">:</span>
                        <input type="tel" value={seconds} onChange={handleSecondChange} className="w-20 p-2 text-2xl font-bold bg-gray-100 dark:bg-gray-700 text-center rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={handleStartCustom} className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        <PlayIcon className="w-6 h-6" /> Iniciar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default RestTimer;