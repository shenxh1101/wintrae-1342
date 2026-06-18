import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import KnowledgeCardComponent from '@/components/KnowledgeCard';
import { knowledgeCards, categoryList } from '@/data/mockKnowledge';
import type { KnowledgeCategory } from '@/types/plant';
import styles from './index.module.scss';

const KnowledgePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  useDidShow(() => {
    // 刷新数据
  });

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const filteredCards = useMemo(() => {
    let result = knowledgeCards;
    
    if (activeCategory !== 'all') {
      result = result.filter(card => card.category === activeCategory);
    }
    
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(card => 
        card.title.toLowerCase().includes(keyword) || 
        card.summary.toLowerCase().includes(keyword) ||
        card.content.toLowerCase().includes(keyword)
      );
    }
    
    return result;
  }, [activeCategory, searchText]);

  const getCategoryColor = (category: KnowledgeCategory | 'all') => {
    if (category === 'all') return '#2DB84D';
    const cat = categoryList.find(c => c.key === category);
    return cat?.color || '#2DB84D';
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>📚 知识卡片</Text>
        <Text className={styles.subtitle}>学习养花知识，成为植物达人</Text>
      </View>

      <View className={styles.categoryTabs}>
        <View
          className={classnames(
            styles.categoryTab,
            activeCategory === 'all' && styles.categoryTabActive
          )}
          style={{
            backgroundColor: activeCategory === 'all' ? getCategoryColor('all') : 'transparent'
          }}
          onClick={() => setActiveCategory('all')}
        >
          全部
        </View>
        {categoryList.map(category => (
          <View
            key={category.key}
            className={classnames(
              styles.categoryTab,
              activeCategory === category.key && styles.categoryTabActive
            )}
            style={{
              backgroundColor: activeCategory === category.key ? category.color : 'transparent'
            }}
            onClick={() => setActiveCategory(category.key)}
          >
            {category.name}
          </View>
        ))}
      </View>

      <View className={styles.searchBar}>
        <Text>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索养护知识..."
          placeholderClass={styles.searchPlaceholder}
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
          confirmType="search"
        />
      </View>

      {filteredCards.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🔍</Text>
          <Text className={styles.emptyText}>
            没有找到相关知识{'\n'}
            换个关键词试试吧~
          </Text>
        </View>
      ) : (
        <View className={styles.list}>
          {filteredCards.map(card => (
            <KnowledgeCardComponent key={card.id} card={card} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default KnowledgePage;
