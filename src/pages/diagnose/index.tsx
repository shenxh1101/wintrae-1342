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

type HistoryFilterType = 'all' | string;

const DiagnosePage: React.FC = () => {
  const { plants, diagnosticRecords, addDiagnosticRecord, initStore } = usePlantStore();

  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilterType>('all');
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

  const selectedPlant = useMemo(() => {
    return plants.find(p => p.id === selectedPlantId);
  }, [plants, selectedPlantId]);

  const processedRecords = useMemo(() => {
    let filtered = [...diagnosticRecords];
    if (historyFilter !== 'all') {
      filtered = filtered.filter(r => r.plantId === historyFilter);
    }

    return filtered
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
      .map(record => {
        const plant = plants.find(p => p.id === record.plantId);
        const symptom = symptoms.find(s => s.id === record.symptomId);
        return {
          ...record,
          plantName: plant?.name || '未知植物',
          plantImage: plant?.image || '',
          symptomName: symptom?.name || '未知问题',
          symptomIcon: symptom?.icon || '❓',
          symptomColor: symptom ? getSymptomColor(symptom.id) : '#86909C'
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagnosticRecords, plants, historyFilter, refreshKey]);

  const recentRecords = processedRecords.slice(0, 5);

  function getSymptomColor(symptomId: string): string {
    const colorMap: Record<string, string> = {
      'yellow-leaf': '#FAAD14',
      'root-rot': '#722ED1',
      'pest': '#F5222D',
      'legginess': '#13C2C2'
    };
    return colorMap[symptomId] || '#86909C';
  }

  const handlePlantSelect = (plantId: string) => {
    setSelectedPlantId(plantId === selectedPlantId ? '' : plantId);
  };

  const handleSymptomClick = (symptom: Symptom) => {
    if (!selectedPlantId) {
      Taro.showToast({
        title: '请先选择植物',
        icon: 'none'
      });
      return;
    }

    Taro.navigateTo({
      url: `/pages/diagnose-detail/index?id=${symptom.id}&plantId=${selectedPlantId}`
    });
  };

  const handleRecordClick = (recordId: string) => {
    Taro.navigateTo({
      url: `/pages/diagnose-record/index?id=${recordId}`
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

      <View className={styles.historySection}>
        <View className={styles.historyHeader}>
          <Text className={styles.sectionTitle}>📋 诊断历史记录</Text>
          <Text className={styles.historyCount}>共 {processedRecords.length} 条</Text>
        </View>

        {processedRecords.length > 0 && (
          <ScrollView className={styles.historyFilterBar} scrollX>
            <View
              className={classnames(
                styles.historyFilterItem,
                historyFilter === 'all' && styles.historyFilterItemActive
              )}
              onClick={() => setHistoryFilter('all')}
            >
              全部 ({diagnosticRecords.length})
            </View>
            {plants.map(plant => {
              const count = diagnosticRecords.filter(r => r.plantId === plant.id).length;
              if (count === 0) return null;
              return (
                <View
                  key={plant.id}
                  className={classnames(
                    styles.historyFilterItem,
                    historyFilter === plant.id && styles.historyFilterItemActive
                  )}
                  onClick={() => setHistoryFilter(plant.id)}
                >
                  {plant.name} ({count})
                </View>
              );
            })}
          </ScrollView>
        )}

        {processedRecords.length === 0 ? (
          <View className={styles.emptyHistory}>
            <Text className={styles.emptyHistoryIcon}>📝</Text>
            <Text className={styles.emptyHistoryText}>
              {historyFilter === 'all'
                ? '还没有诊断记录\n选择症状开始记录吧~'
                : '该植物还没有诊断记录'
              }
            </Text>
          </View>
        ) : (
          <View className={styles.historyList}>
            {processedRecords.map(record => (
              <View
                key={record.id}
                className={styles.historyCard}
                onClick={() => handleRecordClick(record.id)}
              >
                <View className={styles.historyCardTop}>
                  <Image
                    className={styles.historyPlantImage}
                    src={record.plantImage}
                    mode="aspectFill"
                  />
                  <View className={styles.historyInfo}>
                    <View className={styles.historyPlantRow}>
                      <Text className={styles.historyPlantName}>{record.plantName}</Text>
                      <View
                        className={styles.historySymptomBadge}
                        style={{
                          backgroundColor: `${record.symptomColor}15`,
                          color: record.symptomColor
                        }}
                      >
                        <Text className={styles.historySymptomIcon}>{record.symptomIcon}</Text>
                        <Text>{record.symptomName}</Text>
                      </View>
                    </View>
                    <Text className={styles.historyDate}>📅 {record.date}</Text>
                    {record.notes && (
                      <Text className={styles.historyNotes}>💬 {record.notes}</Text>
                    )}
                  </View>
                  <Text style={{ color: '#86909C', fontSize: '28rpx', flexShrink: 0 }}>→</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

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
