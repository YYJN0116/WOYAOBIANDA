import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { loadCompletedWorkouts } from '@/lib/workout-preferences';
import type { CompletedWorkout } from '@/types/training';

export default function WorkoutHistoryScreen() {
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoading(true);
      setHasError(false);

      loadCompletedWorkouts()
        .then((workouts) => {
          if (active) {
            setHistory(workouts);
          }
        })
        .catch((error: unknown) => {
          console.error('Failed to load workout history.', error);
          if (active) {
            setHasError(true);
          }
        })
        .finally(() => {
          if (active) {
            setIsLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backText}>‹ 返回</ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary">
            YOUR PROGRESS
          </ThemedText>
          <ThemedText type="subtitle" themeColor="text" style={styles.title}>
            训练记录
          </ThemedText>

          {isLoading ? (
            <ThemedText themeColor="textSecondary" style={styles.message}>
              正在读取训练记录…
            </ThemedText>
          ) : hasError ? (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText themeColor="text" style={styles.emptyTitle}>
                暂时无法读取记录
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                请返回后重试。已保存的记录不会因此被删除。
              </ThemedText>
            </ThemedView>
          ) : history.length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText themeColor="text" style={styles.emptyTitle}>
                还没有训练记录
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                完成一次训练并保存总结后，记录会显示在这里。
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.list}>
              {history.map((workout) => (
                <ThemedView key={workout.id} type="backgroundElement" style={styles.card}>
                  <ThemedText themeColor="text" style={styles.cardTitle}>
                    {workout.exerciseName}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatDate(workout.completedAt)} · {formatDuration(workout.durationSeconds)}
                  </ThemedText>
                  <View style={styles.stats}>
                    <Stat label="完成组数" value={`${workout.completedSets} / ${workout.totalSets}`} />
                    <Stat label="训练容量" value={`${formatNumber(workout.totalVolume)} kg`} />
                  </View>
                  {workout.exercises && workout.exercises.length > 0 ? (
                    <View style={styles.exerciseList}>
                      {workout.exercises.map((exercise) => (
                        <View key={exercise.id} style={styles.exercise}>
                          <ThemedText themeColor="text" style={styles.exerciseName}>
                            {exercise.name}
                          </ThemedText>
                          {exercise.sets.map((set) => (
                            <ThemedText
                              key={`${exercise.id}-${set.setNumber}`}
                              type="small"
                              themeColor="textSecondary">
                              第 {set.setNumber} 组：{formatNumber(set.weight)} kg × {set.reps} 次
                            </ThemedText>
                          ))}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <ThemedText type="small" themeColor="textSecondary">
                      此记录来自旧版本，仅保存了训练汇总。
                    </ThemedText>
                  )}
                  {workout.note ? (
                    <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
                      备注：{workout.note}
                    </ThemedText>
                  ) : null}
                </ThemedView>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText themeColor="text" style={styles.statValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes} 分 ${remainingSeconds} 秒` : `${remainingSeconds} 秒`;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
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
  message: { marginTop: Spacing.four },
  emptyCard: { borderRadius: 20, padding: Spacing.four, gap: Spacing.two, marginTop: Spacing.four },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  list: { gap: Spacing.three, marginTop: Spacing.four },
  card: { borderRadius: 20, padding: Spacing.four, gap: Spacing.two },
  cardTitle: { fontSize: 20, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: Spacing.five, marginTop: Spacing.one },
  stat: { gap: Spacing.one },
  statValue: { color: '#1F7A5A', fontWeight: '700' },
  exerciseList: { gap: Spacing.three, marginTop: Spacing.two },
  exercise: { gap: Spacing.one },
  exerciseName: { fontWeight: '700' },
  note: { marginTop: Spacing.one },
});
