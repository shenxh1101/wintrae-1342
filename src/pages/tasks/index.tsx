import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { usePlantStore } from '@/store/usePlantStore';
import TaskItem from '@/components/TaskItem';
import { getCalendarTasks } from '@/utils/taskGenerator';
import type { Task, TaskType } from '@/types/plant';
import styles from './index.module.scss';

type TabType = 'pending' | 'completed';
type ViewMode = 'list' | 'calendar';

const TasksPage: React.FC = () => {
  const { plants, getTasks, getCompletedTasks, completeTask, deferTask, initStore } = usePlantStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [today, setToday] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

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

  const calendarData = useMemo(() => {
    const year = currentMonth.year();
    const month = currentMonth.month() + 1;
    return getCalendarTasks(plants, year, month);
  }, [plants, currentMonth, refreshKey]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.year();
    const month = currentMonth.month();
    const firstDay = dayjs(new Date(year, month, 1));
    const startWeekDay = firstDay.day();
    const daysInMonth = firstDay.daysInMonth();
    const days: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; hasOverdue: boolean; taskCount: number }[] = [];

    const prevMonthDays = firstDay.subtract(startWeekDay, 'day');
    for (let i = 0; i < startWeekDay; i++) {
      const d = prevMonthDays.add(i, 'day');
      const dateStr = d.format('YYYY-MM-DD');
      const dayTasks = calendarData[dateStr] || [];
      days.push({
        date: dateStr,
        day: d.date(),
        isCurrentMonth: false,
        isToday: d.isSame(dayjs(), 'day'),
        isSelected: dateStr === selectedDate,
        hasOverdue: dayTasks.some(t => t.isOverdue),
        taskCount: dayTasks.length
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = dayjs(new Date(year, month, i));
      const dateStr = d.format('YYYY-MM-DD');
      const dayTasks = calendarData[dateStr] || [];
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isToday: d.isSame(dayjs(), 'day'),
        isSelected: dateStr === selectedDate,
        hasOverdue: dayTasks.some(t => t.isOverdue),
        taskCount: dayTasks.length
      });
    }

    const remaining = 42 - days.length;
    const nextMonthStart = firstDay.add(daysInMonth, 'day');
    for (let i = 0; i < remaining; i++) {
      const d = nextMonthStart.add(i, 'day');
      const dateStr = d.format('YYYY-MM-DD');
      const dayTasks = calendarData[dateStr] || [];
      days.push({
        date: dateStr,
        day: d.date(),
        isCurrentMonth: false,
        isToday: d.isSame(dayjs(), 'day'),
        isSelected: dateStr === selectedDate,
        hasOverdue: dayTasks.some(t => t.isOverdue),
        taskCount: dayTasks.length
      });
    }

    return days;
  }, [currentMonth, calendarData, selectedDate]);

  const selectedDayTasks = useMemo(() => {
    const tasksForDay = calendarData[selectedDate] || [];
    return tasksForDay.map(t => ({
      id: `${t.plantId}-${t.type}-${t.date}`,
      plantId: t.plantId,
      plantName: t.plantName,
      type: t.type as TaskType,
      scheduledDate: t.date,
      completed: false,
      deferredCount: 0,
      nextDate: ''
    } as Task));
  }, [calendarData, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleComplete = (task: Task, options?: { photoUrl?: string; notes?: string }) => {
    completeTask(task, options);
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
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const renderTaskItem = (task: Task) => (
    <TaskItem
      key={task.id}
      task={task}
      onComplete={(options) => handleComplete(task, options)}
      onDefer={(days) => handleDefer(task, days)}
    />
  );

  return (
    <ScrollView className={styles.page} scrollY>
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
        <Text className={styles.date}>{today}</Text>
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
                    completedPhotoUrl={record.photoUrl}
                    completedNotes={record.notes}
                  />
                ))}
              </View>
            )
          )}
        </>
      ) : (
        <>
          <View className={styles.calendarCard}>
            <View className={styles.calendarHeader}>
              <Text className={styles.monthNav} onClick={handlePrevMonth}>
                ◀
              </Text>
              <Text className={styles.monthTitle}>
                {currentMonth.format('YYYY年MM月')}
              </Text>
              <Text className={styles.monthNav} onClick={handleNextMonth}>
                ▶
              </Text>
            </View>

            <View className={styles.weekRow}>
              {weekDays.map(day => (
                <Text key={day} className={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View className={styles.daysGrid}>
              {calendarDays.map(day => (
                <View
                  key={day.date}
                  className={classnames(
                    styles.dayCell,
                    !day.isCurrentMonth && styles.dayOtherMonth,
                    day.isToday && styles.dayToday,
                    day.isSelected && styles.daySelected,
                    day.hasOverdue && styles.dayHasOverdue
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
                {selectedDayTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={(options) => handleComplete(task, options)}
                    onDefer={(days) => handleDefer(task, days)}
                  />
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default TasksPage;

