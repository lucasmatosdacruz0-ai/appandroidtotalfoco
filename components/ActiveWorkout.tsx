import React, { useState, useMemo, useEffect } from 'react';
import { WorkoutPlan, Exercise, CompletedSet } from '../types.ts';
import { ReplaceIcon, ArrowRightIcon, ArrowLeftIcon, CheckSquareIcon, GitCompareArrowsIcon, PlayIcon, PlusCircleIcon } from './icons.tsx';
import RestTimer from './RestTimer.tsx';
import ExerciseDetailModal from './ExerciseDetailModal.tsx';
import { findLastPerformanceForExercise, getWorkoutHistory } from '../services/storageService.ts';
import { WORKOUT_TIPS } from '../constants.ts';

interface ActiveWorkoutProps {
  plan: WorkoutPlan;
  onFinish: (plan: WorkoutPlan) => void;
  onAutoSwap: (exerciseId: string) => void;
  onShowSimilarChoices: (exerciseId: string) => void;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ plan, onFinish, onAutoSwap, onShowSimilarChoices }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<{ [exerciseId: string]: CompletedSet[] }>({});
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [activeTimerSetIndex, setActiveTimerSetIndex] = useState<number | null>(null);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan>(plan);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [lastPerformance, setLastPerformance] = useState<{ sets: CompletedSet[] } | null>(null);
  
  useEffect(() => {
    setCurrentPlan(plan);
  }, [plan]);

  const swappingTip = useMemo(() => {
    if (!swappingId) return '';
    return WORKOUT_TIPS[Math.floor(Math.random() * WORKOUT_TIPS.length)];
  }, [swappingId]);

  const currentExercise = currentPlan.exercises[currentIndex];
  const totalExercises = currentPlan.exercises.length;
  const progressPercentage = ((currentIndex + 1) / totalExercises) * 100;
  
  const numSets = useMemo(() => {
    const setsMatch = currentExercise.sets.match(/\d+/);
    return setsMatch ? parseInt(setsMatch[0], 10) : 3;
  }, [currentExercise]);

  useEffect(() => {
    const fetchLastPerformance = async () => {
        const history = await getWorkoutHistory();
        setLastPerformance(findLastPerformanceForExercise(currentExercise.name, history));
    };
    
    fetchLastPerformance();

    const currentExerciseSets = completedSets[currentExercise.id] || [];
    if (currentExerciseSets.length < numSets) {
        const setsToAdd = numSets - currentExerciseSets.length;
        const newSets = Array.from({ length: setsToAdd }, () => ({ checked: false, weight: '', reps: '' }));
        setCompletedSets(prev => ({
            ...prev,
            [currentExercise.id]: [...currentExerciseSets, ...newSets]
        }));
    }
  }, [currentExercise, numSets]);

  const handleSetToggle = (exerciseId: string, setIndex: number) => {
    setCompletedSets(prev => {
      const newSets = [...(prev[exerciseId] || [])];
      newSets[setIndex].checked = !newSets[setIndex].checked;
      return { ...prev, [exerciseId]: newSets };
    });
  };

  const handleValueChange = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
     setCompletedSets(prev => {
        const newSets = [...(prev[exerciseId] || [])];
        if (newSets[setIndex]) {
            newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        }
        return { ...prev, [exerciseId]: newSets };
    });
  };
  
  const handleAutoSwapClick = async (exerciseId: string) => {
    setSwappingId(exerciseId);
    try {
        await onAutoSwap(exerciseId);
    } finally {
        setSwappingId(null);
    }
  };

  const handleShowSimilarClick = async (exerciseId: string) => {
      setSwappingId(exerciseId);
      try {
          await onShowSimilarChoices(exerciseId);
      } finally {
          setSwappingId(null);
      }
  }

  const goToNext = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const handleFinishWorkout = () => {
    const finalPlan: WorkoutPlan = {
      ...currentPlan,
      exercises: currentPlan.exercises.map(ex => ({
        ...ex,
        completedSets: completedSets[ex.id] || []
      }))
    };
    onFinish(finalPlan);
  };
  
  const handleTimerCompletion = (setIndex: number) => {
    const currentSets = completedSets[currentExercise.id] || [];
    if (currentSets[setIndex] && !currentSets[setIndex].checked) {
      handleSetToggle(currentExercise.id, setIndex);
    }
    setActiveTimerSetIndex(null);
  };

  const handleAddSet = () => {
    setCurrentPlan(prevPlan => {
        if (!prevPlan) return prevPlan;
        const updatedExercises = prevPlan.exercises.map((ex) => {
            if (ex.id === currentExercise.id) {
                const setsMatch = ex.sets.match(/\d+/);
                const currentNumSets = setsMatch ? parseInt(setsMatch[0], 10) : 0;
                const newNumSets = currentNumSets + 1;
                const newSetsString = ex.sets.replace(/\d+/, String(newNumSets));
                return { ...ex, sets: newSetsString };
            }
            return ex;
        });
        return { ...prevPlan, exercises: updatedExercises };
    });
  };

  const exerciseSets = completedSets[currentExercise.id] || [];

  return (
    <>
      {selectedExercise && <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />}
      {activeTimerSetIndex !== null && (
        <RestTimer onClose={() => setActiveTimerSetIndex(null)} onNextSet={() => handleTimerCompletion(activeTimerSetIndex)} />
      )}
      <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in max-w-2xl mx-auto">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-blue-700 dark:text-white">Progresso</span>
            <span className="text-sm font-medium text-blue-700 dark:text-white">{currentIndex + 1} de {totalExercises}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Exercício {currentIndex + 1}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
              <button onClick={() => setSelectedExercise(currentExercise)} className="text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{currentExercise.name}</h2>
              </button>
          </div>
          
           <div className="flex items-center justify-center gap-4 mt-2 text-sm min-h-[24px]">
              {swappingId === currentExercise.id ? (
                  <div className="flex items-center justify-center h-full gap-2 text-gray-500 dark:text-gray-400 italic">
                      <div className="w-5 h-5 border-2 border-blue-500 border-solid border-t-transparent rounded-full animate-spin shrink-0"></div>
                      <span>"{swappingTip}"</span>
                  </div>
              ) : (
                  <>
                      <button onClick={() => handleShowSimilarClick(currentExercise.id)} className="flex items-center gap-1.5 text-blue-500 hover:underline disabled:opacity-50" disabled={!!swappingId} >
                          <GitCompareArrowsIcon className="w-4 h-4" /> Escolher
                      </button>
                      <button onClick={() => handleAutoSwapClick(currentExercise.id)} className="flex items-center gap-1.5 text-gray-500 hover:underline disabled:opacity-50" disabled={!!swappingId} >
                          <ReplaceIcon className="w-4 h-4" /> Trocar
                      </button>
                  </>
              )}
          </div>
          
          <div className="flex items-center justify-center gap-3 mt-3 text-sm font-semibold">
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 px-3 py-1 rounded-full">{currentExercise.sets} séries</span>
              <span className="bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200 px-3 py-1 rounded-full">{currentExercise.reps} reps</span>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-4 text-center">Registre seu Progresso</h3>
          <div className="space-y-3 max-w-md mx-auto">
              {Array.from({ length: numSets }).map((_, i) => {
                  const lastSet = lastPerformance?.sets[i];
                  return (
                      <div key={i} className={`flex items-center gap-2 sm:gap-4 p-3 rounded-lg transition-colors border-2 ${(exerciseSets[i]?.checked) ? 'bg-green-900/50 border-green-500' : 'bg-gray-700 border-transparent'}`} >
                          <button onClick={() => handleSetToggle(currentExercise.id, i)} className='flex items-center'>
                              <CheckSquareIcon className={`w-7 h-7 ${(exerciseSets[i]?.checked) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                          </button>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 w-14 shrink-0">Série {i + 1}</span>
                          <div className='flex items-center gap-2 flex-grow'>
                            <input type="number" placeholder={lastSet?.weight || "kg"} value={exerciseSets[i]?.weight || ''} onChange={(e) => handleValueChange(currentExercise.id, i, 'weight', e.target.value)} className="w-full p-2 text-center bg-gray-800 border border-gray-500 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                            <span className='font-semibold text-gray-600 dark:text-gray-400 hidden sm:inline'>kg</span>
                          </div>
                           <div className='flex items-center gap-2 flex-grow'>
                            <input type="number" placeholder={lastSet?.reps || "reps"} value={exerciseSets[i]?.reps || ''} onChange={(e) => handleValueChange(currentExercise.id, i, 'reps', e.target.value)} className="w-full p-2 text-center bg-gray-800 border border-gray-500 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                             <span className='font-semibold text-gray-600 dark:text-gray-400 hidden sm:inline'>reps</span>
                          </div>
                           <button onClick={() => setActiveTimerSetIndex(i)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shrink-0" title="Iniciar cronômetro de descanso" aria-label="Iniciar cronômetro de descanso">
                              <PlayIcon className="w-5 h-5" />
                          </button>
                      </div>
                  )
              })}
          </div>
          <div className="max-w-md mx-auto mt-4">
              <button onClick={handleAddSet} className="w-full flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 border-2 border-dashed border-blue-400 dark:border-blue-500 transition-colors">
                  <PlusCircleIcon className="w-5 h-5"/>
                  Adicionar Série
              </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button onClick={goToPrev} disabled={currentIndex === 0} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Anterior
          </button>
          {currentIndex === totalExercises - 1 ? (
            <button onClick={handleFinishWorkout} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center shadow-lg">
              Finalizar Treino
              <CheckSquareIcon className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button onClick={goToNext} className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center shadow-lg">
              Próximo
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ActiveWorkout;