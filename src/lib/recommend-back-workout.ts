import { backExercises } from '@/data/back-exercises';
import type { Exercise, RecommendedExercise, WorkoutPreferences } from '@/types/workout';

const goalNames = {
  width: '背部宽度',
  thickness: '背部厚度',
  combined: '背部综合',
} as const;

const beginnerFriendlyEquipment = new Set([
  'chest-supported-row-machine',
  'rowing-machine',
  'cable-machine',
  'lat-pulldown-machine',
  'assisted-pull-up-machine',
]);

function getRecommendationScore(exercise: Exercise, experience: WorkoutPreferences['experience']) {
  if (experience !== 'beginner') {
    return 0;
  }

  let score = exercise.difficulty.includes('beginner') ? 3 : 0;
  if (exercise.equipment.some((item) => beginnerFriendlyEquipment.has(item))) {
    score += 2;
  }
  if (exercise.equipment.includes('bench')) {
    score += 1;
  }
  if (exercise.id === 'barbell-bent-over-row' || exercise.id === 'pull-up') {
    score -= 2;
  }
  return score;
}

export function recommendBackWorkout(
  preferences: WorkoutPreferences,
): RecommendedExercise[] {
  if (preferences.bodyPart !== 'back') {
    return [];
  }

  return backExercises
    .filter((exercise) => exercise.goals.includes(preferences.goal))
    .filter((exercise) => exercise.difficulty.includes(preferences.experience))
    .filter((exercise) =>
      exercise.equipment.some((item) => preferences.equipment.includes(item)),
    )
    .map((exercise) => ({
      exercise,
      score: getRecommendationScore(exercise, preferences.experience),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ exercise }) => ({
      ...exercise,
      reason:
        preferences.experience === 'beginner'
          ? `${exercise.name}适合${goalNames[preferences.goal]}训练，重点刺激${exercise.primaryMuscles.join('、')}，优先选择容易控制的动作`
          : `${exercise.name}适合${goalNames[preferences.goal]}训练，重点刺激${exercise.primaryMuscles.join('、')}`,
    }));
}
