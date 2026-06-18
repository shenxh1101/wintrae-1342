import React, { useMemo } from 'react';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { usePlantStore } from '@/store/usePlantStore';
import { taskTypeList } from '@/data/mockDiagnose';
import { getNextScheduleForPlant } from '@/utils/taskGenerator';
import type { TaskType } from '@/types/plant';
import styles from './index.module.scss';

const PlantDetailPage: React.FC = () => {
  const router = useRouter();
  const plantId = router.params.id;

  const { plants, getPhotosByPlant, deletePlant, deletePhoto, initStore } = usePlantStore();

  const [refreshKey, setRefreshKey] = React.useState(0);

  useDidShow(() => {
    initStore();
    setRefreshKey(k => k + 1);
  });

  const plant = useMemo(() => {
    return plants.find(p => p.id === plantId);
  }, [plants, plantId, refreshKey]);

  const plantPhotos = useMemo(() => {
    if (!plantId) return [];
    return getPhotosByPlant(plantId).slice(0, 6);
  }, [plantId, getPhotosByPlant, refreshKey]);

  const nextSchedule = useMemo(() => {
    if (!plant) return null;
    return getNextScheduleForPlant(plant);
  }, [plant, refreshKey]);

  const ownedDays = useMemo(() => {
    if (!plant) return 0;
    return dayjs().diff(dayjs(plant.purchaseDate), 'day');
  }, [plant]);

  const getScheduleStatusClass = (isOverdue: boolean, date: string) => {
    if (isOverdue) return styles.nextOverdue;
    const diff = dayjs(date).diff(dayjs(), 'day');
    if (diff === 0) return styles.nextToday;
    if (diff === 1) return styles.nextTomorrow;
    return styles.nextNormal;
  };

  const getScheduleStatusText = (isOverdue: boolean, date: string) => {
    if (isOverdue) return '逾期';
    const diff = dayjs(date).diff(dayjs(), 'day');
    if (diff < 0) return `逾期${Math.abs(diff)}天`;
    if (diff === 0) return '今日';
    if (diff === 1) return '明日';
    return `${diff}天后`;
  };

  const handleEdit = () => {
    Taro.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '删除植物',
      content: `确定要删除"${plant?.name}"吗？相关的任务和照片也会被删除。`,
      confirmColor: '#F5222D',
      success: (res) => {
        if (res.confirm && plantId) {
          deletePlant(plantId);
          Taro.showToast({
            title: '已删除',
            icon: 'success',
            duration: 1500
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  const handlePhotoClick = (photo: typeof plantPhotos[0]) => {
    const allPhotos = getPhotosByPlant(plantId || '');
    Taro.previewImage({
      urls: allPhotos.map(p => p.url),
      current: photo.url
    });
  };

  const handlePhotoLongPress = (photoId: string) => {
    Taro.showActionSheet({
      itemList: ['删除照片'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showModal({
            title: '删除照片',
            content: '确定要删除这张照片吗？',
            success: (modalRes) => {
              if (modalRes.confirm) {
                deletePhoto(photoId);
                setRefreshKey(k => k + 1);
                Taro.showToast({
                  title: '已删除',
                  icon: 'success'
                });
              }
            }
          });
        }
      }
    });
  };

  const handleViewAllPhotos = () => {
    Taro.switchTab({
      url: '/pages/album/index'
    });
  };

  const handleGoToTasks = () => {
    Taro.switchTab({
      url: '/pages/tasks/index'
    });
  };

  if (!plant) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🌿</Text>
          <Text className={styles.emptyText}>植物不存在或已被删除</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.topSection}>
          <Image
            className={styles.image}
            src={plant.image}
            mode="aspectFill"
            onError={(e) => console.error('[PlantDetail] 图片加载失败:', e.detail)}
          />
          <View className={styles.info}>
            <Text className={styles.name}>{plant.name}</Text>
            <Text className={styles.location}>📍 {plant.location}</Text>
            <Text className={styles.days}>已陪伴 {ownedDays} 天</Text>
          </View>
        </View>
        <View className={styles.tags}>
          <Text className={styles.tag}>☀️ {plant.light}</Text>
          <Text className={styles.tag}>🪴 {plant.potSize}</Text>
          <Text className={styles.tag}>📅 购入 {plant.purchaseDate}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📅 下次养护计划</Text>
          <Text className={styles.sectionAction} onClick={handleGoToTasks}>
            查看全部 →
          </Text>
        </View>
        {nextSchedule && (
          <View className={styles.nextScheduleGrid}>
            {taskTypeList.map(task => {
              const info = nextSchedule[task.key as TaskType];
              const lastDone = plant.lastCompletedDates[task.key as TaskType];
              return (
                <View key={task.key} className={styles.nextScheduleItem}>
                  <View
                    className={styles.nextScheduleIcon}
                    style={{ backgroundColor: `${task.color}15` }}
                  >
                    <Text>{task.icon}</Text>
                  </View>
                  <Text className={styles.nextScheduleName}>{task.name}</Text>
                  <Text className={classnames(styles.nextScheduleDate, getScheduleStatusClass(info.isOverdue, info.date))}>
                    {getScheduleStatusText(info.isOverdue, info.date)}
                  </Text>
                  <Text className={styles.nextScheduleDateText}>{info.date}</Text>
                  <View className={styles.nextScheduleMeta}>
                    <Text className={styles.nextScheduleInterval}>每 {plant.careSchedule[task.key as TaskType]} 天</Text>
                    {lastDone && (
                      <Text className={styles.nextScheduleLast}>上次：{lastDone}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>⏰ 养护周期设置</Text>
        <View className={styles.scheduleList}>
          {taskTypeList.map(task => (
            <View key={task.key} className={styles.scheduleItem}>
              <View className={styles.scheduleLabel}>
                <Text className={styles.scheduleIcon}>{task.icon}</Text>
                <Text>{task.name}</Text>
              </View>
              <Text className={styles.scheduleValue}>
                每 {plant.careSchedule[task.key as TaskType]} 天
              </Text>
            </View>
          ))}
        </View>
      </View>

      {plant.notes && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📝 备注</Text>
          <Text className={styles.notes}>{plant.notes}</Text>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📷 成长记录</Text>
        {plantPhotos.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📸</Text>
            <Text className={styles.emptyText}>还没有照片记录</Text>
          </View>
        ) : (
          <View className={styles.photoSection}>
            <View className={styles.photoGrid}>
              {plantPhotos.slice(0, 5).map(photo => (
                <View
                  key={photo.id}
                  className={styles.photoItem}
                  onClick={() => handlePhotoClick(photo)}
                  onLongPress={() => handlePhotoLongPress(photo.id)}
                >
                  <Image
                    className={styles.photoImage}
                    src={photo.url}
                    mode="aspectFill"
                    onError={(e) => console.error('[PlantDetail] 图片加载失败:', e.detail)}
                  />
                </View>
              ))}
              {plantPhotos.length > 5 && (
                <View
                  className={classnames(styles.photoItem, styles.morePhotos)}
                  onClick={handleViewAllPhotos}
                >
                  <Text>+{plantPhotos.length - 5} 张</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      <View className={styles.footer}>
        <Button className={styles.editBtn} onClick={handleEdit}>
          编辑
        </Button>
        <Button className={styles.deleteBtn} onClick={handleDelete}>
          删除
        </Button>
      </View>
    </ScrollView>
  );
};

export default PlantDetailPage;
