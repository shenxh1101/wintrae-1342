import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { usePlantStore } from '@/store/usePlantStore';
import { symptoms } from '@/data/mockDiagnose';
import styles from './index.module.scss';

const DiagnoseRecordPage: React.FC = () => {
  const router = useRouter();
  const recordId = router.params.id;

  const { plants, diagnosticRecords, initStore } = usePlantStore();

  React.useEffect(() => {
    initStore();
  }, []);

  const record = useMemo(() => {
    return diagnosticRecords.find(r => r.id === recordId);
  }, [diagnosticRecords, recordId]);

  const plant = useMemo(() => {
    if (!record) return null;
    return plants.find(p => p.id === record.plantId);
  }, [plants, record]);

  const symptom = useMemo(() => {
    if (!record) return null;
    return symptoms.find(s => s.id === record.symptomId);
  }, [record]);

  const handleViewDiagnoseDetail = () => {
    if (!symptom) return;
    Taro.navigateTo({
      url: `/pages/diagnose-detail/index?id=${symptom.id}`
    });
  };

  const handleViewPlantDetail = () => {
    if (!plant) return;
    Taro.navigateTo({
      url: `/pages/plant-detail/index?id=${plant.id}`
    });
  };

  if (!record || !symptom) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>❓</Text>
          <Text className={styles.emptyText}>
            诊断记录不存在{'\n'}可能已被删除
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.headerSection}>
        <Text className={styles.headerTitle}>
          {symptom.icon} {symptom.name} - 诊断记录
        </Text>
        <Text className={styles.headerDate}>📅 记录时间：{record.date}</Text>
        {plant && (
          <View className={styles.headerPlant} onClick={handleViewPlantDetail}>
            <Image
              className={styles.headerPlantImage}
              src={plant.image}
              mode="aspectFill"
            />
            <View className={styles.headerPlantInfo}>
              <Text className={styles.headerPlantName}>{plant.name}</Text>
              <Text className={styles.headerPlantLocation}>📍 {plant.location}</Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '28rpx' }}>→</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🏷️ 症状信息</Text>
        <View className={styles.symptomInfo}>
          <View className={styles.symptomIcon}>
            <Text>{symptom.icon}</Text>
          </View>
          <View className={styles.symptomDetail}>
            <Text className={styles.symptomName}>{symptom.name}</Text>
            <Text className={styles.symptomDescription}>{symptom.description}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📋 排查步骤</Text>
        <View className={styles.stepsList}>
          {symptom.steps.map(step => (
            <View key={step.order} className={styles.stepItem}>
              <View className={styles.stepCard}>
                <View className={styles.stepNumber}>{step.order}</View>
                <Text className={styles.stepTitle}>{step.title}</Text>
                <Text className={styles.stepDescription}>{step.description}</Text>
                <View className={styles.stepSolution}>
                  <Text className={styles.stepSolutionLabel}>✅ 解决方法</Text>
                  <Text className={styles.stepSolutionText}>{step.solution}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <Button className={styles.viewDiagnoseBtn} onClick={handleViewDiagnoseDetail}>
          🔍 查看完整诊断指南
        </Button>
      </View>

      {record.notes && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>💬 用户备注</Text>
          <View className={styles.notesSection}>
            <Text className={styles.notesLabel}>记录时的备注</Text>
            <Text className={styles.notesText}>{record.notes}</Text>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>💡 后续建议</Text>
        <View className={styles.tipsSection}>
          <Text className={styles.tipsTitle}>🌿 养护小贴士</Text>
          <Text className={styles.tipsText}>
            1. 按照排查步骤执行后，请持续观察植物 3-7 天，记录变化{'\n'}
            2. 如症状未改善或加重，建议重复诊断或咨询专业园艺师{'\n'}
            3. 可以在成长相册中记录当前状态，便于后续对比{'\n'}
            4. 保持规律的养护习惯，预防问题再次发生
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default DiagnoseRecordPage;
