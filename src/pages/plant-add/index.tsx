import React, { useState } from 'react';
import { View, Text, Button, Input, Picker, Textarea, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { usePlantStore } from '@/store/usePlantStore';
import { taskTypeList } from '@/data/mockDiagnose';
import type { CareSchedule } from '@/types/plant';
import { saveImageToLocal } from '@/utils/imageStorage';
import styles from './index.module.scss';

const lightOptions = ['散射光', '充足阳光', '半阴', '耐阴', '明亮光线'];
const potSizeOptions = ['小号(8cm)', '小号(10cm)', '中号(15cm)', '中号(18cm)', '大号(25cm)', '大号(30cm)'];
const locationOptions = ['客厅', '卧室', '书房', '阳台', '厨房', '卫生间', '办公桌', '其他'];

const PlantAddPage: React.FC = () => {
  const { addPlant } = usePlantStore();
  
  const [image, setImage] = useState('https://picsum.photos/id/116/300/300');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [light, setLight] = useState('');
  const [potSize, setPotSize] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [notes, setNotes] = useState('');
  
  const [careSchedule, setCareSchedule] = useState<CareSchedule>({
    water: 3,
    fertilize: 14,
    prune: 30,
    rotate: 7,
    clean: 14
  });

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      const tempPath = res.tempFilePaths[0];

      Taro.showLoading({ title: '处理中...' });
      const savedPath = await saveImageToLocal(tempPath);
      setImage(savedPath);
    } catch (err) {
      console.error('[PlantAdd] 选择图片失败:', err);
    } finally {
      Taro.hideLoading();
    }
  };

  const updateSchedule = (type: keyof CareSchedule, delta: number) => {
    setCareSchedule(prev => ({
      ...prev,
      [type]: Math.max(1, Math.min(90, prev[type] + delta))
    }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入植物名称', icon: 'none' });
      return;
    }
    if (!location) {
      Taro.showToast({ title: '请选择摆放位置', icon: 'none' });
      return;
    }
    if (!light) {
      Taro.showToast({ title: '请选择光照条件', icon: 'none' });
      return;
    }
    if (!potSize) {
      Taro.showToast({ title: '请选择花盆大小', icon: 'none' });
      return;
    }

    addPlant({
      name: name.trim(),
      location,
      light,
      potSize,
      purchaseDate,
      image,
      careSchedule,
      notes: notes.trim()
    });

    Taro.showToast({
      title: '添加成功',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const dateRange = {
    start: '2020-01-01',
    end: dayjs().format('YYYY-MM-DD')
  };

  return (
    <View className={styles.page}>
      <View className={styles.form}>
        <View className={styles.imageSection}>
          <View className={styles.imagePreview}>
            {image ? (
              <Image src={image} mode="aspectFill" style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text>🪴</Text>
            )}
          </View>
          <Button className={styles.uploadBtn} onClick={handleChooseImage}>
            选择图片
          </Button>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>植物名称
          </Text>
          <Input
            className={styles.input}
            placeholder="请输入植物名称，如：绿萝"
            placeholderClass={styles.inputPlaceholder}
            value={name}
            onInput={(e) => setName(e.detail.value)}
            maxlength={20}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>摆放位置
          </Text>
          <Picker
            mode="selector"
            range={locationOptions}
            onChange={(e) => setLocation(locationOptions[e.detail.value])}
          >
            <View className={styles.picker}>
              <Text className={location ? '' : styles.inputPlaceholder}>
                {location || '请选择摆放位置'}
              </Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>光照条件
          </Text>
          <Picker
            mode="selector"
            range={lightOptions}
            onChange={(e) => setLight(lightOptions[e.detail.value])}
          >
            <View className={styles.picker}>
              <Text className={light ? '' : styles.inputPlaceholder}>
                {light || '请选择光照条件'}
              </Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>花盆大小
          </Text>
          <Picker
            mode="selector"
            range={potSizeOptions}
            onChange={(e) => setPotSize(potSizeOptions[e.detail.value])}
          >
            <View className={styles.picker}>
              <Text className={potSize ? '' : styles.inputPlaceholder}>
                {potSize || '请选择花盆大小'}
              </Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>购买日期
          </Text>
          <Picker
            mode="date"
            value={purchaseDate}
            start={dateRange.start}
            end={dateRange.end}
            onChange={(e) => setPurchaseDate(e.detail.value)}
          >
            <View className={styles.picker}>
              <Text>{purchaseDate}</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.scheduleSection}>
          <Text className={styles.scheduleTitle}>⏰ 养护周期设置</Text>
          {taskTypeList.map(task => (
            <View key={task.key} className={styles.scheduleItem}>
              <View className={styles.scheduleLabel}>
                <Text className={styles.scheduleIcon}>{task.icon}</Text>
                <Text>{task.name}</Text>
              </View>
              <View className={styles.scheduleControl}>
                <Button
                  className={styles.scheduleBtn}
                  onClick={() => updateSchedule(task.key, -1)}
                >
                  -
                </Button>
                <Text className={styles.scheduleValue}>
                  {careSchedule[task.key as keyof CareSchedule]}
                </Text>
                <Button
                  className={styles.scheduleBtn}
                  onClick={() => updateSchedule(task.key, 1)}
                >
                  +
                </Button>
                <Text className={styles.scheduleUnit}>天</Text>
              </View>
            </View>
          ))}
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>备注</Text>
          <Textarea
            className={styles.textarea}
            placeholder="记录植物的习性、特点等..."
            placeholderClass={styles.inputPlaceholder}
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
            maxlength={200}
            autoHeight
          />
        </View>
      </View>

      <View className={styles.footer}>
        <Button className={styles.saveBtn} onClick={handleSave}>
          保存植物
        </Button>
      </View>
    </View>
  );
};

export default PlantAddPage;
