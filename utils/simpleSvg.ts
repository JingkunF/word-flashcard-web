// 改进的SVG生成器 - 根据单词生成不同图标
export function generateSimpleSVG(word: string): string {
  // 根据单词获取对应的emoji
  const getEmojiForWord = (word: string): string => {
    const emojiMap: Record<string, string> = {
      // 食物类
      'apple': '🍎', 'banana': '🍌', 'orange': '🍊', 'cake': '🍰', 'bread': '🍞',
      'milk': '🥛', 'water': '💧', 'rice': '🍚', 'egg': '🥚', 'fish': '🐟',
      'cookie': '🍪', 'pizza': '🍕', 'burger': '🍔', 'cheese': '🧀', 'honey': '🍯',
      'tea': '🍵', 'coffee': '☕', 'juice': '🧃', 'soup': '🍲', 'pasta': '🍝',
      'broccoli': '🥦', 'strawberry': '🍓', 'cherry': '🍒', 'grape': '🍇', 'lemon': '🍋',
      'chocolate': '🍫', 'ice cream': '🍦', 'donut': '🍩', 'chips': '🍟', 'bacon': '🥓',
      'aubergine': '🍆', 'baguette': '🥖', 'bagel': '🥯', 'burrito': '🌯', 'chestnut': '🌰',
      'coconut': '🥥', 'cherries': '🍒', 'chili pepper': '🌶️', 'birthday cake': '🎂',
      
      // 动物类  
      'cat': '🐱', 'dog': '🐶', 'bird': '🐦', 'rabbit': '🐰', 'elephant': '🐘',
      'lion': '🦁', 'bear': '🐻', 'tiger': '🐯', 'monkey': '🐵', 'horse': '🐴',
      'cow': '🐄', 'pig': '🐷', 'sheep': '🐑', 'duck': '🦆', 'chicken': '🐔',
      'mouse': '🐭', 'frog': '🐸', 'snake': '🐍', 'turtle': '🐢',
      
      // 身体部位
      'head': '👤', 'hand': '✋', 'foot': '🦶', 'eye': '👁️', 'ear': '👂',
      
      // 家庭
      'mom': '👩', 'dad': '👨', 'baby': '👶', 'boy': '👦', 'girl': '👧',
      'family': '👨‍👩‍👧‍👦', 'grandma': '👵', 'grandpa': '👴',
      
      // 学校用品
      'book': '📚', 'pen': '🖊️', 'pencil': '✏️', 'school': '🏫', 'bag': '🎒',
      'desk': '🪑', 'toy': '🧸', 'ball': '⚽', 'doll': '🪆', 'game': '🎲',
      'music': '🎵', 'five': '5️⃣', 'four': '4️⃣', 'three': '3️⃣', 'two': '2️⃣', 'one': '1️⃣',
      
      // 自然
      'sun': '☀️', 'moon': '🌙', 'star': '⭐', 'tree': '🌳', 'flower': '🌸',
      'grass': '🌱', 'cloud': '☁️', 'rain': '🌧️', 'snow': '❄️', 'fire': '🔥',
      
      // 动作
      'run': '🏃', 'walk': '🚶', 'jump': '🦘', 'dance': '💃', 'sing': '🎤',
      'read': '📖', 'write': '✍️', 'play': '🎮', 'sleep': '😴', 'eat': '🍽️',
      'happy': '😊', 'sad': '😢', 'good': '👍', 'bad': '👎', 'big': '📏', 'small': '🔍'
    };
    
    return emojiMap[word.toLowerCase()] || '📚';
  };

  // 根据单词获取主题色
  const getThemeForWord = (word: string): { bg: string; stroke: string } => {
    const themes = [
      { bg: '#FFF3E0', stroke: '#FF9800' }, // 橙色 - 食物
      { bg: '#E8F5E8', stroke: '#4CAF50' }, // 绿色 - 动物/自然
      { bg: '#E3F2FD', stroke: '#2196F3' }, // 蓝色 - 学校/家庭
      { bg: '#F3E5F5', stroke: '#9C27B0' }, // 紫色 - 动作
      { bg: '#FFEBEE', stroke: '#F44336' }, // 红色 - 其他
    ];
    
    const index = word.length % themes.length;
    return themes[index];
  };

  const emoji = getEmojiForWord(word);
  const theme = getThemeForWord(word);
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <text x="32" y="38" text-anchor="middle" font-size="32" dominant-baseline="middle">${emoji}</text>
  </svg>`;
}
