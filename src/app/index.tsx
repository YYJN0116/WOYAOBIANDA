import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  loadWelcomeCompleted,
  loadWorkoutPreferences,
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
];

export default function HomeScreen() {
  const startTraining = async () => {
    try {
      const welcomeCompleted = await loadWelcomeCompleted();
      if (!welcomeCompleted) {
        router.push('/welcome');
        return;
      }

      const preferences = await loadWorkoutPreferences();
      if (!preferences) {
        router.push('/welcome');
        return;
      }

      router.push({
        pathname: '/workout-plan',
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
              onPress={action.primary ? startTraining : () => router.push('/workout-plan')}
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
