import fs from 'fs/promises';
import path from 'path';
import Fontmin from 'fontmin';
import { glob } from 'glob';
// import { JSDOM } from 'jsdom';
import { convert } from 'html-to-text';

async function optimizeFonts() {
  console.log('开始字体文件精简');

  // 1. 收集所有构建后的 HTML 文件
  const htmlFiles = await glob('dist/**/*.html');
  const textSet = new Set<string>();

  // 2. 提取所有文本内容
  for (const file of htmlFiles) {
    console.log(`处理文件: ${file}`);
    const content = await fs.readFile(file, 'utf-8');
    const text = convert(content);
    text.split('').forEach(char => textSet.add(char));
  }

  // 3. 转换为字符串
  const text = Array.from(textSet).join('');
  console.log(`收集到 ${textSet.size} 个独特字符`);
  await fs.writeFile('dist/fonts/all.txt', text);
  console.log('已保存所有独特字符到 dist/fonts/all.txt');

  // 4. 使用 Fontmin 处理字体文件
  const fontFiles = await glob('public/fonts/*.{ttf,otf}');

  for (const fontFile of fontFiles) {
    const fileName = path.basename(fontFile);
    console.log(`处理字体文件: ${fileName}`);

    const fontmin = new Fontmin()
      .src(fontFile)
      .use(Fontmin.otf2ttf())
      .use(Fontmin.glyph({ text }))
      .dest('dist/fonts/min');

    await new Promise((resolve, reject) => {
      fontmin.run((err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });

    console.log(`字体文件 ${fileName} 优化完成`);
  }

  console.log('字体文件精简完成！');
}

optimizeFonts().catch(console.error);
