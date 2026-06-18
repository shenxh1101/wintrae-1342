import dayjs from 'dayjs';
import type { Plant, Task, TaskType } from '@/types/plant';

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

export const generateTasksForPlant = (plant: Plant, baseDate: string = dayjs().format('YYYY-MM-DD')): Task[] => {
  const tasks: Task[] = [];
  const { careSchedule } = plant;
  
  const taskConfigs: { type: TaskType; interval: number }[] = [
    { type: 'water', interval: careSchedule.water },
    { type: 'fertilize', interval: careSchedule.fertilize },
    { type: 'prune', interval: careSchedule.prune },
    { type: 'rotate', interval: careSchedule.rotate },
    { type: 'clean', interval: careSchedule.clean }
  ];
  
  taskConfigs.forEach(({ type, interval }) => {
    if (interval > 0) {
      const today = dayjs(baseDate);
      const plantDate = dayjs(plant.purchaseDate);
      const daysSincePurchase = today.diff(plantDate, 'day');
      const nextTaskDay = Math.ceil(daysSincePurchase / interval) * interval;
      const scheduledDate = plantDate.add(nextTaskDay, 'day').format('YYYY-MM-DD');
      
      const diffDays = dayjs(scheduledDate).diff(today, 'day');
      
      if (diffDays <= 1 && diffDays >= -3) {
        tasks.push({
          id: generateId(),
          plantId: plant.id,
          plantName: plant.name,
          type,
          scheduledDate,
          completed: false,
          deferredCount: 0
        });
      }
    }
  });
  
  return tasks;
};

export const generateAllTasks = (plants: Plant[], completedTaskIds: string[] = []): Task[] => {
  const today = dayjs().format('YYYY-MM-DD');
  let allTasks: Task[] = [];
  
  plants.forEach(plant => {
    const plantTasks = generateTasksForPlant(plant, today);
    allTasks = [...allTasks, ...plantTasks];
  });
  
  allTasks = allTasks.filter(task => !completedTaskIds.includes(task.id));
  
  allTasks.sort((a, b) => {
    const dateDiff = dayjs(a.scheduledDate).valueOf() - dayjs(b.scheduledDate).valueOf();
    if (dateDiff !== 0) return dateDiff;
    return a.plantName.localeCompare(b.plantName);
  });
  
  return allTasks;
};

export const getTaskTypeName = (type: TaskType): string => {
  return taskTypeNames[type];
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
