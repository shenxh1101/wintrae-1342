export interface Plant {
  id: string;
  name: string;
  location: string;
  light: string;
  potSize: string;
  purchaseDate: string;
  image: string;
  careSchedule: CareSchedule;
  lastCompletedDates: LastCompletedDates;
  deferredTasks: DeferredTaskMap;
  createdAt: string;
  notes?: string;
}

export interface CareSchedule {
  water: number;
  fertilize: number;
  prune: number;
  rotate: number;
  clean: number;
}

export type TaskType = 'water' | 'fertilize' | 'prune' | 'rotate' | 'clean';

export interface LastCompletedDates {
  water?: string;
  fertilize?: string;
  prune?: string;
  rotate?: string;
  clean?: string;
}

export interface DeferredTaskMap {
  water?: number;
  fertilize?: number;
  prune?: number;
  rotate?: number;
  clean?: number;
}

export interface Task {
  id: string;
  plantId: string;
  plantName: string;
  type: TaskType;
  scheduledDate: string;
  completed: boolean;
  completedDate?: string;
  deferredCount: number;
  nextDate: string;
}

export interface TaskTypeInfo {
  key: TaskType;
  name: string;
  icon: string;
  color: string;
}

export interface Symptom {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: DiagnosticStep[];
}

export interface DiagnosticStep {
  order: number;
  title: string;
  description: string;
  solution: string;
}

export interface DiagnosticRecord {
  id: string;
  plantId: string;
  symptomId: string;
  date: string;
  notes?: string;
}

export interface Photo {
  id: string;
  plantId: string;
  url: string;
  date: string;
  notes?: string;
}

export interface KnowledgeCard {
  id: string;
  category: KnowledgeCategory;
  title: string;
  summary: string;
  content: string;
  image: string;
}

export type KnowledgeCategory = 'season' | 'mistake' | 'emergency';

export interface CategoryInfo {
  key: KnowledgeCategory;
  name: string;
  color: string;
}
