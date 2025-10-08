


import React from 'react';
import { DumbbellIcon, ZapIcon, TargetIcon, StarIcon } from './icons.tsx';

interface FocusSelectorProps {
  onSelect: (focus: string) => void;
  currentFocus: string | null;
}

const focusOptions: {
    focus: string;
    description: string;
    // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace error.
    icon: React.ReactElement;
    recommended?: boolean;
}[] = [
    { focus: 'Corpo Inteiro', description: 'Trabalha todos os principais grupos musculares.', icon: <ZapIcon className="w-10 h-10 mb-2"/>, recommended: true },
    { focus: 'Superiores', description: 'Foco em peito, costas, ombros e braços.', icon: <DumbbellIcon className="w-10 h-10 mb-2"/> },
    { focus: 'Pernas e Glúteos', description: 'Foco em pernas e glúteos.', icon: <TargetIcon className="w-10 h-10 mb-2"/> },
    { focus: 'Peito e Tríceps', description: 'Treino de empurrar focado em peitoral e tríceps.', icon: <DumbbellIcon className="w-10 h-10 mb-2"/> },
    { focus: 'Costas e Bíceps', description: 'Treino de puxar focado em costas e bíceps.', icon: <DumbbellIcon className="w-10 h-10 mb-2"/> },
    { focus: 'Pernas e Ombros', description: 'Combinação para força e definição muscular.', icon: <TargetIcon className="w-10 h-10 mb-2"/> }
];

const FocusSelector: React.FC<FocusSelectorProps> = ({ onSelect, currentFocus }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Qual o foco do seu treino?</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">Vamos direcionar os exercícios para o seu objetivo de hoje.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {focusOptions.map(({ focus, icon, description, recommended }) => {
          const isSelected = focus === currentFocus;
          return (
            <button
              key={focus}
              onClick={() => onSelect(focus)}
              className={`relative group p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 border-2 transition-all duration-300 ease-in-out flex flex-col items-center justify-start text-center ${
                isSelected ? 'border-blue-500 scale-105' : 'border-transparent hover:border-blue-500 dark:hover:border-blue-500'
              }`}
            >
              {recommended && (
                <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 z-10">
                    <span className="flex items-center px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg ring-2 ring-transparent dark:ring-gray-800">
                      <StarIcon className="w-3.5 h-3.5 mr-1" />
                      Recomendado
                    </span>
                </div>
              )}
              <div className="text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors h-12">{icon}</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-2">{focus}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm flex-grow min-h-[50px]">{description}</p>
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default FocusSelector;