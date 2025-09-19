'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2 } from 'lucide-react';
import { Word, Category } from '../../types';
import { getAllWords, deleteWord, searchWords, updateWord } from '../../utils/dataAdapter';
import { getCategories } from '../../utils/categoryStorage';
import { ThemeWordbankManager } from '../../utils/themeWordbankManager';
import SimpleCard from '../../components/SimpleCard';
import EditWordModal from '../../components/EditWordModal';
import Navigation from '../../components/Navigation';

export default function ManagePage() {
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWordbank, setSelectedWordbank] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [totalWords, setTotalWords] = useState(0);
  const [displayedWordsCount, setDisplayedWordsCount] = useState(0);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableWordbanks, setAvailableWordbanks] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [wordbankManager] = useState(() => ThemeWordbankManager.getInstance());

  useEffect(() => {
    loadWords();
    setAvailableCategories(getCategories());
    setAvailableWordbanks(wordbankManager.getAllWordbanks());
  }, []);

  // 根据选中的词库更新可用分类
  useEffect(() => {
    if (selectedWordbank === 'all') {
      // 选择"全部"时，显示所有分类
      setFilteredCategories(availableCategories);
    } else {
      // 选择特定词库时，只显示该词库的分类
      const wordbank = availableWordbanks.find(wb => wb.id === selectedWordbank);
      if (wordbank && wordbank.categories) {
        // 从词库的分类中筛选出实际存在的分类
        const wordbankCategories = wordbank.categories.map((catName: string) => {
          return availableCategories.find(cat => cat.name === catName);
        }).filter(Boolean) as Category[];
        
        setFilteredCategories(wordbankCategories);
        console.log('📁 词库分类筛选:', wordbank.name, '包含分类:', wordbankCategories.map(c => c.name));
      } else {
        setFilteredCategories([]);
      }
    }
    
    // 重置分类选择
    setSelectedCategory('all');
  }, [selectedWordbank, availableWordbanks, availableCategories]);

  // 强制刷新数据
  const handleRefresh = async () => {
    console.log('🔄 手动刷新词汇数据...');
    await loadWords();
    setAvailableCategories(getCategories());
  };

  const handleImageUpdate = (updatedWord: Word, newImageUrl: string) => {
    console.log(`🔄 更新UI中的"${updatedWord.word}"图片`);
    
    // 更新words数组中的单词
    setWords(prevWords => 
      prevWords.map(w => w.id === updatedWord.id ? updatedWord : w)
    );
    
    // 更新filteredWords数组中的单词
    setFilteredWords(prevFiltered => 
      prevFiltered.map(w => w.id === updatedWord.id ? updatedWord : w)
    );
  };

  useEffect(() => {
    // 实时搜索和筛选
    const performSearch = async () => {
      try {
        console.log('🔍 开始筛选:', { selectedWordbank, selectedCategory, searchQuery });
        
        // 先获取所有单词
        let allWords = await getAllWords();
        console.log('📊 数据库总单词数:', allWords.length);
        
        // 按词库筛选
        if (selectedWordbank !== 'all') {
          console.log('🎯 按词库筛选:', selectedWordbank);
          const wordbank = availableWordbanks.find(wb => wb.id === selectedWordbank);
          console.log('📚 找到词库:', wordbank?.name, '包含', wordbank?.words?.length, '个单词');
          
          if (wordbank && wordbank.words) {
            const wordbankWords = wordbank.words.map((wbWord: any) => wbWord.word.toLowerCase());
            console.log('📝 词库单词列表:', wordbankWords.slice(0, 5), '...');
            
            // 筛选数据库中的单词
            const dbWords = allWords.filter(word => {
              const isInWordbank = wordbankWords.includes(word.word.toLowerCase());
              if (isInWordbank) {
                console.log('✅ 数据库单词匹配:', word.word);
              }
              return isInWordbank;
            });
            
            // 找出词库中缺失的单词
            const missingWords = wordbankWords.filter((wbWord: string) => 
              !allWords.some(dbWord => dbWord.word.toLowerCase() === wbWord)
            );
            
            console.log('📊 数据库匹配单词:', dbWords.length, '个');
            console.log('⚠️ 词库中缺失的单词:', missingWords.length, '个');
            
            // 为缺失的单词创建占位符对象
            const missingWordObjects = missingWords.map((word: string) => {
              const wordbankWord = wordbank.words.find((wbWord: any) => 
                wbWord.word.toLowerCase() === word
              );
              return {
                id: `missing-${word}`,
                word: wordbankWord?.word || word,
                translation: wordbankWord?.translation || `翻译_${word}`,
                example: wordbankWord?.example || '',
                categories: wordbankWord?.category ? [wordbankWord.category] : ['uncategorized'],
                imageUrl: '',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                reviewCount: 0,
                isMissing: true
              } as Word & { isMissing: boolean };
            });
            
            // 合并数据库单词和缺失单词
            allWords = [...dbWords, ...missingWordObjects];
            console.log('📝 词库筛选后总数:', allWords.length);
          }
        }
        
        // 按分类筛选
        let filtered = allWords;
        if (selectedCategory !== 'all') {
          console.log('📁 按分类筛选:', selectedCategory);
          filtered = filtered.filter(word => 
            word.categories && word.categories.includes(selectedCategory)
          );
          console.log('📊 分类筛选后:', filtered.length, '个单词');
        }
        
        // 按关键词搜索
        if (searchQuery.trim()) {
          console.log('🔍 按关键词搜索:', searchQuery);
          const lowerQuery = searchQuery.toLowerCase();
          filtered = filtered.filter(word =>
            word.word.toLowerCase().includes(lowerQuery) ||
            word.translation.toLowerCase().includes(lowerQuery) ||
            (word.example && word.example.toLowerCase().includes(lowerQuery))
          );
          console.log('📊 搜索筛选后:', filtered.length, '个单词');
        }
        
        console.log('📊 最终筛选结果:', filtered.length, '个单词');
        setFilteredWords(filtered);
        setDisplayedWordsCount(filtered.length);
      } catch (error) {
        console.error('❌ 搜索失败:', error);
        setFilteredWords([]);
        setDisplayedWordsCount(0);
      }
    };
    
    performSearch();
  }, [searchQuery, selectedCategory, selectedWordbank, words, availableWordbanks]);

  const loadWords = async () => {
    try {
      const words = await getAllWords();
      setWords(words);
      setTotalWords(words.length);
    } catch (error) {
      console.error('❌ 加载单词失败:', error);
      setWords([]);
      setTotalWords(0);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleWordbankSelect = (wordbankId: string) => {
    console.log('🎯 选择词库:', wordbankId);
    setSelectedWordbank(wordbankId);
  };

  const handleDeleteWord = async (wordId: string) => {
    try {
      console.log(`🗑️ 用户请求删除单词 ID: ${wordId}`);
      await deleteWord(wordId);
      console.log(`✅ 删除成功，重新加载数据`);
      await loadWords(); // 重新加载数据
    } catch (error) {
      console.error('❌ 删除单词失败:', error);
      // 可以在这里添加用户友好的错误提示
      alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleEditWord = (word: Word) => {
    setEditingWord(word);
  };

  const handleSaveWord = async (updatedWord: Word) => {
    try {
      console.log(`✏️ 用户请求更新单词: ${updatedWord.word}`);
      await updateWord(updatedWord);
      console.log(`✅ 更新成功，关闭编辑模态框`);
      setEditingWord(null);
      await loadWords();
    } catch (error) {
      console.error('❌ 更新单词失败:', error);
      // 可以在这里添加用户友好的错误提示
      alert(`更新失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleCloseEdit = () => {
    setEditingWord(null);
  };

  const getCategoryName = (categoryId: string) => {
    const category = availableCategories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-20 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 标题和统计 - 设计规范 */}
        <div className="text-center section-spacing">
          <h1 className="text-large-title font-inter mb-4">词汇管理</h1>
          <div className="module-pink rounded-standard p-4 inline-block">
            <span className="text-body font-roboto font-medium text-text-dark">
              {selectedWordbank === 'all' && selectedCategory === 'all' && !searchQuery 
                ? `已有 ${totalWords} 个单词`
                : `显示 ${displayedWordsCount} 个单词`
              }
            </span>
            {(selectedWordbank !== 'all' || selectedCategory !== 'all' || searchQuery) && (
              <div className="text-xs text-text-gray mt-1">
                共 {totalWords} 个单词
              </div>
            )}
          </div>
        </div>

        {/* 词库筛选 - 设计规范 */}
        <div className="card p-6 module-spacing">
          <div className="flex justify-between items-center mb-4">
            <p className="text-small font-roboto font-medium text-text-dark">按词库筛选</p>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-primary-blue text-white rounded text-xs hover:bg-blue-600 transition-colors"
            >
              🔄 刷新数据
            </button>
          </div>
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => handleWordbankSelect('all')}
              className={`px-4 py-2 rounded-standard font-roboto font-medium text-small whitespace-nowrap transition-all duration-300 ${
                selectedWordbank === 'all'
                  ? 'bg-accent-yellow text-text-dark shadow-card transform -translate-y-1'
                  : 'bg-white border border-border-gray text-text-dark hover:bg-primary-blue hover:text-text-white'
              }`}
            >
              全部
            </button>
            {availableWordbanks.map((wordbank) => (
              <button
                key={wordbank.id}
                onClick={() => handleWordbankSelect(wordbank.id)}
                className={`px-4 py-2 rounded-standard font-roboto font-medium text-small whitespace-nowrap transition-all duration-300 ${
                  selectedWordbank === wordbank.id
                    ? 'bg-accent-yellow text-text-dark shadow-card transform -translate-y-1'
                    : 'bg-white border border-border-gray text-text-dark hover:bg-primary-blue hover:text-text-white'
                }`}
              >
                {wordbank.name}
              </button>
            ))}
          </div>
        </div>

        {/* 分类筛选 - 设计规范 - 只在选择特定词库时显示 */}
        {selectedWordbank !== 'all' && filteredCategories.length > 0 && (
          <div className="card p-6 module-spacing">
            <div className="flex justify-between items-center mb-4">
              <p className="text-small font-roboto font-medium text-text-dark">
                按分类筛选
                <span className="text-xs text-text-gray ml-2">
                  ({availableWordbanks.find(wb => wb.id === selectedWordbank)?.name})
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`px-4 py-2 rounded-standard font-roboto font-medium text-small whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-accent-yellow text-text-dark shadow-card transform -translate-y-1'
                    : 'bg-white border border-border-gray text-text-dark hover:bg-primary-blue hover:text-text-white'
                }`}
              >
                全部
              </button>
              {filteredCategories.map((category) => (
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
        )}

        {/* 搜索框 - 设计规范 */}
        <div className="card p-6 module-spacing">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-dark/50 text-lg">
              🔍
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索单词或中文意思..."
              className="w-full pl-12"
            />
          </div>
        </div>

        {/* 单词列表 - PETHOUSE风格 */}
        <AnimatePresence>
          {filteredWords.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredWords.map((word, index) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <SimpleCard
                    word={word}
                    categories={availableCategories}
                    showDeleteButton={true}
                    onDelete={() => handleDeleteWord(word.id)}
                    onEdit={() => handleEditWord(word)}
                    onImageUpdate={handleImageUpdate}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-32 h-32 bg-gradient-blue rounded-3xl flex items-center justify-center text-6xl mx-auto mb-6 shadow-card">
                {searchQuery ? '🔍' : '📚'}
              </div>
              <h3 className="text-2xl font-fredoka font-bold text-text-dark mb-4">
                {searchQuery ? '未找到相关单词' : '该分类暂无单词'}
              </h3>
              <p className="text-text-gray font-nunito text-lg">
                {searchQuery ? '试试其他关键词' : '可先添加一些单词哦！'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => window.location.href = '/'}
                  className="mt-6 px-8 py-4 bg-gradient-orange text-white rounded-2xl font-fredoka font-semibold hover:shadow-orange-hover hover:-translate-y-1 transition-all duration-200"
                >
                  现在添加
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Navigation />

      {/* 编辑模态框 */}
      {editingWord && (
        <EditWordModal
          word={editingWord}
          isOpen={true}
          onClose={handleCloseEdit}
          onSave={handleSaveWord}
        />
      )}
    </div>
  );
}