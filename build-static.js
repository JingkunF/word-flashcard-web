// 简化的构建脚本
const fs = require('fs');
const path = require('path');

// 复制静态文件到out目录
function copyStaticFiles() {
  const publicDir = './public';
  const outDir = './out';
  
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  // 复制public目录内容
  if (fs.existsSync(publicDir)) {
    copyDir(publicDir, outDir);
  }
  
  console.log('静态文件复制完成');
}

function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyStaticFiles();
