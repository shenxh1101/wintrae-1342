import React, { useState } from 'react';
import { View, Text, Button, Image, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import type { Task } from '@/types/plant';
import { taskTypeList } from '@/data/mockDiagnose';
import { saveImageToLocal, deleteLocalImage } from '@/utils/imageStorage';
import styles from './index.module.scss';

interface TaskItemProps {
  task: Task;
  onComplete?: (options?: { photoUrl?: string; notes?: string }) => void;
  onDefer?: (days?: number) => void;
  isHistory?: boolean;
  completedDate?: string;
  completedPhotoUrl?: string;
  completedNotes?: string;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  onDefer,
  isHistory = false,
  completedDate,
  completedPhotoUrl,
  completedNotes
}) => {
  const taskType = taskTypeList.find(t => t.key === task.type);
  const icon = taskType?.icon || '📋';
  const name = taskType?.name || '任务';
  const color = taskType?.color || '#52C41A';

  const [showCompletePanel, setShowCompletePanel] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const today = dayjs();
  const scheduled = dayjs(task.scheduledDate);
  const diff = scheduled.diff(today, 'day');

  let statusClass = styles.statusTomorrow;
  let statusText = `${diff} 天后`;

  if (task.completed || isHistory) {
    statusClass = styles.statusCompleted;
    statusText = '已完成';
  } else if (diff < 0) {
    statusClass = styles.statusOverdue;
    statusText = `逾期 ${Math.abs(diff)} 天`;
  } else if (diff === 0) {
    statusClass = styles.statusToday;
    statusText = '今日待办';
  } else if (diff === 1) {
    statusClass = styles.statusTomorrow;
    statusText = '明日待办';
  }

  const displayCompletedDate = completedDate || task.completedDate;

  const handleChoosePhoto = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      Taro.showLoading({ title: '处理中...' });
      const savedPath = await saveImageToLocal(res.tempFilePaths[0]);
      if (photoUrl) {
        await deleteLocalImage(photoUrl);
      }
      setPhotoUrl(savedPath);
    } catch (err) {
      console.error('[TaskItem] 选择图片失败:', err);
    } finally {
      Taro.hideLoading();
    }
  };

  const handleRemovePhoto = async () => {
    if (photoUrl) {
      await deleteLocalImage(photoUrl);
    }
    setPhotoUrl('');
  };

  const handleConfirmComplete = () => {
    onComplete?.({ photoUrl: photoUrl || undefined, notes: notes.trim() || undefined });
    setShowCompletePanel(false);
    setPhotoUrl('');
    setNotes('');
  };

  const handleCancelComplete = () => {
    if (photoUrl) {
      deleteLocalImage(photoUrl);
    }
    setShowCompletePanel(false);
    setPhotoUrl('');
    setNotes('');
  };

  return (
    <View className={classnames(styles.card, (task.completed || isHistory) && styles.completed)}>
      <View className={styles.header}>
        <View className={styles.icon} style={{ backgroundColor: `${color}15` }}>
          <Text>{icon}</Text>
        </View>
        <View className={styles.content}>
          <Text className={styles.title}>{name} - {task.plantName}</Text>
          <Text className={styles.subtitle}>
            {isHistory || task.completed
              ? `原定：${task.scheduledDate}`
              : `计划日期：${task.scheduledDate}`
            }
            {task.deferredCount > 0 && (
              <Text className={styles.deferredTag}> 已延期{task.deferredCount}次</Text>
            )}
          </Text>
        </View>
        <Text className={classnames(styles.status, statusClass)}>{statusText}</Text>
      </View>

      {(task.completed || isHistory) && completedPhotoUrl && (
        <View className={styles.completedPhoto}>
          <Image src={completedPhotoUrl} className={styles.completedPhotoImg} mode="aspectFill" />
        </View>
      )}
      {(task.completed || isHistory) && completedNotes && (
        <View className={styles.completedNotes}>
          <Text className={styles.completedNotesText}>📝 {completedNotes}</Text>
        </View>
      )}

      <View className={styles.body}>
        {task.completed || isHistory ? (
          <Text className={styles.completedText}>✅ 已完成于 {displayCompletedDate}</Text>
        ) : (
          <>
            {!showCompletePanel ? (
              <>
                <Button className={styles.checkBtn} onClick={() => setShowCompletePanel(true)}>
                  📋 完成打卡
                </Button>
                <Button className={styles.deferBtn} onClick={() => onDefer?.(1)}>
                  延期1天
                </Button>
              </>
            ) : (
              <View className={styles.completePanel}>
                <View className={styles.panelRow}>
                  <Text className={styles.panelLabel}>📷 养护照片</Text>
                  {photoUrl ? (
                    <View className={styles.photoPreviewWrap}>
                      <Image
                        src={photoUrl}
                        className={styles.photoPreview}
                        mode="aspectFill"
                        onClick={() => Taro.previewImage({ urls: [photoUrl] })}
                      />
                      <View className={styles.removePhotoBtn} onClick={handleRemovePhoto}>
                        <Text className={styles.removePhotoText}>×</Text>
                      </View>
                    </View>
                  ) : (
                    <View className={styles.addPhotoBtn} onClick={handleChoosePhoto}>
                      <Text className={styles.addPhotoIcon}>📷</Text>
                      <Text className={styles.addPhotoText}>添加照片</Text>
                    </View>
                  )}
                </View>

                <View className={styles.panelRow}>
                  <Text className={styles.panelLabel}>📝 备注</Text>
                  <Textarea
                    className={styles.notesInput}
                    placeholder="记录养护情况..."
                    placeholderClass={styles.notesPlaceholder}
                    value={notes}
                    onInput={(e) => setNotes(e.detail.value)}
                    maxlength={200}
                    autoHeight
                  />
                </View>

                <View className={styles.panelActions}>
                  <Button className={styles.panelCancelBtn} onClick={handleCancelComplete}>
                    取消
                  </Button>
                  <Button className={styles.panelConfirmBtn} onClick={handleConfirmComplete}>
                    ✅ 确认完成
                  </Button>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default TaskItem;

