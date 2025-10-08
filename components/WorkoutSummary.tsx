import React from 'react';
import { WorkoutSummaryData, ExerciseComparison } from '../types.ts';
import { CheckSquareIcon, FlameIcon, TimerIcon, TrophyIcon, StarIcon } from './icons.tsx';

interface WorkoutSummaryProps {
    summary: WorkoutSummaryData;
    onDone: () => void;
    postWorkoutInfo: {
        earnedXp: number;
        didLevelUp: boolean;
        newLevel: number | null;
    }
}

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center text-center">
        <div className="text-blue-500">{icon}</div>
        <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
);

const ComparisonCard: React.FC<{ comparison: ExerciseComparison }> = ({ comparison }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center">
                {comparison.name}
                {comparison.isNewPR && <span className="ml-2 text-xl animate-bounce">🚀</span>}
            </h4>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-semibold text-gray-600 dark:text-gray-300">Neste Treino:</p>
                    <p className="text-gray-800 dark:text-gray-200"><span className="font-bold">{comparison.current.maxWeight} kg</span> (max)</p>
                </div>
                <div>
                     <p className="font-semibold text-gray-600 dark:text-gray-300">Última Vez:</p>
                     {comparison.last ? (
                        <p className={`text-gray-800 dark:text-gray-200 ${comparison.isNewPR ? 'text-green-500 dark:text-green-400 font-bold' : ''}`}>
                            <span className="font-bold">{comparison.last.maxWeight} kg</span> (max)
                        </p>
                     ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">Primeira vez</p>
                     )}
                </div>
            </div>
        </div>
    );
};


const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ summary, onDone, postWorkoutInfo }) => {
    return (
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in max-w-2xl mx-auto">
            <div className="text-center">
                {postWorkoutInfo.didLevelUp && (
                    <div className="mb-4 text-center animate-fade-in">
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                           LEVEL UP!
                        </h2>
                         <p className="text-lg text-gray-500 dark:text-gray-300">Você alcançou o Nível {postWorkoutInfo.newLevel}!</p>
                    </div>
                )}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white">Resumo do Treino</h2>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{summary.title}</p>
                <p className="font-bold text-green-500 mt-2">Parabéns por concluir seu treino!</p>
            </div>

            <div className="my-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-gray-200 dark:border-gray-700 py-6">
                <StatItem icon={<TrophyIcon className="w-8 h-8"/>} label="Volume Total" value={`${summary.totalVolume} kg`} />
                <StatItem icon={<TimerIcon className="w-8 h-8"/>} label="Duração" value={`${summary.duration} min`} />
                <StatItem icon={<StarIcon className="w-8 h-8"/>} label="XP Ganho" value={`+${postWorkoutInfo.earnedXp}`} />
            </div>

            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Seu Desempenho</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {summary.exercises.map(ex => (
                        <ComparisonCard key={ex.name} comparison={ex} />
                    ))}
                </div>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={onDone}
                    className="w-full sm:w-auto bg-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center mx-auto shadow-lg hover:shadow-xl"
                >
                    <CheckSquareIcon className="w-5 h-5 mr-2" />
                    Concluído
                </button>
            </div>
        </div>
    );
};

export default WorkoutSummary;