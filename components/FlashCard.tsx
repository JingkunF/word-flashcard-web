'use client';

import { useState } from 'react';
import { Word } from '../types';
import Image from 'next/image';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface FlashCardProps {
  word: Word;
  onClick?: () => void;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  className?: string;
}

export default function FlashCard({ 
  word, 
  onClick, 
  showDeleteButton = false, 
  onDelete,
  className = '' 
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
    onClick?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      const confirmed = window.confirm(`确定要删除【${word.word}】及对应的闪卡吗？`);
      if (confirmed) {
        onDelete();
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'food': 'bg-orange-100 text-orange-600',
      'animals': 'bg-green-100 text-green-600',
      'family': 'bg-blue-100 text-blue-600',
      'actions': 'bg-purple-100 text-purple-600',
      'school': 'bg-pink-100 text-pink-600',
      'nature': 'bg-teal-100 text-teal-600',
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  return (
    <motion.div
      className={`flip-card w-full cursor-pointer ${isFlipped ? 'flipped' : ''} ${className}`}
      onClick={handleCardClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flip-card-inner relative h-48">
        {/* 正面 */}
        <div className="flip-card-front bg-white border-2 border-blue-300 shadow-md rounded-xl">

          {/* 删除按钮 */}
          {showDeleteButton && (
            <button
              onClick={handleDeleteClick}
              className="absolute top-3 left-3 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors z-10"
              aria-label="删除单词"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* 图片显示 */}
          <div className="flex-1 flex items-center justify-center pt-4 pb-2">
            {word.imageUrl ? (
              word.imageUrl.startsWith('data:image/svg+xml') ? (
                <div className="w-12 h-12">
                  <img 
                    src={word.imageUrl}
                    alt={word.word}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="relative w-20 h-20">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                  <Image
                    src={word.imageUrl}
                    alt={word.word}
                    fill
                    className="object-contain"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                  />
                </div>
              )
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* 单词 */}
          <div className="text-center pb-3 px-2">
            <h2 className="text-sm font-bold text-gray-800 leading-tight">{word.word}</h2>
          </div>
        </div>

        {/* 背面 */}
        <div className="flip-card-back bg-gradient-to-br from-primary-pink to-white border-2 border-accent-pink/20">
          {/* 分类标签 */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(word.categories[0] || 'uncategorized')}`}>
              {word.categories[0] === 'food' && '食物'}
              {word.categories[0] === 'animals' && '动物'}
              {word.categories[0] === 'family' && '家人'}
              {word.categories[0] === 'actions' && '动作'}
              {word.categories[0] === 'school' && '学校'}
              {word.categories[0] === 'nature' && '自然'}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            {/* 翻译 */}
            <h2 className="text-xl font-bold text-red-500">{word.translation}</h2>
            
            {/* 例句 - 暂时隐藏 */}
            {false && word.example && (
              <div className="px-4 max-h-16 overflow-hidden">
                <p className="text-sm text-gray-600 text-center italic leading-tight line-clamp-3">
                  &ldquo;{word.example}&rdquo;
                </p>
              </div>
            )}

            {/* 复习次数 */}
            <div className="text-xs text-gray-500">
              已复习 {word.reviewCount} 次
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}