// 核心数据类型定义

export interface Word {
  id: string;
  word: string;
  translation: string;
  categories: string[]; // 改为数组，支持多分类
  imageUrl?: string;
  example?: string;
  createdAt: number; // 改为数字时间戳，避免IndexedDB序列化问题
  updatedAt?: number; // 添加更新时间字段
  reviewCount: number;
  lastReviewTime?: number; // 添加最后复习时间字段
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
  createdAt?: number; // 改为数字时间戳
}

export interface ReviewSession {
  id: string;
  words: Word[];
  currentIndex: number;
  isFlipped: boolean;
  completedCount: number;
}

// 系统默认分类（不可删除）
export const SYSTEM_CATEGORIES: Category[] = [
  { id: 'all', name: '全部', color: 'gray', isDefault: true },
  { id: 'uncategorized', name: '未归类', color: 'slate', isDefault: true },
];

// 初始预设分类（可编辑）
export const INITIAL_CATEGORIES: Category[] = [
  ...SYSTEM_CATEGORIES,
];

// 预置100个启蒙阶段常用单词
export const PRESET_WORDS: Omit<Word, 'id' | 'createdAt' | 'reviewCount'>[] = [
  // 食物类
  { word: 'apple', translation: '苹果', categories: ['uncategorized'], example: 'I eat an apple.' },
  { word: 'banana', translation: '香蕉', categories: ['uncategorized'], example: 'The banana is yellow.' },
  { word: 'cake', translation: '蛋糕', categories: ['uncategorized'], example: 'I like chocolate cake.' },
  { word: 'milk', translation: '牛奶', categories: ['uncategorized'], example: 'I drink milk every day.' },
  { word: 'bread', translation: '面包', categories: ['uncategorized'], example: 'I have bread for breakfast.' },
  { word: 'egg', translation: '鸡蛋', categories: ['uncategorized'], example: 'I cook an egg.' },
  { word: 'fish', translation: '鱼', categories: ['uncategorized'], example: 'The fish swims in water.' },
  { word: 'rice', translation: '米饭', categories: ['uncategorized'], example: 'We eat rice for dinner.' },
  { word: 'water', translation: '水', categories: ['uncategorized'], example: 'Water is good for you.' },
  { word: 'juice', translation: '果汁', categories: ['uncategorized'], example: 'Orange juice is sweet.' },
  
  // 动物类
  { word: 'cat', translation: '猫', categories: ['uncategorized'], example: 'The cat is cute.' },
  { word: 'dog', translation: '狗', categories: ['uncategorized'], example: 'My dog is friendly.' },
  { word: 'bird', translation: '鸟', categories: ['uncategorized'], example: 'The bird can fly.' },
  { word: 'rabbit', translation: '兔子', categories: ['uncategorized'], example: 'The rabbit is white.' },
  { word: 'elephant', translation: '大象', categories: ['uncategorized'], example: 'The elephant is big.' },
  { word: 'lion', translation: '狮子', categories: ['uncategorized'], example: 'The lion is strong.' },
  { word: 'bear', translation: '熊', categories: ['uncategorized'], example: 'The bear likes honey.' },
  { word: 'tiger', translation: '老虎', categories: ['uncategorized'], example: 'The tiger has stripes.' },
  { word: 'monkey', translation: '猴子', categories: ['uncategorized'], example: 'The monkey climbs trees.' },
  { word: 'duck', translation: '鸭子', categories: ['uncategorized'], example: 'The duck swims in the pond.' },
  
  // 家人类
  { word: 'mom', translation: '妈妈', categories: ['uncategorized'], example: 'I love my mom.' },
  { word: 'dad', translation: '爸爸', categories: ['uncategorized'], example: 'Dad reads me stories.' },
  { word: 'baby', translation: '宝宝', categories: ['uncategorized'], example: 'The baby is sleeping.' },
  { word: 'sister', translation: '姐姐/妹妹', categories: ['uncategorized'], example: 'My sister is kind.' },
  { word: 'brother', translation: '哥哥/弟弟', categories: ['uncategorized'], example: 'I play with my brother.' },
  { word: 'grandma', translation: '奶奶', categories: ['uncategorized'], example: 'Grandma bakes cookies.' },
  { word: 'grandpa', translation: '爷爷', categories: ['uncategorized'], example: 'Grandpa tells stories.' },
  
  // 动作类
  { word: 'run', translation: '跑', categories: ['uncategorized'], example: 'I run fast.' },
  { word: 'jump', translation: '跳', categories: ['uncategorized'], example: 'I can jump high.' },
  { word: 'walk', translation: '走', categories: ['uncategorized'], example: 'We walk to school.' },
  { word: 'sit', translation: '坐', categories: ['uncategorized'], example: 'Please sit down.' },
  { word: 'stand', translation: '站', categories: ['uncategorized'], example: 'Stand up straight.' },
  { word: 'eat', translation: '吃', categories: ['uncategorized'], example: 'I eat an apple.' },
  { word: 'drink', translation: '喝', categories: ['uncategorized'], example: 'Drink some water.' },
  { word: 'sleep', translation: '睡觉', categories: ['uncategorized'], example: 'I sleep at night.' },
  { word: 'play', translation: '玩', categories: ['uncategorized'], example: 'Let\'s play together.' },
  { word: 'read', translation: '读', categories: ['uncategorized'], example: 'I read a book.' },
  
  // 学校类
  { word: 'school', translation: '学校', categories: ['uncategorized'], example: 'I go to school.' },
  { word: 'teacher', translation: '老师', categories: ['uncategorized'], example: 'My teacher is nice.' },
  { word: 'book', translation: '书', categories: ['uncategorized'], example: 'I have a book.' },
  { word: 'pen', translation: '笔', categories: ['uncategorized'], example: 'I write with a pen.' },
  { word: 'desk', translation: '桌子', categories: ['uncategorized'], example: 'The desk is clean.' },
  { word: 'chair', translation: '椅子', categories: ['uncategorized'], example: 'Sit on the chair.' },
  { word: 'bag', translation: '书包', categories: ['uncategorized'], example: 'My bag is heavy.' },
  { word: 'pencil', translation: '铅笔', categories: ['uncategorized'], example: 'Draw with a pencil.' },
  
  // 自然类
  { word: 'sun', translation: '太阳', categories: ['uncategorized'], example: 'The sun is bright.' },
  { word: 'moon', translation: '月亮', categories: ['uncategorized'], example: 'The moon shines at night.' },
  { word: 'star', translation: '星星', categories: ['uncategorized'], example: 'Stars twinkle in the sky.' },
  { word: 'tree', translation: '树', categories: ['uncategorized'], example: 'The tree is tall.' },
  { word: 'flower', translation: '花', categories: ['uncategorized'], example: 'The flower smells good.' },
  { word: 'grass', translation: '草', categories: ['uncategorized'], example: 'Green grass grows.' },
  { word: 'sky', translation: '天空', categories: ['uncategorized'], example: 'The sky is blue.' },
  { word: 'cloud', translation: '云', categories: ['uncategorized'], example: 'White clouds float.' },
  { word: 'rain', translation: '雨', categories: ['uncategorized'], example: 'Rain makes plants grow.' },
  { word: 'snow', translation: '雪', categories: ['uncategorized'], example: 'Snow is white and cold.' },
  
  // 更多食物类
  { word: 'orange', translation: '橙子', categories: ['uncategorized'], example: 'The orange is sweet.' },
  { word: 'grape', translation: '葡萄', categories: ['uncategorized'], example: 'Grapes are purple.' },
  { word: 'cookie', translation: '饼干', categories: ['uncategorized'], example: 'I like cookies.' },
  { word: 'candy', translation: '糖果', categories: ['uncategorized'], example: 'Candy is sweet.' },
  { word: 'ice cream', translation: '冰淇淋', categories: ['uncategorized'], example: 'Ice cream is cold.' },
  
  // 更多动物类
  { word: 'horse', translation: '马', categories: ['uncategorized'], example: 'The horse runs fast.' },
  { word: 'cow', translation: '牛', categories: ['uncategorized'], example: 'The cow gives milk.' },
  { word: 'pig', translation: '猪', categories: ['uncategorized'], example: 'The pig is pink.' },
  { word: 'sheep', translation: '羊', categories: ['uncategorized'], example: 'Sheep have wool.' },
  { word: 'chicken', translation: '鸡', categories: ['uncategorized'], example: 'The chicken lays eggs.' },
  
  // 更多动作类
  { word: 'sing', translation: '唱歌', categories: ['uncategorized'], example: 'I sing a song.' },
  { word: 'dance', translation: '跳舞', categories: ['uncategorized'], example: 'Let\'s dance together.' },
  { word: 'draw', translation: '画画', categories: ['uncategorized'], example: 'I draw a picture.' },
  { word: 'write', translation: '写字', categories: ['uncategorized'], example: 'I write my name.' },
  { word: 'listen', translation: '听', categories: ['uncategorized'], example: 'Listen to music.' },
  
  // 更多学校类
  { word: 'student', translation: '学生', categories: ['uncategorized'], example: 'I am a student.' },
  { word: 'classroom', translation: '教室', categories: ['uncategorized'], example: 'We study in the classroom.' },
  { word: 'homework', translation: '作业', categories: ['uncategorized'], example: 'I do my homework.' },
  { word: 'lesson', translation: '课程', categories: ['uncategorized'], example: 'The lesson is fun.' },
  { word: 'friend', translation: '朋友', categories: ['uncategorized'], example: 'You are my friend.' },
  
  // 颜色和形容词
  { word: 'red', translation: '红色', categories: ['uncategorized'], example: 'The apple is red.' },
  { word: 'blue', translation: '蓝色', categories: ['uncategorized'], example: 'The sky is blue.' },
  { word: 'green', translation: '绿色', categories: ['uncategorized'], example: 'Grass is green.' },
  { word: 'yellow', translation: '黄色', categories: ['uncategorized'], example: 'The sun is yellow.' },
  { word: 'white', translation: '白色', categories: ['uncategorized'], example: 'Snow is white.' },
  { word: 'black', translation: '黑色', categories: ['uncategorized'], example: 'The night is black.' },
  
  // 形容词
  { word: 'big', translation: '大的', categories: ['uncategorized'], example: 'The elephant is big.' },
  { word: 'small', translation: '小的', categories: ['uncategorized'], example: 'The mouse is small.' },
  { word: 'hot', translation: '热的', categories: ['uncategorized'], example: 'The sun is hot.' },
  { word: 'cold', translation: '冷的', categories: ['uncategorized'], example: 'Ice is cold.' },
  { word: 'fast', translation: '快的', categories: ['uncategorized'], example: 'The car is fast.' },
  { word: 'slow', translation: '慢的', categories: ['uncategorized'], example: 'The turtle is slow.' },
  
  // 情感词汇
  { word: 'happy', translation: '开心的', categories: ['uncategorized'], example: 'I am happy.' },
  { word: 'sad', translation: '伤心的', categories: ['uncategorized'], example: 'Don\'t be sad.' },
  { word: 'angry', translation: '生气的', categories: ['uncategorized'], example: 'Don\'t be angry.' },
  { word: 'tired', translation: '累的', categories: ['uncategorized'], example: 'I am tired.' },
  
  // 基础词汇
  { word: 'good', translation: '好的', categories: ['uncategorized'], example: 'You are a good kid.' },
  { word: 'bad', translation: '坏的', categories: ['uncategorized'], example: 'Don\'t be bad.' },
  { word: 'nice', translation: '很好的', categories: ['uncategorized'], example: 'Have a nice day.' },
  { word: 'new', translation: '新的', categories: ['uncategorized'], example: 'I have a new toy.' },
  { word: 'old', translation: '旧的', categories: ['uncategorized'], example: 'This is an old book.' },
  
  // 数字
  { word: 'one', translation: '一', categories: ['uncategorized'], example: 'I have one apple.' },
  { word: 'two', translation: '二', categories: ['uncategorized'], example: 'Two cats play.' },
  { word: 'three', translation: '三', categories: ['uncategorized'], example: 'I see three birds.' },
  { word: 'four', translation: '四', categories: ['uncategorized'], example: 'Four wheels on a car.' },
  { word: 'five', translation: '五', categories: ['uncategorized'], example: 'Five fingers on my hand.' },
  
  // 身体部位
  { word: 'head', translation: '头', categories: ['uncategorized'], example: 'I have a head.' },
  { word: 'hand', translation: '手', categories: ['uncategorized'], example: 'Wash your hands.' },
  { word: 'foot', translation: '脚', categories: ['uncategorized'], example: 'I have two feet.' },
  { word: 'eye', translation: '眼睛', categories: ['uncategorized'], example: 'I see with my eyes.' },
  { word: 'ear', translation: '耳朵', categories: ['uncategorized'], example: 'I hear with my ears.' },
  
  // 更多日常用品
  { word: 'toy', translation: '玩具', categories: ['uncategorized'], example: 'I play with toys.' },
  { word: 'ball', translation: '球', categories: ['uncategorized'], example: 'Throw the ball.' },
  { word: 'doll', translation: '娃娃', categories: ['uncategorized'], example: 'The doll is pretty.' },
  { word: 'game', translation: '游戏', categories: ['uncategorized'], example: 'Let\'s play a game.' },
  { word: 'music', translation: '音乐', categories: ['uncategorized'], example: 'I love music.' },
];