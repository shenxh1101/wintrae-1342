import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { usePlantStore } from '@/store/usePlantStore';
import PhotoItem from '@/components/PhotoItem';
import styles from './index.module.scss';

const AlbumPage: React.FC = () => {
  const { plants, photos, addPhoto, deletePhoto, getPhotosByPlant, initStore } = usePlantStore();

  const [selectedPlantId, setSelectedPlantId] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useDidShow(() => {
    initStore();
    setRefreshKey(k => k + 1);
  });

  usePullDownRefresh(() => {
    setRefreshKey(k => k + 1);
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const displayPhotos = useMemo(() => {
    let filteredPhotos = photos;
    if (selectedPlantId !== 'all') {
      filteredPhotos = getPhotosByPlant(selectedPlantId);
    }
    return filteredPhotos.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos, selectedPlantId, getPhotosByPlant, refreshKey]);

  const groupedPhotos = useMemo(() => {
    const groups: Record<string, typeof photos> = {};
    displayPhotos.forEach(photo => {
      const month = dayjs(photo.date).format('YYYY年MM月');
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(photo);
    });
    return groups;
  }, [displayPhotos]);

  const canCompare = useMemo(() => {
    if (selectedPlantId === 'all') {
      return plants.some(p => getPhotosByPlant(p.id).length >= 2);
    }
    return getPhotosByPlant(selectedPlantId).length >= 2;
  }, [selectedPlantId, plants, getPhotosByPlant]);

  const getPlantName = (plantId: string) => {
    const plant = plants.find(p => p.id === plantId);
    return plant?.name || '未知植物';
  };

  const handleAddPhoto = () => {
    if (plants.length === 0) {
      Taro.showToast({
        title: '请先添加植物',
        icon: 'none'
      });
      return;
    }

    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        const plantId = selectedPlantId === 'all' ? plants[0].id : selectedPlantId;

        Taro.showModal({
          title: '添加备注',
          editable: true,
          placeholderText: '记录这一刻的变化...',
          success: (modalRes) => {
            if (modalRes.confirm) {
              addPhoto({
                plantId,
                url: tempFilePath,
                date: dayjs().format('YYYY-MM-DD'),
                notes: modalRes.content || ''
              });
              setRefreshKey(k => k + 1);
              Taro.showToast({
                title: '照片已添加',
                icon: 'success'
              });
            }
          }
        });
      },
      fail: (err) => {
        console.error('[Album] 选择图片失败:', err);
      }
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    deletePhoto(photoId);
    setRefreshKey(k => k + 1);
    Taro.showToast({
      title: '已删除',
      icon: 'success'
    });
  };

  const handleCompare = () => {
    if (!canCompare) {
      Taro.showToast({
        title: '需要至少2张照片才能对比',
        icon: 'none'
      });
      return;
    }
    const plantParam = selectedPlantId !== 'all' ? `?plantId=${selectedPlantId}` : '';
    Taro.navigateTo({
      url: `/pages/photo-compare/index${plantParam}`
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>📷 成长相册</Text>
        <Text className={styles.subtitle}>记录植物成长的每一个瞬间</Text>
      </View>

      <ScrollView className={styles.filterBar} scrollX>
        <View
          className={classnames(
            styles.filterItem,
            selectedPlantId === 'all' && styles.filterItemActive,
            styles.filterAll
          )}
          onClick={() => setSelectedPlantId('all')}
        >
          全部 ({photos.length})
        </View>
        {plants.map(plant => (
          <View
            key={plant.id}
            className={classnames(
              styles.filterItem,
              selectedPlantId === plant.id && styles.filterItemActive
            )}
            onClick={() => setSelectedPlantId(plant.id)}
          >
            {plant.name}
          </View>
        ))}
      </ScrollView>

      <View className={styles.actionBar}>
        <Button className={styles.addBtn} onClick={handleAddPhoto}>
          + 记录成长
        </Button>
        <Button
          className={classnames(styles.compareBtn, !canCompare && styles.compareBtnDisabled)}
          onClick={handleCompare}
        >
          🔄 对比成长
        </Button>
      </View>

      {displayPhotos.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📸</Text>
          <Text className={styles.emptyText}>
            还没有照片哦{'\n'}
            记录下植物的成长吧~
          </Text>
          <Button className={styles.emptyBtn} onClick={handleAddPhoto}>
            上传第一张照片
          </Button>
        </View>
      ) : (
        <View className={styles.timeline}>
          {Object.entries(groupedPhotos).map(([month, monthPhotos]) => (
            <View key={month} className={styles.timeGroup}>
              <View className={styles.timeHeader}>
                <Text className={styles.timeTitle}>{month}</Text>
              </View>
              <View className={styles.photoGrid}>
                {monthPhotos.map(photo => (
                  <PhotoItem
                    key={photo.id}
                    photo={photo}
                    plantName={selectedPlantId === 'all' ? getPlantName(photo.plantId) : undefined}
                    showDelete
                    onDelete={handleDeletePhoto}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default AlbumPage;
