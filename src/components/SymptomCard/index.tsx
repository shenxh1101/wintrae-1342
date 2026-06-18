import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { Symptom } from '@/types/plant';
import styles from './index.module.scss';

interface SymptomCardProps {
  symptom: Symptom;
  onClick?: (symptom: Symptom) => void;
}

const SymptomCard: React.FC<SymptomCardProps> = ({ symptom, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(symptom);
    } else {
      Taro.navigateTo({
        url: `/pages/diagnose-detail/index?id=${symptom.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.icon}>
          <Text>{symptom.icon}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.name}>{symptom.name}</Text>
          <Text className={styles.description}>{symptom.description}</Text>
        </View>
      </View>
      <View className={styles.footer}>
        <Text className={styles.stepCount}>共 {symptom.steps.length} 步排查</Text>
        <Text className={styles.action}>查看诊断 →</Text>
      </View>
    </View>
  );
};

export default SymptomCard;
