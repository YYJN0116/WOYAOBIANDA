import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { backExercises } from '@/data/back-exercises';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const weightOptions = [0, 2.5, 5, 7.5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60];
const weightStorageKey = (exerciseId: string) => `fitness-coach:weight:${exerciseId}`;

export default function WorkoutSessionScreen() {
  const {
    id,
    workoutIds,
    completedSets: completedSetsParam,
    totalSets: totalSetsParam,
    totalReps: totalRepsParam,
    totalVolume: totalVolumeParam,
    startedAt: startedAtParam,
  } = useLocalSearchParams<{
    id?: string;
    workoutIds?: string;
    completedSets?: string;
    totalSets?: string;
    totalReps?: string;
    totalVolume?: string;
    startedAt?: string;
  }>();
  const theme = useTheme();
  const exerciseId = Array.isArray(id) ? id[0] : id;
  const exercise = backExercises.find((item) => item.id === exerciseId);
  const exerciseIds = (Array.isArray(workoutIds) ? workoutIds[0] : workoutIds)
    ?.split(',')
    .filter(Boolean) ?? [];
  const currentExerciseIndex = exerciseId ? exerciseIds.indexOf(exerciseId) : -1;
  const nextExerciseId =
    currentExerciseIndex >= 0 ? exerciseIds[currentExerciseIndex + 1] : undefined;
  const startedAt = useState(() => Number(startedAtParam ?? Date.now()))[0];
  const [sets, setSets] = useState<WorkoutSet[]>(() =>
    exercise
      ? Array.from({ length: exercise.defaultSets }, (_, index) => ({
          setNumber: index + 1,
          weight: '',
          reps: getInitialReps(exercise.defaultReps),
          completed: false,
        }))
      : [],
  );

  useEffect(() => {
    if (!exercise) {
      setSets([]);
      return;
    }

    let active = true;
    setSets(
      Array.from({ length: exercise.defaultSets }, (_, index) => ({
        setNumber: index + 1,
        weight: '',
        reps: getInitialReps(exercise.defaultReps),
        completed: false,
      })),
    );

    AsyncStorage.getItem(weightStorageKey(exercise.id))
      .then((savedWeight) => {
        if (!active || savedWeight === null) {
          return;
        }

        const savedWeights = parseSavedWeights(savedWeight);
        setSets((current) =>
          current.map((set) => ({
            ...set,
            weight: savedWeights[set.setNumber] ?? savedWeights.default ?? '',
          })),
        );
      })
      .catch((error: unknown) => {
        console.error('Failed to load saved exercise weight.', error);
      });

    return () => {
      active = false;
    };
  }, [exercise]);

  const updateSet = (setNumber: number, changes: Partial<WorkoutSet>) => {
    setSets((current) => {
      const updatedSets = current.map((set) =>
        set.setNumber === setNumber ? { ...set, ...changes } : set,
      );
      const completedCurrentSet = changes.completed === true;
      const finishedExercise =
        completedCurrentSet && updatedSets.length > 0 && updatedSets.every((set) => set.completed);

      if (finishedExercise && nextExerciseId) {
        const remainingExerciseIds = exerciseIds.slice(currentExerciseIndex + 1).join(',');
        const completedSets = Number(completedSetsParam ?? 0) + updatedSets.length;
        const totalSets = Number(totalSetsParam ?? 0) + updatedSets.length;
        const totalReps =
          Number(totalRepsParam ?? 0) +
          updatedSets.reduce((sum, set) => sum + Number(set.reps || 0), 0);
        const totalVolume =
          Number(totalVolumeParam ?? 0) +
          updatedSets.reduce(
            (sum, set) => sum + Number(set.weight || 0) * Number(set.reps || 0),
            0,
          );
        router.replace({
          pathname: '/workout-session',
          params: {
            id: nextExerciseId,
            workoutIds: remainingExerciseIds,
            completedSets: String(completedSets),
            totalSets: String(totalSets),
            totalReps: String(totalReps),
            totalVolume: String(totalVolume),
            startedAt: String(startedAt),
          },
        });
      } else if (finishedExercise) {
        const completedSets = Number(completedSetsParam ?? 0) + updatedSets.length;
        const totalSets = Number(totalSetsParam ?? 0) + updatedSets.length;
        const totalReps =
          Number(totalRepsParam ?? 0) +
          updatedSets.reduce((sum, set) => sum + Number(set.reps || 0), 0);
        const totalVolume =
          Number(totalVolumeParam ?? 0) +
          updatedSets.reduce(
            (sum, set) => sum + Number(set.weight || 0) * Number(set.reps || 0),
            0,
          );
        router.replace({
          pathname: '/workout-summary',
          params: {
            exerciseName: '背部训练',
            completedSets: String(completedSets),
            totalSets: String(totalSets),
            totalReps: String(totalReps),
            totalVolume: String(totalVolume),
            durationSeconds: String(Math.max(1, Math.floor((Date.now() - startedAt) / 1000))),
          },
        });
      }

      return updatedSets;
    });
  };

  const selectWeight = (setNumber: number, weight: number) => {
    if (!exercise) {
      return;
    }

    const savedWeight = String(weight);
    setSets((current) => {
      const next = current.map((set) =>
        set.setNumber === setNumber ? { ...set, weight: savedWeight } : set,
      );
      const savedWeights = Object.fromEntries(
        next
          .filter((set) => set.weight !== '')
          .map((set) => [set.setNumber, set.weight]),
      );
      AsyncStorage.setItem(weightStorageKey(exercise.id), JSON.stringify(savedWeights)).catch(
        (error: unknown) => {
          console.error('Failed to save exercise weight.', error);
        },
      );
      return next;
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backText}>‹ 返回动作详情</ThemedText>
          </Pressable>

          {exercise ? (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="small" themeColor="textSecondary">
                准备开始
              </ThemedText>
              <ThemedText type="subtitle" themeColor="text" style={styles.title}>
                {exercise.name}
              </ThemedText>
              <ThemedText style={styles.trainingDetails}>
                {exercise.defaultSets} 组 × {exercise.defaultReps} 次
              </ThemedText>
              {exerciseIds.length > 1 && currentExerciseIndex >= 0 && (
                <ThemedText type="small" themeColor="textSecondary">
                  动作 {currentExerciseIndex + 1} / {exerciseIds.length}
                </ThemedText>
              )}
              <ThemedText themeColor="text" style={styles.sectionTitle}>
                记录每组训练
              </ThemedText>
              <View style={styles.setList}>
                {sets.map((set) => (
                  <ThemedView
                    key={set.setNumber}
                    type={set.completed ? 'backgroundSelected' : 'background'}
                    style={styles.setCard}>
                    <View style={styles.setHeader}>
                      <ThemedText themeColor="text" style={styles.setTitle}>
                        第 {set.setNumber} 组
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {set.completed ? '已完成' : '未完成'}
                      </ThemedText>
                    </View>
                    <View style={styles.inputGroup}>
                      <ThemedText type="small" themeColor="textSecondary">
                        重量（公斤）
                      </ThemedText>
                      <View style={styles.weightList}>
                        {weightOptions.map((weight) => (
                          <Pressable
                            key={weight}
                            accessibilityRole="button"
                            accessibilityState={{ selected: set.weight === String(weight) }}
                            onPress={() => selectWeight(set.setNumber, weight)}
                            style={({ pressed }) => [
                              styles.weightCard,
                              set.weight === String(weight) && styles.selectedWeightCard,
                              pressed && styles.pressed,
                            ]}>
                            <ThemedText
                              themeColor="text"
                              style={
                                set.weight === String(weight)
                                  ? styles.selectedWeightText
                                  : styles.weightText
                              }>
                              {weight} kg
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                    <View style={styles.inputGroup}>
                      <ThemedText type="small" themeColor="textSecondary">
                        次数
                      </ThemedText>
                      <TextInput
                        accessibilityLabel={`第${set.setNumber}组次数`}
                        keyboardType="number-pad"
                        onChangeText={(reps) => updateSet(set.setNumber, { reps })}
                        placeholder={exercise.defaultReps}
                        placeholderTextColor="#9AAFA5"
                        style={[styles.input, { color: theme.text }]}
                        value={set.reps}
                      />
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ checked: set.completed }}
                      onPress={() =>
                        updateSet(set.setNumber, { completed: !set.completed })
                      }
                      style={({ pressed }) => [
                        styles.completeButton,
                        set.completed && styles.completedButton,
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText
                        style={set.completed ? styles.completedButtonText : styles.completeText}>
                        {set.completed ? '已完成本组' : '标记本组完成'}
                      </ThemedText>
                    </Pressable>
                  </ThemedView>
                ))}
              </View>
            </ThemedView>
          ) : (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="small" themeColor="textSecondary">
                WORKOUT SESSION
              </ThemedText>
              <ThemedText themeColor="text" style={styles.title}>
                找不到这个动作
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                训练动作参数没有成功传入，请返回训练计划后重新开始。
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.back()}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <ThemedText style={styles.primaryButtonText}>返回训练计划</ThemedText>
              </Pressable>
            </ThemedView>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type WorkoutSet = {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
};

function parseSavedWeights(value: string): Record<number | 'default', string> {
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<number | 'default', string>;
    }
  } catch {
    return { default: value };
  }
  return { default: value };
}

function getInitialReps(defaultReps: string) {
  const firstNumber = defaultReps.match(/\d+/)?.[0];
  return firstNumber ?? '';
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
  card: { borderRadius: 20, padding: Spacing.four, gap: Spacing.two },
  title: { marginTop: Spacing.one },
  trainingDetails: { color: '#1F7A5A', fontWeight: '700' },
  primaryButton: {
    backgroundColor: '#1F7A5A',
    borderRadius: 14,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.three },
  setList: { gap: Spacing.two, marginTop: Spacing.one },
  setCard: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  setHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  setTitle: { fontSize: 17, fontWeight: '700' },
  inputGroup: { flex: 1, gap: Spacing.one },
  weightList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  weightCard: {
    minWidth: 64,
    borderWidth: 1,
    borderColor: '#C9E2D6',
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  selectedWeightCard: { backgroundColor: '#1F7A5A', borderColor: '#1F7A5A' },
  weightText: { fontWeight: '700' },
  selectedWeightText: { color: '#FFFFFF', fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#C9E2D6',
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  completeButton: {
    borderWidth: 1,
    borderColor: '#1F7A5A',
    borderRadius: 12,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  completedButton: { backgroundColor: '#1F7A5A' },
  completeText: { color: '#1F7A5A', fontWeight: '700' },
  completedButtonText: { color: '#FFFFFF', fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
