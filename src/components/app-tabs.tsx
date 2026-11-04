import { NativeTabs } from 'expo-router/native-tabs';
import { usePathname } from 'expo-router';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const pathname = usePathname();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isWorkoutFlow =
    pathname.startsWith('/welcome') ||
    pathname.startsWith('/fitness-profile') ||
    pathname.startsWith('/body-parts') ||
    pathname.startsWith('/workout-') ||
    pathname.startsWith('/exercise/');

  return (
    <NativeTabs
      hidden={isWorkoutFlow}
      backBehavior="history"
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="body-parts">
        <NativeTabs.Trigger.Label>训练部位</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="welcome">
        <NativeTabs.Trigger.Label>欢迎</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="fitness-profile">
        <NativeTabs.Trigger.Label>健身资料</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workout-setup">
        <NativeTabs.Trigger.Label>训练设置</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workout-result">
        <NativeTabs.Trigger.Label>训练结果</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workout-plan">
        <NativeTabs.Trigger.Label>训练计划</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workout-session">
        <NativeTabs.Trigger.Label>开始训练</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workout-summary">
        <NativeTabs.Trigger.Label>训练总结</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="exercise/[id]">
        <NativeTabs.Trigger.Label>动作详情</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
