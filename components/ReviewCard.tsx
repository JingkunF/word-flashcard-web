'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, RotateCcw } from 'lucide-react';
import { Word } from '../types';
import { speakWord } from '../utils/speech';

interface ReviewCardProps {
  word: Word;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  className?: string;
}

export default function ReviewCard({ word, showTranslation, onToggleTranslation, className = '' }: ReviewCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

  // 安全检查
  if (!word) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-gray-600">单词数据加载中...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className={`w-80 h-96 cursor-pointer ${className}`}
      onClick={handleFlip}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {!isFlipped ? (
        /* 正面 - 显示单词 */
        <div className="bg-white rounded-lg shadow-lg h-full flex flex-col items-center justify-center p-6 text-center relative">
          {/* 图片区域 */}
          {word.imageUrl && (
            <img 
              src={word.imageUrl} 
              alt={word.word} 
              className="max-h-40 max-w-full object-contain mb-4" 
            />
          )}
          
          {/* 单词显示 */}
          <h2 className="text-4xl font-bold text-gray-800 mb-2">{word.word}</h2>
          
          {/* 提示文字 */}
          <p className="text-sm text-gray-500 mb-4">点击查看翻译</p>
          
          {/* 发音按钮 */}
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className="absolute bottom-4 right-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* 背面 - 显示翻译 */
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg h-full flex flex-col items-center justify-center p-6 text-center relative">
          {/* 翻译显示 */}
          <h2 className="text-3xl font-bold text-white mb-4">{word.translation}</h2>
          
          {/* 提示文字 */}
          <p className="text-sm text-white/80 mb-4">点击返回单词</p>
          
          {/* 返回按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFlip();
            }}
            className="absolute bottom-4 right-4 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}