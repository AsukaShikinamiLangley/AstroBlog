import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { glob } from 'glob';
import { convert } from 'html-to-text';

const DIST_DIR = 'dist';
const TEXT_OUTPUT_FILE = 'dist/fonts/all.txt';
const SOURCE_FONT_GLOB = 'src/assets/fonts/*.woff2';
const DIST_FONT_GLOB = 'dist/_astro/fonts/*.woff2';
const TEMP_OUTPUT_DIR = 'dist/fonts/.tmp';

function collectCharacters(text: string, textSet: Set<string>) {
  for (const char of text) {
    textSet.add(char);
  }
}

async function ensureBuildExists() {
  try {
    await fs.access(DIST_DIR);
  }
  catch {
    throw new Error('未找到 dist 目录，请先运行 astro build');
  }
}

async function getFileSize(file: string) {
  const stats = await fs.stat(file);
  return stats.size;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

async function runFontSubset(fontFile: string, textFile: string) {
  await fs.rm(TEMP_OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(TEMP_OUTPUT_DIR, { recursive: true });

  const generatedFont = path.join(TEMP_OUTPUT_DIR, path.basename(fontFile));
  await runPythonFontSubset(fontFile, generatedFont, textFile);

  return generatedFont;
}

async function runPythonFontSubset(inputFile: string, outputFile: string, textFile: string) {
  await ensureFontToolsInstalled();

  const args = [
    '-m',
    'fontTools.subset',
    inputFile,
    `--text-file=${textFile}`,
    `--output-file=${outputFile}`,
    '--flavor=woff2',
    '--layout-features=*',
    '--name-IDs=*',
    '--name-legacy',
    '--name-languages=*',
  ];

  await runCommand('python3', args);
}

async function ensureFontToolsInstalled() {
  try {
    await runCommand('python3', ['-c', 'import fontTools.subset, brotli'], { silent: true });
  }
  catch {
    throw new Error('缺少字体精简依赖，请先安装: python3 -m pip install fonttools brotli');
  }
}

async function runCommand(command: string, args: string[], options: { silent?: boolean } = {}) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.silent ? 'ignore' : 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} 执行失败，退出码: ${code}`));
    });
  });
}

async function optimizeFonts() {
  console.log('开始字体文件精简');

  await ensureBuildExists();

  const htmlFiles = await glob('dist/**/*.html');
  const textSet = new Set<string>();

  for (const file of htmlFiles) {
    console.log(`处理文件: ${file}`);
    const content = await fs.readFile(file, 'utf-8');
    const text = convert(content);
    collectCharacters(text, textSet);
  }

  const text = Array.from(textSet).join('');
  console.log(`收集到 ${textSet.size} 个独特字符`);
  await fs.mkdir(path.dirname(TEXT_OUTPUT_FILE), { recursive: true });
  await fs.writeFile(TEXT_OUTPUT_FILE, text);
  console.log(`已保存所有独特字符到 ${TEXT_OUTPUT_FILE}`);

  const sourceFontFiles = await glob(SOURCE_FONT_GLOB);
  const distFontFiles = await glob(DIST_FONT_GLOB);

  if (sourceFontFiles.length === 0) {
    throw new Error(`未找到源字体文件: ${SOURCE_FONT_GLOB}`);
  }

  if (distFontFiles.length === 0) {
    throw new Error(`未找到构建后的字体文件: ${DIST_FONT_GLOB}`);
  }

  if (sourceFontFiles.length !== 1 || distFontFiles.length !== 1) {
    throw new Error('当前脚本按单字体产物处理，请为多字体场景补充源字体与构建产物的映射关系');
  }

  const sourceFont = sourceFontFiles[0];
  const distFont = distFontFiles[0];
  const originalSize = await getFileSize(distFont);
  const generatedFont = await runFontSubset(sourceFont, TEXT_OUTPUT_FILE);

  await fs.copyFile(generatedFont, distFont);

  const optimizedSize = await getFileSize(distFont);
  const savedSize = originalSize - optimizedSize;
  const savedPercent = originalSize > 0 ? (savedSize / originalSize * 100).toFixed(1) : '0.0';

  console.log(`源字体: ${sourceFont}`);
  console.log(`构建产物: ${distFont}`);
  console.log(`体积: ${formatBytes(originalSize)} -> ${formatBytes(optimizedSize)}，减少 ${formatBytes(savedSize)} (${savedPercent}%)`);

  await fs.rm(TEMP_OUTPUT_DIR, { recursive: true, force: true });

  console.log('字体文件精简完成！');
}

optimizeFonts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
