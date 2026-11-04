import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  const pathname = usePathname();
  const isWorkoutFlow =
    pathname.startsWith('/welcome') ||
    pathname.startsWith('/fitness-profile') ||
    pathname.startsWith('/body-parts') ||
    pathname.startsWith('/workout-') ||
    pathname.startsWith('/exercise/');

  return (
    <Tabs style={styles.container}>
      <TabSlot style={styles.slot} />
      {!isWorkoutFlow && (
        <TabList asChild>
          <MobileTabList>
            <TabTrigger name="index" href="/" asChild>
              <TabButton>Home</TabButton>
            </TabTrigger>
            <TabTrigger name="explore" href="/explore" asChild>
              <TabButton>Explore</TabButton>
            </TabTrigger>
            <TabTrigger name="body-parts" href="/body-parts" asChild>
              <TabButton style={styles.hiddenTab}>训练部位</TabButton>
            </TabTrigger>
            <TabTrigger name="welcome" href="/welcome" asChild>
              <TabButton style={styles.hiddenTab}>欢迎</TabButton>
            </TabTrigger>
            <TabTrigger name="fitness-profile" href="/fitness-profile" asChild>
              <TabButton style={styles.hiddenTab}>健身资料</TabButton>
            </TabTrigger>
            <TabTrigger name="workout-setup" href="/workout-setup" asChild>
              <TabButton style={styles.hiddenTab}>训练设置</TabButton>
            </TabTrigger>
            <TabTrigger name="workout-result" href="/workout-result" asChild>
              <TabButton style={styles.hiddenTab}>训练结果</TabButton>
            </TabTrigger>
            <TabTrigger name="workout-plan" href="/workout-plan" asChild>
              <TabButton style={styles.hiddenTab}>训练计划</TabButton>
            </TabTrigger>
            <TabTrigger name="workout-session" href="/workout-session" asChild>
              <TabButton style={styles.hiddenTab}>开始训练</TabButton>
            </TabTrigger>
            <TabTrigger name="workout-summary" href="/workout-summary" asChild>
              <TabButton style={styles.hiddenTab}>训练总结</TabButton>
            </TabTrigger>
            <TabTrigger name="workout-history" href="/workout-history" asChild>
              <TabButton style={styles.hiddenTab}>训练记录</TabButton>
            </TabTrigger>
            <TabTrigger name="exercise/[id]" href="/exercise/[id]" asChild>
              <TabButton style={styles.hiddenTab}>动作详情</TabButton>
            </TabTrigger>
          </MobileTabList>
        </TabList>
      )}
    </Tabs>
  );
}

function MobileTabList(props: TabListProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      {...props}
      style={[styles.tabListContainer, { bottom: Math.max(Spacing.two, insets.bottom) }]}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {props.children}
      </ThemedView>
    </View>
  );
}

export function TabButton({ children, isFocused, ref: _ref, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText
          type="small"
          themeColor={isFocused ? 'text' : 'textSecondary'}
          style={isFocused ? styles.activeTabText : styles.tabText}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButtonView: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F7A5A',
  },
  hiddenTab: {
    display: 'none',
  },
  pressed: {
    opacity: 0.7,
  },
});