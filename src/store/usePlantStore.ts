import { create } from 'zustand';
import dayjs from 'dayjs';
import type { Plant, Task, Photo, DiagnosticRecord } from '@/types/plant';
import { mockPlants, mockPhotos } from '@/data/mockPlants';
import { generateAllTasks } from '@/utils/taskGenerator';

interface PlantStore {
  plants: Plant[];
  tasks: Task[];
  photos: Photo[];
  diagnosticRecords: DiagnosticRecord[];
  completedTaskIds: string[];
  
  addPlant: (plant: Omit<Plant, 'id' | 'createdAt'>) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  deletePlant: (id: string) => void;
  
  addTask: (task: Task) => void;
  completeTask: (taskId: string) => void;
  deferTask: (taskId: string, days?: number) => void;
  refreshTasks: () => void;
  
  addPhoto: (photo: Omit<Photo, 'id'>) => void;
  deletePhoto: (photoId: string) => void;
  getPhotosByPlant: (plantId: string) => Photo[];
  
  addDiagnosticRecord: (record: Omit<DiagnosticRecord, 'id'>) => void;
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

const initialTasks = generateAllTasks(mockPlants);

export const usePlantStore = create<PlantStore>((set, get) => ({
  plants: mockPlants,
  tasks: initialTasks,
  photos: mockPhotos,
  diagnosticRecords: [],
  completedTaskIds: [],

  addPlant: (plantData) => {
    const newPlant: Plant = {
      ...plantData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    set((state) => ({
      plants: [...state.plants, newPlant]
    }));
    get().refreshTasks();
    console.log('[PlantStore] 新增植物:', newPlant.name);
  },

  updatePlant: (id, updates) => {
    set((state) => ({
      plants: state.plants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )
    }));
    get().refreshTasks();
    console.log('[PlantStore] 更新植物:', id);
  },

  deletePlant: (id) => {
    set((state) => ({
      plants: state.plants.filter((p) => p.id !== id),
      tasks: state.tasks.filter((t) => t.plantId !== id),
      photos: state.photos.filter((p) => p.plantId !== id)
    }));
    console.log('[PlantStore] 删除植物:', id);
  },

  addTask: (task) => {
    set((state) => ({
      tasks: [...state.tasks, task]
    }));
  },

  completeTask: (taskId) => {
    const now = dayjs().format('YYYY-MM-DD');
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: true, completedDate: now }
          : t
      ),
      completedTaskIds: [...state.completedTaskIds, taskId]
    }));
    console.log('[PlantStore] 完成任务:', taskId);
  },

  deferTask: (taskId, days = 1) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              scheduledDate: dayjs(t.scheduledDate)
                .add(days, 'day')
                .format('YYYY-MM-DD'),
              deferredCount: t.deferredCount + 1
            }
          : t
      )
    }));
    console.log('[PlantStore] 延期任务:', taskId, '+', days, '天');
  },

  refreshTasks: () => {
    const { plants, completedTaskIds } = get();
    const newTasks = generateAllTasks(plants, completedTaskIds);
    set({ tasks: newTasks });
    console.log('[PlantStore] 刷新任务列表，共', newTasks.length, '个任务');
  },

  addPhoto: (photoData) => {
    const newPhoto: Photo = {
      ...photoData,
      id: generateId()
    };
    set((state) => ({
      photos: [...state.photos, newPhoto]
    }));
    console.log('[PlantStore] 新增照片:', newPhoto.id);
  },

  deletePhoto: (photoId) => {
    set((state) => ({
      photos: state.photos.filter((p) => p.id !== photoId)
    }));
    console.log('[PlantStore] 删除照片:', photoId);
  },

  getPhotosByPlant: (plantId) => {
    return get()
      .photos.filter((p) => p.plantId === plantId)
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  },

  addDiagnosticRecord: (recordData) => {
    const newRecord: DiagnosticRecord = {
      ...recordData,
      id: generateId()
    };
    set((state) => ({
      diagnosticRecords: [...state.diagnosticRecords, newRecord]
    }));
    console.log('[PlantStore] 新增诊断记录:', newRecord.id);
  }
}));
