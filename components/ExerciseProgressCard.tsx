

import React, { useState } from 'react';
import { ExerciseProgress } from '../types.ts';
import { LineChartIcon, VideoIcon, ChevronRightIcon } from './icons.tsx';
import LineProgressChart from './LineProgressChart.tsx';
import SparkLineChart from './SparkLineChart.tsx';

interface ExerciseProgressCardProps {
    progress: ExerciseProgress;
    onExerciseNameClick: (exerciseName: string) => void;
}

const ExerciseProgressCard: React.FC<ExerciseProgressCardProps> = ({ progress, onExerciseNameClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const evolutionColor = progress.evolution > 0 ? 'text-green-500' : progress.evolution < 0 ? 'text-red-500' : 'text-gray-500';
    const evolutionSign = progress.evolution > 0 ? '+' : '';
    const isSingleWorkout = progress.workoutCount <= 1;

    const handleToggleExpand = () => {
        if (!isSingleWorkout) {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg transition-all duration-300">
            <div className="w-full p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 w-full">
                     <button
                        title="Ver vídeo do exercício"
                        className="video-button group flex items-center gap-2 text-left"
                        onClick={() => onExerciseNameClick(progress.name)}
                    >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{progress.name}</h3>
                        <VideoIcon className="w-5 h-5 text-blue-500 shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"/>
                    </button>

                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm mt-1 text-gray-500 dark:text-gray-400">
                        {isSingleWorkout ? (
                            <span className="font-bold text-gray-500 dark:text-gray-400">Ponto de partida</span>
                        ) : (
                            <span>
                                <span className={`font-bold ${evolutionColor}`}>
                                    {evolutionSign}{progress.evolution}kg
                                </span> de progresso
                            </span>
                        )}
                        <span>
                            {progress.initialWeight}kg → {progress.currentWeight}kg
                        </span>
                         <span>
                            {progress.workoutCount} treino{progress.workoutCount > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    {!isSingleWorkout && <SparkLineChart data={progress.data} evolution={progress.evolution} />}
                    <button 
                        onClick={handleToggleExpand}
                        disabled={isSingleWorkout}
                        className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        aria-expanded={isExpanded}
                    >
                        <LineChartIcon className="w-4 h-4"/>
                        <span className="hidden sm:inline">Ver Gráfico</span>
                        <ChevronRightIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                </div>
            </div>
            
            {isExpanded && !isSingleWorkout && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Evolução da Carga Máxima (kg)</h4>
                    <LineProgressChart data={progress.data} />
                </div>
            )}
        </div>
    );
};

export default ExerciseProgressCard;