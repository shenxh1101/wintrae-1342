import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { usePlantStore } from '@/store/usePlantStore';
import type { Photo } from '@/types/plant';
import styles from './index.module.scss';

const PhotoComparePage: React.FC = () => {
  const router = useRouter();
  const initialPlantId = router.params.plantId || '';

  const { plants, getPhotosByPlant, initStore } = usePlantStore();

  const [selectedPlantId, setSelectedPlantId] = useState<string>(initialPlantId || '');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<[string | null, string | null]>([null, null]);

  useDidShow(() => {
    initStore();
  });

  const plantsWithPhotos = useMemo(() => {
    return plants
      .map(p => ({
        plant: p,
        photos: getPhotosByPlant(p.id)
      }))
      .filter(item => item.photos.length >= 2);
  }, [plants, getPhotosByPlant]);

  const selectedPlant = useMemo(() => {
    return plants.find(p => p.id === selectedPlantId);
  }, [plants, selectedPlantId]);

  const plantPhotos = useMemo(() => {
    if (!selectedPlantId) return [];
    return getPhotosByPlant(selectedPlantId);
  }, [selectedPlantId, getPhotosByPlant]);

  const [photo1, photo2] = useMemo(() => {
    return selectedPhotoIds.map(id =>
      plantPhotos.find(p => p.id === id) || null
    ) as [Photo | null, Photo | null];
  }, [selectedPhotoIds, plantPhotos]);

  const canCompare = photo1 && photo2;

  const daysDiff = useMemo(() => {
    if (!photo1 || !photo2) return 0;
    return Math.abs(dayjs(photo2.date).diff(dayjs(photo1.date), 'day'));
  }, [photo1, photo2]);

  const handleSelectPlant = (plantId: string) => {
    setSelectedPlantId(plantId);
    setSelectedPhotoIds([null, null]);
  };

  const handleSelectPhoto = (photoId: string) => {
    const [first, second] = selectedPhotoIds;

    if (first === photoId) {
      setSelectedPhotoIds([second, null]);
      return;
    }
    if (second === photoId) {
      setSelectedPhotoIds([first, null]);
      return;
    }

    if (!first) {
      setSelectedPhotoIds([photoId, second]);
    } else if (!second) {
      setSelectedPhotoIds([first, photoId]);
    } else {
      setSelectedPhotoIds([first, photoId]);
    }
  };

  const handleReset = () => {
    setSelectedPhotoIds([null, null]);
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  if (!selectedPlantId) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>🌿 选择植物</Text>
          <Text className={styles.subTitle}>
            请选择要对比的植物，需要至少有2张照片才能进行对比。
          </Text>

          {plantsWithPhotos.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📷</Text>
              <Text className={styles.emptyText}>
                还没有可以对比的植物{'\n'}快去相册添加一些照片吧！
              </Text>
            </View>
          ) : (
            <View className={styles.plantList}>
              {plantsWithPhotos.map(({ plant, photos }) => (
                <View
                  key={plant.id}
                  className={classnames(styles.plantItem)}
                  onClick={() => handleSelectPlant(plant.id)}
                >
                  <Image
                    className={styles.plantImage}
                    src={plant.image}
                    mode="aspectFill"
                  />
                  <View className={styles.plantInfo}>
                    <Text className={styles.plantName}>{plant.name}</Text>
                    <Text className={styles.plantCount}>共 {photos.length} 张照片</Text>
                  </View>
                  <Text style={{ color: '#2DB84D', fontSize: '28rpx' }}>→</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.section}>
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16rpx'
          }}
        >
          <Text className={styles.sectionTitle}>
            📷 {selectedPlant?.name} - 成长对比
          </Text>
          <Text
            style={{
              fontSize: '24rpx',
              color: '#2DB84D'
            }}
            onClick={() => setSelectedPlantId('')}
          >
            切换植物
          </Text>
        </View>

        {canCompare ? (
          <View className={styles.compareSection}>
            <View className={styles.compareGrid}>
              {[photo1, photo2].map((photo, index) => photo && (
                <View key={photo.id} className={styles.compareCard}>
                  <Image
                    className={styles.compareImage}
                    src={photo.url}
                    mode="aspectFill"
                    onClick={() => {
                      const urls = [photo1!.url, photo2!.url];
                      Taro.previewImage({
                        urls,
                        current: photo.url
                      });
                    }}
                  />
                  <View className={styles.compareInfo}>
                    <Text className={styles.compareDate}>
                      {index === 0 ? '📅 之前：' : '📅 之后：'}{photo.date}
                    </Text>
                    {photo.notes && (
                      <Text className={styles.compareNotes}>💬 {photo.notes}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <View className={styles.vsDivider}>
              <View className={styles.vsBadge}>
                间隔 {daysDiff} 天
              </View>
            </View>

            <View className={styles.analysis}>
              <Text className={styles.analysisTitle}>📝 观察建议</Text>
              <Text className={styles.analysisContent}>
                {daysDiff === 0
                  ? '两张照片拍摄于同一天，建议仔细对比叶片状态的微小变化。'
                  : daysDiff < 7
                    ? `间隔 ${daysDiff} 天，时间较短，可以观察叶片伸展情况和颜色变化。`
                    : daysDiff < 30
                      ? `间隔 ${daysDiff} 天（约 ${Math.ceil(daysDiff / 7)} 周），可以对比新叶生长和整体状态变化。`
                      : `间隔 ${daysDiff} 天（约 ${Math.floor(daysDiff / 30)} 个月），可以明显看到生长变化，记得保持良好的养护习惯！`
                }
              </Text>
            </View>

            <Button className={styles.resetBtn} onClick={handleReset}>
              🔄 重新选择照片
            </Button>
          </View>
        ) : (
          <View className={styles.photoSelector}>
            <Text className={styles.subTitle}>
              请选择 2 张照片进行对比（先选的为"之前"，后选的为"之后"）
            </Text>

            <View className={styles.photoList}>
              {plantPhotos.map(photo => {
                const isFirst = selectedPhotoIds[0] === photo.id;
                const isSecond = selectedPhotoIds[1] === photo.id;
                const isSelected = isFirst || isSecond;
                const isDisabled = !isSelected && selectedPhotoIds[0] && selectedPhotoIds[1];

                return (
                  <View
                    key={photo.id}
                    className={classnames(
                      styles.photoItem,
                      isSelected && styles.selected,
                      isDisabled && styles.disabled
                    )}
                    onClick={() => handleSelectPhoto(photo.id)}
                  >
                    <Image
                      className={styles.photoImage}
                      src={photo.url}
                      mode="aspectFill"
                    />
                    {isSelected && (
                      <View className={styles.photoCheck}>
                        {isFirst ? '1' : '2'}
                      </View>
                    )}
                    <View className={styles.photoDateBadge}>
                      {photo.date.slice(5)}
                    </View>
                  </View>
                );
              })}
            </View>

            {plantPhotos.length < 2 && (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📸</Text>
                <Text className={styles.emptyText}>
                  照片不足2张，无法进行对比{'\n'}快去添加更多成长照片吧！
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PhotoComparePage;
