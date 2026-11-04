import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { backExercises } from '@/data/back-exercises';
import {
  loadProfileCompleted,
  loadWorkoutPreferences,
  loadSelectedExerciseIds,
} from '@/lib/workout-preferences';

const actions = [
  {
    title: '开始训练',
    description: '从今天开始，完成你的第一组训练',
    primary: true,
  },
  {
    title: '训练计划',
    description: '根据目标查看适合你的训练安排',
    primary: false,
  },
  {
    title: '训练记录',
    description: '回顾已完成的训练、重量和次数',
    primary: false,
  },
];

export default function HomeScreen() {
  useEffect(() => {
    loadProfileCompleted()
      .then((completed) => {
        if (!completed) {
          // 未完成问卷的全新用户首次启动导向问卷
          router.replace('/welcome');
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to check profile status on mount.', error);
      });
  }, []);

  const startTraining = async () => {
    try {
      const profileCompleted = await loadProfileCompleted();
      if (!profileCompleted) {
        router.push('/welcome');
        return;
      }

      const preferences = await loadWorkoutPreferences();
      if (!preferences) {
        // 已完成问卷，跳过问卷直接进入部位设置
        router.push('/body-parts');
        return;
      }

      // 尝试加载已选动作，直接进入训练记录界面
      let selectedIds: string[] = [];
      try {
        selectedIds = await loadSelectedExerciseIds();
      } catch {
        // 未选动作或无效 → 降级到动作选择页
      }

      if (selectedIds.length >= 4) {
        const exercises = selectedIds
          .map((id) => backExercises.find((e) => e.id === id))
          .filter((e): e is (typeof backExercises)[number] => Boolean(e));
        if (exercises.length >= 4) {
          router.push({
            pathname: '/workout-session',
            params: {
              id: exercises[0].id,
              workoutIds: exercises.map((e) => e.id).join(','),
              startedAt: String(Date.now()),
            },
          });
          return;
        }
      }

      // 没有已选动作 → 进入动作选择页
      router.push({
        pathname: '/workout-result',
        params: {
          goal: preferences.goal,
          experience: preferences.experience,
          equipment: preferences.equipment.join(','),
        },
      });
    } catch (error: unknown) {
      console.error('Failed to start saved workout.', error);
      Alert.alert('读取失败', '无法打开已保存的训练，请重新选择训练设置。');
      router.push('/body-parts');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="small" themeColor="textSecondary">
            FITNESS COACH
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            今天也要动起来
          </ThemedText>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            为自己留出一点时间，健康从每一次坚持开始。
          </ThemedText>
        </View>

        <View style={styles.actionList}>
          {actions.map((action) => (
            <Pressable
              key={action.title}
              accessibilityRole="button"
              onPress={
                action.title === '训练记录'
                  ? () => router.push('/workout-history')
                  : action.primary
                    ? startTraining
                    : () => router.push('/workout-plan')
              }
              style={({ pressed }) => [
                styles.actionButton,
                action.primary ? styles.primaryButton : styles.secondaryButton,
                pressed && styles.pressedButton,
              ]}>
              <View style={styles.actionCopy}>
                <ThemedText
                  type="subtitle"
                  style={action.primary ? styles.primaryTitle : styles.secondaryTitle}>
                  {action.title}
                </ThemedText>
                <ThemedText
                  style={action.primary ? styles.primaryDescription : styles.secondaryDescription}>
                  {action.description}
                </ThemedText>
              </View>
              <ThemedText style={action.primary ? styles.primaryArrow : styles.secondaryArrow}>
                →
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="small" style={styles.footer} themeColor="textSecondary">
          每一次训练，都是更好的自己
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.two,
  },
  header: {
    paddingTop: Spacing.five,
    gap: Spacing.two,
  },
  title: {
    fontSize: 36,
    lineHeight: 44,
  },
  subtitle: {
    maxWidth: 320,
  },
  actionList: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.five,
  },
  actionButton: {
    minHeight: 112,
    borderRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: '#1F7A5A',
  },
  secondaryButton: {
    backgroundColor: '#E8F1ED',
  },
  pressedButton: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  actionCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  primaryTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 34,
  },
  secondaryTitle: {
    color: '#173A2D',
    fontSize: 26,
    lineHeight: 34,
  },
  primaryDescription: {
    color: '#D8F0E5',
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryDescription: {
    color: '#527064',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryArrow: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 34,
    marginLeft: Spacing.two,
  },
  secondaryArrow: {
    color: '#1F7A5A',
    fontSize: 30,
    lineHeight: 34,
    marginLeft: Spacing.two,
  },
  footer: {
    textAlign: 'center',
  },
});