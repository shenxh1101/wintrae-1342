import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import type { Plant, Task, Photo, DiagnosticRecord, TaskType } from '@/types/plant';
import { mockPlants, mockPhotos } from '@/data/mockPlants';
import { generateAllTasks, calculateNextDate } from '@/utils/taskGenerator';

interface CompletedTaskRecord {
  id: string;
  plantId: string;
  plantName: string;
  type: TaskType;
  scheduledDate: string;
  completedDate: string;
  deferredCount: number;
}

interface PlantStore {
  plants: Plant[];
  photos: Photo[];
  diagnosticRecords: DiagnosticRecord[];
  completedHistory: CompletedTaskRecord[];
  initialized: boolean;

  initStore: () => void;

  addPlant: (plant: Omit<Plant, 'id' | 'createdAt' | 'lastCompletedDates' | 'deferredTasks'>) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  deletePlant: (id: string) => void;

  getTasks: () => Task[];
  getCompletedTasks: () => CompletedTaskRecord[];
  completeTask: (task: Task) => void;
  deferTask: (taskId: string, taskType: TaskType, plantId: string, days?: number) => void;

  addPhoto: (photo: Omit<Photo, 'id'>) => void;
  deletePhoto: (photoId: string) => void;
  getPhotosByPlant: (plantId: string) => Photo[];

  addDiagnosticRecord: (record: Omit<DiagnosticRecord, 'id'>) => void;
  getRecordsByPlant: (plantId: string) => DiagnosticRecord[];
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

const taroStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const res = Taro.getStorageSync(name);
      return res || null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      Taro.setStorageSync(name, value);
    } catch {
      console.error('[Store] setStorage failed for:', name);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      Taro.removeStorageSync(name);
    } catch {
      console.error('[Store] removeStorage failed for:', name);
    }
  }
};

const INITIAL_COMPLETED_HISTORY: CompletedTaskRecord[] = [];
const INITIAL_RECORDS: DiagnosticRecord[] = [];

const baseStore = create<PlantStore>()(
  persist(
    (set, get) => ({
      plants: mockPlants,
      photos: mockPhotos,
      diagnosticRecords: INITIAL_RECORDS,
      completedHistory: INITIAL_COMPLETED_HISTORY,
      initialized: false,

      initStore: () => {
        if (!get().initialized) {
          set({ initialized: true });
        }
      },

      addPlant: (plantData) => {
        const newPlant: Plant = {
          ...plantData,
          id: generateId(),
          lastCompletedDates: {},
          deferredTasks: {},
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          plants: [...state.plants, newPlant]
        }));
        console.log('[PlantStore] 新增植物:', newPlant.name);
      },

      updatePlant: (id, updates) => {
        set((state) => ({
          plants: state.plants.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          )
        }));
        console.log('[PlantStore] 更新植物:', id);
      },

      deletePlant: (id) => {
        set((state) => ({
          plants: state.plants.filter((p) => p.id !== id),
          photos: state.photos.filter((p) => p.plantId !== id),
          diagnosticRecords: state.diagnosticRecords.filter((r) => r.plantId !== id),
          completedHistory: state.completedHistory.filter((h) => h.plantId !== id)
        }));
        console.log('[PlantStore] 删除植物:', id);
      },

      getTasks: () => {
        const { plants } = get();
        return generateAllTasks(plants);
      },

      getCompletedTasks: () => {
        return get()
          .completedHistory.sort((a, b) =>
            dayjs(b.completedDate).valueOf() - dayjs(a.completedDate).valueOf()
          );
      },

      completeTask: (task) => {
        const now = dayjs().format('YYYY-MM-DD');
        const completedRecord: CompletedTaskRecord = {
          id: task.id,
          plantId: task.plantId,
          plantName: task.plantName,
          type: task.type,
          scheduledDate: task.scheduledDate,
          completedDate: now,
          deferredCount: task.deferredCount
        };

        set((state) => ({
          completedHistory: [...state.completedHistory, completedRecord],
          plants: state.plants.map((p) => {
            if (p.id !== task.plantId) return p;
            const newLastCompletedDates = {
              ...p.lastCompletedDates,
              [task.type]: now
            };
            const newDeferredTasks = { ...p.deferredTasks };
            delete newDeferredTasks[task.type];
            return {
              ...p,
              lastCompletedDates: newLastCompletedDates,
              deferredTasks: newDeferredTasks
            };
          })
        }));
        console.log('[PlantStore] 完成任务:', task.plantName, task.type);
      },

      deferTask: (_taskId, taskType, plantId, days = 1) => {
        set((state) => ({
          plants: state.plants.map((p) => {
            if (p.id !== plantId) return p;
            const currentDefer = p.deferredTasks[taskType] || 0;
            return {
              ...p,
              deferredTasks: {
                ...p.deferredTasks,
                [taskType]: currentDefer + days
              }
            };
          })
        }));
        console.log('[PlantStore] 延期任务:', plantId, taskType, '+', days, '天');
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
      },

      getRecordsByPlant: (plantId) => {
        return get()
          .diagnosticRecords.filter((r) => r.plantId === plantId)
          .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
      }
    }),
    {
      name: 'plant-care-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        plants: state.plants,
        photos: state.photos,
        diagnosticRecords: state.diagnosticRecords,
        completedHistory: state.completedHistory,
        initialized: state.initialized
      })
    }
  )
);

export const usePlantStore = baseStore;
export { calculateNextDate };
export type { CompletedTaskRecord };
