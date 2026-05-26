import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Vibration } from 'react-native';

const FOCUS_TIME = 25 * 60; // 25分钟，单位：秒
const SHORT_BREAK_TIME = 5 * 60; // 5分钟
const LONG_BREAK_TIME = 15 * 60; // 15分钟
const POMODOROS_PER_CYCLE = 4; // 每4个番茄钟后长休息

export default function App() {
  const [timer, setTimer] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef(null);

  // 格式化时间：将秒数转换为 MM:SS 格式
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取当前模式的配置
  const getModeConfig = () => {
    switch (mode) {
      case 'focus':
        return {
          label: '专注模式',
          color: '#4A90E2',
          backgroundColor: '#EBF5FF',
          time: FOCUS_TIME,
        };
      case 'shortBreak':
        return {
          label: '短休息',
          color: '#50C878',
          backgroundColor: '#F0FFF4',
          time: SHORT_BREAK_TIME,
        };
      case 'longBreak':
        return {
          label: '长休息',
          color: '#9B59B6',
          backgroundColor: '#F5EEF8',
          time: LONG_BREAK_TIME,
        };
      default:
        return {
          label: '专注模式',
          color: '#4A90E2',
          backgroundColor: '#EBF5FF',
          time: FOCUS_TIME,
        };
    }
  };

  const modeConfig = getModeConfig();

  // 切换到下一个模式
  const switchToNextMode = () => {
    if (mode === 'focus') {
      // 完成一个番茄钟
      const newCompleted = completedPomodoros + 1;
      setCompletedPomodoros(newCompleted);

      // 判断是长休息还是短休息
      if (newCompleted % POMODOROS_PER_CYCLE === 0) {
        setMode('longBreak');
        setTimer(LONG_BREAK_TIME);
      } else {
        setMode('shortBreak');
        setTimer(SHORT_BREAK_TIME);
      }
    } else {
      // 休息结束，切换到专注模式
      setMode('focus');
      setTimer(FOCUS_TIME);
    }
    setIsRunning(false);
  };

  // 开始计时器
  const startTimer = () => {
    setIsRunning(true);
  };

  // 暂停计时器
  const pauseTimer = () => {
    setIsRunning(false);
  };

  // 重置计时器
  const resetTimer = () => {
    setIsRunning(false);
    setTimer(modeConfig.time);
  };

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            // 时间到
            clearInterval(intervalRef.current);
            // 震动提示（移动端）
            Vibration.vibrate([0, 500, 200, 500]);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timer]);

  // 监听计时器归零
  useEffect(() => {
    if (timer === 0 && isRunning) {
      setIsRunning(false);
      switchToNextMode();
    }
  }, [timer, isRunning]);

  // 渲染进度点
  const renderProgressDots = () => {
    const dots = [];
    for (let i = 0; i < POMODOROS_PER_CYCLE; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i < completedPomodoros % POMODOROS_PER_CYCLE ? '#50C878' : '#D1D5DB',
            },
          ]}
        />
      );
    }
    return <View style={styles.dotsContainer}>{dots}</View>;
  };

  return (
    <View style={[styles.container, { backgroundColor: modeConfig.backgroundColor }]}>
      <StatusBar style="auto" />

      {/* 状态标签 */}
      <View style={[styles.statusBadge, { backgroundColor: modeConfig.color }]}>
        <Text style={styles.statusText}>{modeConfig.label}</Text>
      </View>

      {/* 已完成番茄钟数量 */}
      <Text style={styles.completedText}>已完成 {completedPomodoros} 个番茄钟</Text>

      {/* 进度点 */}
      {renderProgressDots()}

      {/* 大字体倒计时 */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { color: modeConfig.color }]}>{formatTime(timer)}</Text>
      </View>

      {/* 控制按钮区 */}
      <View style={styles.buttonContainer}>
        {!isRunning ? (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: modeConfig.color }]}
            onPress={startTimer}
            activeOpacity={0.7}
          >
            <Text style={styles.mainButtonText}>▶ 开始</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: '#F39C12' }]}
            onPress={pauseTimer}
            activeOpacity={0.7}
          >
            <Text style={styles.mainButtonText}>⏸ 暂停</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.resetButton, { borderColor: modeConfig.color }]}
          onPress={resetTimer}
          activeOpacity={0.7}
        >
          <Text style={[styles.resetButtonText, { color: modeConfig.color }]}>↺ 重置</Text>
        </TouchableOpacity>
      </View>

      {/* 提示信息 */}
      {timer === 0 && (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>
            {mode === 'focus' ? '🎉 专注完成！该休息了' : '✅ 休息结束！准备专注'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  statusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  completedText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  timerContainer: {
    marginBottom: 50,
  },
  timerText: {
    fontSize: 96,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  mainButton: {
    width: 160,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  notification: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#2C3E50',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
