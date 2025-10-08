import React, { useState } from 'react';
import { CustomWorkoutPlan, CustomExercise } from '../types.ts';
import { XIcon, PlusCircleIcon, Trash2Icon } from './icons.tsx';
import ExercisePickerModal from './ExercisePickerModal.tsx';

interface CustomWorkoutModalProps {
    plan: CustomWorkoutPlan | null;
    onClose: () => void;
    onSave: (plan: CustomWorkoutPlan) => void;
}

const CustomWorkoutModal: React.FC<CustomWorkoutModalProps> = ({ plan, onClose, onSave }) => {
    const [name, setName] = useState(plan?.name || '');
    const [exercises, setExercises] = useState<CustomExercise[]>(plan?.exercises || []);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleAddExercise = (exerciseName: string) => {
        const newExercise: CustomExercise = {
            id: crypto.randomUUID(),
            name: exerciseName,
            sets: '3',
            reps: '10',
        };
        setExercises([...exercises, newExercise]);
        setIsPickerOpen(false);
    };

    const handleRemoveExercise = (id: string) => {
        setExercises(exercises.filter(ex => ex.id !== id));
    };

    const handleExerciseChange = (id: string, field: 'sets' | 'reps', value: string) => {
        setExercises(exercises.map(ex => 
            ex.id === id ? { ...ex, [field]: value } : ex
        ));
    };

    const handleSaveChanges = () => {
        if (!name.trim()) {
            alert("Por favor, dê um nome ao seu plano de treino.");
            return;
        }
        const workoutPlan: CustomWorkoutPlan = {
            id: plan?.id || crypto.randomUUID(),
            name: name.trim(),
            exercises,
            created_at: plan?.created_at || new Date().toISOString(),
        };
        onSave(workoutPlan);
    };

    return (
        <>
            {isPickerOpen && (
                <ExercisePickerModal 
                    onClose={() => setIsPickerOpen(false)}
                    onSelect={handleAddExercise}
                />
            )}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
              onClick={onClose}
            >
              <div 
                className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 p-6 relative animate-slide-up flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
                  <XIcon className="w-6 h-6" />
                </button>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4 pr-8">
                    {plan ? 'Editar Plano de Treino' : 'Criar Novo Plano de Treino'}
                </h2>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 max-h-[70vh]">
                    <div className="mb-4">
                        <label htmlFor="plan-name" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Nome do Plano</label>
                        <input 
                            type="text"
                            id="plan-name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: Treino A - Peito e Tríceps"
                            className="mt-1 w-full p-2 bg-gray-900 border border-gray-600 rounded-md"
                        />
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Exercícios</h3>
                        <div className="space-y-3">
                            {exercises.map(ex => (
                                <div key={ex.id} className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg flex items-center gap-4">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 flex-grow">{ex.name}</p>
                                    <input type="text" value={ex.sets} onChange={e => handleExerciseChange(ex.id, 'sets', e.target.value)} className="w-16 p-1 text-center bg-gray-800 border border-gray-500 rounded-md" placeholder="Séries" />
                                    <span className="text-gray-500 dark:text-gray-400">x</span>
                                    <input type="text" value={ex.reps} onChange={e => handleExerciseChange(ex.id, 'reps', e.target.value)} className="w-20 p-1 text-center bg-gray-800 border border-gray-500 rounded-md" placeholder="Reps" />
                                    <button onClick={() => handleRemoveExercise(ex.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
                                        <Trash2Icon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                         <button
                            onClick={() => setIsPickerOpen(true)}
                            className="mt-4 w-full flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 border-2 border-dashed border-blue-400 dark:border-blue-500 transition-colors"
                        >
                            <PlusCircleIcon className="w-5 h-5"/>
                            Adicionar Exercício
                        </button>
                    </div>
                </div>
                
                <div className="mt-6 text-right border-t border-gray-200 dark:border-gray-700 pt-4">
                     <button
                        onClick={handleSaveChanges}
                        className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Salvar Plano
                    </button>
                </div>
              </div>
            </div>
        </>
    );
};

export default CustomWorkoutModal;