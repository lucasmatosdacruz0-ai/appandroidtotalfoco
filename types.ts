// FIX: Import React to make React.ComponentType available for the Achievement interface.
import React from 'react';

export enum FitnessLevel {
  Beginner = 'Iniciante',
  Intermediate = 'Intermediário',
  Advanced = 'Avançado',
}

export enum TrainingLocation {
  Gym = 'Academia',
  Home = 'Casa/Parque',
}

export enum AppStep {
  Home = 0,
  Level,
  Location,
  Duration,
  Focus,
  Equipment,
  Generating,
  WorkoutOverview,
  WorkoutActive,
  WorkoutSummary,
  Error
}

export enum AppView {
  Workout = 'WORKOUT',
  Planner = 'PLANNER',
  History = 'PROGRESS',
  Profile = 'PROFILE',
}

export interface CompletedSet {
    checked: boolean;
    weight: string;
    reps?: string;
}

export interface Exercise {
  id: string; // Unique identifier for the exercise instance
  name: string;
  sets: string;
  reps: string;
  description:string;
  completedSets?: CompletedSet[];
  equipmentUsed?: string[]; // Equipment from user's selection needed for this exercise
}

// Types for Custom Workouts
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface CustomExercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

export interface CustomWorkoutPlan {
  id: string;
  name: string;
  exercises: CustomExercise[];
  created_at: string;
}

export interface WeeklySchedule {
  [key: string]: string | undefined; // Maps DayOfWeek to CustomWorkoutPlan.id
}


export interface WorkoutPlan {
  title: string;
  duration: number;
  focus: string;
  exercises: Exercise[];
}

export interface HistoricalWorkout extends WorkoutPlan {
    completedAt: string;
}

export interface GenerateWorkoutParams {
  level: FitnessLevel;
  location: TrainingLocation;
  equipment: string[];
  duration: number;
  focus: string;
}

export interface GenerateWeeklyWorkoutParams {
    level: FitnessLevel;
}

export interface GetAutoSwapExerciseParams extends GenerateWorkoutParams {
    currentPlan: WorkoutPlan;
    exerciseToReplace: Exercise;
}

export interface GetSimilarExercisesParams extends GenerateWorkoutParams {
    currentPlan: WorkoutPlan;
    exerciseToReplace: Exercise;
}

export interface ProfileGalleryImage {
    id: string;
    src: string; // Base64 encoded image
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string; // URL or identifier or Base64
  instagram?: string; // Optional instagram handle
  whatsapp?: string; // Optional phone number
  level: number;
  xp: number;
  xpToNextLevel: number;
  stats: {
    totalWorkouts: number;
    currentStreak: number;
    totalVolume: number; // in kg
    timeSpent: number; // in minutes
  };
  gallery: ProfileGalleryImage[];
}

export interface Achievement {
    id:string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    unlocked: boolean;
    isSecret: boolean;
    condition: (history: HistoricalWorkout[], stats: UserProfile['stats'], prs: PersonalRecords) => boolean;
}

export interface ExercisePerformance {
    maxWeight: number;
    totalVolume: number;
}

export interface ExerciseComparison {
    name: string;
    current: ExercisePerformance;
    last: ExercisePerformance | null;
    isNewPR: boolean;
}

export interface WorkoutSummaryData {
    title: string;
    totalVolume: number;
    duration: number;
    exercises: ExerciseComparison[];
}

export type PersonalRecords = {
    [exerciseName: string]: number; // key is exercise name, value is max weight
};

export interface AiPreferences {
    level: FitnessLevel | null;
    location: TrainingLocation | null;

    equipment: string[];
    duration: number | null;
    focus: string | null;
}

export interface AiGeneratedWeeklyPlan {
    plans: Omit<CustomWorkoutPlan, 'id' | 'created_at'>[];
    schedule: { [key in DayOfWeek]?: string }; // Maps day to plan NAME
}

export interface ExerciseDataPoint {
  date: string;
  maxWeight: number;
}

export interface ExerciseProgress {
  name: string;
  data: ExerciseDataPoint[];
  initialWeight: number;
  currentWeight: number;
  evolution: number;
  workoutCount: number;
}