import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { usePathname } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

import { ExternalLink } from './external-link';
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
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      {!isWorkoutFlow && (
        <TabList asChild>
          <CustomTabList>
            <TabTrigger name="home" href="/" asChild>
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
          </CustomTabList>
        </TabList>
      )}
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ref: _ref, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          Expo Starter
        </ThemedText>

        {props.children}

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={styles.externalPressable}>
            <ThemedText type="link">Docs</ThemedText>
            <SymbolView
              tintColor={colors.text}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  hiddenTab: {
    display: 'none',
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});
