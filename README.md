# 健身教练（Fitness Coach）

一个使用 Expo、React Native、TypeScript 和 Expo Router 构建的移动端健身指导应用。当前版本聚焦于背部训练：用户填写健身资料、选择训练目标和可用器械后，应用会生成适合当前经验水平的训练建议。

## 当前功能

- 欢迎页和健身资料填写流程
- 健身目标、训练时间、经验水平和器械选择
- 背部训练目标：宽度、厚度和综合
- 根据目标、经验和器械筛选动作
- 面向初学者的动作排序和安全提示
- 训练计划、训练过程、训练结果和训练总结页面
- 动作详情页面
- 深色模式、Expo Router 文件路由和 Web 支持

## 技术栈

- Expo SDK 58
- React Native 0.88
- React 19
- TypeScript 6
- Expo Router
- AsyncStorage（已安装；本地训练记录接入进度见项目报告）

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
- `src/components/`：可复用 UI 组件
- `src/data/`：训练动作数据
- `src/lib/`：训练推荐和业务逻辑
- `src/types/`：TypeScript 类型
- `assets/`：图标、启动图和图片资源
- `PROJECT_REPORT/`：原始进度报告和后续实现报告

## 当前限制

目前主要是本地演示版本，训练数据范围集中在背部，尚未接入后端账号、云端同步和真实设备通知。详细进度见 [项目报告文件夹](./PROJECT_REPORT/README.md)。
