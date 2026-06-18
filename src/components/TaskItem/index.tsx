import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import dayjs from 'dayjs';
import type { Task } from '@/types/plant';
import { taskTypeList } from '@/data/mockDiagnose';
import styles from './index.module.scss';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string, days?: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDefer }) => {
  const taskType = taskTypeList.find(t => t.key === task.type);
  const icon = taskType?.icon || '📋';
  const name = taskType?.name || '任务';
  const color = taskType?.color || '#52C41A';

  const today = dayjs();
  const scheduled = dayjs(task.scheduledDate);
  const diff = scheduled.diff(today, 'day');

  let statusClass = styles.statusTomorrow;
  let statusText = `${diff} 天后`;

  if (task.completed) {
    statusClass = styles.statusCompleted;
    statusText = '已完成';
  } else if (diff < 0) {
    statusClass = styles.statusOverdue;
    statusText = `逾期 ${Math.abs(diff)} 天`;
  } else if (diff === 0) {
    statusClass = styles.statusToday;
    statusText = '今日待办';
  } else if (diff === 1) {
    statusClass = styles.statusTomorrow;
    statusText = '明日待办';
  }

  const handleComplete = () => {
    onComplete(task.id);
  };

  const handleDefer = () => {
    onDefer(task.id, 1);
  };

  return (
    <View className={classnames(styles.card, task.completed && styles.completed)}>
      <View className={styles.header}>
        <View className={styles.icon} style={{ backgroundColor: `${color}15` }}>
          <Text>{icon}</Text>
        </View>
        <View className={styles.content}>
          <Text className={styles.title}>{name} - {task.plantName}</Text>
          <Text className={styles.subtitle}>计划日期：{task.scheduledDate}</Text>
        </View>
        <Text className={classnames(styles.status, statusClass)}>{statusText}</Text>
      </View>
      <View className={styles.body}>
        {task.completed ? (
          <Text className={styles.completedText}>✅ 已完成于 {task.completedDate}</Text>
        ) : (
          <>
            <Button className={styles.checkBtn} onClick={handleComplete}>
              完成打卡
            </Button>
            <Button className={styles.deferBtn} onClick={handleDefer}>
              延期1天
            </Button>
          </>
        )}
      </View>
    </View>
  );
};

export default TaskItem;
