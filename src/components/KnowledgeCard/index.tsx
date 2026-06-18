import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { KnowledgeCard } from '@/types/plant';
import { categoryList } from '@/data/mockKnowledge';
import styles from './index.module.scss';

interface KnowledgeCardProps {
  card: KnowledgeCard;
}

const KnowledgeCardComponent: React.FC<KnowledgeCardProps> = ({ card }) => {
  const category = categoryList.find(c => c.key === card.category);
  
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/knowledge-detail/index?id=${card.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image
        className={styles.image}
        src={card.image}
        mode="aspectFill"
        lazyLoad
        onError={(e) => console.error('[KnowledgeCard] 图片加载失败:', e.detail)}
      />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text 
            className={styles.category} 
            style={{ backgroundColor: category?.color || '#52C41A' }}
          >
            {category?.name || '知识'}
          </Text>
          <Text className={styles.title}>{card.title}</Text>
        </View>
        <Text className={styles.summary}>{card.summary}</Text>
      </View>
    </View>
  );
};

export default KnowledgeCardComponent;
