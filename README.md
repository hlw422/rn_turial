# 🍅 React Native 番茄时钟应用

一个使用 React Native + Expo 开发的番茄时钟（Pomodoro Timer）应用，帮助你提高专注工作效率。

## 📱 功能特性

### 核心功能

- ✅ **智能计时器**
  - 25 分钟专注时段
  - 5 分钟短休息
  - 15 分钟长休息（每完成 4 个番茄钟）
  - 支持开始、暂停、重置操作

- ✅ **自动状态切换**
  - 专注 → 短休息 → 专注 → 短休息 → ... → 长休息（循环）
  - 每完成 4 个番茄钟自动进入长休息
  - 状态切换时震动提醒（移动端）

- ✅ **进度统计**
  - 实时显示已完成的番茄钟数量
  - 可视化进度点指示（每 4 个为一组）

- ✅ **精美界面**
  - 大字体倒计时显示（96px）
  - 不同模式用颜色区分（专注-蓝色、短休息-绿色、长休息-紫色）
  - 响应式设计，适配各种屏幕尺寸
  - 流畅的交互动画

## 🎨 界面预览

应用采用简约现代的设计风格：

- **顶部**：状态标签（专注模式/短休息/长休息）
- **中部**：大字体倒计时显示（MM:SS 格式）
- **底部**：控制按钮（开始/暂停/重置）+ 完成数量统计

### 配色方案

| 模式 | 主题色 | 背景色 |
|------|---------|--------|
| 专注模式 | 🔵 蓝色 (#4A90E2) | 浅蓝 (#EBF5FF) |
| 短休息 | 🟢 绿色 (#50C878) | 浅绿 (#F0FFF4) |
| 长休息 | 🟣 紫色 (#9B59B6) | 浅紫 (#F5EEF8) |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Expo CLI
- iOS 模拟器（可选）或 Android 模拟器（可选）或物理设备

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/hlw422/rn_turial.git
cd rn_turial

# 安装依赖
npm install
```

### 运行应用

#### 方法一：使用 Expo Go（推荐新手）

1. 在手机上安装 **Expo Go** 应用
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. 启动开发服务器
   ```bash
   npm start
   ```

3. 用 Expo Go 扫描终端显示的二维码

#### 方法二：在浏览器中预览

```bash
npm run web
```

#### 方法三：使用模拟器

```bash
# iOS 模拟器（需要 macOS + Xcode）
npm run ios

# Android 模拟器（需要 Android Studio）
npm run android
```

## 📦 技术栈

- **框架**: React Native 0.81.0
- **开发工具**: Expo SDK 54
- **编程语言**: JavaScript (React Hooks)
- **状态管理**: useState + useEffect + useRef
- **样式方案**: React Native StyleSheet

## 📁 项目结构

```
rn-turial/
├── App.js              # 主应用组件（番茄时钟核心逻辑和 UI）
├── app.json            # Expo 配置文件
├── package.json        # 项目依赖配置
├── index.js            # 应用入口文件
├── assets/             # 静态资源（图标等）
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash.png
│   ├── favicon.png
│   └── android-icon-*.png
└── README.md           # 项目说明文档
```

## 🔧 开发说明

### 核心代码结构

`App.js` 包含以下核心部分：

1. **状态定义**
   ```javascript
   const [timer, setTimer] = useState(25 * 60); // 倒计时（秒）
   const [isRunning, setIsRunning] = useState(false); // 运行状态
   const [mode, setMode] = useState('focus'); // 当前模式
   const [completedPomodoros, setCompletedPomodoros] = useState(0); // 完成数
   ```

2. **控制函数**
   - `startTimer()`: 开始计时
   - `pauseTimer()`: 暂停计时
   - `resetTimer()`: 重置计时
   - `switchToNextMode()`: 切换到下一个模式

4. **时间常量**
   ```javascript
   const FOCUS_TIME = 25 * 60;        // 25 分钟
   const SHORT_BREAK_TIME = 5 * 60;   // 5 分钟
   const LONG_BREAK_TIME = 15 * 60;    // 15 分钟
   const POMODOROS_PER_CYCLE = 4;     // 4 个番茄钟后长休息
   ```

### 自定义配置

你可以修改 `App.js` 顶部的时间常量来自定义计时时长：

```javascript
const FOCUS_TIME = 25 * 60;        // 修改专注时长
const SHORT_BREAK_TIME = 5 * 60;   // 修改短休息时长
const LONG_BREAK_TIME = 15 * 60;   // 修改长休息时长
```

## 🎯 使用指南

1. **开始专注**
   - 点击 "▶ 开始" 按钮开始 25 分钟专注计时
   - 界面会显示蓝色主题，表示当前处于专注模式

2. **暂停/继续**
   - 点击 "⏸ 暂停" 按钮可以暂停计时
   - 再次点击 "▶ 开始" 继续计时

3. **完成专注**
   - 25 分钟结束后，应用会震动提醒
   - 自动切换到休息模式（5 分钟或 15 分钟）

4. **查看进度**
   - 顶部显示当前模式
   - 中间显示剩余时间
   - 底部显示已完成的番茄钟数量
   - 进度点显示当前周期的进度

5. **重置计时**
   - 随时点击 "↺ 重置" 按钮重置当前计时

## 🐛 常见问题

### 1. Expo Go 版本不兼容

**错误信息**: "Project is incompatible with this version of Expo Go"

**解决方案**:
- 更新手机上的 Expo Go 到最新版本
- 或确保项目的 Expo SDK 版本与 Expo Go 匹配

### 2. 端口 8081 被占用

**解决方案**:
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <进程ID> /F

# 或使用其他端口
npx expo start --port 8082
```

### 3. 依赖安装失败

**解决方案**:
```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

## 📝 开发日志

### 2026-05-26
- ✅ 初始化 Expo 项目
- ✅ 实现番茄时钟核心功能
- ✅ 添加开始、暂停、重置操作
- ✅ 实现专注/短休息/长休息自动切换
- ✅ 添加进度统计和可视化
- ✅ 优化界面设计和交互体验

## 🚀 未来计划

- [ ] 添加任务列表功能
- [ ] 添加统计图表（每日/每周完成情况）
- [ ] 支持自定义时间设置
- [ ] 添加背景白噪音
- [ ] 支持通知提醒
- [ ] 添加成就系统
- [ ] 支持数据持久化（AsyncStorage）
- [ ] 发布到 App Store 和 Google Play

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👤 作者

**hlw422**

- GitHub: [@hlw422](https://github.com/hlw422)

## 🙏 致谢

- [Expo](https://expo.dev/) - 优秀的 React Native 开发工具
- [React Native](https://reactnative.dev/) - 跨平台移动应用框架
- [Pomodoro Technique](https://francescocirillo.com/pages/pomodoro-technique) - 番茄工作法

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
