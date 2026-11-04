# 健身教练（Fitness Coach）

一个使用 Expo、React Native、TypeScript 和 Expo Router 构建的移动端健身指导应用。当前版本聚焦于背部训练：用户填写健身资料、选择训练目标和可用器械后，应用会生成适合当前经验水平的训练建议。

## 当前功能

- 欢迎页和健身资料填写流程（支持年龄、身高、体重、目标、习惯时段及每周训练天数选择）
- 智能初始化路由：首次启动引导问卷，已完成问卷用户启动直达训练中心，防止重复弹出
- 健身目标、训练时间、经验水平和可用器械多维筛选
- 直通式训练体验：点击“开始训练”直接根据已有偏好进入训练打卡，无需强制预先排期
- 紧凑型组打卡交互：集中填报重量与次数，支持单组微调与“一键完成整组动作”推进
- 训练总结与本地持久化：每次训练的每组重量、次数、总容量及备注自动保存至本地 AsyncStorage，支持回看明细
- 动作详情页面与背部动作库指南
- 深色模式自适应、全平台统一无头路由（消除原生平台底栏异常）及 Web 支持

## 技术栈

- Expo SDK 58
- React Native 0.88
- React 19
- TypeScript 6
- Expo Router
- AsyncStorage（本地保存训练偏好、健身档案和训练历史）

## 开始使用

```bash
npm install
npx expo start
```

随后可以使用 Expo Go、Android 模拟器、iOS 模拟器或 Web 浏览器运行项目。

常用检查命令：

```bash
npx expo lint
npx tsc --noEmit
```

## 项目结构

- `src/app/`：Expo Router 页面
- `src/components/`：可复用 UI 组件与跨平台底栏导航
- `src/data/`：训练动作数据
- `src/lib/`：训练推荐、偏好与历史持久化业务逻辑
- `src/types/`：TypeScript 类型定义
- `assets/`：图标、启动图和图片资源
- `PROJECT_REPORT/`：各阶段演进报告（原始报告、Codex 报告、Antigravity 优化报告）

## 当前限制

目前主要是本地演示版本，训练动作数据范围聚焦在背部，数据仅保存在当前设备，尚未接入后端账号体系与云端同步。详细技术演进见 [项目报告文件夹](./PROJECT_REPORT/README.md)。