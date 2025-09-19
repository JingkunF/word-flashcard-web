'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Trophy } from 'lucide-react';
import { Word, Category } from '@/types';
import { searchWords, updateWord, getAllWords } from '@/utils/dataAdapter';
import { getCategories } from '@/utils/categoryStorage';
import ReviewCard from '@/components/ReviewCard';
import Navigation from '@/components/Navigation';

export default function ReviewPage() {
  const [reviewWords, setReviewWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRandomOrder, setIsRandomOrder] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadReviewWords();
    setAvailableCategories(getCategories());
  }, [selectedCategory, isRandomOrder]);

  const loadReviewWords = async () => {
    try {
      let words = await searchWords('', selectedCategory);
      
      if (isRandomOrder) {
        words = shuffleArray([...words]);
      }
      
      setReviewWords(words);
      setCurrentIndex(0);
      setShowCompletion(false);
      setReviewedCount(0);
    } catch (error) {
      console.error('❌ 加载复习单词失败:', error);
      setReviewWords([]);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = async () => {
    try {
      const currentWord = reviewWords[currentIndex];
      
      // 更新当前单词的复习次数
      const updatedWord = {
        ...currentWord,
        reviewCount: (currentWord.reviewCount || 0) + 1,
        lastReviewTime: Date.now()
      };
      
      await updateWord(updatedWord);
      setReviewedCount(prev => prev + 1);
      
      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // 完成所有复习
        setShowCompletion(true);
      }
    } catch (error) {
      console.error('❌ 更新复习记录失败:', error);
      // 即使更新失败，也继续进行复习
      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setShowCompletion(true);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowCompletion(false);
    setReviewedCount(0);
  };

  const currentWord = reviewWords[currentIndex];

  // 调试信息
  console.log('Review Debug:', {
    reviewWords: reviewWords.length,
    currentIndex,
    currentWord: currentWord?.word,
    selectedCategory
  });

  return (
    <div className="min-h-screen bg-bg-cream pb-20 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* 标题 - 设计规范 */}
        <div className="text-center section-spacing">
          <h1 className="text-large-title font-inter mb-4">复习闪卡</h1>
          <p className="text-body font-roboto text-text-dark">翻转卡片学习单词</p>
        </div>

        {/* 分类筛选 - 设计规范 */}
        <div className="card p-6 module-spacing">
          <p className="text-small font-roboto font-medium text-text-dark mb-4">选择复习范围</p>
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
            {availableCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-4 py-2 rounded-standard font-roboto font-medium text-small whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-accent-yellow text-text-dark shadow-card transform -translate-y-1'
                    : 'bg-white border border-border-gray text-text-dark hover:bg-primary-blue hover:text-text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 随机复习开关 - PETHOUSE风格 */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-fredoka font-bold text-text-dark text-lg">🎲 随机顺序</h3>
              <p className="text-sm font-nunito text-text-gray mt-1">打乱单词顺序复习</p>
            </div>
            <button
              onClick={() => setIsRandomOrder(!isRandomOrder)}
              className={`relative w-14 h-8 rounded-2xl transition-all duration-200 ${
                isRandomOrder 
                  ? 'bg-gradient-to-r from-primary-blue to-accent-yellow shadow-card' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-xl transition-all duration-200 shadow-card flex items-center justify-center ${
                  isRandomOrder ? 'translate-x-7' : 'translate-x-1'
                }`}
              >
                <span className={`text-xs transition-colors duration-200 ${
                  isRandomOrder ? 'text-primary-blue' : 'text-gray-400'
                }`}>
                  {isRandomOrder ? '🎲' : '📋'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 复习内容 */}
        <AnimatePresence mode="wait">
          {showCompletion ? (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <div className="w-32 h-32 bg-gradient-yellow rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-yellow animate-bounce-gentle">
                <Trophy className="w-16 h-16 text-text-dark" />
              </div>
              <h2 className="text-3xl font-fredoka font-bold text-text-dark mb-4">恭喜完成！</h2>
              <p className="text-text-gray font-nunito text-lg mb-8">
                您已经复习了 <span className="font-bold text-primary-orange">{reviewedCount}</span> 个单词
              </p>
              <button
                onClick={handleRestart}
                className="bg-gradient-orange text-white px-8 py-4 rounded-2xl font-fredoka font-bold text-lg hover:shadow-orange-hover hover:-translate-y-1 transition-all duration-200"
              >
                再来一轮
              </button>
            </motion.div>
          ) : reviewWords.length > 0 && currentWord ? (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 进度显示 - 设计规范 */}
              <div className="card p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center">
                    <div className="text-small-title font-inter font-bold text-text-dark">
                      {currentIndex + 1}/{reviewWords.length}
                    </div>
                    <div className="text-tiny font-roboto text-text-dark/60 mt-1">
                      当前进度
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-small-title font-inter font-bold text-primary-blue">
                      {Math.round(((currentIndex + 1) / reviewWords.length) * 100)}%
                    </div>
                    <div className="text-tiny font-roboto text-text-dark/60 mt-1">
                      完成度
                    </div>
                  </div>
                </div>
                <div className="w-full bg-border-gray rounded-standard h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-primary-blue to-accent-yellow h-full rounded-standard"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / reviewWords.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* 当前闪卡 - 优化布局 */}
              <div className="mb-8 min-h-[400px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentWord.id}
                    initial={{ opacity: 0, x: 100, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-full max-w-sm mx-auto"
                  >
                    <ReviewCard word={currentWord} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 控制按钮 - 设计规范 */}
              <div className="flex justify-between items-center gap-4">
                <motion.button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className={`flex items-center px-6 py-3 rounded-standard font-roboto font-medium text-small transition-all duration-300 min-w-[100px] justify-center ${
                    currentIndex === 0
                      ? 'bg-border-gray text-text-dark/30 cursor-not-allowed'
                      : 'btn-secondary hover:scale-105'
                  }`}
                  whileHover={currentIndex === 0 ? {} : { scale: 1.05 }}
                  whileTap={currentIndex === 0 ? {} : { scale: 0.95 }}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  上一个
                </motion.button>

                <motion.div 
                  className="text-center flex-1 px-4"
                  animate={{ 
                    y: [0, -2, 0],
                    opacity: [0.7, 1, 0.7] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <div className="text-accent-yellow text-2xl mb-1">👆</div>
                  <div className="text-tiny font-roboto text-text-dark/60">点击卡片翻转</div>
                </motion.div>

                <motion.button
                  onClick={handleNext}
                  className={`flex items-center px-6 py-3 rounded-standard font-roboto font-medium text-small transition-all duration-300 min-w-[100px] justify-center ${
                    currentIndex === reviewWords.length - 1
                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-card'
                      : 'btn-primary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentIndex === reviewWords.length - 1 ? '完成' : '下一个'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="w-32 h-32 bg-primary-pink rounded-3xl flex items-center justify-center text-6xl mx-auto mb-6 shadow-card">
                📚
              </div>
              <h3 className="text-small-title font-inter font-bold text-text-dark mb-4">
                该分类暂无单词
              </h3>
              <p className="text-body font-roboto text-text-dark/70 mb-6">
                请先添加一些单词来开始复习吧！
              </p>
              <motion.button
                onClick={() => window.location.href = '/'}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                现在添加
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Navigation />
    </div>
  );
}