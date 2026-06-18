import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { Photo } from '@/types/plant';
import styles from './index.module.scss';

interface PhotoItemProps {
  photo: Photo;
  plantName?: string;
  showDelete?: boolean;
  onDelete?: (photoId: string) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ photo, plantName, showDelete = false, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    Taro.showModal({
      title: '删除照片',
      content: '确定要删除这张照片吗？',
      success: (res) => {
        if (res.confirm && onDelete) {
          onDelete(photo.id);
        }
      }
    });
  };

  const handlePreview = () => {
    Taro.previewImage({
      urls: [photo.url],
      current: photo.url
    });
  };

  return (
    <View className={styles.card} onClick={handlePreview}>
      {showDelete && (
        <Button className={styles.deleteBtn} onClick={handleDelete}>
          ×
        </Button>
      )}
      <Image
        className={styles.image}
        src={photo.url}
        mode="aspectFill"
        lazyLoad
        onError={(e) => console.error('[PhotoItem] 图片加载失败:', e.detail)}
      />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.date}>📅 {photo.date}</Text>
          {plantName && (
            <Text className={styles.plantName}>🌿 {plantName}</Text>
          )}
        </View>
        {photo.notes && (
          <Text className={styles.notes}>{photo.notes}</Text>
        )}
      </View>
    </View>
  );
};

export default PhotoItem;
