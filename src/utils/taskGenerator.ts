import dayjs from 'dayjs';
import type { Plant, Task, TaskType, LastCompletedDates, DeferredTaskMap } from '@/types/plant';

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

const taskTypeNames: Record<TaskType, string> = {
  water: '浇水',
  fertilize: '施肥',
  prune: '修剪',
  rotate: '转盆',
  clean: '清洁'
};

const taskTypeIcons: Record<TaskType, string> = {
  water: '💧',
  fertilize: '🌱',
  prune: '✂️',
  rotate: '🔄',
  clean: '🧹'
};

export const taskTypes: TaskType[] = ['water', 'fertilize', 'prune', 'rotate', 'clean'];

export const calculateNextDate = (
  plant: Plant,
  type: TaskType
): { date: string; isOverdue: boolean; deferredCount: number } => {
  const { careSchedule, lastCompletedDates, deferredTasks, purchaseDate } = plant;
  const interval = careSchedule[type];
  const lastDone = lastCompletedDates[type];
  const deferred = deferredTasks[type] || 0;

  let baseDate: string;
  if (lastDone) {
    baseDate = lastDone;
  } else {
    baseDate = purchaseDate;
  }

  let nextDate = dayjs(baseDate).add(interval, 'day');
  if (deferred > 0) {
    nextDate = nextDate.add(deferred, 'day');
  }

  const formattedDate = nextDate.format('YYYY-MM-DD');
  const isOverdue = nextDate.isBefore(dayjs(), 'day');

  return {
    date: formattedDate,
    isOverdue,
    deferredCount: deferred
  };
};

export const getNextScheduleForPlant = (plant: Plant): Record<TaskType, { date: string; isOverdue: boolean; deferredCount: number }> => {
  const result = {} as Record<TaskType, { date: string; isOverdue: boolean; deferredCount: number }>;
  taskTypes.forEach(type => {
    result[type] = calculateNextDate(plant, type);
  });
  return result;
};

export const generateTasksForPlant = (plant: Plant, rangeDays: number = 90): Task[] => {
  const tasks: Task[] = [];
  const today = dayjs().startOf('day');

  taskTypes.forEach(type => {
    const interval = plant.careSchedule[type];
    if (interval <= 0) return;

    const { date, isOverdue, deferredCount } = calculateNextDate(plant, type);
    const scheduled = dayjs(date).startOf('day');
    const diffDays = scheduled.diff(today, 'day');

    if (diffDays <= rangeDays) {
      const nextCycleDate = scheduled.add(interval, 'day').format('YYYY-MM-DD');
      tasks.push({
        id: `${plant.id}-${type}-${date}`,
        plantId: plant.id,
        plantName: plant.name,
        type,
        scheduledDate: date,
        completed: false,
        deferredCount,
        nextDate: nextCycleDate
      });
    }
  });

  return tasks;
};

export const generateAllTasks = (plants: Plant[], rangeDays: number = 90): Task[] => {
  let allTasks: Task[] = [];

  plants.forEach(plant => {
    const plantTasks = generateTasksForPlant(plant, rangeDays);
    allTasks = [...allTasks, ...plantTasks];
  });

  allTasks.sort((a, b) => {
    const dateDiff = dayjs(a.scheduledDate).valueOf() - dayjs(b.scheduledDate).valueOf();
    if (dateDiff !== 0) return dateDiff;
    return a.plantName.localeCompare(b.plantName);
  });

  return allTasks;
};

export const groupTasksByDate = (tasks: Task[]): Record<string, Task[]> => {
  const result: Record<string, Task[]> = {};
  tasks.forEach(task => {
    const key = task.scheduledDate;
    if (!result[key]) result[key] = [];
    result[key].push(task);
  });
  return result;
};

export interface CalendarDayInfo {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isCurrentWeek: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasOverdue: boolean;
  taskCount: number;
  tasks: Task[];
}

interface CalendarOptions {
  currentDate: dayjs.Dayjs;
  selectedDate: string;
  tasksByDate: Record<string, Task[]>;
  viewMode: 'month' | 'week';
}

export const generateCalendarDays = ({
  currentDate,
  selectedDate,
  tasksByDate,
  viewMode
}: CalendarOptions): CalendarDayInfo[] => {
  const days: CalendarDayInfo[] = [];
  const today = dayjs().startOf('day');
  const currentWeekStart = today.startOf('week');
  const currentWeekEnd = today.endOf('week');

  if (viewMode === 'week') {
    const weekStart = currentDate.startOf('week');
    for (let i = 0; i < 7; i++) {
      const d = weekStart.add(i, 'day');
      const dateStr = d.format('YYYY-MM-DD');
      const dayTasks = tasksByDate[dateStr] || [];

      days.push({
        date: dateStr,
        day: d.date(),
        isCurrentMonth: d.isSame(currentDate, 'month'),
        isCurrentWeek: d.isBetween(currentWeekStart, currentWeekEnd, 'day', '[]'),
        isToday: d.isSame(today, 'day'),
        isSelected: dateStr === selectedDate,
        hasOverdue: dayTasks.some(t => dayjs(t.scheduledDate).isBefore(today, 'day')),
        taskCount: dayTasks.length,
        tasks: dayTasks
      });
    }
  } else {
    const year = currentDate.year();
    const month = currentDate.month();
    const firstDay = dayjs(new Date(year, month, 1));
    const startWeekDay = firstDay.day();
    const daysInMonth = firstDay.daysInMonth();

    const prevMonthDays = firstDay.subtract(startWeekDay, 'day');
    for (let i = 0; i < startWeekDay; i++) {
      const d = prevMonthDays.add(i, 'day');
      const dateStr = d.format('YYYY-MM-DD');
      const dayTasks = tasksByDate[dateStr] || [];

      days.push({
        date: dateStr,
        day: d.date(),
        isCurrentMonth: false,
        isCurrentWeek: d.isBetween(currentWeekStart, currentWeekEnd, 'day', '[]'),
        isToday: d.isSame(today, 'day'),
        isSelected: dateStr === selectedDate,
        hasOverdue: dayTasks.some(t => dayjs(t.scheduledDate).isBefore(today, 'day')),
        taskCount: dayTasks.length,
        tasks: dayTasks
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = dayjs(new Date(year, month, i));
      const dateStr = d.format('YYYY-MM-DD');
      const dayTasks = tasksByDate[dateStr] || [];

      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isCurrentWeek: d.isBetween(currentWeekStart, currentWeekEnd, 'day', '[]'),
        isToday: d.isSame(today, 'day'),
        isSelected: dateStr === selectedDate,
        hasOverdue: dayTasks.some(t => dayjs(t.scheduledDate).isBefore(today, 'day')),
        taskCount: dayTasks.length,
        tasks: dayTasks
      });
    }

    const remaining = 42 - days.length;
    const nextMonthStart = firstDay.add(daysInMonth, 'day');
    for (let i = 0; i < remaining; i++) {
      const d = nextMonthStart.add(i, 'day');
      const dateStr = d.format('YYYY-MM-DD');
      const dayTasks = tasksByDate[dateStr] || [];

      days.push({
        date: dateStr,
        day: d.date(),
        isCurrentMonth: false,
        isCurrentWeek: d.isBetween(currentWeekStart, currentWeekEnd, 'day', '[]'),
        isToday: d.isSame(today, 'day'),
        isSelected: dateStr === selectedDate,
        hasOverdue: dayTasks.some(t => dayjs(t.scheduledDate).isBefore(today, 'day')),
        taskCount: dayTasks.length,
        tasks: dayTasks
      });
    }
  }

  return days;
};

export const getTaskTypeName = (type: TaskType): string => {
  return taskTypeNames[type];
};

export const getTaskTypeIcon = (type: TaskType): string => {
  return taskTypeIcons[type];
};

export const getTaskStatusText = (scheduledDate: string, completed: boolean): string => {
  if (completed) return '已完成';

  const today = dayjs();
  const scheduled = dayjs(scheduledDate);
  const diff = scheduled.diff(today, 'day');

  if (diff < 0) return `逾期 ${Math.abs(diff)} 天`;
  if (diff === 0) return '今日待办';
  if (diff === 1) return '明日待办';
  return `${diff} 天后`;
};

export const getTaskStatusColor = (scheduledDate: string, completed: boolean): string => {
  if (completed) return '#52C41A';

  const today = dayjs();
  const scheduled = dayjs(scheduledDate);
  const diff = scheduled.diff(today, 'day');

  if (diff < 0) return '#F5222D';
  if (diff === 0) return '#FA8C16';
  return '#1890FF';
};

export { taskTypeNames, taskTypeIcons };
export type { LastCompletedDates, DeferredTaskMap };
