import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { usePlantStore } from '@/store/usePlantStore';
import TaskItem from '@/components/TaskItem';
import styles from './index.module.scss';

type TabType = 'pending' | 'completed';

const TasksPage: React.FC = () => {
  const { tasks, completeTask, deferTask, refreshTasks } = usePlantStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(dayjs().format('YYYY年MM月DD日 dddd'));
    refreshTasks();
  }, []);

  useDidShow(() => {
    refreshTasks();
  });

  usePullDownRefresh(() => {
    refreshTasks();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const { overdueTasks, todayTasks, tomorrowTasks, completedTasks } = useMemo(() => {
    const now = dayjs();
    const overdue: typeof tasks = [];
    const today: typeof tasks = [];
    const tomorrow: typeof tasks = [];
    const completed: typeof tasks = [];

    tasks.forEach(task => {
      if (task.completed) {
        completed.push(task);
        return;
      }
      const scheduled = dayjs(task.scheduledDate);
      const diff = scheduled.diff(now, 'day');
      if (diff < 0) {
        overdue.push(task);
      } else if (diff === 0) {
        today.push(task);
      } else if (diff === 1) {
        tomorrow.push(task);
      }
    });

    return {
      overdueTasks: overdue,
      todayTasks: today,
      tomorrowTasks: tomorrow,
      completedTasks: completed
    };
  }, [tasks]);

  const handleComplete = (taskId: string) => {
    completeTask(taskId);
    Taro.showToast({
      title: '完成打卡成功',
      icon: 'success'
    });
  };

  const handleDefer = (taskId: string, days: number = 1) => {
    deferTask(taskId, days);
    Taro.showToast({
      title: `已延期${days}天`,
      icon: 'none'
    });
  };

  const pendingTasks = [...overdueTasks, ...todayTasks, ...tomorrowTasks];
  const displayTasks = activeTab === 'pending' ? pendingTasks : completedTasks;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>📋 今日任务</Text>
        <Text className={styles.date}>{today}</Text>
      </View>

      <View className={styles.summary}>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryValue, styles.summaryValueOverdue)}>
            {overdueTasks.length}
          </Text>
          <Text className={styles.summaryLabel}>已逾期</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryValue, styles.summaryValueToday)}>
            {todayTasks.length}
          </Text>
          <Text className={styles.summaryLabel}>今日待办</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryValue, styles.summaryValueCompleted)}>
            {completedTasks.length}
          </Text>
          <Text className={styles.summaryLabel}>已完成</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classnames(styles.tab, activeTab === 'pending' && styles.tabActive)}
          onClick={() => setActiveTab('pending')}
        >
          待办 ({pendingTasks.length})
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'completed' && styles.tabActive)}
          onClick={() => setActiveTab('completed')}
        >
          已完成 ({completedTasks.length})
        </Text>
      </View>

      {displayTasks.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>
            {activeTab === 'pending' ? '🎉' : '📭'}
          </Text>
          <Text className={styles.emptyText}>
            {activeTab === 'pending' 
              ? '太棒了！所有任务都已完成\n继续保持哦~' 
              : '还没有完成任何任务\n加油完成第一个任务吧！'
            }
          </Text>
        </View>
      ) : (
        <View className={styles.list}>
          {activeTab === 'pending' && (
            <>
              {overdueTasks.length > 0 && (
                <Text className={styles.sectionTitle}>⚠️ 已逾期</Text>
              )}
              {overdueTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onDefer={handleDefer}
                />
              ))}

              {todayTasks.length > 0 && (
                <Text className={styles.sectionTitle}>📅 今日待办</Text>
              )}
              {todayTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onDefer={handleDefer}
                />
              ))}

              {tomorrowTasks.length > 0 && (
                <Text className={styles.sectionTitle}>⏰ 明日待办</Text>
              )}
              {tomorrowTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onDefer={handleDefer}
                />
              ))}
            </>
          )}

          {activeTab === 'completed' && (
            <>
              {completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onDefer={handleDefer}
                />
              ))}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default TasksPage;
