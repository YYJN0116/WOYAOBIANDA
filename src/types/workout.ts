import type { ImageSourcePropType } from 'react-native';

export type BodyPart = 'back';

export type BackGoal = 'width' | 'thickness' | 'combined';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type Equipment =
  | 'dumbbells'
  | 'barbell'
  | 'bench'
  | 'chest-supported-row-machine'
  | 'cable-machine'
  | 'lat-pulldown-machine'
  | 'rowing-machine'
  | 'assisted-pull-up-machine'
  | 'pull-up-bar';

export type WorkoutPreferences = {
  bodyPart: BodyPart;
  goal: BackGoal;
  experience: ExperienceLevel;
  equipment: Equipment[];
};

export type WeeklyDays = 3 | 4 | 5;

export type FitnessProfile = {
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  heightCm: number;
  weightKg: number;
  goal: 'fat-loss' | 'body-shaping' | 'muscle-gain' | 'general-fitness';
  preferredWorkoutTime: 'morning' | 'afternoon' | 'evening';
  weeklyDays: WeeklyDays;
};

export type PlannedTrainingFocus =
  | 'back'
  | 'biceps'
  | 'chest'
  | 'triceps'
  | 'shoulders'
  | 'legs'
  | 'abs'
  | 'cardio'
  | 'rest';

export type WeeklyTrainingPlan = Record<string, PlannedTrainingFocus[]>;

export const MAX_DAILY_EXERCISES = 6;

export type Exercise = {
  id: string;
  name: string;
  bodyPart: BodyPart;
  goals: BackGoal[];
  equipment: Equipment[];
  difficulty: ExperienceLevel[];
  beginnerSafetyTips: string[];
  image: ImageSourcePropType | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  defaultSets: number;
  defaultReps: string;
  restSeconds: number;
  instructions: string[];
};

export type RecommendedExercise = Exercise & {
  reason: string;
};
