import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sizeOf from 'image-size';

// 获取当前路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置参数
const targetDir = path.join(__dirname, 'png');
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

async function getImageDimensions() {
  try {
    // 验证目录存在性
    try {
      await fs.access(targetDir);
    } catch {
      throw new Error(`目录 ${targetDir} 不存在`);
    }

    // 读取目录内容
    const files = await fs.readdir(targetDir, { withFileTypes: true });

    // 处理结果容器
    const results = [];

    // 改用顺序处理以便调试
    for (const dirent of files) {
      // 跳过子目录和非图片文件
      if (!dirent.isFile()) continue;
      const ext = path.extname(dirent.name).toLowerCase();
      if (!allowedExtensions.has(ext)) continue;

      const filePath = path.join(targetDir, dirent.name);
      try {
        // 方式1：使用image-size库
        const dimensions = sizeOf(await fs.readFile(filePath));
        
        // 方式2：使用原生Buffer检测（基础版）
        // const buffer = await fs.readFile(filePath);
        // const dimensions = {
        //   width: buffer.readUInt32BE(16), // 适用于PNG
        //   height: buffer.readUInt32BE(20)
        // };

        if (!dimensions.height) throw new Error('无法解析图片尺寸');
        
        results.push({
          filename: dirent.name,
          height: dimensions.height,
          width: dimensions.width || '未知'
        });

        console.log(`√ 已处理: ${dirent.name}`);

      } catch (err) {
        console.error(`× 处理失败: ${dirent.name} - ${err.message}`);
      }
    }

    return results;

  } catch (error) {
    throw new Error(`系统错误: ${error.message}`);
  }
}

// 执行并输出
getImageDimensions()
  .then(data => {
    console.log('\n最终结果:');
    console.log(data);
  })
  .catch(err => console.error(err.message));