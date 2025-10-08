import React from 'react';
import { Exercise } from '../types.ts';
import { XIcon, CheckSquareIcon, InfoIcon } from './icons.tsx';

interface ExerciseChoiceModalProps {
  choices: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
  exerciseToReplaceName: string;
}

const ExerciseChoiceModal: React.FC<ExerciseChoiceModalProps> = ({ choices, onSelect, onClose, exerciseToReplaceName }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-4 p-6 relative animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
          <XIcon className="w-6 h-6" />
        </button>

        <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2 pr-8">Escolha uma Alternativa</h2>
            <p className="text-gray-500 dark:text-gray-400">Alternativas para: <span className="font-semibold text-gray-700 dark:text-gray-300">{exerciseToReplaceName}</span></p>
        </div>

        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {choices.length > 0 ? choices.map((choice) => (
            <div key={choice.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{choice.name}</h3>
                    <div className="flex items-center gap-2 text-sm font-semibold shrink-0">
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 px-2 py-1 rounded-full">{choice.sets} séries</span>
                        <span className="bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200 px-2 py-1 rounded-full">{choice.reps} reps</span>
                    </div>
                </div>
                 <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm flex items-start gap-2">
                    <InfoIcon className="w-4 h-4 mt-0.5 shrink-0 text-gray-400 dark:text-gray-500" />
                    <span>{choice.description}</span>
                </p>
                <div className="mt-3 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-600 pt-3">
                   <button 
                        onClick={() => onSelect(choice)} 
                        className="flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors py-2 px-4 rounded-md"
                    >
                      <CheckSquareIcon className="w-4 h-4" /> Escolher
                    </button>
                </div>
            </div>
          )) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma alternativa encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseChoiceModal;