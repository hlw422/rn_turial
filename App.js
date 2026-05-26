import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Vibration, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';

export default function App() {
  // 时间配置（单位：秒）- 可自定义
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [shortBreakTime, setShortBreakTime] = useState(5 * 60);
  const [longBreakTime, setLongBreakTime] = useState(15 * 60);
  const [pomodorosPerCycle, setPomodorosPerCycle] = useState(4);

  // 专注内容
  const [focusTask, setFocusTask] = useState('');
  const [isEditingTask, setIsEditingTask] = useState(false);

  // 设置面板显示控制
  const [showSettings, setShowSettings] = useState(false);
  
  // 临时设置状态（用于设置面板中的临时调整）
  const [tempFocusTime, setTempFocusTime] = useState(25);
  const [tempShortBreakTime, setTempShortBreakTime] = useState(5);
  const [tempLongBreakTime, setTempLongBreakTime] = useState(15);
  const [tempPomodorosPerCycle, setTempPomodorosPerCycle] = useState(4);

  // 计时器状态
  const [timer, setTimer] = useState(focusTime);
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
          time: focusTime,
        };
      case 'shortBreak':
        return {
          label: '短休息',
          color: '#50C878',
          backgroundColor: '#F0FFF4',
          time: shortBreakTime,
        };
      case 'longBreak':
        return {
          label: '长休息',
          color: '#9B59B6',
          backgroundColor: '#F5EEF8',
          time: longBreakTime,
        };
      default:
        return {
          label: '专注模式',
          color: '#4A90E2',
          backgroundColor: '#EBF5FF',
          time: focusTime,
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
      if (newCompleted % pomodorosPerCycle === 0) {
        setMode('longBreak');
        setTimer(longBreakTime);
      } else {
        setMode('shortBreak');
        setTimer(shortBreakTime);
      }
    } else {
      // 休息结束，切换到专注模式
      setMode('focus');
      setTimer(focusTime);
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
    setIsEditingTask(false);
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
    for (let i = 0; i < pomodorosPerCycle; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i < completedPomodoros % pomodorosPerCycle ? '#50C878' : '#D1D5DB',
            },
          ]}
        />
      );
    }
    return <View style={styles.dotsContainer}>{dots}</View>;
  };

  // 打开设置面板
  const openSettings = () => {
    setTempFocusTime(focusTime / 60);
    setTempShortBreakTime(shortBreakTime / 60);
    setTempLongBreakTime(longBreakTime / 60);
    setTempPomodorosPerCycle(pomodorosPerCycle);
    setShowSettings(true);
  };

  // 保存设置
  const saveSettings = () => {
    setFocusTime(tempFocusTime * 60);
    setShortBreakTime(tempShortBreakTime * 60);
    setLongBreakTime(tempLongBreakTime * 60);
    setPomodorosPerCycle(tempPomodorosPerCycle);
    
    // 如果当前未运行，重置计时器到新设置
    if (!isRunning) {
      setTimer(mode === 'focus' ? tempFocusTime * 60 : mode === 'shortBreak' ? tempShortBreakTime * 60 : tempLongBreakTime * 60);
    }
    
    setShowSettings(false);
  };

  // 更新专注时长（用于预设按钮）
  const updateFocusTime = (minutes) => {
    setTempFocusTime(minutes);
  };

  return (
    <View style={[styles.container, { backgroundColor: modeConfig.backgroundColor }]}>
      <StatusBar style="auto" />

      {/* 设置按钮 */}
      <TouchableOpacity 
        style={styles.settingsButton} 
        onPress={openSettings}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsButtonText}>⚙️</Text>
      </TouchableOpacity>

      {/* 状态标签 */}
      <View style={[styles.statusBadge, { backgroundColor: modeConfig.color }]}>
        <Text style={styles.statusText}>{modeConfig.label}</Text>
      </View>

      {/* 专注内容显示/输入区 */}
      <View style={styles.taskContainer}>
        {!isRunning || isEditingTask ? (
          <TextInput
            style={[styles.taskInput, { borderColor: modeConfig.color }]}
            placeholder="输入本次专注内容..."
            value={isEditingTask ? focusTask : focusTask}
            onChangeText={setFocusTask}
            editable={!isRunning || isEditingTask}
            onBlur={() => setIsEditingTask(false)}
            returnKeyType="done"
          />
        ) : (
          <View style={styles.taskDisplay}>
            <Text style={[styles.taskText, { color: modeConfig.color }]}>
              📝 {focusTask || '未设置专注内容'}
            </Text>
            <TouchableOpacity 
              onPress={() => setIsEditingTask(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.editButton, { color: modeConfig.color }]}>编辑</Text>
            </TouchableOpacity>
          </View>
        )}
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

      {/* 设置面板 Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>⚙️ 时间设置</Text>

              {/* 专注时长设置 */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>专注时长（分钟）</Text>
                <View style={styles.settingInputRow}>
                  <TextInput
                    style={styles.settingInput}
                    value={tempFocusTime.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 5;
                      setTempFocusTime(Math.max(5, Math.min(120, num)));
                    }}
                    keyboardType="numeric"
                  />
                  <Text style={styles.settingUnit}>分钟</Text>
                </View>
                <Slider
                  style={styles.settingSlider}
                  value={tempFocusTime}
                  onValueChange={(value) => setTempFocusTime(Math.round(value))}
                  minimumValue={5}
                  maximumValue={120}
                  step={1}
                  minimumTrackTintColor={modeConfig.color}
                  maximumTrackTintColor="#D1D5DB"
                />
                <View style={styles.presetButtons}>
                  <TouchableOpacity 
                    style={[styles.presetButton, { borderColor: modeConfig.color }]}
                    onPress={() => updateFocusTime(25)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.presetButtonText, { color: modeConfig.color }]}>25分钟</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.presetButton, { borderColor: modeConfig.color }]}
                    onPress={() => updateFocusTime(45)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.presetButtonText, { color: modeConfig.color }]}>45分钟</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.presetButton, { borderColor: modeConfig.color }]}
                    onPress={() => updateFocusTime(60)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.presetButtonText, { color: modeConfig.color }]}>60分钟</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 短休息时长设置 */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>短休息时长（分钟）</Text>
                <View style={styles.settingInputRow}>
                  <TextInput
                    style={styles.settingInput}
                    value={tempShortBreakTime.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 1;
                      setTempShortBreakTime(Math.max(1, Math.min(30, num)));
                    }}
                    keyboardType="numeric"
                  />
                  <Text style={styles.settingUnit}>分钟</Text>
                </View>
                <Slider
                  style={styles.settingSlider}
                  value={tempShortBreakTime}
                  onValueChange={(value) => setTempShortBreakTime(Math.round(value))}
                  minimumValue={1}
                  maximumValue={30}
                  step={1}
                  minimumTrackTintColor="#50C878"
                  maximumTrackTintColor="#D1D5DB"
                />
              </View>

              {/* 长休息时长设置 */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>长休息时长（分钟）</Text>
                <View style={styles.settingInputRow}>
                  <TextInput
                    style={styles.settingInput}
                    value={tempLongBreakTime.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 5;
                      setTempLongBreakTime(Math.max(5, Math.min(60, num)));
                    }}
                    keyboardType="numeric"
                  />
                  <Text style={styles.settingUnit}>分钟</Text>
                </View>
                <Slider
                  style={styles.settingSlider}
                  value={tempLongBreakTime}
                  onValueChange={(value) => setTempLongBreakTime(Math.round(value))}
                  minimumValue={5}
                  maximumValue={60}
                  step={1}
                  minimumTrackTintColor="#9B59B6"
                  maximumTrackTintColor="#D1D5DB"
                />
              </View>

              {/* 长休息间隔设置 */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>长休息间隔（个番茄钟）</Text>
                <View style={styles.settingInputRow}>
                  <TextInput
                    style={styles.settingInput}
                    value={tempPomodorosPerCycle.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 2;
                      setTempPomodorosPerCycle(Math.max(2, Math.min(8, num)));
                    }}
                    keyboardType="numeric"
                  />
                  <Text style={styles.settingUnit}>个</Text>
                </View>
                <Slider
                  style={styles.settingSlider}
                  value={tempPomodorosPerCycle}
                  onValueChange={(value) => setTempPomodorosPerCycle(Math.round(value))}
                  minimumValue={2}
                  maximumValue={8}
                  step={1}
                  minimumTrackTintColor={modeConfig.color}
                  maximumTrackTintColor="#D1D5DB"
                />
              </View>

              {/* 保存按钮 */}
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: modeConfig.color }]}
                onPress={saveSettings}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>保存设置</Text>
              </TouchableOpacity>

              {/* 取消按钮 */}
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowSettings(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  // 设置按钮
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  settingsButtonText: {
    fontSize: 28,
  },
  // 专注内容容器
  taskContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  taskInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // 设置面板样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#2C3E50',
  },
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  settingInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  settingUnit: {
    marginLeft: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  settingSlider: {
    width: '100%',
    height: 40,
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  presetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 18,
    fontWeight: '600',
  },
});
