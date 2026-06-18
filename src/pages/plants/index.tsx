import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { usePlantStore } from '@/store/usePlantStore';
import PlantCard from '@/components/PlantCard';
import styles from './index.module.scss';

const PlantsPage: React.FC = () => {
  const { plants, tasks, refreshTasks } = usePlantStore();
  
  const [pendingTasks, setPendingTasks] = useState(0);

  useEffect(() => {
    refreshTasks();
  }, []);

  useDidShow(() => {
    refreshTasks();
  });

  usePullDownRefresh(() => {
    refreshTasks();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  useEffect(() => {
    const pending = tasks.filter(t => !t.completed).length;
    setPendingTasks(pending);
  }, [tasks]);

  const handleAddPlant = () => {
    Taro.navigateTo({
      url: '/pages/plant-add/index'
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>🌿 我的花园</Text>
        <Text className={styles.title}>用心呵护每一株植物</Text>
      </View>

      <View className={styles.stats}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{plants.length}</Text>
          <Text className={styles.statLabel}>株植物</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{pendingTasks}</Text>
          <Text className={styles.statLabel}>待办任务</Text>
        </View>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>植物列表</Text>
        <Button className={styles.addBtn} onClick={handleAddPlant}>
          + 添加植物
        </Button>
      </View>

      {plants.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🪴</Text>
          <Text className={styles.emptyText}>还没有添加植物哦</Text>
          <Button className={styles.emptyBtn} onClick={handleAddPlant}>
            添加第一株植物
          </Button>
        </View>
      ) : (
        <View className={styles.list}>
          {plants.map(plant => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default PlantsPage;
