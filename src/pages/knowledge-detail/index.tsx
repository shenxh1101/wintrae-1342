import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { knowledgeCards, categoryList } from '@/data/mockKnowledge';
import styles from './index.module.scss';

const KnowledgeDetailPage: React.FC = () => {
  const router = useRouter();
  const cardId = router.params.id;

  const card = useMemo(() => {
    return knowledgeCards.find(c => c.id === cardId);
  }, [cardId]);

  const category = useMemo(() => {
    if (!card) return null;
    return categoryList.find(c => c.key === card.category);
  }, [card]);

  if (!card) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📚</Text>
          <Text className={styles.emptyText}>文章不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.cover}>
        <Image
          className={styles.coverImage}
          src={card.image}
          mode="aspectFill"
          onError={(e) => console.error('[KnowledgeDetail] 图片加载失败:', e.detail)}
        />
      </View>

      <View className={styles.header}>
        {category && (
          <Text
            className={styles.category}
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </Text>
        )}
        <Text className={styles.title}>{card.title}</Text>
        <Text className={styles.summary}>{card.summary}</Text>
      </View>

      <View className={styles.content}>
        <Text className={styles.contentText}>{card.content}</Text>
      </View>
    </ScrollView>
  );
};

export default KnowledgeDetailPage;
