import React from 'react';
import { FitnessLevel } from '../types.ts';
import { AwardIcon, WeightIcon, DumbbellIcon } from './icons.tsx';

interface LevelSelectorProps {
  onSelect: (level: FitnessLevel) => void;
  currentLevel: FitnessLevel | null;
}

const levels = [
  { level: FitnessLevel.Beginner, icon: <DumbbellIcon className="w-10 h-10 mb-2" />, description: "Começando agora ou voltando aos treinos." },
  { level: FitnessLevel.Intermediate, icon: <WeightIcon className="w-10 h-10 mb-2" />, description: "Já treino com consistência e conheço os exercícios." },
  { level: FitnessLevel.Advanced, icon: <AwardIcon className="w-10 h-10 mb-2" />, description: "Treino há anos e busco alta performance." },
];

const LevelSelector: React.FC<LevelSelectorProps> = ({ onSelect, currentLevel }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Qual é o seu nível?</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">Isso nos ajuda a personalizar a intensidade do seu treino.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {levels.map(({ level, icon, description }) => {
          const isSelected = level === currentLevel;
          return (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className={`group p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 border-2 transition-all duration-300 ease-in-out flex flex-col items-center text-center ${
                isSelected ? 'border-blue-500 scale-105' : 'border-transparent hover:border-blue-500 dark:hover:border-blue-500'
              }`}
            >
              <div className="text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{icon}</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-2">{level}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{description}</p>
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default LevelSelector;