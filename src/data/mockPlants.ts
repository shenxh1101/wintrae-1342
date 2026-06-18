import type { Plant, Photo } from '@/types/plant';
import dayjs from 'dayjs';

const today = dayjs();

export const mockPlants: Plant[] = [
  {
    id: '1',
    name: '绿萝',
    location: '客厅窗台',
    light: '散射光',
    potSize: '中号(15cm)',
    purchaseDate: '2025-03-15',
    image: 'https://picsum.photos/id/110/300/300',
    careSchedule: {
      water: 3,
      fertilize: 14,
      prune: 30,
      rotate: 7,
      clean: 14
    },
    lastCompletedDates: {
      water: today.subtract(2, 'day').format('YYYY-MM-DD'),
      fertilize: today.subtract(10, 'day').format('YYYY-MM-DD'),
      rotate: today.subtract(5, 'day').format('YYYY-MM-DD'),
      clean: today.subtract(12, 'day').format('YYYY-MM-DD')
    },
    deferredTasks: {},
    createdAt: '2025-03-15T10:00:00Z',
    notes: '喜欢湿润环境，避免阳光直射'
  },
  {
    id: '2',
    name: '多肉组合',
    location: '阳台',
    light: '充足阳光',
    potSize: '小号(10cm)',
    purchaseDate: '2025-04-20',
    image: 'https://picsum.photos/id/111/300/300',
    careSchedule: {
      water: 10,
      fertilize: 30,
      prune: 60,
      rotate: 14,
      clean: 30
    },
    lastCompletedDates: {
      water: today.subtract(11, 'day').format('YYYY-MM-DD'),
      rotate: today.subtract(14, 'day').format('YYYY-MM-DD')
    },
    deferredTasks: {
      water: 1
    },
    createdAt: '2025-04-20T14:30:00Z',
    notes: '耐旱，浇水要见干见湿'
  },
  {
    id: '3',
    name: '龟背竹',
    location: '书房角落',
    light: '半阴',
    potSize: '大号(25cm)',
    purchaseDate: '2025-02-10',
    image: 'https://picsum.photos/id/112/300/300',
    careSchedule: {
      water: 5,
      fertilize: 14,
      prune: 45,
      rotate: 10,
      clean: 7
    },
    lastCompletedDates: {
      water: today.subtract(6, 'day').format('YYYY-MM-DD'),
      fertilize: today.subtract(15, 'day').format('YYYY-MM-DD'),
      prune: today.subtract(40, 'day').format('YYYY-MM-DD'),
      rotate: today.subtract(12, 'day').format('YYYY-MM-DD'),
      clean: today.subtract(8, 'day').format('YYYY-MM-DD')
    },
    deferredTasks: {},
    createdAt: '2025-02-10T09:00:00Z',
    notes: '叶片大，需要定期擦拭除尘'
  },
  {
    id: '4',
    name: '仙人掌',
    location: '办公桌',
    light: '明亮光线',
    potSize: '小号(8cm)',
    purchaseDate: '2025-05-01',
    image: 'https://picsum.photos/id/113/300/300',
    careSchedule: {
      water: 20,
      fertilize: 60,
      prune: 90,
      rotate: 30,
      clean: 60
    },
    lastCompletedDates: {
      water: today.subtract(18, 'day').format('YYYY-MM-DD')
    },
    deferredTasks: {},
    createdAt: '2025-05-01T11:00:00Z',
    notes: '非常耐旱，少浇水'
  },
  {
    id: '5',
    name: '虎皮兰',
    location: '卧室',
    light: '耐阴',
    potSize: '中号(18cm)',
    purchaseDate: '2025-01-20',
    image: 'https://picsum.photos/id/114/300/300',
    careSchedule: {
      water: 14,
      fertilize: 30,
      prune: 60,
      rotate: 21,
      clean: 30
    },
    lastCompletedDates: {
      water: today.subtract(13, 'day').format('YYYY-MM-DD'),
      fertilize: today.subtract(25, 'day').format('YYYY-MM-DD')
    },
    deferredTasks: {},
    createdAt: '2025-01-20T16:00:00Z',
    notes: '夜间释放氧气，适合卧室'
  },
  {
    id: '6',
    name: '发财树',
    location: '客厅',
    light: '散射光',
    potSize: '大号(30cm)',
    purchaseDate: '2024-12-15',
    image: 'https://picsum.photos/id/115/300/300',
    careSchedule: {
      water: 7,
      fertilize: 21,
      prune: 30,
      rotate: 14,
      clean: 14
    },
    lastCompletedDates: {
      water: today.subtract(3, 'day').format('YYYY-MM-DD'),
      rotate: today.subtract(15, 'day').format('YYYY-MM-DD')
    },
    deferredTasks: {},
    createdAt: '2024-12-15T10:00:00Z',
    notes: '忌积水，盆土干透再浇'
  }
];

export const mockPhotos: Photo[] = [
  {
    id: 'p1',
    plantId: '1',
    url: 'https://picsum.photos/id/110/400/400',
    date: '2025-03-15',
    notes: '刚买回来的样子'
  },
  {
    id: 'p2',
    plantId: '1',
    url: 'https://picsum.photos/id/120/400/400',
    date: '2025-04-15',
    notes: '长势良好，新叶长出'
  },
  {
    id: 'p3',
    plantId: '1',
    url: 'https://picsum.photos/id/121/400/400',
    date: '2025-05-15',
    notes: '已经爬藤了'
  },
  {
    id: 'p4',
    plantId: '2',
    url: 'https://picsum.photos/id/111/400/400',
    date: '2025-04-20',
    notes: '刚上盆'
  },
  {
    id: 'p5',
    plantId: '2',
    url: 'https://picsum.photos/id/122/400/400',
    date: '2025-05-20',
    notes: '状态不错'
  },
  {
    id: 'p6',
    plantId: '3',
    url: 'https://picsum.photos/id/112/400/400',
    date: '2025-02-10',
    notes: '刚入手'
  },
  {
    id: 'p7',
    plantId: '3',
    url: 'https://picsum.photos/id/123/400/400',
    date: '2025-04-10',
    notes: '开背了！'
  },
  {
    id: 'p8',
    plantId: '4',
    url: 'https://picsum.photos/id/113/400/400',
    date: '2025-05-01',
    notes: '小仙人球'
  },
  {
    id: 'p9',
    plantId: '5',
    url: 'https://picsum.photos/id/114/400/400',
    date: '2025-01-20',
    notes: '刚到家'
  },
  {
    id: 'p10',
    plantId: '6',
    url: 'https://picsum.photos/id/115/400/400',
    date: '2024-12-15',
    notes: '开业礼物'
  }
];
