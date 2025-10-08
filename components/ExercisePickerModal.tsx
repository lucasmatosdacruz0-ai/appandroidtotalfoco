import React, { useState } from 'react';
import { XIcon } from './icons.tsx';
import { EXERCISE_NAMES } from '../services/videoMapping.ts';

interface ExercisePickerModalProps {
    onClose: () => void;
    onSelect: (exerciseName: string) => void;
}

const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({ onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredExercises = EXERCISE_NAMES.filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in"
          onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 p-6 flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 pr-8">Selecionar Exercício</h2>
                
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar exercício..."
                    className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md mb-4"
                    autoFocus
                />

                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                    <ul className="space-y-2">
                        {filteredExercises.map(name => (
                            <li key={name}>
                                <button
                                    onClick={() => onSelect(name)}
                                    className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-gray-800 dark:text-gray-200 transition-colors"
                                >
                                    {name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ExercisePickerModal;