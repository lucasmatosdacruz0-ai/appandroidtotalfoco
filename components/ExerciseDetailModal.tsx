import React from 'react';
import { Exercise } from '../types.ts';
import { XIcon, InfoIcon, VideoIcon } from './icons.tsx';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
}

const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise, onClose }) => {

  const handleSearchOnYouTube = () => {
    const query = encodeURIComponent(exercise.name);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4 pr-8">{exercise.name}</h2>

        <div className="mb-6">
            <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-blue-500" />
                Demonstração em Vídeo
            </h3>
            <button
              onClick={handleSearchOnYouTube}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg"
              aria-label={`Pesquisar demonstração do exercício ${exercise.name} no YouTube`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"/>
              </svg>
              Pesquisar no YouTube
            </button>
        </div>

        <div>
            <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <InfoIcon className="w-5 h-5 text-blue-500" />
                Instruções
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-base">
                {exercise.description}
            </p>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailModal;