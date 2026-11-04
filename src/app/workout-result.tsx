import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { recommendBackWorkout } from '@/lib/recommend-back-workout';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  loadSelectedExerciseIds,
  saveSelectedExerciseIds,
} from '@/lib/workout-preferences';
import { MAX_DAILY_EXERCISES } from '@/types/workout';
import type { BackGoal, Equipment, ExperienceLevel } from '@/types/workout';

const goalLabels: Record<BackGoal, string> = {
  width: '宽度',
  thickness: '厚度',
  combined: '综合',
};

export default function WorkoutResultScreen() {
  const params = useLocalSearchParams<{
    goal?: string;
    experience?: string;
    equipment?: string;
  }>();
  const goal: BackGoal =
    params.goal === 'thickness' || params.goal === 'combined' ? params.goal : 'width';
  const experience: ExperienceLevel =
    params.experience === 'intermediate' || params.experience === 'advanced'
      ? params.experience
      : 'beginner';
  const equipment = (params.equipment ?? '').split(',').filter(Boolean) as Equipment[];
  const exercises = recommendBackWorkout({ bodyPart: 'back', goal, experience, equipment });
  const recommendedIds = new Set(exercises.slice(0, 4).map((exercise) => exercise.id));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadSelectedExerciseIds()
      .then((savedIds) => {
        const availableIds = new Set(exercises.map((exercise) => exercise.id));
        setSelectedIds(savedIds.filter((id) => availableIds.has(id)));
      })
      .catch((error: unknown) => {
        console.error('Failed to load selected exercises.', error);
      });
  }, [params.goal, params.experience, params.equipment]);

  const toggleExercise = (exerciseId: string) => {
    setSelectedIds((current) => {
      if (current.includes(exerciseId)) {
        return current.filter((id) => id !== exerciseId);
      }
      if (current.length >= MAX_DAILY_EXERCISES) {
        return current;
      }
      return [...current, exerciseId];
    });
  };

  const startTraining = async () => {
    if (selectedIds.length !== 4) {
      return;
    }

    try {
      await saveSelectedExerciseIds(selectedIds);
      router.replace('/workout-plan');
    } catch (error: unknown) {
      console.error('Failed to save selected exercises.', error);
      Alert.alert('保存失败', '动作选择暂时无法保存，请稍后重试。');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backText}>‹ 返回调整</ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary">
            今日推荐
          </ThemedText>
          <ThemedText type="subtitle" themeColor="text" style={styles.title}>
            背部训练 · {goalLabels[goal]}
          </ThemedText>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            选择 4 个动作开始训练，带有“推荐”标记的动作优先适合当前设置。
          </ThemedText>

          {exercises.length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.empty}>
              <ThemedText themeColor="text" style={styles.emptyTitle}>
                暂时没有匹配动作
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                请返回选择对应的训练器械，或更换训练目标。
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.exerciseList}>
              {exercises.map((exercise, index) => (
                <Pressable
                  key={exercise.id}
                  accessibilityRole="button"
                  accessibilityLabel={`选择${exercise.name}`}
                  accessibilityState={{ selected: selectedIds.includes(exercise.id) }}
                  onPress={() => toggleExercise(exercise.id)}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedView
                    type={selectedIds.includes(exercise.id) ? 'backgroundSelected' : 'backgroundElement'}
                    style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <View style={styles.number}>
                        <ThemedText style={styles.numberText}>{index + 1}</ThemedText>
                      </View>
                      <ThemedText themeColor="text" style={styles.exerciseName}>
                        {exercise.name}
                      </ThemedText>
                      {recommendedIds.has(exercise.id) && (
                        <ThemedText style={styles.recommendedLabel}>推荐</ThemedText>
                      )}
                    </View>
                    <ThemedText style={styles.trainingDetails}>
                      {exercise.defaultSets} 组 × {exercise.defaultReps} 次 · 休息 {exercise.restSeconds} 秒
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {exercise.reason}
                    </ThemedText>
                    <ThemedText type="small" style={styles.instructions}>
                      {exercise.instructions.join(' · ')}
                    </ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.selectionText}>
                      {selectedIds.includes(exercise.id) ? '已选择' : '点击选择'}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </View>
          )}

          {exercises.length >= 4 && (
            <View style={styles.footerArea}>
              <ThemedText themeColor="textSecondary">
                已选择 {selectedIds.length} / {MAX_DAILY_EXERCISES} 个动作（至少选择 4 个）
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                disabled={selectedIds.length < 4 || selectedIds.length > MAX_DAILY_EXERCISES}
                onPress={startTraining}
                style={({ pressed }) => [
                  styles.startButton,
                  selectedIds.length !== 4 && styles.disabledButton,
                  pressed && styles.pressed,
                ]}>
                <ThemedText style={styles.startButtonText}>开始训练</ThemedText>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset,
  },
  content: { paddingBottom: Spacing.five },
  backButton: { paddingVertical: Spacing.two, marginBottom: Spacing.four },
  backText: { color: '#1F7A5A', fontWeight: '700' },
  title: { marginTop: Spacing.one },
  subtitle: { marginTop: Spacing.two },
  exerciseList: { gap: Spacing.three, marginTop: Spacing.five },
  exerciseCard: { borderRadius: 20, padding: Spacing.three, gap: Spacing.two },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  number: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#C9E2D6', alignItems: 'center', justifyContent: 'center' },
  numberText: { color: '#1F7A5A', fontWeight: '700' },
  exerciseName: { fontSize: 20, fontWeight: '700' },
  trainingDetails: { color: '#1F7A5A', fontWeight: '700' },
  instructions: { color: '#527064' },
  recommendedLabel: {
    color: '#1F7A5A',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  selectionText: { color: '#1F7A5A', fontWeight: '700' },
  empty: { borderRadius: 20, padding: Spacing.four, marginTop: Spacing.five, gap: Spacing.two },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  footerArea: { gap: Spacing.two, marginTop: Spacing.five },
  startButton: {
    backgroundColor: '#1F7A5A',
    borderRadius: 18,
    padding: Spacing.three,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#527064' },
  startButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
