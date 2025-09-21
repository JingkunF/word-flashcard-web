'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import { Word } from '../../types';
import { getAllWords } from '../../utils/dataAdapter';
import ReviewCard from '../../components/ReviewCard';
import Navigation from '../../components/Navigation';

export default function ReviewPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [reviewedWords, setReviewedWords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const allWords = await getAllWords();
      const wordsWithImages = allWords.filter(word => word.imageUrl);
      setWords(wordsWithImages);
      setIsLoading(false);
    } catch (error) {
      console.error('加载单词失败:', error);
      setIsLoading(false);
    }
  };

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
    }
  };

  const handleToggleTranslation = () => {
    setShowTranslation(!showTranslation);
    if (!showTranslation && currentWord) {
      setReviewedWords(prev => new Set([...prev, currentWord.id]));
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowTranslation(false);
    setReviewedWords(new Set());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载单词中...</p>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">复习页面</h1>
            <p className="text-gray-600 mb-8">还没有可复习的单词，请先添加一些单词。</p>
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加单词
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="w-full bg-gray-200 h-2">
        <div 
          className="bg-blue-600 h-2 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">复习模式</h1>
          <p className="text-gray-600">
            {currentIndex + 1} / {words.length} 
            <span className="ml-4">已复习: {reviewedWords.size}</span>
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <AnimatePresence mode="wait">
            {currentWord && (
              <motion.div
                key={currentWord.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <ReviewCard 
                  word={currentWord}
                  showTranslation={showTranslation}
                  onToggleTranslation={handleToggleTranslation}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一个
          </button>

          <button
            onClick={handleToggleTranslation}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {showTranslation ? '隐藏翻译' : '显示翻译'}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === words.length - 1}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一个
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleRestart}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
}