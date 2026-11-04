import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const bodyParts = ['胸', '背', '肩', '腿', '腹部'];

export default function BodyPartsScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="返回首页"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <ThemedText style={styles.backArrow}>‹</ThemedText>
          <ThemedText style={styles.backText}>返回</ThemedText>
        </Pressable>

        <View style={styles.header}>
          <ThemedText type="small" themeColor="textSecondary">
            开始训练
          </ThemedText>
          <ThemedText type="subtitle" style={styles.title}>
            选择训练部位
          </ThemedText>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            选择今天想要训练的部位，开始你的训练。
          </ThemedText>
        </View>

        <View style={styles.options}>
          {bodyParts.map((bodyPart, index) => (
            <Pressable
              key={bodyPart}
              accessibilityRole="button"
              onPress={bodyPart === '背' ? () => router.push('/workout-setup') : undefined}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
              <View style={styles.optionIcon}>
                <ThemedText style={styles.optionNumber}>{index + 1}</ThemedText>
              </View>
              <ThemedText style={styles.optionText}>{bodyPart}</ThemedText>
              <ThemedText style={styles.optionArrow}>→</ThemedText>
            </Pressable>
          ))}
        </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
  },
  backArrow: {
    color: '#1F7A5A',
    fontSize: 32,
    lineHeight: 28,
    marginRight: Spacing.one,
  },
  backText: {
    color: '#1F7A5A',
    fontWeight: '700',
  },
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
  },
  title: {
    color: '#173A2D',
    fontSize: 34,
    lineHeight: 42,
  },
  subtitle: {
    maxWidth: 320,
  },
  options: {
    gap: Spacing.two,
  },
  option: {
    minHeight: 72,
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F1ED',
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C9E2D6',
    marginRight: Spacing.three,
  },
  optionNumber: {
    color: '#1F7A5A',
    fontWeight: '700',
  },
  optionText: {
    color: '#173A2D',
    fontSize: 19,
    fontWeight: '700',
    flex: 1,
  },
  optionArrow: {
    color: '#1F7A5A',
    fontSize: 24,
  },
  pressed: {
    opacity: 0.72,
  },
});
