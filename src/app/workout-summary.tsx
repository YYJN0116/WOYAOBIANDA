import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { saveCompletedWorkout } from '@/lib/workout-preferences';

export default function WorkoutSummaryScreen() {
  const params = useLocalSearchParams<{
    exerciseName?: string;
    durationSeconds?: string;
    completedSets?: string;
    totalSets?: string;
    totalReps?: string;
    totalVolume?: string;
  }>();
  const theme = useTheme();
  const [note, setNote] = useState('');
  const durationSeconds = Number(params.durationSeconds ?? 0);
  const completedSets = Number(params.completedSets ?? 0);
  const totalSets = Number(params.totalSets ?? 0);
  const totalReps = Number(params.totalReps ?? 0);

  const finishWorkout = async () => {
    try {
      await saveCompletedWorkout({
        id: `${Date.now()}`,
        exerciseName: params.exerciseName ?? '背部训练',
        completedAt: new Date().toISOString(),
        durationSeconds,
        completedSets,
        totalSets,
        totalVolume: Number(params.totalVolume ?? 0),
        note: note.trim() || undefined,
      });
      router.replace('/workout-plan');
    } catch (error: unknown) {
      console.error('Failed to save completed workout.', error);
      Alert.alert('保存失败', '训练总结暂时无法保存，请稍后重试。');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="small" themeColor="textSecondary">
            WORKOUT COMPLETE
          </ThemedText>
          <ThemedText type="subtitle" themeColor="text" style={styles.title}>
            训练完成
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            今天的训练已经完成，做得很好。
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText themeColor="text" style={styles.cardTitle}>
              {params.exerciseName ?? '背部训练'}
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              完成 {completedSets} / {totalSets} 组
            </ThemedText>
            <ThemedText style={styles.volume}>{totalReps} 次</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              完成总次数
            </ThemedText>
          </ThemedView>

          <ThemedText style={styles.sectionTitle} themeColor="text">
            训练备注
          </ThemedText>
          <TextInput
            multiline
            onChangeText={setNote}
            placeholder="记录今天的感受（可选）"
            placeholderTextColor="#9AAFA5"
            style={[styles.noteInput, { color: theme.text }]}
            value={note}
          />
          <Pressable
            onPress={finishWorkout}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <ThemedText style={styles.buttonText}>保存并返回训练计划</ThemedText>
          </Pressable>
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
  content: { paddingBottom: Spacing.five, gap: Spacing.two },
  title: { marginTop: Spacing.one },
  card: { borderRadius: 20, padding: Spacing.four, gap: Spacing.two, marginTop: Spacing.four },
  cardTitle: { fontSize: 20, fontWeight: '700' },
  volume: {
    color: '#1F7A5A',
    fontSize: 32,
    lineHeight: 42,
    fontWeight: '700',
    marginTop: Spacing.two,
    paddingTop: Spacing.one,
    includeFontPadding: true,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.four },
  noteInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#C9E2D6',
    borderRadius: 14,
    padding: Spacing.three,
    textAlignVertical: 'top',
  },
  button: { backgroundColor: '#1F7A5A', borderRadius: 18, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.two },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
