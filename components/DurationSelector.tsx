import React from 'react';
import { ClockIcon } from './icons.tsx';

interface DurationSelectorProps {
  onSelect: (duration: number) => void;
  currentDuration: number | null;
}

const durations = [30, 45, 60];

const DurationSelector: React.FC<DurationSelectorProps> = ({ onSelect, currentDuration }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Quanto tempo você tem?</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">Escolha a duração e nós montaremos o treino ideal.</p>
      <div className="flex justify-center gap-4 sm:gap-6">
        {durations.map(duration => {
          const isSelected = duration === currentDuration;
          return (
            <button
              key={duration}
              onClick={() => onSelect(duration)}
              className={`group w-32 h-32 sm:w-40 sm:h-40 p-4 bg-gray-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 border-2 transition-all duration-300 ease-in-out flex flex-col items-center justify-center ${
                isSelected ? 'border-blue-500 scale-105' : 'border-transparent hover:border-blue-500 dark:hover:border-blue-500'
              }`}
            >
              <ClockIcon className="w-10 h-10 text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">{duration}</span>
              <span className="text-gray-500 dark:text-gray-400">minutos</span>
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default DurationSelector;