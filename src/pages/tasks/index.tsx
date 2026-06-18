import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { usePlantStore } from '@/store/usePlantStore';
import TaskItem from '@/components/TaskItem';
import type { Task } from '@/types/plant';
import styles from './index.module.scss';

type TabType = 'pending' | 'completed';

const TasksPage: React.FC = () => {
  const { getTasks, getCompletedTasks, completeTask, deferTask, initStore } = usePlantStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [today, setToday] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    initStore();
    setToday(dayjs().format('YYYY年MM月DD日 dddd'));
  }, []);

  useDidShow(() => {
    setRefreshKey(k => k + 1);
  });

  usePullDownRefresh(() => {
    setRefreshKey(k => k + 1);
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const tasks = useMemo(() => getTasks(), [getTasks, refreshKey]);
  const completedHistory = useMemo(() => getCompletedTasks(), [getCompletedTasks, refreshKey]);

  const { overdueTasks, todayTasks, tomorrowTasks } = useMemo(() => {
    const now = dayjs();
    const overdue: Task[] = [];
    const todayArr: Task[] = [];
    const tomorrow: Task[] = [];

    tasks.forEach(task => {
      const scheduled = dayjs(task.scheduledDate);
      const diff = scheduled.diff(now, 'day');
      if (diff < 0) {
        overdue.push(task);
      } else if (diff === 0) {
        todayArr.push(task);
      } else if (diff === 1) {
        tomorrow.push(task);
      }
    });

    return {
      overdueTasks: overdue,
      todayTasks: todayArr,
      tomorrowTasks: tomorrow
    };
  }, [tasks]);

  const handleComplete = (task: Task) => {
    completeTask(task);
    Taro.showToast({
      title: '完成打卡成功',
      icon: 'success'
    });
    setRefreshKey(k => k + 1);
  };

  const handleDefer = (task: Task, days: number = 1) => {
    deferTask(task.id, task.type, task.plantId, days);
    Taro.showToast({
      title: `已延期${days}天`,
      icon: 'none'
    });
    setRefreshKey(k => k + 1);
  };

  const pendingTasks = [...overdueTasks, ...todayTasks, ...tomorrowTasks];
  const displayPending = activeTab === 'pending';

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
            {completedHistory.length}
          </Text>
          <Text className={styles.summaryLabel}>已完成</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classnames(styles.tab, displayPending && styles.tabActive)}
          onClick={() => setActiveTab('pending')}
        >
          待办 ({pendingTasks.length})
        </Text>
        <Text
          className={classnames(styles.tab, !displayPending && styles.tabActive)}
          onClick={() => setActiveTab('completed')}
        >
          已完成 ({completedHistory.length})
        </Text>
      </View>

      {displayPending ? (
        pendingTasks.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🎉</Text>
            <Text className={styles.emptyText}>
              太棒了！所有任务都已完成{'\n'}继续保持哦~
            </Text>
          </View>
        ) : (
          <View className={styles.list}>
            {overdueTasks.length > 0 && (
              <Text className={styles.sectionTitle}>⚠️ 已逾期</Text>
            )}
            {overdueTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={() => handleComplete(task)}
                onDefer={(days) => handleDefer(task, days)}
              />
            ))}

            {todayTasks.length > 0 && (
              <Text className={styles.sectionTitle}>📅 今日待办</Text>
            )}
            {todayTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={() => handleComplete(task)}
                onDefer={(days) => handleDefer(task, days)}
              />
            ))}

            {tomorrowTasks.length > 0 && (
              <Text className={styles.sectionTitle}>⏰ 明日待办</Text>
            )}
            {tomorrowTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={() => handleComplete(task)}
                onDefer={(days) => handleDefer(task, days)}
              />
            ))}
          </View>
        )
      ) : (
        completedHistory.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>
              还没有完成任何任务{'\n'}加油完成第一个任务吧！
            </Text>
          </View>
        ) : (
          <View className={styles.list}>
            {completedHistory.map(record => (
              <TaskItem
                key={record.id}
                task={{
                  id: record.id,
                  plantId: record.plantId,
                  plantName: record.plantName,
                  type: record.type,
                  scheduledDate: record.scheduledDate,
                  completed: true,
                  completedDate: record.completedDate,
                  deferredCount: record.deferredCount,
                  nextDate: ''
                }}
                isHistory
                completedDate={record.completedDate}
              />
            ))}
          </View>
        )
      )}
    </ScrollView>
  );
};

export default TasksPage;
