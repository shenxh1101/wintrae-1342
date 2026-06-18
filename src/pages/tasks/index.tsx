import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import classnames from 'classnames';
import { usePlantStore } from '@/store/usePlantStore';
import TaskItem from '@/components/TaskItem';
import { groupTasksByDate, generateCalendarDays } from '@/utils/taskGenerator';
import type { Task } from '@/types/plant';
import type { CalendarDayInfo } from '@/utils/taskGenerator';
import styles from './index.module.scss';

dayjs.extend(weekOfYear);

type TabType = 'pending' | 'completed';
type CalendarViewMode = 'week' | 'month';

const TasksPage: React.FC = () => {
  const { plants, getTasks, getCompletedTasks, completeTask, deferTask, initStore } = usePlantStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarMode, setCalendarMode] = useState<CalendarViewMode>('month');
  const [todayStr, setTodayStr] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [calendarDate, setCalendarDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    initStore();
    setTodayStr(dayjs().format('YYYY年MM月DD日 dddd'));
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

  const allTasks = useMemo(() => {
    return getTasks(120);
  }, [getTasks, refreshKey]);

  const completedHistory = useMemo(() => {
    return getCompletedTasks();
  }, [getCompletedTasks, refreshKey]);

  const tasksByDate = useMemo(() => {
    return groupTasksByDate(allTasks);
  }, [allTasks]);

  const { overdueTasks, todayTasks, tomorrowTasks } = useMemo(() => {
    const now = dayjs().startOf('day');
    const overdue: Task[] = [];
    const todayArr: Task[] = [];
    const tomorrow: Task[] = [];

    allTasks.forEach(task => {
      const scheduled = dayjs(task.scheduledDate).startOf('day');
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
  }, [allTasks]);

  const calendarDays = useMemo((): CalendarDayInfo[] => {
    try {
      return generateCalendarDays({
        currentDate: calendarDate,
        selectedDate,
        tasksByDate,
        viewMode: calendarMode
      });
    } catch (err) {
      console.error('[TasksPage] 生成日历失败:', err);
      return [];
    }
  }, [calendarDate, selectedDate, tasksByDate, calendarMode]);

  const selectedDayTasks = useMemo(() => {
    return tasksByDate[selectedDate] || [];
  }, [tasksByDate, selectedDate]);

  const handlePrev = useCallback(() => {
    if (calendarMode === 'week') {
      setCalendarDate(prev => prev.subtract(1, 'week'));
    } else {
      setCalendarDate(prev => prev.subtract(1, 'month'));
    }
  }, [calendarMode]);

  const handleNext = useCallback(() => {
    if (calendarMode === 'week') {
      setCalendarDate(prev => prev.add(1, 'week'));
    } else {
      setCalendarDate(prev => prev.add(1, 'month'));
    }
  }, [calendarMode]);

  const handleToday = useCallback(() => {
    setCalendarDate(dayjs());
    setSelectedDate(dayjs().format('YYYY-MM-DD'));
  }, []);

  const handleDateClick = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleComplete = useCallback((task: Task, options?: { photoUrl?: string; notes?: string }) => {
    try {
      completeTask(task, options);
      Taro.showToast({
        title: '完成打卡成功',
        icon: 'success'
      });
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('[TasksPage] 完成任务失败:', err);
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  }, [completeTask]);

  const handleDefer = useCallback((task: Task, days: number = 1) => {
    try {
      deferTask(task.id, task.type, task.plantId, days);
      Taro.showToast({
        title: `已延期${days}天`,
        icon: 'none'
      });
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('[TasksPage] 延期任务失败:', err);
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  }, [deferTask]);

  const pendingTasks = [...overdueTasks, ...todayTasks, ...tomorrowTasks];
  const displayPending = activeTab === 'pending';
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const renderTaskItem = useCallback((task: Task) => (
    <TaskItem
      key={task.id}
      task={task}
      onComplete={(options) => handleComplete(task, options)}
      onDefer={(days) => handleDefer(task, days)}
    />
  ), [handleComplete, handleDefer]);

  const renderCompletedItem = useCallback((record: any) => (
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
      completedPhotoUrl={record.photoUrl}
      completedNotes={record.notes}
    />
  ), []);

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.title}>📋 今日任务</Text>
          <View className={styles.viewToggle}>
            <Text
              className={classnames(styles.toggleBtn, viewMode === 'list' && styles.toggleActive)}
              onClick={() => setViewMode('list')}
            >
              📝 列表
            </Text>
            <Text
              className={classnames(styles.toggleBtn, viewMode === 'calendar' && styles.toggleActive)}
              onClick={() => setViewMode('calendar')}
            >
              📅 日历
            </Text>
          </View>
        </View>
        <Text className={styles.date}>{todayStr}</Text>
      </View>

      {viewMode === 'list' ? (
        <>
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
                {overdueTasks.map(renderTaskItem)}

                {todayTasks.length > 0 && (
                  <Text className={styles.sectionTitle}>📅 今日待办</Text>
                )}
                {todayTasks.map(renderTaskItem)}

                {tomorrowTasks.length > 0 && (
                  <Text className={styles.sectionTitle}>⏰ 明日待办</Text>
                )}
                {tomorrowTasks.map(renderTaskItem)}
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
                {completedHistory.map(renderCompletedItem)}
              </View>
            )
          )}
        </>
      ) : (
        <>
          <View className={styles.calendarCard}>
            <View className={styles.calendarHeader}>
              <Text className={styles.monthNav} onClick={handlePrev}>
                ◀
              </Text>
              <View className={styles.monthInfo}>
                <Text className={styles.monthTitle}>
                  {calendarDate.format(calendarMode === 'week' ? 'YYYY年MM月第W周' : 'YYYY年MM月')}
                </Text>
                <Text className={styles.todayBtn} onClick={handleToday}>
                  今天
                </Text>
              </View>
              <Text className={styles.monthNav} onClick={handleNext}>
                ▶
              </Text>
            </View>

            <View className={styles.calendarModeToggle}>
              <Text
                className={classnames(styles.calModeBtn, calendarMode === 'week' && styles.calModeActive)}
                onClick={() => setCalendarMode('week')}
              >
                周视图
              </Text>
              <Text
                className={classnames(styles.calModeBtn, calendarMode === 'month' && styles.calModeActive)}
                onClick={() => setCalendarMode('month')}
              >
                月视图
              </Text>
            </View>

            <View className={styles.weekRow}>
              {weekDays.map(day => (
                <Text key={day} className={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View className={classnames(
              styles.daysGrid,
              calendarMode === 'week' && styles.daysGridWeek
            )}>
              {calendarDays.map(day => (
                <View
                  key={day.date}
                  className={classnames(
                    styles.dayCell,
                    calendarMode === 'week' && styles.dayCellWeek,
                    !day.isCurrentMonth && styles.dayOtherMonth,
                    day.isToday && styles.dayToday,
                    day.isSelected && styles.daySelected,
                    day.hasOverdue && styles.dayHasOverdue,
                    day.isCurrentWeek && calendarMode === 'month' && styles.dayCurrentWeek
                  )}
                  onClick={() => handleDateClick(day.date)}
                >
                  <Text className={styles.dayNumber}>{day.day}</Text>
                  {day.taskCount > 0 && (
                    <View className={classnames(
                      styles.taskDot,
                      day.hasOverdue ? styles.dotOverdue : styles.dotNormal
                    )} />
                  )}
                </View>
              ))}
            </View>

            <View className={styles.legend}>
              <View className={styles.legendItem}>
                <View className={classnames(styles.dotSmall, styles.dotOverdue)} />
                <Text className={styles.legendText}>逾期</Text>
              </View>
              <View className={styles.legendItem}>
                <View className={classnames(styles.dotSmall, styles.dotNormal)} />
                <Text className={styles.legendText}>待办</Text>
              </View>
              <View className={styles.legendItem}>
                <View className={styles.dotTodaySmall} />
                <Text className={styles.legendText}>今天</Text>
              </View>
            </View>
          </View>

          <View className={styles.dayTasksSection}>
            <Text className={styles.dayTasksTitle}>
              {dayjs(selectedDate).format('MM月DD日 dddd')} · 共 {selectedDayTasks.length} 项
            </Text>

            {selectedDayTasks.length === 0 ? (
              <View className={styles.dayEmpty}>
                <Text className={styles.dayEmptyText}>🌿 这天没有待办任务</Text>
              </View>
            ) : (
              <View className={styles.list}>
                {selectedDayTasks.map(renderTaskItem)}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default TasksPage;
