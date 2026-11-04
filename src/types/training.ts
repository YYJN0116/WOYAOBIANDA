export type TrainingSet = {
  setNumber: number;
  weight: number;
  reps: number;
  completedAt?: string;
};

export type TrainingExercise = {
  id: string;
  name: string;
  equipment?: string;
  sets: TrainingSet[];
};

export type CompletedExercise = {
  id: string;
  name: string;
  sets: TrainingSet[];
};

export type CardioEntry = {
  id: string;
  activity: string;
  durationSeconds: number;
};

export type WorkoutSession = {
  id: string;
  startedAt: string;
  endedAt?: string;
  totalDurationSeconds: number;
  totalSets: number;
  exercises: TrainingExercise[];
  cardio: CardioEntry[];
  note?: string;
};

export type CompletedWorkout = {
  id: string;
  exerciseName: string;
  startedAt?: string;
  completedAt: string;
  durationSeconds: number;
  completedSets: number;
  totalSets: number;
  totalVolume: number;
  exercises?: CompletedExercise[];
  note?: string;
};
