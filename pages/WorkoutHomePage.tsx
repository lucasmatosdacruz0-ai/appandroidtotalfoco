import React, { useState, useEffect } from 'react';
import { CustomWorkoutPlan } from '../types.ts';
import { getCustomWorkouts, getWeeklySchedule } from '../services/storageService.ts';
import { PlayIcon, ZapIcon, CalendarIcon } from '../components/icons.tsx';
import Spinner from '../components/Spinner.tsx';

interface WorkoutHomePageProps {
  onStartAiWorkout: () => void;
  onStartCustomWorkout: (plan: CustomWorkoutPlan) => void;
  onStartAiWeeklyPlan: () => void;
}

const WorkoutHomePage: React.FC<WorkoutHomePageProps> = ({ onStartAiWorkout, onStartCustomWorkout, onStartAiWeeklyPlan }) => {
  const [todaysPlan, setTodaysPlan] = useState<CustomWorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTodaysPlan = async () => {
        setIsLoading(true);
        const [customWorkouts, schedule] = await Promise.all([
            getCustomWorkouts(),
            getWeeklySchedule()
        ]);
        
        const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        const todaysPlanId = schedule[today];
        
        if (todaysPlanId) {
            const plan = customWorkouts.find(p => p.id === todaysPlanId);
            setTodaysPlan(plan || null);
        }
        setIsLoading(false);
    };
    fetchTodaysPlan();
  }, []);

  const isRestDay = todaysPlan && (todaysPlan.name.toLowerCase().includes('descanso') || todaysPlan.exercises.length === 0);

  return (
    <div className="animate-fade-in text-center max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white">Pronto para Treinar?</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Escolha como você quer suar a camisa hoje.</p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl shadow-xl flex flex-col items-center text-center transition-all duration-300 min-h-[280px] ${todaysPlan ? 'bg-gray-800 border-2 border-blue-500' : 'bg-gray-800/50'}`}>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Treino do Dia</h2>
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center"><Spinner /></div>
          ) : todaysPlan ? (
            isRestDay ? (
              <div className="mt-4 flex flex-col items-center flex-grow justify-between w-full">
                <div>
                  <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{todaysPlan.name}</p>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Aproveite para recarregar as energias. O descanso é fundamental para o progresso!</p>
                </div>
                <button disabled className="mt-6 bg-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center shadow-lg w-full cursor-not-allowed">
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Descansar
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center flex-grow justify-between w-full">
                <div>
                  <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{todaysPlan.name}</p>
                  <ul className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {todaysPlan.exercises.slice(0, 3).map(ex => <li key={ex.id}>{ex.name}</li>)}
                    {todaysPlan.exercises.length > 3 && <li>...e mais!</li>}
                  </ul>
                </div>
                <button onClick={() => onStartCustomWorkout(todaysPlan)} className="mt-6 bg-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center shadow-lg hover:shadow-xl w-full">
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Começar Treino
                </button>
              </div>
            )
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center flex-grow">
              <p className="text-gray-500 dark:text-gray-400">Nenhum treino agendado para hoje.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Vá para o Planejador para montar sua semana!</p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-gray-800 rounded-2xl shadow-xl flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gerar Treino Diário</h2>
           <div className="mt-4 flex flex-col items-center flex-grow justify-between w-full">
              <p className="text-gray-500 dark:text-gray-400">Deixe nossa IA criar um treino exclusivo para você em segundos, baseado no seu nível e equipamentos.</p>
              <button onClick={onStartAiWorkout} className="mt-6 bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center shadow-lg hover:shadow-xl w-full">
                <ZapIcon className="w-5 h-5 mr-2" />
                Gerar Treino
              </button>
          </div>
        </div>
        
        <div className="p-6 bg-gray-800 rounded-2xl shadow-xl flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Planejar Semana com IA</h2>
           <div className="mt-4 flex flex-col items-center flex-grow justify-between w-full">
              <p className="text-gray-500 dark:text-gray-400">Deixe a IA montar uma rotina semanal completa e balanceada para você, que será salva no seu planejador.</p>
              <button onClick={onStartAiWeeklyPlan} className="mt-6 bg-purple-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-600 transition-colors duration-300 flex items-center justify-center shadow-lg hover:shadow-xl w-full">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Planejar Semana
              </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkoutHomePage;