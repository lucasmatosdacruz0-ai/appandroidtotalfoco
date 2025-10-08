import React, { useState, useCallback, useEffect } from 'react';
import { FitnessLevel, TrainingLocation, WorkoutPlan, AppStep, Exercise, AppView, HistoricalWorkout, WorkoutSummaryData, UserProfile, Achievement, CustomWorkoutPlan, AiPreferences, User } from './types.ts';
import { addWorkoutToHistory, getUserProfile, getAiPreferences, saveAiPreferences, saveGeneratedWeeklyPlan } from './services/storageService.ts';
import StepIndicator from './components/StepIndicator.tsx';
import LevelSelector from './components/LevelSelector.tsx';
import LocationSelector from './components/LocationSelector.tsx';
import EquipmentSelector from './components/EquipmentSelector.tsx';
import DurationSelector from './components/DurationSelector.tsx';
import FocusSelector from './components/FocusSelector.tsx';
import WorkoutDisplay from './components/WorkoutDisplay.tsx';
import ActiveWorkout from './components/ActiveWorkout.tsx';
import Spinner from './components/Spinner.tsx';
import BottomNav from './components/BottomNav.tsx';
import HistoryPage from './pages/HistoryPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import PlannerPage from './pages/PlannerPage.tsx';
import WorkoutHomePage from './pages/WorkoutHomePage.tsx';
import WorkoutSummary from './components/WorkoutSummary.tsx';
import { FlameIcon, LogoIcon } from './components/icons.tsx';
import ExerciseChoiceModal from './components/ExerciseChoiceModal.tsx';
import AchievementUnlockedModal from './components/AchievementUnlockedModal.tsx';
import { WORKOUT_TIPS } from './constants.ts';

interface AppProps {
  onLogout: () => void;
  user: User;
}

const App: React.FC<AppProps> = ({ onLogout, user }) => {
  const [view, setView] = useState<AppView>(AppView.Workout);
  const [step, setStep] = useState<AppStep>(AppStep.Home);
  
  // AI Prefs
  const [aiPrefs, setAiPrefs] = useState<AiPreferences | null>(null);

  const [level, setLevel] = useState<FitnessLevel | null>(null);
  const [location, setLocation] = useState<TrainingLocation | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [duration, setDuration] = useState<number | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [workoutSummaryData, setWorkoutSummaryData] = useState<WorkoutSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [swappingExerciseId, setSwappingExerciseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0); // Used to trigger re-renders
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingTip, setLoadingTip] = useState<string>('');
  const [tipKey, setTipKey] = useState(0);

  // Flow control
  const [isWeeklyFlow, setIsWeeklyFlow] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // State for modals and gamification
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState<boolean>(false);
  const [exerciseChoices, setExerciseChoices] = useState<Exercise[]>([]);
  const [exerciseToReplace, setExerciseToReplace] = useState<Exercise | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState<boolean>(false);
  const [postWorkoutInfo, setPostWorkoutInfo] = useState<{ earnedXp: number; didLevelUp: boolean; newLevel: number | null }>({ earnedXp: 0, didLevelUp: false, newLevel: null });

  useEffect(() => {
    let tipInterval: number;
    if (step === AppStep.Generating) {
      tipInterval = window.setInterval(() => {
        setLoadingTip(prevTip => {
          const currentIndex = WORKOUT_TIPS.indexOf(prevTip);
          const nextIndex = (currentIndex + 1) % WORKOUT_TIPS.length;
          return WORKOUT_TIPS[nextIndex];
        });
        setTipKey(prevKey => prevKey + 1);
      }, 5000);
    }
    return () => clearInterval(tipInterval);
  }, [step]);
  
  useEffect(() => {
    const fetchInitialData = async () => {
        setIsInitialLoading(true);
        setError(null);
        try {
            let userProfile: UserProfile | null = null;
            // Retry logic to handle potential delay in profile creation after signup
            for (let i = 0; i < 5; i++) {
                userProfile = await getUserProfile(user.id);
                if (userProfile) break;
                await new Promise(resolve => setTimeout(resolve, 500 * (i + 1))); // Wait 0.5s, 1s, 1.5s, 2s, 2.5s
            }

            if (!userProfile) {
                throw new Error("Não foi possível carregar os dados do seu perfil. Tente sair e entrar novamente.");
            }

            setProfile(userProfile);
            const userAiPrefs = await getAiPreferences();
            setAiPrefs(userAiPrefs);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocorreu um erro desconhecido ao carregar seus dados.");
            }
        } finally {
            setIsInitialLoading(false);
        }
    };
    fetchInitialData();
  }, [historyKey, user.id]);

  const handleLevelSelect = (selectedLevel: FitnessLevel) => {
    setLevel(selectedLevel);
    if (isWeeklyFlow) {
        handleGenerateWeeklyPlan(selectedLevel);
    } else {
        setStep(AppStep.Location);
    }
  };

  const handleLocationSelect = (selectedLocation: TrainingLocation) => {
    setLocation(selectedLocation);
    setStep(AppStep.Duration);
  };

  const handleDurationSelect = (selectedDuration: number) => {
    setDuration(selectedDuration);
    setStep(AppStep.Focus);
  };

  const handleFocusSelect = (selectedFocus: string) => {
    setFocus(selectedFocus);
    setStep(AppStep.Equipment);
  };

  const handleEquipmentSelect = async (equipment: string[]) => {
    setSelectedEquipment(equipment);
    const randomIndex = Math.floor(Math.random() * WORKOUT_TIPS.length);
    setLoadingTip(WORKOUT_TIPS[randomIndex]);
    setTipKey(0);
    setStep(AppStep.Generating);
    
    if (level && location && duration && focus) {
        const prefsToSave: AiPreferences = { level, location, equipment, duration, focus };
        await saveAiPreferences(prefsToSave);
        setAiPrefs(prefsToSave);
    }
    
    await handleGenerateWorkout(equipment);
  };
  
  const handleGenerateWorkout = useCallback(async (finalEquipment: string[]) => {
    if (!level || !location || !duration || !focus) return;
    setIsLoading(true);
    setError(null);
    setWorkoutPlan(null);
    try {
      const { generateWorkoutPlan } = await import('./services/geminiService.ts');
      const plan = await generateWorkoutPlan({ level, location, equipment: finalEquipment, duration, focus });
      const planWithIds = { ...plan, exercises: plan.exercises.map(ex => ({ ...ex, id: crypto.randomUUID() })) };
      setWorkoutPlan(planWithIds);
      setStep(AppStep.WorkoutOverview);
    } catch (err) {
      console.error(err);
      setError('Desculpe, não foi possível gerar seu treino. Por favor, tente novamente.');
      setStep(AppStep.Error);
    } finally {
      setIsLoading(false);
    }
  }, [level, location, duration, focus]);
  
  const handleGenerateWeeklyPlan = async (selectedLevel: FitnessLevel) => {
      setStep(AppStep.Generating);
      setError(null);
      setIsLoading(true);
      try {
          const { generateWeeklyWorkoutPlan } = await import('./services/geminiService.ts');
          const weeklyPlan = await generateWeeklyWorkoutPlan({ level: selectedLevel });
          await saveGeneratedWeeklyPlan(weeklyPlan);
          setView(AppView.Planner);
          handleRestartWorkoutFlow();
      } catch (err) {
          console.error(err);
          setError('Desculpe, não foi possível gerar seu plano semanal. Por favor, tente novamente.');
          setStep(AppStep.Error);
      } finally {
          setIsLoading(false);
          setIsWeeklyFlow(false);
      }
  };

  const handleStartCustomWorkout = (plan: CustomWorkoutPlan) => {
    const activeWorkoutPlan: WorkoutPlan = {
        title: plan.name,
        focus: "Personalizado",
        duration: 0,
        exercises: plan.exercises.map(ex => ({ ...ex, description: "Execute com boa forma e controle." }))
    };
    setWorkoutPlan(activeWorkoutPlan);
    setStep(AppStep.WorkoutActive);
  };

  const handleAutoSwap = async (exerciseId: string) => {
    if (!workoutPlan || !level || !location || !duration || !focus) return;
    const exerciseToReplace = workoutPlan.exercises.find(ex => ex.id === exerciseId);
    if (!exerciseToReplace) return;

    setSwappingExerciseId(exerciseId);
    try {
      const { getAutoSwapExercise } = await import('./services/geminiService.ts');
      const newExercise = await getAutoSwapExercise({
        level, location, equipment: selectedEquipment, duration, focus, currentPlan: workoutPlan, exerciseToReplace,
      });
      setWorkoutPlan(prevPlan => {
        if (!prevPlan) return null;
        return { ...prevPlan, exercises: prevPlan.exercises.map(ex => ex.id === exerciseId ? { ...newExercise, id: crypto.randomUUID() } : ex) };
      });
    } catch (err) {
      console.error("Failed to auto-swap exercise:", err);
      alert("Não foi possível trocar o exercício. Tente novamente.");
    } finally {
      setSwappingExerciseId(null);
    }
  };

  const handleShowSimilarChoices = async (exerciseId: string) => {
    if (!workoutPlan || !level || !location || !duration || !focus) return;
    const foundExerciseToReplace = workoutPlan.exercises.find(ex => ex.id === exerciseId);
    if (!foundExerciseToReplace) return;

    setExerciseToReplace(foundExerciseToReplace);
    setSwappingExerciseId(exerciseId);
    try {
      const { getSimilarExerciseChoices } = await import('./services/geminiService.ts');
      const choices = await getSimilarExerciseChoices({
        level, location, equipment: selectedEquipment, duration, focus, currentPlan: workoutPlan, exerciseToReplace: foundExerciseToReplace,
      });
      setExerciseChoices(choices.map(c => ({...c, id: crypto.randomUUID()})));
      setIsChoiceModalOpen(true);
    } catch (err) {
      console.error("Failed to get similar choices:", err);
      alert("Não foi possível buscar alternativas. Tente novamente.");
    } finally {
      setSwappingExerciseId(null);
    }
  };
  
  const handleSelectAlternative = (newExercise: Exercise) => {
      if (!workoutPlan || !exerciseToReplace) return;
      setWorkoutPlan(prevPlan => {
          if (!prevPlan) return null;
          return { ...prevPlan, exercises: prevPlan.exercises.map(ex => ex.id === exerciseToReplace.id ? newExercise : ex) };
      });
      setIsChoiceModalOpen(false);
      setExerciseChoices([]);
      setExerciseToReplace(null);
  };
  
  const handleRestartWorkoutFlow = () => {
    setStep(AppStep.Home);
    setLevel(null);
    setLocation(null);
    setSelectedEquipment([]);
    setDuration(null);
    setFocus(null);
    setWorkoutPlan(null);
    setError(null);
    setIsLoading(false);
    setWorkoutSummaryData(null);
    setUnlockedAchievements([]);
    setPostWorkoutInfo({ earnedXp: 0, didLevelUp: false, newLevel: null });
    setIsWeeklyFlow(false);
  };
  
  const handleLogoClick = () => {
    setView(AppView.Workout);
    handleRestartWorkoutFlow();
  };

  const handleFinishWorkout = async (completedPlan: WorkoutPlan) => {
    const workoutDuration = completedPlan.duration > 0 ? completedPlan.duration : 45;
    const historicalWorkout: HistoricalWorkout = { ...completedPlan, duration: workoutDuration, completedAt: new Date().toISOString() };

    try {
        const { summary, gamificationResult } = await addWorkoutToHistory(historicalWorkout);
        setWorkoutSummaryData(summary);
        setPostWorkoutInfo({ earnedXp: gamificationResult.earnedXp, didLevelUp: gamificationResult.levelUp, newLevel: gamificationResult.updatedProfile.level });
        setProfile(gamificationResult.updatedProfile);
        if (gamificationResult.unlockedAchievements.length > 0) {
            setUnlockedAchievements(gamificationResult.unlockedAchievements);
        }
        setHistoryKey(prevKey => prevKey + 1);
        setStep(AppStep.WorkoutSummary);
    } catch (error) {
        console.error("Failed to save workout:", error);
        setError("Não foi possível salvar seu progresso. Verifique sua conexão e tente novamente.");
        setStep(AppStep.Error);
    }
  };

  const handleSummaryDone = () => {
    if (unlockedAchievements.length > 0) {
        setIsAchievementModalOpen(true);
    } else {
        handlePostAchievementFlow();
    }
  };

  const handlePostAchievementFlow = () => {
    handleRestartWorkoutFlow();
    setView(AppView.History);
  };
  
  const handleStartAiWorkoutFlow = () => {
    if (!aiPrefs) return;
    setIsWeeklyFlow(false);
    setLevel(aiPrefs.level);
    setLocation(aiPrefs.location);
    setSelectedEquipment(aiPrefs.equipment);
    setDuration(aiPrefs.duration);
    setFocus(aiPrefs.focus);
    setStep(AppStep.Level);
  };

  const handleStartAiWeeklyPlan = () => {
      if (!aiPrefs) return;
      setIsWeeklyFlow(true);
      setLevel(aiPrefs.level);
      setStep(AppStep.Level);
  };

  const handleStepClick = (stepToGo: AppStep) => {
    if (stepToGo >= AppStep.Level && stepToGo < step) {
      setStep(stepToGo);
    }
  };

  const getStreakFlame = () => {
      if (!profile) return null;
      const streak = profile.stats.currentStreak;
      let colorClass = 'text-gray-400';
      if (streak > 0) colorClass = 'text-orange-400';
      if (streak >= 5) colorClass = 'text-orange-500';
      if (streak >= 10) colorClass = 'text-red-500 animate-pulse';

      return (
          <div className={`flex items-center gap-1 font-bold ${colorClass}`}>
              <FlameIcon className="w-6 h-6" />
              <span>{streak}</span>
          </div>
      );
  }

  const renderWorkoutFlow = () => {
    switch (step) {
      case AppStep.Home:
        return <WorkoutHomePage onStartAiWorkout={handleStartAiWorkoutFlow} onStartCustomWorkout={handleStartCustomWorkout} onStartAiWeeklyPlan={handleStartAiWeeklyPlan} />;
      case AppStep.Level:
        return <LevelSelector onSelect={handleLevelSelect} currentLevel={level} />;
      case AppStep.Location:
        return <LocationSelector onSelect={handleLocationSelect} currentLocation={location} />;
      case AppStep.Duration:
        return <DurationSelector onSelect={handleDurationSelect} currentDuration={duration} />;
      case AppStep.Focus:
        return <FocusSelector onSelect={handleFocusSelect} currentFocus={focus} />;
      case AppStep.Equipment:
        return <EquipmentSelector location={location!} onSelect={handleEquipmentSelect} currentEquipment={selectedEquipment} />;
      case AppStep.Generating:
        return (
          <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-blue-900/50 z-50 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <div className="max-w-md w-full">
              <LogoIcon className="w-24 h-24 text-blue-500 mx-auto animate-subtle-pulse" />
              <h2 className="text-3xl font-extrabold text-gray-100 mt-6">{isWeeklyFlow ? 'Planejando sua semana...' : 'Gerando seu treino...'}</h2>
              <p className="text-gray-400 mt-2">{isWeeklyFlow ? 'Nossa IA está criando uma rotina completa e balanceada para você.' : 'Nossa IA está montando o treino perfeito para você.'}</p>
              
              <div className="mt-8 w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div className="h-2.5 rounded-full animate-loading-bar" style={{ backgroundImage: 'linear-gradient(90deg, transparent, #3B82F6, transparent)', backgroundSize: '200% 100%' }}></div>
              </div>

              <div className="mt-10 overflow-hidden">
                <div key={tipKey} className="p-5 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 animate-tip-slide-in">
                    <p className="text-gray-300 text-base italic flex items-center justify-center text-center min-h-[40px]">
                        <span className="font-bold not-italic text-blue-400 mr-2 shrink-0">Dica:</span> 
                        <span>{loadingTip}</span>
                    </p>
                </div>
              </div>
            </div>
          </div>
        );
      case AppStep.WorkoutOverview:
        return workoutPlan && <WorkoutDisplay plan={workoutPlan} onRestart={handleRestartWorkoutFlow} onStart={() => setStep(AppStep.WorkoutActive)} onAutoSwap={handleAutoSwap} onShowSimilarChoices={handleShowSimilarChoices} swappingExerciseId={swappingExerciseId} />;
      case AppStep.WorkoutActive:
        return workoutPlan && <ActiveWorkout plan={workoutPlan} onFinish={handleFinishWorkout} onAutoSwap={handleAutoSwap} onShowSimilarChoices={handleShowSimilarChoices} />;
      case AppStep.WorkoutSummary:
        return workoutSummaryData && <WorkoutSummary summary={workoutSummaryData} onDone={handleSummaryDone} postWorkoutInfo={postWorkoutInfo} />;
      case AppStep.Error:
        return (
           <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-red-600">Ocorreu um Erro</h2>
            <p className="text-gray-300 mt-2 mb-6">{error}</p>
            <button onClick={handleRestartWorkoutFlow} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300">Tentar Novamente</button>
          </div>
        );
      default:
        return null;
    }
  };

  const isSetupStep = step >= AppStep.Level && step <= AppStep.Equipment;
  
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Spinner />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-center p-4">
        <h2 className="text-2xl font-bold text-red-500">Ocorreu um Erro ao Carregar</h2>
        <p className="text-gray-300 mt-2 mb-6 max-w-md">{error}</p>
        <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setHistoryKey(k => k + 1)} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300">
                Tentar Novamente
            </button>
            <button onClick={onLogout} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors duration-300">
                Sair
            </button>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-center p-4">
         <h2 className="text-2xl font-bold text-yellow-500">Perfil não encontrado</h2>
         <p className="text-gray-300 mt-2 mb-6">Não foi possível encontrar dados do perfil. Tente sair e entrar novamente.</p>
         <button onClick={onLogout} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300">Sair</button>
      </div>
    );
  }

  return (
    <>
      {isChoiceModalOpen && (
        <ExerciseChoiceModal choices={exerciseChoices} onSelect={handleSelectAlternative} onClose={() => setIsChoiceModalOpen(false)} exerciseToReplaceName={exerciseToReplace?.name || ''} />
      )}
      {isAchievementModalOpen && (
        <AchievementUnlockedModal achievements={unlockedAchievements} onClose={() => { setIsAchievementModalOpen(false); handlePostAchievementFlow(); }} />
      )}
      {step === AppStep.Generating && renderWorkoutFlow()}
      <div className={`sm:flex min-h-screen text-gray-200 transition-colors duration-300 ${step === AppStep.Generating ? 'hidden' : ''}`}>
        <BottomNav currentView={view} setView={setView} onLogoClick={handleLogoClick} />
        
        <div className="flex-grow flex flex-col w-full">
            <div className="flex-grow p-4 sm:p-6 lg:p-8">
                <header className="w-full mb-8 flex justify-between items-center">
                    <button onClick={handleLogoClick} className="flex sm:hidden items-center justify-center gap-3">
                        <LogoIcon className="w-10 h-10 text-blue-500" />
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Foco<span className="text-blue-500">Total</span></h1>
                    </button>
                    <div className="flex-grow sm:hidden" />
                    <div className="flex items-center gap-4">
                        {getStreakFlame()}
                    </div>
                </header>
                
                <main className="w-full">
                    {view === AppView.Workout && isSetupStep && <StepIndicator currentStep={step} onStepClick={handleStepClick} />}
                    <div className="mt-8">
                        {view === AppView.Workout && step !== AppStep.Generating && renderWorkoutFlow()}
                        {view === AppView.Planner && <PlannerPage />}
                        {view === AppView.History && <HistoryPage key={`history-${historyKey}`} />}
                        {view === AppView.Profile && <ProfilePage key={`profile-${historyKey}`} onLogout={onLogout} initialProfile={profile} />}
                    </div>
                </main>
            </div>
            
            <footer className="w-full text-center p-4">
                <p className="text-gray-400 text-sm">
                    Powered by Gemini AI. Treinos gerados para fins de inspiração. Consulte um profissional.
                </p>
            </footer>
        </div>
      </div>
    </>
  );
};

export default App;