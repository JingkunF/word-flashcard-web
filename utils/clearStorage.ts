// 清除本地存储的工具函数

export const clearAllStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // 完全清除localStorage
    localStorage.clear();
    
    // 清除sessionStorage
    sessionStorage.clear();
    
    console.log('✅ All storage completely cleared');
    
    // 清除缓存
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
          console.log(`Cache ${name} cleared`);
        });
      });
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// 重置应用数据
export const resetAppData = (): void => {
  clearAllStorage();
  // 刷新页面以重新初始化数据
  window.location.reload();
};