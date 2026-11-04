import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { recommendBackWorkout } from '@/lib/recommend-back-workout';
import {
  loadSelectedExerciseIds,
  loadWeeklyTrainingPlan,
  loadWorkoutPreferences,
  saveWeeklyTrainingPlan,
} from '@/lib/workout-preferences';
import { backExercises } from '@/data/back-exercises';
import {
  MAX_DAILY_EXERCISES,
} from '@/types/workout';
import type {
  PlannedTrainingFocus,
  WeeklyTrainingPlan,
  WorkoutPreferences,
} from '@/types/workout';

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
const focusOptions: { value: PlannedTrainingFocus; label: string }[] = [
  { value: 'back', label: '背部' },
  { value: 'biceps', label: '二头肌' },
  { value: 'chest', label: '胸部' },
  { value: 'triceps', label: '三头肌' },
  { value: 'shoulders', label: '肩部' },
  { value: 'legs', label: '腿部' },
  { value: 'abs', label: '腹部' },
  { value: 'cardio', label: '有氧' },
  { value: 'rest', label: '休息' },
];

export default function WorkoutPlanScreen() {
  const [preferences, setPreferences] = useState<WorkoutPreferences | null>(null);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyTrainingPlan>({});
  const [selectedDay, setSelectedDay] = useState(String(new Date().getDay() || 7));
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;
  const selectedFocuses = weeklyPlan[selectedDay] ?? [];
  const isTrainingDay = selectedFocuses.length > 0 && !selectedFocuses.includes('rest');
  const recommendedExercises = preferences ? recommendBackWorkout(preferences) : [];
  const exercises =
    selectedExerciseIds.length >= 4 && selectedExerciseIds.length <= MAX_DAILY_EXERCISES
      ? selectedExerciseIds
          .map((id) => backExercises.find((exercise) => exercise.id === id))
          .filter((exercise): exercise is (typeof backExercises)[number] => Boolean(exercise))
      : recommendedExercises.slice(0, 4);
  const workoutIds = exercises.map((exercise) => exercise.id).join(',');

  useEffect(() => {
    Promise.all([
      loadWorkoutPreferences(),
      loadSelectedExerciseIds(),
      loadWeeklyTrainingPlan(),
    ])
      .then(([savedPreferences, savedExerciseIds, savedPlan]) => {
        setPreferences(savedPreferences);
        setSelectedExerciseIds(savedExerciseIds);
        setWeeklyPlan(savedPlan ?? {});
      })
      .catch((error: unknown) => {
        console.error('Failed to load workout plan preferences.', error);
        Alert.alert('读取失败', '暂时无法读取训练计划，请稍后重试。');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const toggleFocus = (focus: PlannedTrainingFocus) => {
    setWeeklyPlan((current) => {
      const selected = current[selectedDay] ?? [];
      const next: PlannedTrainingFocus[] = selected.includes(focus)
        ? selected.filter((item) => item !== focus)
        : focus === 'rest'
          ? ['rest']
          : [...selected.filter((item) => item !== 'rest'), focus];
      return { ...current, [selectedDay]: next };
    });
  };

  const savePlan = async () => {
    try {
      await saveWeeklyTrainingPlan(weeklyPlan);
    } catch (error: unknown) {
      console.error('Failed to save weekly training plan.', error);
      Alert.alert('保存失败', '训练计划暂时无法保存，请稍后重试。');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backText}>‹ 返回</ThemedText>
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary">
            TRAINING PLAN
          </ThemedText>
          <ThemedText type="subtitle" themeColor="text" style={styles.title}>
            训练计划
          </ThemedText>
          <ThemedText style={styles.cycleText}>第 1 个 Cycle</ThemedText>

          <View style={styles.weekRow}>
            {weekDays.map((day, index) => {
              const dayNumber = index + 1;
              const date = getDateForWeekday(dayNumber);
              const dateKey = String(dayNumber);
              const isToday = index === todayIndex;
              const hasTraining = (weeklyPlan[dateKey] ?? []).length > 0;
              return (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDay(dateKey)}
                  style={[
                    styles.dayItem,
                    isToday && styles.todayItem,
                    selectedDay === dateKey && styles.selectedDayItem,
                  ]}>
                  <ThemedText themeColor={isToday || selectedDay === dateKey ? 'text' : 'textSecondary'} style={isToday ? styles.todayText : styles.dayText}>
                    {day}
                  </ThemedText>
                  <ThemedText style={styles.dateText}>{date.getDate()}</ThemedText>
                  <ThemedText style={hasTraining ? styles.trainingDot : styles.restDot}>
                    {hasTraining ? '●' : '·'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {isLoading ? (
            <ThemedText style={styles.statusText} themeColor="textSecondary">
              正在加载训练计划...
            </ThemedText>
          ) : !preferences ? (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText style={styles.cardTitle}>先完成你的训练设置</ThemedText>
              <ThemedText themeColor="textSecondary">
                设置完成后，这里会显示你的当天训练动作。
              </ThemedText>
              <Pressable onPress={() => router.push('/body-parts')} style={styles.primaryButton}>
                <ThemedText style={styles.primaryButtonText}>开始设置</ThemedText>
              </Pressable>
            </ThemedView>
          ) : (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="small" themeColor="textSecondary">
                {selectedDay === String(todayIndex + 1) ? '今天 · ' : ''}星期{weekDays[Number(selectedDay) - 1]} · {getDateForWeekday(Number(selectedDay)).getMonth() + 1}/{getDateForWeekday(Number(selectedDay)).getDate()}
              </ThemedText>
              <ThemedText themeColor="text" style={styles.cardTitle}>
                {selectedFocuses.length === 0 || selectedFocuses.includes('rest') ? '未安排训练' : selectedFocuses.map(getFocusLabel).join(' + ')}
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                {isTrainingDay ? '按照当前计划完成今天的训练。' : '点击下方安排今天的训练内容。'}
              </ThemedText>

              <View style={styles.focusList}>
                {focusOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => toggleFocus(option.value)}
                    style={[
                      styles.focusChip,
                      selectedFocuses.includes(option.value) && styles.selectedFocusChip,
                    ]}>
                    <ThemedText
                      themeColor={selectedFocuses.includes(option.value) ? 'text' : 'textSecondary'}
                      style={styles.focusChipText}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={savePlan} style={styles.savePlanButton}>
                <ThemedText style={styles.primaryButtonText}>保存当天安排</ThemedText>
              </Pressable>

              {selectedFocuses.includes('back') && exercises.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: '/workout-session',
                      params: {
                        id: String(exercises[0].id),
                        workoutIds,
                        startedAt: String(Date.now()),
                      },
                    })
                  }
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={styles.primaryButtonText}>开始今天训练</ThemedText>
                </Pressable>
              )}

              {selectedFocuses.includes('back') && exercises.length === 0 && (
                <ThemedText style={styles.emptyText} themeColor="textSecondary">
                  当前设置暂时没有匹配的动作，请返回训练设置调整器械。
                </ThemedText>
              )}

              {selectedFocuses.includes('back') && exercises.length > 0 && (
                <View style={styles.exerciseList}>
                  {exercises.map((exercise, index) => (
                    <Pressable
                      key={exercise.id}
                      onPress={() =>
                        router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })
                      }
                      style={({ pressed }) => [styles.exerciseRow, pressed && styles.pressed]}>
                      <ThemedText style={styles.exerciseNumber}>{index + 1}</ThemedText>
                      <View style={styles.exerciseCopy}>
                        <ThemedText themeColor="text" style={styles.exerciseName}>
                          {exercise.name}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {exercise.defaultSets} 组 × {exercise.defaultReps} 次
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.arrow}>›</ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
            </ThemedView>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function getDateForWeekday(dayNumber: number) {
  const date = new Date();
  const currentDay = date.getDay() || 7;
  date.setDate(date.getDate() + dayNumber - currentDay);
  return date;
}

function getFocusLabel(value: PlannedTrainingFocus) {
  return focusOptions.find((option) => option.value === value)?.label ?? value;
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
  cycleText: { color: '#1F7A5A', fontWeight: '700', marginTop: Spacing.two },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.four },
  dayItem: { alignItems: 'center', justifyContent: 'center', width: 36, height: 56, borderRadius: 18 },
  todayItem: { backgroundColor: '#C9E2D6' },
  selectedDayItem: { borderWidth: 2, borderColor: '#1F7A5A' },
  dayText: { color: '#527064', fontWeight: '700' },
  todayText: { fontWeight: '700' },
  dateText: { color: '#527064', fontSize: 12, marginTop: 2 },
  trainingDot: { color: '#1F7A5A', fontSize: 16, marginTop: Spacing.one },
  restDot: { color: '#AFC5BB', fontSize: 20, lineHeight: 16, marginTop: Spacing.one },
  statusText: { marginTop: Spacing.five },
  card: { borderRadius: 20, padding: Spacing.four, gap: Spacing.two, marginTop: Spacing.five },
  cardTitle: { fontSize: 20, fontWeight: '700' },
  primaryButton: { backgroundColor: '#1F7A5A', borderRadius: 14, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.two },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700' },
  emptyText: { marginTop: Spacing.two },
  focusList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  focusChip: { borderWidth: 1, borderColor: '#C9E2D6', borderRadius: 18, paddingHorizontal: Spacing.two, paddingVertical: Spacing.two },
  selectedFocusChip: { backgroundColor: '#C9E2D6', borderColor: '#1F7A5A' },
  focusChipText: { fontWeight: '600' },
  savePlanButton: { backgroundColor: '#1F7A5A', borderRadius: 14, padding: Spacing.two, alignItems: 'center', marginTop: Spacing.two },
  exerciseList: { gap: Spacing.two, marginTop: Spacing.two },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  exerciseNumber: { color: '#1F7A5A', fontSize: 18, fontWeight: '700', width: 24 },
  exerciseCopy: { flex: 1, gap: Spacing.one },
  exerciseName: { fontSize: 17, fontWeight: '700' },
  arrow: { color: '#1F7A5A', fontSize: 28 },
  pressed: { opacity: 0.72 },
});
