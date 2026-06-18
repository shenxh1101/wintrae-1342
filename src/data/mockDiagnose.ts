import type { Symptom, TaskTypeInfo } from '@/types/plant';

export const taskTypeList: TaskTypeInfo[] = [
  { key: 'water', name: '浇水', icon: '💧', color: '#1890FF' },
  { key: 'fertilize', name: '施肥', icon: '🌱', color: '#52C41A' },
  { key: 'prune', name: '修剪', icon: '✂️', color: '#FA8C16' },
  { key: 'rotate', name: '转盆', icon: '🔄', color: '#722ED1' },
  { key: 'clean', name: '清洁', icon: '🧹', color: '#13C2C2' }
];

export const symptoms: Symptom[] = [
  {
    id: 'yellow-leaf',
    name: '黄叶',
    icon: '🍂',
    description: '叶片发黄、枯萎，可能是浇水过多或过少、光照不足等原因',
    steps: [
      {
        order: 1,
        title: '检查土壤湿度',
        description: '用手指插入土壤2-3厘米，感受土壤干湿程度',
        solution: '如果土壤干燥，说明缺水，需要及时浇水；如果土壤潮湿，说明浇水过多，需要停止浇水并松土透气'
      },
      {
        order: 2,
        title: '检查光照情况',
        description: '观察植物放置位置的光照时长和强度',
        solution: '如果光照不足，移到光线明亮处；如果光照过强，移到散射光处'
      },
      {
        order: 3,
        title: '检查施肥情况',
        description: '回忆最近施肥时间和用量',
        solution: '如果长期未施肥，补充稀释后的营养液；如果施肥过多，用大水冲洗土壤'
      },
      {
        order: 4,
        title: '检查温度',
        description: '确认环境温度是否适合该植物',
        solution: '避免温度骤变，冬季注意保暖，夏季注意降温通风'
      }
    ]
  },
  {
    id: 'root-rot',
    name: '烂根',
    icon: '🪴',
    description: '根部腐烂发臭，叶片萎蔫，土壤有异味',
    steps: [
      {
        order: 1,
        title: '确认烂根程度',
        description: '轻轻将植物从盆中取出，观察根部状态',
        solution: '用消毒后的剪刀剪除所有腐烂的根系，健康的根是白色或淡黄色的'
      },
      {
        order: 2,
        title: '消毒处理',
        description: '修剪后的根系需要消毒',
        solution: '将根部放入多菌灵或高锰酸钾溶液中浸泡15-30分钟，取出晾干'
      },
      {
        order: 3,
        title: '更换土壤',
        description: '旧土可能带有病菌，需要更换',
        solution: '准备疏松透气的新土壤，可以添加珍珠岩或蛭石增加透气性'
      },
      {
        order: 4,
        title: '上盆养护',
        description: '重新栽种后注意养护',
        solution: '上盆后浇一次透水，放在阴凉通风处缓苗，避免阳光直射，待恢复后正常养护'
      }
    ]
  },
  {
    id: 'pests',
    name: '虫害',
    icon: '🐛',
    description: '叶片有虫洞、粘液、虫卵或可见虫子',
    steps: [
      {
        order: 1,
        title: '识别虫害类型',
        description: '仔细观察叶片背面和连接处，确定虫害种类',
        solution: '常见虫害有蚜虫、红蜘蛛、蚧壳虫、白粉虱等，不同虫害处理方式不同'
      },
      {
        order: 2,
        title: '物理清除',
        description: '数量不多时可以手动清除',
        solution: '用清水冲洗叶片，或用棉签蘸酒精擦拭受害部位'
      },
      {
        order: 3,
        title: '药物治疗',
        description: '虫害严重时需要用药',
        solution: '使用对应的杀虫剂（如吡虫啉、护花神等），按照说明稀释后喷洒叶片正反面，7天一次，连续2-3次'
      },
      {
        order: 4,
        title: '隔离预防',
        description: '防止传染其他植物',
        solution: '将生病的植物隔离养护，保持通风，定期检查其他植物状况'
      }
    ]
  },
  {
    id: 'leggy',
    name: '徒长',
    icon: '📏',
    description: '植物茎干细长、叶片稀疏、间距拉大',
    steps: [
      {
        order: 1,
        title: '增加光照',
        description: '徒长最常见的原因是光照不足',
        solution: '将植物移到光照充足的地方，保证每天至少4-6小时的光照'
      },
      {
        order: 2,
        title: '控制浇水',
        description: '水分过多也会导致徒长',
        solution: '适当减少浇水频率，待土壤干透后再浇水，避免盆土长期潮湿'
      },
      {
        order: 3,
        title: '控制施肥',
        description: '氮肥过多会促进徒长',
        solution: '减少氮肥使用，增施磷钾肥，促进植物健壮生长'
      },
      {
        order: 4,
        title: '修剪整形',
        description: '已经徒长的部分无法恢复，需要修剪',
        solution: '将徒长的枝条剪短，促进侧枝萌发，修剪下来的枝条可以用来扦插繁殖'
      }
    ]
  }
];
