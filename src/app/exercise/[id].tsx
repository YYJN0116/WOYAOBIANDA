import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { backExercises } from '@/data/back-exercises';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const exercise = backExercises.find((item) => item.id === id);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backText}>‹ 返回推荐</ThemedText>
          </Pressable>

          {exercise ? (
            <>
              <View style={styles.visualPlaceholder}>
                <View style={styles.visualBadge}>
                  <ThemedText style={styles.visualBadgeText}>FIT</ThemedText>
                </View>
                <ThemedText style={styles.visualTitle}>动作训练</ThemedText>
                <ThemedText style={styles.visualSubtitle}>按步骤完成每一组动作</ThemedText>
              </View>

              <ThemedText type="small" themeColor="textSecondary">
                背部训练
              </ThemedText>
              <ThemedText type="subtitle" style={styles.title}>
                {exercise.name}
              </ThemedText>
              <ThemedText style={styles.trainingDetails}>
                {exercise.defaultSets} 组 × {exercise.defaultReps} 次 · 休息{' '}
                {exercise.restSeconds} 秒
              </ThemedText>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({ pathname: '/workout-session', params: { id: exercise.id } })
                }
                style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
                <ThemedText style={styles.startButtonText}>开始训练</ThemedText>
              </Pressable>

              <Section title="训练肌群">
                <ThemedText>
                  主要：{exercise.primaryMuscles.join('、')}
                  {'\n'}辅助：{exercise.secondaryMuscles.join('、')}
                </ThemedText>
              </Section>

              <Section title="所需器械">
                <ThemedText>{getEquipmentNames(exercise.equipment)}</ThemedText>
              </Section>

              <Section title="新手安全提示">
                {exercise.beginnerSafetyTips.map((tip) => (
                  <ThemedText key={tip} style={styles.listItem}>
                    • {tip}
                  </ThemedText>
                ))}
              </Section>

              <Section title="动作说明">
                {exercise.instructions.map((instruction, index) => (
                  <ThemedText key={instruction} style={styles.listItem}>
                    {index + 1}. {instruction}
                  </ThemedText>
                ))}
              </Section>
            </>
          ) : (
            <ThemedView type="backgroundElement" style={styles.empty}>
              <ThemedText style={styles.emptyTitle}>找不到这个动作</ThemedText>
              <ThemedText themeColor="textSecondary">
                动作数据可能已更新，请返回推荐列表重新选择。
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );
}

function getEquipmentNames(equipment: string[]) {
  const names: Record<string, string> = {
    dumbbells: '哑铃',
    barbell: '杠铃',
    bench: '训练凳',
    'chest-supported-row-machine': '胸托划船器械',
    'cable-machine': '绳索机',
    'lat-pulldown-machine': '高位下拉机',
    'rowing-machine': '固定器械划船',
    'assisted-pull-up-machine': '辅助引体机',
    'pull-up-bar': '单杠',
  };
  return equipment.map((item) => names[item] ?? item).join('、');
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
  visualPlaceholder: {
    height: 190,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F1ED',
    marginBottom: Spacing.four,
    overflow: 'hidden',
    gap: Spacing.one,
  },
  visualBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F7A5A',
  },
  visualBadgeText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  visualTitle: { color: '#173A2D', fontSize: 18, fontWeight: '700' },
  visualSubtitle: { color: '#527064', fontSize: 13 },
  title: { color: '#173A2D', marginTop: Spacing.one },
  trainingDetails: { color: '#1F7A5A', fontWeight: '700', marginTop: Spacing.two },
  startButton: {
    backgroundColor: '#1F7A5A',
    borderRadius: 18,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  startButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  section: { marginTop: Spacing.four, gap: Spacing.two },
  sectionTitle: { color: '#173A2D', fontSize: 18, fontWeight: '700' },
  listItem: { color: '#527064', lineHeight: 24 },
  empty: { borderRadius: 20, padding: Spacing.four, gap: Spacing.two },
  emptyTitle: { color: '#173A2D', fontSize: 18, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
