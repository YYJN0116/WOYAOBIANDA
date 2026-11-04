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
import type { CompletedExercise } from '@/types/training';

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
    completedExercises: completedExercisesParam,
  } = useLocalSearchParams<{
    id?: string;
    workoutIds?: string;
    completedSets?: string;
    totalSets?: string;
    totalReps?: string;
    totalVolume?: string;
    startedAt?: string;
    completedExercises?: string;
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
  const completedExercises = parseCompletedExercises(
    Array.isArray(completedExercisesParam)
      ? completedExercisesParam[0]
      : completedExercisesParam,
  );
  const [setsState, setSetsState] = useState(() => ({
    exerciseId,
    values: createDefaultSets(exercise),
  }));
  const sets = setsState.exerciseId === exerciseId ? setsState.values : createDefaultSets(exercise);

  useEffect(() => {
    if (!exercise) {
      return;
    }

    let active = true;
    AsyncStorage.getItem(weightStorageKey(exercise.id))
      .then((savedWeight) => {
        if (!active) {
          return;
        }

        const savedWeights: SavedWeights =
          savedWeight === null ? {} : parseSavedWeights(savedWeight);
        setSetsState((current) => {
          const currentSets =
            current.exerciseId === exercise.id ? current.values : createDefaultSets(exercise);
          return {
            exerciseId: exercise.id,
            values: currentSets.map((set) => ({
              ...set,
              weight: savedWeights[set.setNumber] ?? savedWeights.default ?? set.weight,
            })),
          };
        });
      })
      .catch((error: unknown) => {
        console.error('Failed to load saved exercise weight.', error);
      });

    return () => {
      active = false;
    };
  }, [exercise]);

  // 完成一个动作（全部组）并跳转到下一动作或总结页
  const finishExercise = (currentSets: WorkoutSet[]) => {
    if (!exercise) {
      return;
    }
    const completedExercise = createCompletedExercise(exercise, currentSets);
    const addedSets = currentSets.length;
    const addedReps = currentSets.reduce((sum, set) => sum + Number(set.reps || 0), 0);
    const addedVolume = currentSets.reduce(
      (sum, set) => sum + Number(set.weight || 0) * Number(set.reps || 0),
      0,
    );
    const completedSets = Number(completedSetsParam ?? 0) + addedSets;
    const totalSets = Number(totalSetsParam ?? 0) + addedSets;
    const totalReps = Number(totalRepsParam ?? 0) + addedReps;
    const totalVolume = Number(totalVolumeParam ?? 0) + addedVolume;

    if (nextExerciseId) {
      const remainingExerciseIds = exerciseIds.slice(currentExerciseIndex + 1).join(',');
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
          completedExercises: JSON.stringify([...completedExercises, completedExercise]),
        },
      });
    } else {
      router.replace({
        pathname: '/workout-summary',
        params: {
          exerciseName: '背部训练',
          completedSets: String(completedSets),
          totalSets: String(totalSets),
          totalReps: String(totalReps),
          totalVolume: String(totalVolume),
          durationSeconds: String(Math.max(1, Math.floor((Date.now() - startedAt) / 1000))),
          startedAt: String(startedAt),
          completedExercises: JSON.stringify([...completedExercises, completedExercise]),
        },
      });
    }
  };

  // 单组勾选/取消
  const toggleSetCompleted = (setNumber: number) => {
    setSetsState((current) => {
      const currentSets =
        current.exerciseId === exerciseId ? current.values : createDefaultSets(exercise);
      const updatedSets = currentSets.map((set) =>
        set.setNumber === setNumber ? { ...set, completed: !set.completed } : set,
      );
      // 若勾选后全部完成，自动跳转
      if (updatedSets.length > 0 && updatedSets.every((s) => s.completed)) {
        finishExercise(updatedSets);
      }
      return { exerciseId: exerciseId ?? '', values: updatedSets };
    });
  };

  // 修改重量（同时持久化）
  const updateWeight = (setNumber: number, weight: string) => {
    if (!exercise) {
      return;
    }
    setSetsState((current) => {
      const currentSets =
        current.exerciseId === exerciseId ? current.values : createDefaultSets(exercise);
      const next = currentSets.map((set) =>
        set.setNumber === setNumber ? { ...set, weight } : set,
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
      return { exerciseId: exercise.id, values: next };
    });
  };

  // 修改次数
  const updateReps = (setNumber: number, reps: string) => {
    setSetsState((current) => {
      const currentSets =
        current.exerciseId === exerciseId ? current.values : createDefaultSets(exercise);
      const updated = currentSets.map((set) =>
        set.setNumber === setNumber ? { ...set, reps } : set,
      );
      return { exerciseId: exerciseId ?? '', values: updated };
    });
  };

  // 一键完成全部组
  const completeAllSets = () => {
    setSetsState((current) => {
      const currentSets =
        current.exerciseId === exerciseId ? current.values : createDefaultSets(exercise);
      const allCompleted = currentSets.map((set) => ({ ...set, completed: true }));
      finishExercise(allCompleted);
      return { exerciseId: exerciseId ?? '', values: allCompleted };
    });
  };

  const allCompleted = sets.length > 0 && sets.every((s) => s.completed);
  const completedCount = sets.filter((s) => s.completed).length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backText}>‹ 返回</ThemedText>
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

              {/* 表头 */}
              <View style={styles.tableHeader}>
                <ThemedText style={styles.colSet} themeColor="textSecondary">组</ThemedText>
                <ThemedText style={styles.colWeight} themeColor="textSecondary">重量 (kg)</ThemedText>
                <ThemedText style={styles.colReps} themeColor="textSecondary">次数</ThemedText>
                <ThemedText style={styles.colCheck} themeColor="textSecondary">完成</ThemedText>
              </View>

              {/* 每组数据行 */}
              {sets.map((set) => (
                <ThemedView
                  key={set.setNumber}
                  type={set.completed ? 'backgroundSelected' : 'background'}
                  style={styles.tableRow}>
                  {/* 组号 */}
                  <ThemedText style={[styles.colSet, styles.rowText]} themeColor="text">
                    {set.setNumber}
                  </ThemedText>

                  {/* 重量输入 */}
                  <TextInput
                    accessibilityLabel={`第${set.setNumber}组重量`}
                    keyboardType="decimal-pad"
                    onChangeText={(w) => updateWeight(set.setNumber, w)}
                    placeholder={set.weight || '0'}
                    placeholderTextColor="#9AAFA5"
                    style={[styles.colWeight, styles.rowInput, { color: theme.text }]}
                    value={set.weight}
                  />

                  {/* 次数输入 */}
                  <TextInput
                    accessibilityLabel={`第${set.setNumber}组次数`}
                    keyboardType="number-pad"
                    onChangeText={(r) => updateReps(set.setNumber, r)}
                    placeholder={exercise.defaultReps}
                    placeholderTextColor="#9AAFA5"
                    style={[styles.colReps, styles.rowInput, { color: theme.text }]}
                    value={set.reps}
                  />

                  {/* 单组完成勾选 */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ checked: set.completed }}
                    onPress={() => toggleSetCompleted(set.setNumber)}
                    style={[
                      styles.colCheck,
                      styles.checkButton,
                      set.completed && styles.checkButtonDone,
                    ]}>
                    <ThemedText style={set.completed ? styles.checkTextDone : styles.checkText}>
                      {set.completed ? '✓' : '○'}
                    </ThemedText>
                  </Pressable>
                </ThemedView>
              ))}

              {/* 进度提示 */}
              <ThemedText type="small" themeColor="textSecondary" style={styles.progressText}>
                已完成 {completedCount} / {sets.length} 组
              </ThemedText>

              {/* 一键完成全部组 */}
              <Pressable
                accessibilityRole="button"
                onPress={completeAllSets}
                style={({ pressed }) => [
                  styles.finishButton,
                  allCompleted && styles.finishButtonDone,
                  pressed && styles.pressed,
                ]}>
                <ThemedText style={styles.finishButtonText}>
                  {allCompleted
                    ? '已完成，继续 →'
                    : `完成本动作（全部 ${sets.length} 组）`}
                </ThemedText>
              </Pressable>
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

function createDefaultSets(exercise: (typeof backExercises)[number] | undefined): WorkoutSet[] {
  if (!exercise) {
    return [];
  }

  return Array.from({ length: exercise.defaultSets }, (_, index) => ({
    setNumber: index + 1,
    weight: '',
    reps: getInitialReps(exercise.defaultReps),
    completed: false,
  }));
}

function createCompletedExercise(
  exercise: (typeof backExercises)[number],
  sets: WorkoutSet[],
): CompletedExercise {
  return {
    id: exercise.id,
    name: exercise.name,
    sets: sets
      .filter((set) => set.completed)
      .map((set) => ({
        setNumber: set.setNumber,
        weight: Number(set.weight) || 0,
        reps: Number(set.reps) || 0,
        completedAt: new Date().toISOString(),
      })),
  };
}

function parseCompletedExercises(value?: string): CompletedExercise[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (exercise): exercise is CompletedExercise =>
        !!exercise &&
        typeof exercise === 'object' &&
        typeof exercise.id === 'string' &&
        typeof exercise.name === 'string' &&
        Array.isArray(exercise.sets) &&
        exercise.sets.every(
          (set: unknown) =>
            !!set &&
            typeof set === 'object' &&
            typeof (set as Record<string, unknown>).setNumber === 'number' &&
            typeof (set as Record<string, unknown>).weight === 'number' &&
            typeof (set as Record<string, unknown>).reps === 'number',
        ),
    );
  } catch {
    return [];
  }
}

type SavedWeights = Partial<Record<number, string>> & { default?: string };

function parseSavedWeights(value: string): SavedWeights {
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as SavedWeights;
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
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.one,
    marginTop: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#C9E2D6',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    marginTop: Spacing.one,
  },
  colSet: { width: 28, textAlign: 'center', fontSize: 13 },
  colWeight: { flex: 2, textAlign: 'center', fontSize: 13 },
  colReps: { flex: 2, textAlign: 'center', fontSize: 13 },
  colCheck: { width: 44, alignItems: 'center' },
  rowText: { fontSize: 15, fontWeight: '700' },
  rowInput: {
    borderWidth: 1,
    borderColor: '#C9E2D6',
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    fontSize: 15,
    marginHorizontal: 4,
    textAlign: 'center',
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#C9E2D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDone: { backgroundColor: '#1F7A5A', borderColor: '#1F7A5A' },
  checkText: { color: '#9AAFA5', fontSize: 16, fontWeight: '700' },
  checkTextDone: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  progressText: { marginTop: Spacing.two, textAlign: 'right' },
  finishButton: {
    backgroundColor: '#1F7A5A',
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  finishButtonDone: { backgroundColor: '#527064' },
  finishButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});