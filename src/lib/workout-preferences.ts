import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  MAX_DAILY_EXERCISES,
} from '@/types/workout';
import type {
  Equipment,
  FitnessProfile,
  WeeklyTrainingPlan,
  WorkoutPreferences,
} from '@/types/workout';
import type { CompletedExercise, CompletedWorkout } from '@/types/training';

const WORKOUT_PREFERENCES_KEY = 'fitness-coach:workout-preferences';
const FITNESS_PROFILE_KEY = 'fitness-coach:fitness-profile';
const WELCOME_COMPLETED_KEY = 'fitness-coach:welcome-completed';
const SELECTED_EXERCISES_KEY = 'fitness-coach:selected-exercises';
const WORKOUT_HISTORY_KEY = 'fitness-coach:workout-history';
const WEEKLY_TRAINING_PLAN_KEY = 'fitness-coach:weekly-training-plan';
const equipmentValues: Equipment[] = [
  'dumbbells',
  'barbell',
  'bench',
  'chest-supported-row-machine',
  'cable-machine',
  'lat-pulldown-machine',
  'rowing-machine',
  'assisted-pull-up-machine',
  'pull-up-bar',
];

export async function loadWorkoutPreferences(): Promise<WorkoutPreferences | null> {
  const saved = await AsyncStorage.getItem(WORKOUT_PREFERENCES_KEY);
  if (saved === null) {
    return null;
  }

  const parsed: unknown = JSON.parse(saved);
  if (!isWorkoutPreferences(parsed)) {
    throw new Error('Saved workout preferences are invalid.');
  }

  return parsed;
}

export async function saveWorkoutPreferences(
  preferences: WorkoutPreferences,
): Promise<void> {
  await AsyncStorage.setItem(WORKOUT_PREFERENCES_KEY, JSON.stringify(preferences));
}

export async function loadFitnessProfile(): Promise<FitnessProfile | null> {
  const saved = await AsyncStorage.getItem(FITNESS_PROFILE_KEY);
  if (saved === null) {
    return null;
  }

  const parsed: unknown = JSON.parse(saved);
  if (!isFitnessProfile(parsed)) {
    throw new Error('Saved fitness profile is invalid.');
  }

  return parsed;
}

export async function saveFitnessProfile(profile: FitnessProfile): Promise<void> {
  await AsyncStorage.setItem(FITNESS_PROFILE_KEY, JSON.stringify(profile));
}

export async function loadWelcomeCompleted(): Promise<boolean> {
  return (await AsyncStorage.getItem(WELCOME_COMPLETED_KEY)) === 'true';
}

export async function completeWelcome(): Promise<void> {
  await AsyncStorage.setItem(WELCOME_COMPLETED_KEY, 'true');
}

export async function loadSelectedExerciseIds(): Promise<string[]> {
  const saved = await AsyncStorage.getItem(SELECTED_EXERCISES_KEY);
  if (saved === null) {
    return [];
  }

  const parsed: unknown = JSON.parse(saved);
  if (
    !Array.isArray(parsed) ||
    parsed.length < 4 ||
    parsed.length > MAX_DAILY_EXERCISES ||
    parsed.some((item) => typeof item !== 'string')
  ) {
    throw new Error('Saved selected exercises are invalid.');
  }

  return parsed;
}

export async function saveSelectedExerciseIds(exerciseIds: string[]): Promise<void> {
  if (
    exerciseIds.length < 4 ||
    exerciseIds.length > MAX_DAILY_EXERCISES ||
    new Set(exerciseIds).size !== exerciseIds.length
  ) {
    throw new Error(`Between one and ${MAX_DAILY_EXERCISES} unique exercises are required.`);
  }

  await AsyncStorage.setItem(SELECTED_EXERCISES_KEY, JSON.stringify(exerciseIds));
}

export async function saveCompletedWorkout(workout: CompletedWorkout): Promise<void> {
  if (!isCompletedWorkout(workout)) {
    throw new Error('Completed workout is invalid.');
  }

  const history = await loadCompletedWorkouts();
  const updatedHistory = [workout, ...history.filter((item) => item.id !== workout.id)];
  await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(updatedHistory));
}

export async function loadCompletedWorkouts(): Promise<CompletedWorkout[]> {
  const saved = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);
  if (saved === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((item) => ({
        id: typeof item.id === 'string' ? item.id : String(Date.now()),
        exerciseName: typeof item.exerciseName === 'string' ? item.exerciseName : '背部训练',
        completedAt: typeof item.completedAt === 'string' ? item.completedAt : new Date().toISOString(),
        durationSeconds:
          typeof item.durationSeconds === 'number' && Number.isFinite(item.durationSeconds)
            ? Math.max(0, item.durationSeconds)
            : 0,
        completedSets:
          typeof item.completedSets === 'number' && Number.isFinite(item.completedSets)
            ? Math.max(0, item.completedSets)
            : 0,
        totalSets:
          typeof item.totalSets === 'number' && Number.isFinite(item.totalSets)
            ? Math.max(0, item.totalSets)
            : 0,
        totalVolume:
          typeof item.totalVolume === 'number' && Number.isFinite(item.totalVolume)
            ? Math.max(0, item.totalVolume)
            : 0,
        startedAt: typeof item.startedAt === 'string' ? item.startedAt : undefined,
        note: typeof item.note === 'string' ? item.note : undefined,
        exercises: Array.isArray(item.exercises)
          ? (item.exercises as unknown[]).filter(isCompletedExercise)
          : undefined,
      }));
  } catch (error: unknown) {
    console.error('Failed to parse completed workouts history.', error);
    return [];
  }
}

export async function loadWeeklyTrainingPlan(): Promise<WeeklyTrainingPlan | null> {
  const saved = await AsyncStorage.getItem(WEEKLY_TRAINING_PLAN_KEY);
  if (saved === null) {
    return null;
  }

  const parsed: unknown = JSON.parse(saved);
  if (!isWeeklyTrainingPlan(parsed)) {
    throw new Error('Saved weekly training plan is invalid.');
  }

  return parsed;
}

export async function saveWeeklyTrainingPlan(plan: WeeklyTrainingPlan): Promise<void> {
  await AsyncStorage.setItem(WEEKLY_TRAINING_PLAN_KEY, JSON.stringify(plan));
}

function isWorkoutPreferences(value: unknown): value is WorkoutPreferences {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate.bodyPart === 'back' &&
    isBackGoal(candidate.goal) &&
    isExperienceLevel(candidate.experience) &&
    Array.isArray(candidate.equipment) &&
    candidate.equipment.length > 0 &&
    candidate.equipment.every((item) => equipmentValues.includes(item as Equipment))
  );
}

function isBackGoal(value: unknown) {
  return value === 'width' || value === 'thickness' || value === 'combined';
}

function isExperienceLevel(value: unknown) {
  return value === 'beginner' || value === 'intermediate' || value === 'advanced';
}

function isFitnessProfile(value: unknown): value is FitnessProfile {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    isPositiveNumber(candidate.age) &&
    isGender(candidate.gender) &&
    isPositiveNumber(candidate.heightCm) &&
    isPositiveNumber(candidate.weightKg) &&
    isFitnessGoal(candidate.goal) &&
    isWorkoutTime(candidate.preferredWorkoutTime)
  );
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isGender(value: unknown): value is FitnessProfile['gender'] {
  return value === 'male' || value === 'female' || value === 'other' || value === 'prefer-not-to-say';
}

function isFitnessGoal(value: unknown): value is FitnessProfile['goal'] {
  return (
    value === 'fat-loss' ||
    value === 'body-shaping' ||
    value === 'muscle-gain' ||
    value === 'general-fitness'
  );
}

function isWorkoutTime(value: unknown): value is FitnessProfile['preferredWorkoutTime'] {
  return value === 'morning' || value === 'afternoon' || value === 'evening';
}

function isWeeklyTrainingPlan(value: unknown): value is WeeklyTrainingPlan {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.values(value).every(
    (focuses) =>
      Array.isArray(focuses) &&
      focuses.every(
        (focus) =>
          focus === 'back' ||
          focus === 'biceps' ||
          focus === 'chest' ||
          focus === 'triceps' ||
          focus === 'shoulders' ||
          focus === 'legs' ||
          focus === 'abs' ||
          focus === 'cardio' ||
          focus === 'rest',
      ),
  );
}

function isCompletedWorkout(value: unknown): value is CompletedWorkout {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.exerciseName === 'string' &&
    typeof candidate.completedAt === 'string' &&
    isNonNegativeNumber(candidate.durationSeconds) &&
    isNonNegativeNumber(candidate.completedSets) &&
    isNonNegativeNumber(candidate.totalSets) &&
    isNonNegativeNumber(candidate.totalVolume) &&
    (candidate.startedAt === undefined || typeof candidate.startedAt === 'string') &&
    (candidate.note === undefined || typeof candidate.note === 'string') &&
    (candidate.exercises === undefined ||
      (Array.isArray(candidate.exercises) && candidate.exercises.every(isCompletedExercise)))
  );
}

function isCompletedExercise(value: unknown): value is CompletedExercise {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    Array.isArray(candidate.sets) &&
    candidate.sets.every((set) => {
      if (!set || typeof set !== 'object') {
        return false;
      }

      const trainingSet = set as Record<string, unknown>;
      return (
        isNonNegativeNumber(trainingSet.setNumber) &&
        isNonNegativeNumber(trainingSet.weight) &&
        isNonNegativeNumber(trainingSet.reps) &&
        (trainingSet.completedAt === undefined || typeof trainingSet.completedAt === 'string')
      );
    })
  );
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
