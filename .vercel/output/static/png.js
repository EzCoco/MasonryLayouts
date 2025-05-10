import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置参数
const targetDir = path.join(__dirname, 'png'); // 要读取的目录
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

async function getImageFiles() {
  try {
    // 读取目录内容
    const files = await fs.readdir(targetDir, { withFileTypes: true });
    
    // 过滤并提取文件名
    const imageNames = files
      .filter(dirent => 
        dirent.isFile() && 
        allowedExtensions.has(path.extname(dirent.name).toLowerCase())
      )
      .map(file => file.name)
      .sort(); // 按字母顺序排序

    return imageNames;
  } catch (error) {
    throw new Error(`读取目录失败: ${error.message}`);
  }
}

// 执行并输出结果
getImageFiles()
  .then(files => console.log(files))
  .catch(err => console.error('错误:', err.message));