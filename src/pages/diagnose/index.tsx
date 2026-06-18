import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { usePlantStore } from '@/store/usePlantStore';
import SymptomCard from '@/components/SymptomCard';
import { symptoms } from '@/data/mockDiagnose';
import type { Symptom } from '@/types/plant';
import styles from './index.module.scss';

const DiagnosePage: React.FC = () => {
  const { plants, diagnosticRecords, addDiagnosticRecord } = usePlantStore();
  
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');

  useDidShow(() => {
    // 刷新数据
  });

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const selectedPlant = useMemo(() => {
    return plants.find(p => p.id === selectedPlantId);
  }, [plants, selectedPlantId]);

  const recentRecords = useMemo(() => {
    return [...diagnosticRecords]
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
      .slice(0, 5)
      .map(record => {
        const plant = plants.find(p => p.id === record.plantId);
        const symptom = symptoms.find(s => s.id === record.symptomId);
        return {
          ...record,
          plantName: plant?.name || '未知植物',
          symptomName: symptom?.name || '未知问题'
        };
      });
  }, [diagnosticRecords, plants]);

  const handlePlantSelect = (plantId: string) => {
    setSelectedPlantId(plantId === selectedPlantId ? '' : plantId);
  };

  const handleSymptomClick = (symptom: Symptom) => {
    if (selectedPlantId) {
      addDiagnosticRecord({
        plantId: selectedPlantId,
        symptomId: symptom.id,
        date: dayjs().format('YYYY-MM-DD')
      });
      Taro.showToast({
        title: '已记录诊断',
        icon: 'success'
      });
    }

    Taro.navigateTo({
      url: `/pages/diagnose-detail/index?id=${symptom.id}&plantId=${selectedPlantId || ''}`
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>🔍 问题诊断</Text>
        <Text className={styles.subtitle}>选择植物和症状，获取专业诊断建议</Text>
      </View>

      <View className={styles.selectPlant}>
        <Text className={styles.selectTitle}>
          🌿 选择植物 {selectedPlant && <Text style={{ color: '#2DB84D' }}>（已选：{selectedPlant.name}）</Text>}
        </Text>
        <ScrollView className={styles.plantList} scrollX>
          {plants.map(plant => (
            <View
              key={plant.id}
              className={classnames(
                styles.plantItem,
                selectedPlantId === plant.id && styles.plantItemActive
              )}
              onClick={() => handlePlantSelect(plant.id)}
            >
              <Image
                className={styles.plantAvatar}
                src={plant.image}
                mode="aspectFill"
                onError={(e) => console.error('[Diagnose] 植物图片加载失败:', e.detail)}
              />
              <Text className={styles.plantName}>{plant.name}</Text>
              <Text className={styles.plantLocation}>{plant.location}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.tipCard}>
        <Text className={styles.tipTitle}>💡 诊断小贴士</Text>
        <Text className={styles.tipText}>
          1. 先选择出现问题的植物{'\n'}
          2. 点击对应的症状卡片{'\n'}
          3. 按照诊断步骤逐一排查{'\n'}
          4. 记录问题以便后续跟踪
        </Text>
      </View>

      <Text className={styles.sectionTitle}>常见症状</Text>

      <View className={styles.list}>
        {symptoms.map(symptom => (
          <SymptomCard
            key={symptom.id}
            symptom={symptom}
            onClick={handleSymptomClick}
          />
        ))}
      </View>

      {recentRecords.length > 0 && (
        <View className={styles.recordSection}>
          <Text className={styles.sectionTitle}>📋 最近诊断记录</Text>
          {recentRecords.map(record => (
            <View key={record.id} className={styles.recordCard}>
              <View className={styles.recordInfo}>
                <Text className={styles.recordPlant}>{record.plantName}</Text>
                <Text className={styles.recordSymptom}>症状：{record.symptomName}</Text>
                <Text className={styles.recordDate}>诊断时间：{record.date}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {plants.length === 0 && (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🪴</Text>
          <Text className={styles.emptyText}>
            还没有添加植物哦{'\n'}
            先去添加植物，再来诊断问题吧~
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default DiagnosePage;
