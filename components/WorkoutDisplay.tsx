import React, { useState, useMemo } from 'react';
import { WorkoutPlan, Exercise } from '../types.ts';
import { RefreshCwIcon, TargetIcon, TimerIcon, PlayIcon, InfoIcon, GitCompareArrowsIcon, ReplaceIcon, DumbbellIcon } from './icons.tsx';
import ExerciseDetailModal from './ExerciseDetailModal.tsx';
import { WORKOUT_TIPS } from '../constants.ts';

interface WorkoutDisplayProps {
  plan: WorkoutPlan;
  onRestart: () => void;
  onStart: () => void;
  onAutoSwap: (exerciseId: string) => void;
  onShowSimilarChoices: (exerciseId: string) => void;
  swappingExerciseId: string | null;
}

const WorkoutDisplay: React.FC<WorkoutDisplayProps> = ({ plan, onRestart, onStart, onAutoSwap, onShowSimilarChoices, swappingExerciseId }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const swappingTip = useMemo(() => {
    if (!swappingExerciseId) return '';
    return WORKOUT_TIPS[Math.floor(Math.random() * WORKOUT_TIPS.length)];
  }, [swappingExerciseId]);

  return (
    <>
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
      <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in max-w-2xl mx-auto">
        <div className="text-center border-b border-gray-700 pb-6 mb-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{plan.title}</h2>
          <div className="flex items-center justify-center gap-6 mt-4 text-gray-300">
              <div className="flex items-center gap-2">
                  <TimerIcon className="w-5 h-5 text-blue-500"/>
                  <span className="font-semibold">{plan.duration} min</span>
              </div>
              <div className="flex items-center gap-2">
                  <TargetIcon className="w-5 h-5 text-blue-500"/>
                  <span className="font-semibold">{plan.focus}</span>
              </div>
          </div>
        </div>

        <div className="space-y-4">
          {plan.exercises.map((exercise: Exercise, index: number) => (
            <div key={exercise.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                  <button onClick={() => setSelectedExercise(exercise)} className="text-left">
                    <h3 className="text-lg font-bold text-gray-100 hover:text-blue-400 transition-colors">{index + 1}. {exercise.name}</h3>
                  </button>
                  <div className="flex items-center gap-4 text-sm font-semibold shrink-0">
                      <span className="bg-blue-900/70 text-blue-200 px-2 py-1 rounded-full">{exercise.sets} séries</span>
                      <span className="bg-green-900/70 text-green-200 px-2 py-1 rounded-full">{exercise.reps} reps</span>
                  </div>
              </div>
               <p className="text-gray-300 mt-2 text-sm flex items-start gap-2">
                  <InfoIcon className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
                  <span>{exercise.description}</span>
              </p>
              {exercise.equipmentUsed && exercise.equipmentUsed.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600 flex items-center gap-2 flex-wrap">
                      <DumbbellIcon className="w-4 h-4 text-gray-500 shrink-0" />
                      {exercise.equipmentUsed.map(eq => (
                          <span key={eq} className="text-xs font-semibold bg-gray-600 text-gray-200 px-2 py-1 rounded-full">
                              {eq}
                          </span>
                      ))}
                  </div>
              )}
              <div className="mt-3 flex items-center justify-end gap-3 border-t border-gray-600 pt-3 min-h-[56px]">
                {swappingExerciseId === exercise.id ? (
                  <div className="flex items-center justify-center w-full px-2 text-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-500 border-solid border-t-transparent rounded-full animate-spin shrink-0"></div>
                    <p className="text-sm text-gray-400 italic">
                      <span className="font-bold not-italic text-gray-300">Dica:</span> {swappingTip}
                    </p>
                  </div>
                ) : (
                  <>
                    <button onClick={() => onShowSimilarChoices(exercise.id)} className="flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-md hover:bg-blue-900/40">
                      <GitCompareArrowsIcon className="w-4 h-4" /> Escolher
                    </button>
                    <button onClick={() => onAutoSwap(exercise.id)} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-300 transition-colors p-2 rounded-md hover:bg-gray-600/60">
                      <ReplaceIcon className="w-4 h-4" /> Trocar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center space-y-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto bg-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center mx-auto shadow-lg hover:shadow-xl"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Iniciar Treino
          </button>
           <button
            onClick={onRestart}
            className="text-gray-400 font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center mx-auto"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Gerar Novo Treino
          </button>
        </div>
      </div>
    </>
  );
};

export default WorkoutDisplay;