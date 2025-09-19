// 真实例句生成工具
export interface ExampleSentence {
  sentence: string;
  translation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * 为单词生成真实的例句
 */
export function getWordExample(word: string): string {
  const lowerWord = word.toLowerCase();
  
  // 具体单词的例句库
  const exampleDatabase: { [key: string]: string[] } = {
    // 食物类
    'apple': [
      'I eat a red apple for breakfast.',
      'The apple tastes sweet and juicy.',
      'She picked an apple from the tree.'
    ],
    'banana': [
      'The banana is yellow and soft.',
      'I like banana in my cereal.',
      'Monkeys love to eat bananas.'
    ],
    'cake': [
      'We had chocolate cake for my birthday.',
      'The cake smells delicious.',
      'Mom is baking a cake in the kitchen.'
    ],
    'milk': [
      'I drink milk with my cookies.',
      'The milk is cold and fresh.',
      'Cows give us milk every day.'
    ],
    'bread': [
      'I make a sandwich with fresh bread.',
      'The bread is warm from the oven.',
      'We buy bread from the bakery.'
    ],
    'egg': [
      'I eat a boiled egg for breakfast.',
      'The hen laid a white egg.',
      'Mom is cooking eggs for dinner.'
    ],
    'fish': [
      'The fish swims in the clear water.',
      'We caught a big fish today.',
      'I like to eat fish and chips.'
    ],
    'water': [
      'I drink water when I am thirsty.',
      'The water in the lake is blue.',
      'Plants need water to grow.'
    ],
    'juice': [
      'Orange juice is my favorite drink.',
      'The juice is sweet and cold.',
      'I drink apple juice every morning.'
    ],
    
    // 动物类
    'cat': [
      'The cat is sleeping on the sofa.',
      'My cat likes to play with yarn.',
      'The black cat has green eyes.'
    ],
    'dog': [
      'My dog loves to play fetch.',
      'The dog is barking at the mailman.',
      'We take our dog for a walk every day.'
    ],
    'bird': [
      'The bird is singing in the tree.',
      'I saw a colorful bird in the garden.',
      'Birds can fly high in the sky.'
    ],
    'rabbit': [
      'The rabbit hops around the yard.',
      'The white rabbit has long ears.',
      'Rabbits like to eat carrots.'
    ],
    'elephant': [
      'The elephant is very big and gray.',
      'Elephants have long trunks.',
      'We saw elephants at the zoo.'
    ],
    'lion': [
      'The lion is the king of the jungle.',
      'Lions have golden fur and big teeth.',
      'The lion roars very loudly.'
    ],
    
    // 家庭类
    'mom': [
      'Mom reads me a story before bed.',
      'My mom makes the best cookies.',
      'Mom gives me a hug when I am sad.'
    ],
    'dad': [
      'Dad plays soccer with me in the yard.',
      'My dad drives me to school.',
      'Dad tells funny jokes at dinner.'
    ],
    'baby': [
      'The baby is sleeping in the crib.',
      'My baby sister likes to laugh.',
      'Babies need lots of love and care.'
    ],
    'sister': [
      'My sister and I play together.',
      'Sister helps me with my homework.',
      'I love my little sister very much.'
    ],
    'brother': [
      'My brother is taller than me.',
      'Brother and I share the same room.',
      'I play video games with my brother.'
    ],
    
    // 学校类
    'school': [
      'I go to school every weekday.',
      'My school has a big playground.',
      'I learn many things at school.'
    ],
    'teacher': [
      'My teacher is very kind and helpful.',
      'The teacher writes on the blackboard.',
      'Our teacher reads us interesting stories.'
    ],
    'book': [
      'I love reading books about animals.',
      'The book has colorful pictures.',
      'I borrow books from the library.'
    ],
    'pen': [
      'I write with a blue pen.',
      'The pen is on my desk.',
      'My pen ran out of ink.'
    ],
    'pencil': [
      'I draw pictures with my pencil.',
      'The pencil needs to be sharpened.',
      'I write my name with a pencil.'
    ],
    
    // 自然类
    'sun': [
      'The sun is bright and warm.',
      'The sun rises in the morning.',
      'We play outside when the sun is shining.'
    ],
    'moon': [
      'The moon is bright in the night sky.',
      'I can see the moon from my window.',
      'The moon looks like a big circle.'
    ],
    'star': [
      'Stars twinkle in the dark sky.',
      'I wish upon a shooting star.',
      'There are many stars in the universe.'
    ],
    'tree': [
      'The tree has green leaves.',
      'Birds build nests in the tree.',
      'I like to climb the old oak tree.'
    ],
    'flower': [
      'The flower smells very sweet.',
      'I picked a flower for my mom.',
      'Bees collect nectar from flowers.'
    ],
    
    // 颜色类
    'red': [
      'The apple is red and shiny.',
      'I love my red bicycle.',
      'Red is my favorite color.'
    ],
    'blue': [
      'The sky is blue and clear.',
      'I wear my blue shirt to school.',
      'The ocean looks blue and deep.'
    ],
    'green': [
      'The grass is green in spring.',
      'Frogs are usually green.',
      'I have a green backpack.'
    ],
    'yellow': [
      'The sun is bright yellow.',
      'Bananas are yellow when ripe.',
      'I painted the wall yellow.'
    ],
    
    // 动作类
    'run': [
      'I run fast in the playground.',
      'The dog likes to run in the park.',
      'We run together every morning.'
    ],
    'jump': [
      'I can jump very high.',
      'The rabbit can jump over the fence.',
      'We jump rope at recess.'
    ],
    'walk': [
      'I walk to school with my friends.',
      'We walk slowly in the museum.',
      'The baby is learning to walk.'
    ],
    'eat': [
      'I eat breakfast every morning.',
      'Lions eat meat in the wild.',
      'We eat dinner together as a family.'
    ],
    'sleep': [
      'I sleep in my cozy bed.',
      'Cats sleep for many hours.',
      'I need to sleep early tonight.'
    ],
    'play': [
      'I play with my toys after school.',
      'Children play in the playground.',
      'We play games on rainy days.'
    ],
    
    // 情感类
    'happy': [
      'I feel happy when I see my friends.',
      'The happy children are laughing.',
      'Birthdays make me very happy.'
    ],
    'sad': [
      'I feel sad when my pet is sick.',
      'The sad movie made me cry.',
      'She looks sad because she lost her toy.'
    ],
    'angry': [
      'I get angry when someone is mean.',
      'The angry cat hissed at the dog.',
      'Try not to stay angry for too long.'
    ],
    'excited': [
      'I am excited about the school trip.',
      'The excited children are jumping.',
      'Christmas makes me feel excited.'
    ]
  };
  
  // 如果有预定义例句，随机选择一个
  if (exampleDatabase[lowerWord]) {
    const examples = exampleDatabase[lowerWord];
    const randomIndex = Math.floor(Math.random() * examples.length);
    return examples[randomIndex];
  }
  
  // 如果没有预定义例句，根据词汇特征生成
  return generateExampleByPattern(word);
}

/**
 * 根据词汇模式生成例句
 */
function generateExampleByPattern(word: string): string {
  const lowerWord = word.toLowerCase();
  
  // 为常见单词生成更自然的例句
  const customExamples: { [key: string]: string } = {
    'cheese': 'I love to eat cheese with crackers.',
    'ambulance': 'The ambulance rushed to the hospital.',
    'address': 'Please write your address on the form.',
    'computer': 'I use my computer for work and study.',
    'telephone': 'Can you answer the telephone, please?',
    'television': 'We watch television in the evening.',
    'kitchen': 'Mom is cooking dinner in the kitchen.',
    'bedroom': 'I sleep in my bedroom at night.',
    'bathroom': 'I brush my teeth in the bathroom.',
    'garden': 'We have beautiful flowers in our garden.',
    'library': 'I borrow books from the library.',
    'hospital': 'The doctor works at the hospital.',
    'school': 'Children go to school every day.',
    'restaurant': 'We had dinner at a nice restaurant.',
    'supermarket': 'Mom buys groceries at the supermarket.',
    'airport': 'We flew from the airport to Paris.',
    'station': 'The train arrives at the station.',
    'museum': 'We visited the art museum yesterday.',
    'theater': 'We watched a play at the theater.',
    'stadium': 'The football game is at the stadium.'
  };
  
  // 如果有自定义例句，使用它
  if (customExamples[lowerWord]) {
    return customExamples[lowerWord];
  }
  
  // 检查词汇类型并生成相应例句
  if (isNoun(lowerWord)) {
    return `I can see a ${lowerWord} over there.`;
  } else if (isVerb(lowerWord)) {
    return `I like to ${lowerWord} every day.`;
  } else if (isAdjective(lowerWord)) {
    return `This looks very ${lowerWord} to me.`;
  } else {
    return `The word "${lowerWord}" is interesting to learn.`;
  }
}

/**
 * 简单的词性判断
 */
function isNoun(word: string): boolean {
  const nounSuffixes = ['tion', 'sion', 'ness', 'ment', 'er', 'or', 'ist', 'ism'];
  return nounSuffixes.some(suffix => word.endsWith(suffix));
}

function isVerb(word: string): boolean {
  const verbSuffixes = ['ing', 'ed', 'ize', 'ise', 'fy'];
  const verbPrefixes = ['re', 'un', 'pre'];
  return verbSuffixes.some(suffix => word.endsWith(suffix)) ||
         verbPrefixes.some(prefix => word.startsWith(prefix));
}

function isAdjective(word: string): boolean {
  const adjSuffixes = ['ful', 'less', 'ous', 'ive', 'al', 'ic', 'able', 'ible'];
  return adjSuffixes.some(suffix => word.endsWith(suffix));
}

/**
 * 为单词生成中文翻译
 */
export function getWordTranslation(word: string): string {
  const lowerWord = word.toLowerCase();
  
  // 翻译数据库
  const translationDatabase: { [key: string]: string } = {
    // 食物类
    'apple': '苹果',
    'banana': '香蕉',
    'cake': '蛋糕',
    'milk': '牛奶',
    'bread': '面包',
    'egg': '鸡蛋',
    'fish': '鱼',
    'rice': '米饭',
    'water': '水',
    'juice': '果汁',
    'cookie': '饼干',
    'candy': '糖果',
    'ice cream': '冰淇淋',
    'chocolate': '巧克力',
    'grape': '葡萄',
    
    // 动物类
    'cat': '猫',
    'dog': '狗',
    'bird': '鸟',
    'rabbit': '兔子',
    'elephant': '大象',
    'lion': '狮子',
    'tiger': '老虎',
    'bear': '熊',
    'monkey': '猴子',
    'duck': '鸭子',
    'horse': '马',
    'cow': '牛',
    'pig': '猪',
    'sheep': '羊',
    'chicken': '鸡',
    'goose': '鹅',
    
    // 家庭类
    'mom': '妈妈',
    'dad': '爸爸',
    'baby': '婴儿',
    'sister': '姐妹',
    'brother': '兄弟',
    'grandma': '奶奶',
    'grandpa': '爷爷',
    'family': '家庭',
    
    // 学校类
    'school': '学校',
    'teacher': '老师',
    'book': '书',
    'pen': '钢笔',
    'pencil': '铅笔',
    'bag': '书包',
    'desk': '桌子',
    'chair': '椅子',
    'student': '学生',
    'classroom': '教室',
    
    // 自然类
    'sun': '太阳',
    'moon': '月亮',
    'star': '星星',
    'tree': '树',
    'flower': '花',
    'grass': '草',
    'sky': '天空',
    'cloud': '云',
    'rain': '雨',
    'snow': '雪',
    
    // 颜色类
    'red': '红色',
    'blue': '蓝色',
    'green': '绿色',
    'yellow': '黄色',
    'white': '白色',
    'black': '黑色',
    'pink': '粉色',
    'purple': '紫色',
    'brown': '棕色',
    
    // 动作类
    'run': '跑',
    'jump': '跳',
    'walk': '走',
    'sit': '坐',
    'eat': '吃',
    'drink': '喝',
    'sleep': '睡觉',
    'play': '玩',
    'read': '读',
    'write': '写',
    'sing': '唱',
    'dance': '跳舞',
    'draw': '画',
    'listen': '听',
    
    // 情感类
    'happy': '快乐的',
    'sad': '伤心的',
    'angry': '生气的',
    'excited': '兴奋的',
    'tired': '累的',
    'scared': '害怕的',
    'brave': '勇敢的',
    'shy': '害羞的',
    'proud': '自豪的',
    'surprised': '惊讶的',
    
    // 数字类
    'one': '一',
    'two': '二',
    'three': '三',
    'four': '四',
    'five': '五',
    'six': '六',
    'seven': '七',
    'eight': '八',
    'nine': '九',
    'ten': '十',
    
    // 身体部位
    'head': '头',
    'eye': '眼睛',
    'nose': '鼻子',
    'mouth': '嘴',
    'ear': '耳朵',
    'hand': '手',
    'foot': '脚',
    'arm': '胳膊',
    'leg': '腿',
    
    // 物品类
    'car': '汽车',
    'bike': '自行车',
    'ball': '球',
    'toy': '玩具',
    'house': '房子',
    'door': '门',
    'window': '窗户',
    'table': '桌子',
    'phone': '电话',
    'computer': '电脑',
    'guitar': '吉他',
    'piano': '钢琴',
    'violin': '小提琴',
    'tank': '坦克'
  };
  
  // 如果有预定义翻译，返回它
  if (translationDatabase[lowerWord]) {
    return translationDatabase[lowerWord];
  }
  
  // 如果没有预定义翻译，返回基础格式
  return `${word}的中文翻译`;
}
