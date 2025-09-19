'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Volume2 } from 'lucide-react';
import { Word } from '@/types';
import { speakWord } from '@/utils/speech';

interface ReviewCardProps {
  word: Word;
  className?: string;
}

export default function ReviewCard({ word, className = '' }: ReviewCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片翻转
    
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakWord(word.word);
    } catch (error) {
      console.error('发音失败:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // 调试信息
  console.log('ReviewCard render:', { 
    word: word?.word, 
    translation: word?.translation,
    isFlipped 
  });

  // 安全检查
  if (!word) {
    return (
      <div className="card p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-text-dark">单词数据加载中...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className={`w-full h-96 cursor-pointer ${className}`}
      onClick={handleFlip}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {!isFlipped ? (
        /* 正面 */
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 h-full">
          <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
            {/* 图片区域 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {word.imageUrl ? (
                <div className="w-32 h-32 rounded-standard overflow-hidden shadow-card bg-bg-cream p-3 relative">
                  <img 
                    src={word.imageUrl}
                    alt={word.word}
                    className="w-full h-full object-contain opacity-0 transition-opacity duration-500"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('❌ 图片加载失败:', word.imageUrl);
                      const loadingDiv = e.currentTarget.parentElement?.querySelector('.loading-indicator');
                      if (loadingDiv) loadingDiv.remove();
                      
                      // 显示默认图标
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-5xl">🎨</div>';
                      }
                    }}
                    onLoad={(e) => {
                      console.log('✅ 图片加载成功:', word.imageUrl);
                      e.currentTarget.style.opacity = '1';
                      const loadingDiv = e.currentTarget.parentElement?.querySelector('.loading-indicator');
                      if (loadingDiv) loadingDiv.remove();
                    }}
                  />
                  
                  {/* 加载指示器 */}
                  <div className="loading-indicator absolute inset-0 flex flex-col items-center justify-center bg-bg-cream/90">
                    <motion.div
                      className="w-8 h-8 border-2 border-primary-blue border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-xs text-text-dark/70 mt-2">AI生成中...</span>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 bg-bg-cream rounded-standard flex items-center justify-center text-6xl shadow-card">
                  📚
                </div>
              )}
            </motion.div>
            
            {/* 单词显示 */}
            <motion.div
              className="text-center space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-large-title font-inter text-text-dark">
                {word.word}
              </h2>
              
              {/* 发音按钮 */}
              <motion.button
                onClick={handleSpeak}
                disabled={isSpeaking}
                className={`flex items-center space-x-2 transition-colors duration-300 mx-auto ${
                  isSpeaking 
                    ? 'text-primary-blue cursor-not-allowed' 
                    : 'text-text-dark/70 hover:text-primary-blue'
                }`}
                whileHover={!isSpeaking ? { scale: 1.05 } : {}}
                whileTap={!isSpeaking ? { scale: 0.95 } : {}}
              >
                <motion.div
                  animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0 }}
                >
                  <Volume2 className="w-4 h-4" />
                </motion.div>
                <span className="text-small font-roboto">
                  {isSpeaking ? '发音中...' : '点击发音'}
                </span>
              </motion.button>
            </motion.div>
            
            {/* 翻转提示 */}
            <motion.div
              className="flex items-center space-x-2 text-text-dark/50 text-small font-roboto"
              animate={{ 
                y: [0, -3, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>点击查看翻译</span>
            </motion.div>
          </div>
        </div>
      ) : (
        /* 背面 */
        <div className="bg-gradient-to-br from-primary-pink to-accent-yellow rounded-2xl shadow-card h-full">
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-text-dark p-8">
            
            {/* 翻译显示 */}
            <motion.div
              className="text-center space-y-4 px-6"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-large-title font-inter">
                {word.translation}
              </h2>
              
              {/* 例句 - 暂时隐藏 */}
              {false && word.example && (
                <motion.div
                  className="bg-white/20 backdrop-blur-sm rounded-standard p-4 border border-white/30"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <p className="text-small font-roboto text-text-dark/80 mb-2">例句：</p>
                  <p className="text-body font-roboto italic leading-relaxed">
                    &ldquo;{word.example}&rdquo;
                  </p>
                </motion.div>
              )}
            </motion.div>
            
            {/* 返回提示 */}
            <motion.div
              className="flex items-center space-x-2 text-text-dark/60 text-small font-roboto"
              animate={{ 
                y: [0, -3, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>再次点击返回</span>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}