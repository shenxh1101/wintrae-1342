import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Textarea, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import dayjs from 'dayjs';
import { symptoms } from '@/data/mockDiagnose';
import { usePlantStore } from '@/store/usePlantStore';
import styles from './index.module.scss';

const DiagnoseDetailPage: React.FC = () => {
  const router = useRouter();
  const symptomId = router.params.id;
  const plantId = router.params.plantId;
  const initialRecorded = router.params.recorded === 'true';

  const { plants, addDiagnosticRecord } = usePlantStore();

  const [notes, setNotes] = useState('');
  const [recorded, setRecorded] = useState(initialRecorded);

  const symptom = useMemo(() => {
    return symptoms.find(s => s.id === symptomId);
  }, [symptomId]);

  const selectedPlant = useMemo(() => {
    if (!plantId) return null;
    return plants.find(p => p.id === plantId);
  }, [plants, plantId]);

  const handleSaveRecord = () => {
    if (!plantId || !symptomId) {
      Taro.showToast({
        title: '请先选择植物',
        icon: 'none'
      });
      return;
    }

    addDiagnosticRecord({
      plantId,
      symptomId,
      date: dayjs().format('YYYY-MM-DD'),
      notes: notes.trim() || undefined
    });

    setRecorded(true);
    Taro.showToast({
      title: '记录已保存',
      icon: 'success'
    });
  };

  const handleViewHistory = () => {
    Taro.switchTab({
      url: '/pages/diagnose/index'
    });
  };

  if (!symptom) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>❓</Text>
          <Text className={styles.emptyText}>症状不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.icon}>{symptom.icon}</Text>
        <Text className={styles.name}>{symptom.name}</Text>
        <Text className={styles.description}>{symptom.description}</Text>
        {selectedPlant && (
          <View className={styles.selectedPlant}>
            <Text className={styles.selectedPlantText}>
              正在诊断：{selectedPlant.name}
            </Text>
          </View>
        )}
        {recorded && (
          <View style={{
            marginTop: '16rpx',
            padding: '8rpx 16rpx',
            backgroundColor: 'rgba(45, 184, 77, 0.15)',
            borderRadius: '100rpx',
            alignSelf: 'flex-start'
          }}>
            <Text style={{
              color: '#2DB84D',
              fontSize: '24rpx',
              fontWeight: '500'
            }}>
              ✅ 已记录诊断
            </Text>
          </View>
        )}
      </View>

      <View className={styles.tipCard}>
        <Text className={styles.tipTitle}>💡 诊断说明</Text>
        <Text className={styles.tipText}>
          请按照以下步骤逐一排查，每完成一步检查植物状态是否有改善。
          如果问题持续，请咨询专业园艺师或前往植物医院。
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🔍 排查步骤</Text>
        <View className={styles.steps}>
          {symptom.steps.map(step => (
            <View key={step.order} className={styles.step}>
              <View className={styles.stepNumber}>{step.order}</View>
              <Text className={styles.stepTitle}>{step.title}</Text>
              <Text className={styles.stepDesc}>{step.description}</Text>
              <View className={styles.stepSolution}>
                <Text className={styles.solutionLabel}>✅ 解决方法</Text>
                <Text className={styles.solutionText}>{step.solution}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {plantId && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📝 记录备注</Text>
          <Textarea
            className={styles.notesInput}
            placeholder="记录观察到的情况、已采取的措施、后续计划等..."
            placeholderClass={styles.notesPlaceholder}
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
            maxlength={500}
            autoHeight
          />
          <View className={styles.notesActions}>
            {!recorded ? (
              <Button className={styles.saveRecordBtn} onClick={handleSaveRecord}>
                💾 保存诊断记录
              </Button>
            ) : (
              <Button className={styles.viewHistoryBtn} onClick={handleViewHistory}>
                📋 查看全部历史记录
              </Button>
            )}
          </View>
        </View>
      )}

      <View className={styles.tipCard}>
        <Text className={styles.tipTitle}>📝 预防建议</Text>
        <Text className={styles.tipText}>
          1. 定期检查植物状态，早发现早处理{'\n'}
          2. 保持通风环境，避免闷热潮湿{'\n'}
          3. 合理水肥管理，避免过度养护{'\n'}
          4. 新购入植物先隔离观察一周{'\n'}
          5. 定期清洁叶片，保持植物健康
        </Text>
      </View>
    </ScrollView>
  );
};

export default DiagnoseDetailPage;
