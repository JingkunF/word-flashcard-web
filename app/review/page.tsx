'use client';

import { useState, useEffect } from 'react';
import { Word } from '../types';
import { getAllWords } from '../utils/dataAdapter';

export default function ReviewPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
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
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowTranslation(false);
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
        <nav className="bg-blue-600 p-4 text-white flex justify-around">
          <a href="/" className="hover:text-yellow-300">添加单词</a>
          <a href="/manage" className="hover:text-yellow-300">词汇管理</a>
          <a href="/review" className="hover:text-yellow-300">复习闪卡</a>
        </nav>
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
      <nav className="bg-blue-600 p-4 text-white flex justify-around">
        <a href="/" className="hover:text-yellow-300">添加单词</a>
        <a href="/manage" className="hover:text-yellow-300">词汇管理</a>
        <a href="/review" className="hover:text-yellow-300">复习闪卡</a>
      </nav>
      
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
          </p>
        </div>

        <div className="flex justify-center mb-8">
          {currentWord && (
            <div className="bg-white rounded-lg shadow-lg w-80 h-96 flex flex-col items-center justify-center p-6 text-center">
              {currentWord.imageUrl && (
                <img src={currentWord.imageUrl} alt={currentWord.word} className="max-h-40 max-w-full object-contain mb-4" />
              )}
              <h2 className="text-4xl font-bold text-gray-800 mb-2">{currentWord.word}</h2>
              {showTranslation && (
                <p className="text-2xl text-gray-600">{currentWord.translation}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← 上一个
          </button>

          <button
            onClick={handleToggleTranslation}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showTranslation ? '隐藏翻译' : '显示翻译'}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === words.length - 1}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一个 →
          </button>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleRestart}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
          >
            🔄 重新开始
          </button>
        </div>
      </div>
    </div>
  );
}