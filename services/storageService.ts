import { supabase, isSupabaseConfigured } from './supabaseClient.ts';
import { HistoricalWorkout, UserProfile, CompletedSet, Exercise, WorkoutSummaryData, ExerciseComparison, ExercisePerformance, PersonalRecords, CustomWorkoutPlan, WeeklySchedule, AiPreferences, AiGeneratedWeeklyPlan, DayOfWeek, ExerciseProgress, ExerciseDataPoint } from './types.ts';
import { processWorkoutCompletion, GamificationResult } from './gamificationService.ts';

// --- Helper Functions ---

const getUserId = async (): Promise<string> => {
    if (!isSupabaseConfigured) throw new Error("Supabase não está configurado.");
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
        throw new Error(`Erro de autenticação: ${error.message}`);
    }
    
    if (!session?.user) {
        throw new Error("Usuário não autenticado. Por favor, faça login.");
    }
    
    return session.user.id;
};


// --- Profile Management ---

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured) return null;
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(); // Use maybeSingle to gracefully handle 0 rows

        if (error) {
            console.error("Erro ao buscar perfil do usuário:", error.message);
            // Don't throw, return null to allow retry logic in the UI to work
            return null;
        }
        
        return data as UserProfile | null;
    } catch (err) {
        console.error("Exceção em getUserProfile:", err);
        // Also return null here for unexpected exceptions
        return null;
    }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
    if (!isSupabaseConfigured) return;
    const userId = await getUserId();
    if (userId !== profile.id) throw new Error("Não autorizado a salvar este perfil.");

    const { error } = await supabase.from('profiles').update({
        name: profile.name,
        avatar_url: profile.avatar_url,
        instagram: profile.instagram,
        whatsapp: profile.whatsapp,
        gallery: profile.gallery,
    }).eq('id', userId);
    
    if (error) throw new Error(`Erro ao salvar o perfil: ${error.message}`);
};

// --- AI Preferences ---

export const getAiPreferences = async (): Promise<AiPreferences> => {
    if (!isSupabaseConfigured) return { level: null, location: null, equipment: [], duration: null, focus: null };
    const userId = await getUserId();
    const { data, error } = await supabase
        .from('profiles')
        .select('ai_prefs')
        .eq('id', userId)
        .single();
    
    if (error) throw new Error(`Erro ao buscar preferências de IA: ${error.message}`);
    return data.ai_prefs || { level: null, location: null, equipment: [], duration: null, focus: null };
};

export const saveAiPreferences = async (prefs: AiPreferences): Promise<void> => {
    if (!isSupabaseConfigured) return;
    const userId = await getUserId();
    const { error } = await supabase.from('profiles').update({ ai_prefs: prefs }).eq('id', userId);
    if (error) throw new Error(`Erro ao salvar preferências de IA: ${error.message}`);
};

// --- Workout History & Summary ---

export const getWorkoutHistory = async (): Promise<HistoricalWorkout[]> => {
    if (!isSupabaseConfigured) return [];
    try {
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });

        if (error) throw new Error(`Erro ao buscar histórico de treinos: ${error.message}`);
        
        // Map snake_case (completed_at) from DB to camelCase (completedAt) for the app
        const mappedData = data.map(workout => {
            const { completed_at, ...rest } = workout;
            return {
                ...rest,
                completedAt: completed_at,
            };
        });

        return mappedData as HistoricalWorkout[];
    } catch (err) {
        // If user is not logged in, return empty history gracefully
        if (err instanceof Error && err.message.includes("Usuário não autenticado")) {
            return [];
        }
        throw err;
    }
};

/**
 * Calcula o resumo do treino finalizado, como volume total e novos recordes pessoais.
 * Esta função opera localmente com base nos dados inseridos e não utiliza IA.
 */
const calculateWorkoutSummary = (completedWorkout: HistoricalWorkout, history: HistoricalWorkout[]): WorkoutSummaryData => {
    let totalVolume = 0;
    const exercises: ExerciseComparison[] = [];

    completedWorkout.exercises.forEach(exercise => {
        let exerciseVolume = 0;
        let maxWeight = 0;

        if (exercise.completedSets) {
            exercise.completedSets.forEach(set => {
                if (set.checked) {
                    const weight = parseFloat(set.weight) || 0;
                    const reps = parseInt(set.reps || exercise.reps, 10) || 0;
                    exerciseVolume += weight * reps;
                    if (weight > maxWeight) {
                        maxWeight = weight;
                    }
                }
            });
        }
        totalVolume += exerciseVolume;
        
        const lastPerformance = findLastPerformanceForExercise(exercise.name, history);
        let lastMaxWeight = 0;
        if (lastPerformance) {
             lastPerformance.sets.forEach(set => {
                const weight = parseFloat(set.weight) || 0;
                if (weight > lastMaxWeight) {
                    lastMaxWeight = weight;
                }
            });
        }

        exercises.push({
            name: exercise.name,
            current: { maxWeight: maxWeight, totalVolume: exerciseVolume },
            last: lastPerformance ? { maxWeight: lastMaxWeight, totalVolume: 0 } : null,
            isNewPR: maxWeight > lastMaxWeight,
        });
    });

    return {
        title: completedWorkout.title,
        totalVolume: Math.round(totalVolume),
        duration: completedWorkout.duration,
        exercises: exercises,
    };
};

export const addWorkoutToHistory = async (completedWorkout: HistoricalWorkout): Promise<{ summary: WorkoutSummaryData; gamificationResult: GamificationResult }> => {
    if (!isSupabaseConfigured) throw new Error("Supabase não configurado.");
    
    const userId = await getUserId();
    
    const [currentProfile, history, currentPRs] = await Promise.all([
        getUserProfile(userId),
        getWorkoutHistory(),
        getPersonalRecords()
    ]);

    if (!currentProfile) throw new Error("Perfil do usuário não encontrado.");
    
    const summary = calculateWorkoutSummary(completedWorkout, history);
    
    const newHistory = [completedWorkout, ...history];

    const totalWorkouts = newHistory.length;
    const totalVolume = (currentProfile.stats.totalVolume || 0) + summary.totalVolume;
    const timeSpent = (currentProfile.stats.timeSpent || 0) + summary.duration;

    let currentStreak;
    if (history.length > 0) {
        const lastWorkoutDate = new Date(history[0].completedAt);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isLastWorkoutToday = lastWorkoutDate.toDateString() === today.toDateString();
        const isLastWorkoutYesterday = lastWorkoutDate.toDateString() === yesterday.toDateString();
        
        if (isLastWorkoutYesterday) {
            currentStreak = (currentProfile.stats.currentStreak || 0) + 1;
        } else if (!isLastWorkoutToday) {
            currentStreak = 1; 
        } else {
            currentStreak = currentProfile.stats.currentStreak || 1;
        }
    } else {
        currentStreak = 1;
    }

    const newStats: UserProfile['stats'] = { totalWorkouts, totalVolume, timeSpent, currentStreak };

    const gamificationResult = processWorkoutCompletion(completedWorkout, summary, currentProfile, newHistory, currentPRs, newStats);

    // Map camelCase (completedAt) from app to snake_case (completed_at) for the DB
    const { completedAt, ...restOfWorkout } = completedWorkout;
    const workoutDataToInsert = {
        ...restOfWorkout,
        user_id: userId,
        completed_at: completedAt,
    };

    const { error: workoutError } = await supabase.from('workouts').insert(workoutDataToInsert);
    if (workoutError) throw new Error(`Erro ao salvar o treino: ${workoutError.message}`);

    const { error: profileError } = await supabase.from('profiles').update({
        level: gamificationResult.updatedProfile.level,
        xp: gamificationResult.updatedProfile.xp,
        xpToNextLevel: gamificationResult.updatedProfile.xpToNextLevel,
        stats: gamificationResult.updatedProfile.stats,
    }).eq('id', userId);
    if (profileError) throw new Error(`Erro ao atualizar o perfil: ${profileError.message}`);
    
    const { error: prError } = await supabase.from('personal_records').upsert({
        user_id: userId,
        records: gamificationResult.newPRs,
    }, { onConflict: 'user_id' });
    if (prError) throw new Error(`Erro ao salvar recordes pessoais: ${prError.message}`);

    return { summary, gamificationResult };
};

// --- Personal Records ---

export const getPersonalRecords = async (): Promise<PersonalRecords> => {
    if (!isSupabaseConfigured) return {};
    try {
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('personal_records')
            .select('records')
            .eq('user_id', userId)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') return {}; // No records yet is not an error
            throw error;
        }

        return data.records || {};
    } catch (err) {
        if (err instanceof Error && err.message.includes("Usuário não autenticado")) {
            return {};
        }
        throw err;
    }
};

// --- Progress Calculation ---

export const findLastPerformanceForExercise = (exerciseName: string, history: HistoricalWorkout[]): { sets: CompletedSet[] } | null => {
    for (const workout of history) {
        const exercise = workout.exercises.find(e => e.name === exerciseName && e.completedSets && e.completedSets.length > 0);
        if (exercise && exercise.completedSets) {
            return { sets: exercise.completedSets };
        }
    }
    return null;
};

export const calculateAllExercisesProgress = (history: HistoricalWorkout[]): ExerciseProgress[] => {
    const progressMap: { [name: string]: ExerciseDataPoint[] } = {};

    for (let i = history.length - 1; i >= 0; i--) {
        const workout = history[i];
        workout.exercises.forEach(exercise => {
            if (exercise.completedSets && exercise.completedSets.some(s => s.checked && parseFloat(s.weight) > 0)) {
                let maxWeight = 0;
                exercise.completedSets.forEach(set => {
                    if (set.checked) {
                        const weight = parseFloat(set.weight) || 0;
                        if (weight > maxWeight) {
                            maxWeight = weight;
                        }
                    }
                });
                
                if (maxWeight > 0) {
                    if (!progressMap[exercise.name]) {
                        progressMap[exercise.name] = [];
                    }
                    progressMap[exercise.name].push({
                        date: workout.completedAt,
                        maxWeight: maxWeight,
                    });
                }
            }
        });
    }

    const result: ExerciseProgress[] = Object.entries(progressMap)
        .map(([name, data]) => {
            if (data.length === 0) return null;
            const initialWeight = data[0].maxWeight;
            const currentWeight = data[data.length - 1].maxWeight;
            return {
                name,
                data,
                initialWeight,
                currentWeight,
                evolution: currentWeight - initialWeight,
                workoutCount: data.length,
            };
        })
        .filter((p): p is ExerciseProgress => p !== null)
        .sort((a, b) => b.evolution - a.evolution);

    return result;
};

// --- Custom Workouts & Planner ---

export const getCustomWorkouts = async (): Promise<CustomWorkoutPlan[]> => {
    if (!isSupabaseConfigured) return [];
    try {
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('custom_workouts')
            .select('*')
            .eq('user_id', userId);
        
        if (error) throw new Error(`Erro ao buscar planos customizados: ${error.message}`);
        return data as CustomWorkoutPlan[];
    } catch (err) {
        if (err instanceof Error && err.message.includes("Usuário não autenticado")) {
            return [];
        }
        throw err;
    }
};

export const saveCustomWorkouts = async (workouts: CustomWorkoutPlan[]): Promise<void> => {
    if (!isSupabaseConfigured) return;
    const userId = await getUserId();
    
    const workoutsToSave = workouts.map(w => ({ ...w, user_id: userId }));

    const currentIds = workouts.map(w => w.id);
    const { error: deleteError } = await supabase
        .from('custom_workouts')
        .delete()
        .eq('user_id', userId)
        .not('id', 'in', `(${currentIds.join(',')})`);

    if (deleteError && currentIds.length > 0) throw new Error(`Erro ao deletar planos antigos: ${deleteError.message}`);
    else if(deleteError && currentIds.length === 0){
        // handles case where all workouts are deleted
        const { error: deleteAllError } = await supabase.from('custom_workouts').delete().eq('user_id', userId);
        if(deleteAllError) throw new Error(`Erro ao deletar todos os planos: ${deleteAllError.message}`);
    }


    if (workoutsToSave.length > 0) {
        const { error: upsertError } = await supabase.from('custom_workouts').upsert(workoutsToSave);
        if (upsertError) throw new Error(`Erro ao salvar planos customizados: ${upsertError.message}`);
    }
};

export const getWeeklySchedule = async (): Promise<WeeklySchedule> => {
    if (!isSupabaseConfigured) return {};
    try {
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('profiles')
            .select('schedule')
            .eq('id', userId)
            .single();

        if (error) throw new Error(`Erro ao buscar agenda semanal: ${error.message}`);
        return data.schedule || {};
    } catch (err) {
        if (err instanceof Error && err.message.includes("Usuário não autenticado")) {
            return {};
        }
        throw err;
    }
};

export const saveWeeklySchedule = async (schedule: WeeklySchedule): Promise<void> => {
    if (!isSupabaseConfigured) return;
    const userId = await getUserId();
    const { error } = await supabase.from('profiles').update({ schedule: schedule }).eq('id', userId);
    if (error) throw new Error(`Erro ao salvar agenda semanal: ${error.message}`);
};

export const saveGeneratedWeeklyPlan = async (generatedPlan: AiGeneratedWeeklyPlan): Promise<void> => {
    if (!isSupabaseConfigured) return;

    const currentWorkouts = await getCustomWorkouts();
    
    const newWorkouts: CustomWorkoutPlan[] = generatedPlan.plans.map(p => ({
        id: crypto.randomUUID(),
        name: p.name,
        exercises: p.exercises.map(ex => ({...ex, id: crypto.randomUUID()})),
        created_at: new Date().toISOString(),
    }));

    const allWorkouts = [...currentWorkouts, ...newWorkouts];
    await saveCustomWorkouts(allWorkouts);

    const newSchedule: WeeklySchedule = {};
    for (const day in generatedPlan.schedule) {
        const planName = generatedPlan.schedule[day as DayOfWeek];
        const correspondingPlan = newWorkouts.find(p => p.name === planName);
        if (correspondingPlan) {
            newSchedule[day as DayOfWeek] = correspondingPlan.id;
        }
    }
    
    await saveWeeklySchedule(newSchedule);
};