import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  completeWelcome,
  loadFitnessProfile,
  loadProfileCompleted,
} from '@/lib/workout-preferences';

export default function WelcomeScreen() {
  useEffect(() => {
    loadProfileCompleted()
      .then((completed) => {
        if (completed) {
          router.replace('/body-parts');
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to check profile completion in welcome.', error);
      });
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText type="small" themeColor="textSecondary">
            FITNESS COACH
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            欢迎来到你的训练空间
          </ThemedText>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            我们会根据你的目标和习惯，帮你建立更适合自己的训练计划。
          </ThemedText>

          <View style={styles.featureList}>
            <Feature title="找到适合你的动作" description="根据经验和器械生成训练推荐。" />
            <Feature title="记录每一次进步" description="保存重量、次数和完成状态。" />
            <Feature title="逐步建立训练习惯" description="从当天计划开始，持续完成每个 Cycle。" />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            try {
              await completeWelcome();
              const profile = await loadFitnessProfile();
              router.push(profile ? '/body-parts' : '/fitness-profile');
            } catch (error: unknown) {
              console.error('Failed to load fitness profile from welcome.', error);
              Alert.alert('保存失败', '欢迎设置暂时无法保存，请稍后重试。');
            }
          }}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <ThemedText style={styles.buttonText}>开始设置</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.feature}>
      <ThemedText style={styles.featureTitle}>{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {description}
      </ThemedText>
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
    paddingBottom: BottomTabInset + Spacing.two,
  },
  content: { flex: 1, justifyContent: 'center', gap: Spacing.two },
  title: { marginTop: Spacing.two, lineHeight: 56 },
  subtitle: { maxWidth: 340, lineHeight: 25 },
  featureList: { gap: Spacing.two, marginTop: Spacing.four },
  feature: { borderRadius: 18, padding: Spacing.three, gap: Spacing.one },
  featureTitle: { color: '#173A2D', fontSize: 17, fontWeight: '700' },
  button: {
    backgroundColor: '#1F7A5A',
    borderRadius: 18,
    padding: Spacing.three,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});