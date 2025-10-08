import { HistoricalWorkout, WorkoutSummaryData, UserProfile, PersonalRecords, Achievement } from './types.ts';
import { ACHIEVEMENTS_LIST, XP_PER_WORKOUT, XP_PER_PR, BASE_XP_TO_LEVEL_UP } from '../constants.ts';

export interface GamificationResult {
    updatedProfile: UserProfile;
    newPRs: PersonalRecords;
    unlockedAchievements: Achievement[];
    earnedXp: number;
    levelUp: boolean;
}

const calculateXpForNextLevel = (level: number): number => {
    return Math.floor(BASE_XP_TO_LEVEL_UP * Math.pow(1.2, level - 1));
};

/**
 * Processa a lógica de gamificação após a conclusão de um treino.
 * Calcula XP ganho, verifica se o usuário subiu de nível e desbloqueou conquistas.
 * Esta função opera localmente com regras pré-definidas e não utiliza IA.
 */
export const processWorkoutCompletion = (
    completedWorkout: HistoricalWorkout,
    summary: WorkoutSummaryData,
    currentProfile: UserProfile,
    fullHistory: HistoricalWorkout[],
    currentPRs: PersonalRecords,
    newStats: UserProfile['stats']
): GamificationResult => {
    let earnedXp = XP_PER_WORKOUT;
    const newPRs = { ...currentPRs };
    let prCount = 0;
    
    // 1. Update Personal Records and count new PRs for XP
    summary.exercises.forEach(ex => {
        if (ex.isNewPR) {
            prCount++;
        }
        // Update PR if it's higher than the stored one
        if (ex.current.maxWeight > (newPRs[ex.name] || 0)) {
            newPRs[ex.name] = ex.current.maxWeight;
        }
    });
    earnedXp += prCount * XP_PER_PR;

    // 2. Update Profile XP and Level
    let updatedProfile = { ...currentProfile };
    updatedProfile.xp += earnedXp;

    let levelUp = false;
    while (updatedProfile.xp >= updatedProfile.xpToNextLevel) {
        levelUp = true;
        updatedProfile.xp -= updatedProfile.xpToNextLevel;
        updatedProfile.level++;
        updatedProfile.xpToNextLevel = calculateXpForNextLevel(updatedProfile.level);
    }

    // 3. Recalculate all stats based on the new history
    updatedProfile.stats = newStats;

    // 4. Check for newly unlocked achievements
    const newlyUnlockedAchievements: Achievement[] = [];
    ACHIEVEMENTS_LIST.forEach(ach => {
        const wasAlreadyUnlocked = currentProfile.level > 1 && ach.condition(fullHistory.slice(1), currentProfile.stats, currentPRs);
        const isNowUnlocked = ach.condition(fullHistory, updatedProfile.stats, newPRs);
        
        if (isNowUnlocked && !wasAlreadyUnlocked) {
            newlyUnlockedAchievements.push({ ...ach, unlocked: true });
        }
    });

    return {
        updatedProfile,
        newPRs,
        unlockedAchievements: newlyUnlockedAchievements,
        earnedXp,
        levelUp
    };
};