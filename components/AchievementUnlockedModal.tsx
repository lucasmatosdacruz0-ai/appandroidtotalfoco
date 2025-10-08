import React from 'react';
import { Achievement } from '../types.ts';
import { XIcon, CheckSquareIcon } from './icons.tsx';

interface AchievementUnlockedModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({ achievements, onClose }) => {
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
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Conquista Desbloqueada!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Você é incrível! Veja o que você ganhou:</p>
        </div>

        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {achievements.map((ach) => (
            <div key={ach.id} className="p-4 rounded-xl text-center transition-opacity border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 flex items-center gap-4">
              <ach.icon className="w-12 h-12 mx-auto text-yellow-500 shrink-0" />
              <div className="text-left">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{ach.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
            <button
                onClick={onClose}
                className="w-full sm:w-auto bg-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center mx-auto shadow-lg hover:shadow-xl"
            >
                <CheckSquareIcon className="w-5 h-5 mr-2" />
                Continuar
            </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementUnlockedModal;