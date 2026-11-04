import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { saveWorkoutPreferences } from '@/lib/workout-preferences';
import type { BackGoal, Equipment, ExperienceLevel } from '@/types/workout';
import { Alert } from 'react-native';

const goals: { value: BackGoal; label: string; description: string }[] = [
  { value: 'width', label: '宽度', description: '重点训练背阔肌，塑造 V 形背部' },
  { value: 'thickness', label: '厚度', description: '重点训练中背部，让背部更有立体感' },
  { value: 'combined', label: '综合', description: '同时兼顾背部宽度和厚度' },
];

const levels: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: '新手' },
  { value: 'intermediate', label: '有经验' },
  { value: 'advanced', label: '进阶' },
];

const equipmentOptions: { value: Equipment; label: string }[] = [
  { value: 'dumbbells', label: '哑铃' },
  { value: 'barbell', label: '杠铃' },
  { value: 'bench', label: '训练凳' },
  { value: 'chest-supported-row-machine', label: '胸托划船器械' },
  { value: 'lat-pulldown-machine', label: '高位下拉机' },
  { value: 'cable-machine', label: '绳索机' },
  { value: 'rowing-machine', label: '划船器械' },
  { value: 'assisted-pull-up-machine', label: '辅助引体机' },
  { value: 'pull-up-bar', label: '单杠' },
];

export default function WorkoutSetupScreen() {
  const [goal, setGoal] = useState<BackGoal>('width');
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const toggleEquipment = (item: Equipment) => {
    setEquipment((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  };

  const openResults = async () => {
    try {
      await saveWorkoutPreferences({
        bodyPart: 'back',
        goal,
        experience,
        equipment,
      });
    } catch (error: unknown) {
      console.error('Failed to save workout preferences.', error);
      Alert.alert('保存失败', '训练偏好暂时无法保存，请稍后重试。');
      return;
    }

    router.push({
      pathname: '/workout-result',
      params: { goal, experience, equipment: equipment.join(',') },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backText}>‹ 返回</ThemedText>
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary">
            背部训练
          </ThemedText>
          <ThemedText type="subtitle" style={styles.title}>
            定制你的训练
          </ThemedText>

          <SectionTitle title="训练目标" />
          <View style={styles.optionList}>
            {goals.map((item) => (
              <ChoiceCard
                key={item.value}
                selected={goal === item.value}
                title={item.label}
                description={item.description}
                onPress={() => setGoal(item.value)}
              />
            ))}
          </View>

          <SectionTitle title="经验等级" />
          <View style={styles.chipList}>
            {levels.map((item) => (
              <ChoiceChip
                key={item.value}
                selected={experience === item.value}
                label={item.label}
                onPress={() => setExperience(item.value)}
              />
            ))}
          </View>

          <SectionTitle title="你现有的器械" />
          <ThemedText style={styles.hint} themeColor="textSecondary">
            只会推荐你现在可以完成的动作
          </ThemedText>
          <View style={styles.chipList}>
            {equipmentOptions.map((item) => (
              <ChoiceChip
                key={item.value}
                selected={equipment.includes(item.value)}
                label={item.label}
                onPress={() => toggleEquipment(item.value)}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={equipment.length === 0}
            onPress={openResults}
            style={({ pressed }) => [
              styles.submitButton,
              equipment.length === 0 && styles.disabledButton,
              pressed && styles.pressed,
            ]}>
            <ThemedText style={styles.submitText}>查看推荐动作</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <ThemedText style={styles.sectionTitle}>{title}</ThemedText>;
}

function ChoiceCard({
  selected,
  title,
  description,
  onPress,
}: {
  selected: boolean;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <ThemedView type={selected ? 'backgroundSelected' : 'backgroundElement'} style={styles.card}>
        <View style={styles.cardCopy}>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {description}
          </ThemedText>
        </View>
        <ThemedText style={selected ? styles.selectedMark : styles.unselectedMark}>
          {selected ? '✓' : '○'}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function ChoiceChip({
  selected,
  label,
  onPress,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <ThemedView type={selected ? 'backgroundSelected' : 'backgroundElement'} style={styles.chip}>
        <ThemedText
          themeColor={selected ? 'text' : 'textSecondary'}
          style={selected ? styles.selectedChipText : styles.chipText}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
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
  backText: { color: '#1F7A5A', fontWeight: '700', fontSize: 16 },
  title: { marginTop: Spacing.one, marginBottom: Spacing.four },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.three, marginBottom: Spacing.two },
  optionList: { gap: Spacing.two },
  card: { borderRadius: 18, padding: Spacing.three, flexDirection: 'row', alignItems: 'center' },
  cardCopy: { flex: 1, gap: Spacing.one },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  selectedMark: { color: '#1F7A5A', fontSize: 26 },
  unselectedMark: { color: '#9AAFA5', fontSize: 26 },
  chipList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { borderRadius: 20, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  chipText: { color: '#527064' },
  selectedChipText: { fontWeight: '700' },
  hint: { marginBottom: Spacing.two },
  submitButton: { backgroundColor: '#1F7A5A', borderRadius: 18, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.five },
  disabledButton: { backgroundColor: '#AFC5BB' },
  submitText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
