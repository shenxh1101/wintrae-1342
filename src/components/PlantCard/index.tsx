import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import type { Plant } from '@/types/plant';
import { getNextScheduleForPlant, getTaskTypeIcon } from '@/utils/taskGenerator';
import styles from './index.module.scss';

interface PlantCardProps {
  plant: Plant;
  onClick?: (plant: Plant) => void;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(plant);
    } else {
      Taro.navigateTo({
        url: `/pages/plant-detail/index?id=${plant.id}`
      });
    }
  };

  const ownedDays = dayjs().diff(dayjs(plant.purchaseDate), 'day');

  const nextTask = useMemo(() => {
    const schedule = getNextScheduleForPlant(plant);
    const all = (Object.keys(schedule) as Array<keyof typeof schedule>).map(type => ({
      type,
      ...schedule[type]
    }));
    all.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
    return all[0];
  }, [plant]);

  const nextStatusText = useMemo(() => {
    if (!nextTask) return '';
    const diff = dayjs(nextTask.date).diff(dayjs(), 'day');
    if (nextTask.isOverdue || diff < 0) return `逾期${Math.abs(diff)}天`;
    if (diff === 0) return '今日';
    if (diff === 1) return '明日';
    return `${diff}天后`;
  }, [nextTask]);

  const nextStatusClass = useMemo(() => {
    if (!nextTask) return '';
    const diff = dayjs(nextTask.date).diff(dayjs(), 'day');
    if (nextTask.isOverdue || diff < 0) return styles.nextOverdue;
    if (diff === 0) return styles.nextToday;
    if (diff === 1) return styles.nextTomorrow;
    return styles.nextNormal;
  }, [nextTask]);

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image
        className={styles.image}
        src={plant.image}
        mode="aspectFill"
        lazyLoad
        onError={(e) => console.error('[PlantCard] 图片加载失败:', e.detail)}
      />
      <View className={styles.content}>
        <View className={styles.header}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text className={styles.name}>{plant.name}</Text>
            <Text className={styles.location}>📍 {plant.location}</Text>
          </View>
        </View>
        <View className={styles.info}>
          <Text className={styles.tag}>☀️ {plant.light}</Text>
          <Text className={styles.tag}>🪴 {plant.potSize}</Text>
        </View>
        <View className={styles.footer}>
          <Text className={styles.date}>已陪伴 {ownedDays} 天</Text>
          {nextTask && (
            <Text className={classnames(styles.nextTask, nextStatusClass)}>
              {getTaskTypeIcon(nextTask.type as any)} {nextStatusText}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default PlantCard;
