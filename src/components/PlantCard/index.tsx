import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import type { Plant } from '@/types/plant';
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
          <Text className={styles.nextTask}>💧 {plant.careSchedule.water}天浇一次</Text>
        </View>
      </View>
    </View>
  );
};

export default PlantCard;
