import React, { useState, useMemo, useEffect } from 'react';
import { getWorkoutHistory, calculateAllExercisesProgress } from '../services/storageService.ts';
import { HistoricalWorkout, ExerciseProgress, Exercise } from '../types.ts';
import ExerciseProgressCard from '../components/ExerciseProgressCard.tsx';
import { LineChartIcon } from '../components/icons.tsx';
import ExerciseDetailModal from '../components/ExerciseDetailModal.tsx';
import Spinner from '../components/Spinner.tsx';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoricalWorkout[] | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const data = await getWorkoutHistory();
      setHistory(data);
      setIsLoading(false);
    };
    fetchHistory();
  }, []);

  const exerciseProgress: ExerciseProgress[] = useMemo(() => {
    if (!history) return [];
    return calculateAllExercisesProgress(history);
  }, [history]);
  
  const handleExerciseClick = (exerciseName: string) => {
      if (!history) return;
      for (const workout of [...history].reverse()) {
          const ex = workout.exercises.find(e => e.name === exerciseName);
          if (ex) {
              setSelectedExercise(ex);
              return;
          }
      }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Seu histórico está vazio</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Complete seu primeiro treino para começar a acompanhar seu progresso!</p>
      </div>
    );
  }

  if (exerciseProgress.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl animate-fade-in">
         <LineChartIcon className="w-16 h-16 mx-auto text-blue-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Ainda não há progresso para mostrar</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Registre os pesos durante seus treinos para que seu progresso de força apareça aqui.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
        {selectedExercise && <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />}
        <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Progresso por Exercício</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sua evolução, ordenada dos exercícios que você mais progrediu para os que menos progrediu.</p>
        </div>

        <div className="space-y-4">
            {exerciseProgress.map(progress => (
                <ExerciseProgressCard key={progress.name} progress={progress} onExerciseNameClick={handleExerciseClick} />
            ))}
        </div>
    </div>
  );
};

export default HistoryPage;