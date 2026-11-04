import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { saveFitnessProfile } from '@/lib/workout-preferences';
import type { FitnessProfile } from '@/types/workout';

const genders: { value: FitnessProfile['gender']; label: string }[] = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
  { value: 'prefer-not-to-say', label: '不方便回答' },
];
const goals: { value: FitnessProfile['goal']; label: string }[] = [
  { value: 'fat-loss', label: '减脂' },
  { value: 'body-shaping', label: '塑形' },
  { value: 'muscle-gain', label: '增肌' },
  { value: 'general-fitness', label: '提升体能' },
];
const workoutTimes: { value: FitnessProfile['preferredWorkoutTime']; label: string }[] = [
  { value: 'morning', label: '早上' },
  { value: 'afternoon', label: '下午' },
  { value: 'evening', label: '晚上' },
];

export default function FitnessProfileScreen() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<FitnessProfile['gender'] | null>(null);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [goal, setGoal] = useState<FitnessProfile['goal'] | null>(null);
  const [preferredWorkoutTime, setPreferredWorkoutTime] =
    useState<FitnessProfile['preferredWorkoutTime'] | null>(null);

  const submit = async () => {
    const ageValue = Number(age);
    const heightValue = Number(heightCm);
    const weightValue = Number(weightKg);

    if (
      !Number.isFinite(ageValue) ||
      ageValue <= 0 ||
      !gender ||
      !Number.isFinite(heightValue) ||
      heightValue <= 0 ||
      !Number.isFinite(weightValue) ||
      weightValue <= 0 ||
      !goal ||
      !preferredWorkoutTime
    ) {
      Alert.alert('还差一些资料', '请完成所有问题后再继续。');
      return;
    }

    try {
      const profile: FitnessProfile = {
        age: ageValue,
        gender,
        heightCm: heightValue,
        weightKg: weightValue,
        goal,
        preferredWorkoutTime,
      };
      await saveFitnessProfile(profile);
      router.replace('/body-parts');
    } catch (error: unknown) {
      console.error('Failed to save fitness profile.', error);
      Alert.alert('保存失败', '资料暂时无法保存，请稍后重试。');
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
            YOUR PROFILE
          </ThemedText>
          <ThemedText type="subtitle" style={styles.title}>
            先了解一下你
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            这些资料只用于帮助你建立更适合自己的计划。
          </ThemedText>

          <Field label="年龄">
            <TextInput value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="例如 25" placeholderTextColor="#9AAFA5" style={styles.input} />
          </Field>
          <Field label="身高（厘米）">
            <TextInput value={heightCm} onChangeText={setHeightCm} keyboardType="decimal-pad" placeholder="例如 170" placeholderTextColor="#9AAFA5" style={styles.input} />
          </Field>
          <Field label="体重（公斤）">
            <TextInput value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" placeholder="例如 65" placeholderTextColor="#9AAFA5" style={styles.input} />
          </Field>

          <ChoiceSection title="性别" options={genders} selected={gender} onSelect={setGender} />
          <ChoiceSection title="目前的目标" options={goals} selected={goal} onSelect={setGoal} />
          <ChoiceSection title="通常什么时候运动？" options={workoutTimes} selected={preferredWorkoutTime} onSelect={setPreferredWorkoutTime} />

          <Pressable onPress={submit} style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}>
            <ThemedText style={styles.submitText}>保存并继续</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {children}
    </View>
  );
}

function ChoiceSection<T extends string>({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: { value: T; label: string }[];
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <View style={styles.choiceList}>
        {options.map((option) => (
          <Pressable key={option.value} onPress={() => onSelect(option.value)} style={({ pressed }) => [styles.choice, selected === option.value && styles.selectedChoice, pressed && styles.pressed]}>
            <ThemedText style={selected === option.value ? styles.selectedChoiceText : styles.choiceText}>
              {option.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.four, paddingBottom: BottomTabInset },
  content: { paddingBottom: Spacing.five, gap: Spacing.two },
  backButton: { paddingVertical: Spacing.two, marginBottom: Spacing.two },
  backText: { color: '#1F7A5A', fontWeight: '700' },
  title: { color: '#173A2D', marginTop: Spacing.one },
  field: { gap: Spacing.one, marginTop: Spacing.two },
  input: { borderWidth: 1, borderColor: '#C9E2D6', borderRadius: 12, paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, color: '#173A2D', fontSize: 16 },
  section: { gap: Spacing.two, marginTop: Spacing.two },
  choiceList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  choice: { borderWidth: 1, borderColor: '#C9E2D6', borderRadius: 18, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  selectedChoice: { backgroundColor: '#1F7A5A', borderColor: '#1F7A5A' },
  choiceText: { color: '#527064' },
  selectedChoiceText: { color: '#FFFFFF', fontWeight: '700' },
  submitButton: { backgroundColor: '#1F7A5A', borderRadius: 18, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.four },
  submitText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
