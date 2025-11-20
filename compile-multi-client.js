const fs = require('fs');
const path = require('path');
const pug = require('pug');
const stylus = require('stylus');
const { config, clientId } = require('./config/config-loader');

const ROOT_DIR = __dirname;
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const TEMPLATE_DIR = path.join(FRONTEND_DIR, 'Templates');
const STYLE_DIR = path.join(FRONTEND_DIR, 'Styles');
const ASSETS_DIR = path.join(FRONTEND_DIR, 'Assets');
const JS_SOURCE_DIR = path.join(FRONTEND_DIR, 'Javascript');
// 編譯到專案根目錄的 dist，根據客戶ID建立子目錄
const DIST_DIR = path.join(ROOT_DIR, 'dist', clientId);
const JS_DIST_DIR = path.join(DIST_DIR, 'js');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  ensureDir(destDir);
  fs.readdirSync(srcDir).forEach((item) => {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    const stats = fs.statSync(srcPath);

    if (stats.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

// 根據配置生成 variables.styl
function generateVariablesStyl(config) {
  const colors = config.colors;
  return `// ${config.clientName} 色彩系統（自動生成）

prColor = ${colors.primary}
scColor = ${colors.secondary}
neutral-light = ${colors.neutralLight}
neutral-dark = ${colors.neutralDark}
neutral-gray = ${colors.neutralGray}
base-white = ${colors.baseWhite}
acColor = ${colors.accent}

primary-color = prColor
secondary-color = scColor
accent-color = acColor

shadow = 0 5px 10px rgba(12,48,88,0.15)
panel-shadow = 0 5px 10px rgba(12,48,88,0.4)

container-max-width = 1280px
container-padding-x = 50px

layout-container()
  max-width container-max-width
  width 100%
  margin 0 auto
  padding 0 container-padding-x
  box-sizing border-box

breakpoints = {
  desktop: 1280px,
  laptop: 1024px,
  tablet: 768px,
  mobile: 480px
}

respond(size)
  breakpoint = breakpoints[size]
  if breakpoint
    @media (max-width: breakpoint)
      {block}
  else
    @media (max-width: size)
      {block}
`;
}

console.log(`🚚 開始編譯 ${config.clientName} (${clientId})...`);

// 0. 生成動態 variables.styl 並替換原始檔案
const variablesContent = generateVariablesStyl(config);
const variablesStylPath = path.join(STYLE_DIR, 'variables.styl');
const variablesBackupPath = path.join(STYLE_DIR, 'variables.styl.backup');

// 備份原始 variables.styl（如果存在且尚未備份）
if (fs.existsSync(variablesStylPath) && !fs.existsSync(variablesBackupPath)) {
  fs.copyFileSync(variablesStylPath, variablesBackupPath);
}

// 寫入新的 variables.styl
fs.writeFileSync(variablesStylPath, variablesContent);
console.log(`  ✅ 已生成客戶專屬樣式變數`);

// 1. 編譯 Pug -> HTML（傳入配置）
function compilePugRecursive(dir, outputBaseDir, basePath = '') {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      compilePugRecursive(filePath, outputBaseDir, path.join(basePath, file));
    } else if (file.endsWith('.pug')) {
      try {
        const html = pug.renderFile(filePath, {
          pretty: true,
          basedir: TEMPLATE_DIR,
          // 將配置傳遞給模板
          config: config,
          clientId: clientId
        });

        const relativePath = path.relative(TEMPLATE_DIR, filePath);
        const outputPath = path.join(
          outputBaseDir,
          relativePath.replace(/\.pug$/, '.html')
        );
        ensureDir(path.dirname(outputPath));

        fs.writeFileSync(outputPath, html);
        console.log(`  ✅ 已生成 ${path.relative(DIST_DIR, outputPath)}`);
      } catch (error) {
        console.error(`  ⚠️ 編譯失敗 ${filePath}:`, error.message);
      }
    }
  });
}

if (fs.existsSync(TEMPLATE_DIR)) {
  try {
    console.log('📝 編譯 Pug 模板...');
    compilePugRecursive(TEMPLATE_DIR, DIST_DIR);
  } catch (error) {
    console.error('❌ Pug 編譯失敗:', error.message);
    process.exit(1);
  }
} else {
  console.warn('⚠️ 未找到 Templates 目錄');
}

// 2. 編譯 Stylus -> CSS（使用生成的 variables）
function compileStylusRecursive(dir, outputBaseDir) {
  const files = fs.readdirSync(dir);
  const promises = [];

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      compileStylusRecursive(filePath, outputBaseDir);
    } else if (file.endsWith('.styl')) {
      try {
        let stylusCode = fs.readFileSync(filePath, 'utf8');
        
        // variables.styl 已經被替換，直接讀取即可
        
        const relativePath = path.relative(STYLE_DIR, filePath);
        const outputPath = path.join(
          outputBaseDir,
          'css',
          relativePath.replace(/\.styl$/, '.css')
        );
        ensureDir(path.dirname(outputPath));

        stylus(stylusCode)
          .set('filename', filePath)
          .set('paths', [STYLE_DIR])
          .render((err, css) => {
            if (err) {
              console.error(`  ⚠️ 編譯失敗 ${filePath}:`, err.message);
            } else {
              fs.writeFileSync(outputPath, css);
              console.log(`  ✅ 已生成 ${path.relative(DIST_DIR, outputPath)}`);
            }
          });
      } catch (error) {
        console.error(`  ⚠️ 編譯失敗 ${filePath}:`, error.message);
      }
    }
  });
}

if (fs.existsSync(STYLE_DIR)) {
  try {
    console.log('🎨 編譯 Stylus 樣式...');
    compileStylusRecursive(STYLE_DIR, DIST_DIR);
  } catch (error) {
    console.error('❌ Stylus 編譯失敗:', error.message);
    process.exit(1);
  }
} else {
  console.warn('⚠️ 未找到 Styles 目錄');
}

// 恢復原始 variables.styl（如果存在備份）
if (fs.existsSync(variablesBackupPath)) {
  fs.copyFileSync(variablesBackupPath, variablesStylPath);
  fs.unlinkSync(variablesBackupPath);
  console.log(`  ✅ 已恢復原始 variables.styl`);
}

// 3. 複製 JavaScript 檔案
console.log('📜 複製 JavaScript 檔案...');
if (fs.existsSync(JS_SOURCE_DIR)) {
  copyDir(JS_SOURCE_DIR, JS_DIST_DIR);
  console.log('  ✅ 已複製 JavaScript 檔案到 js/');
  
  // 生成客戶專屬的 config.js
  const configJsPath = path.join(JS_DIST_DIR, 'config.js');
  const configJsContent = `// API 配置
// 自動檢測環境：如果是 localhost 使用本地 API，否則使用 Netlify Functions API
// Netlify Functions 會自動處理 /api/* 路徑，轉發到 /.netlify/functions/tracking
const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

const API_BASE_URL = isLocal
  ? 'http://localhost:8888/.netlify/functions' // 或本地 Netlify dev URL
  : '/.netlify/functions';

// 客戶配置（由 compile-multi-client.js 自動生成）
window.CONFIG = {
  API_BASE_URL,
  content: ${JSON.stringify(config.content, null, 2)}
};
`;
  fs.writeFileSync(configJsPath, configJsContent);
  console.log('  ✅ 已生成客戶專屬 config.js');
} else {
  console.warn(`  ⚠️ 未找到 Javascript 目錄: ${JS_SOURCE_DIR}`);
}

// 4. 複製靜態資源
console.log('📦 複製靜態資源...');
const ASSETS_DIST_DIR = path.join(DIST_DIR, 'images');

// 先複製通用的 Assets
if (fs.existsSync(ASSETS_DIR)) {
  copyDir(ASSETS_DIR, ASSETS_DIST_DIR);
  console.log('  ✅ 已複製通用 Assets 到 images/');
} else {
  console.warn('  ⚠️ 未找到 Assets 目錄');
}

// 然後複製客戶專屬的 Assets（如果存在），會覆蓋通用的檔案
const CLIENT_ASSETS_DIR = path.join(ASSETS_DIR, 'clients', clientId);
if (fs.existsSync(CLIENT_ASSETS_DIR)) {
  copyDir(CLIENT_ASSETS_DIR, ASSETS_DIST_DIR);
  console.log(`  ✅ 已複製客戶專屬 Assets (${clientId}) 到 images/`);
} else {
  console.log(`  ℹ️  未找到客戶專屬 Assets 目錄: ${CLIENT_ASSETS_DIR}`);
}

console.log('✅ 靜態資源已就緒');
console.log(`🎉 編譯完成！可以在 dist/${clientId}/index.html 預覽 ${config.clientName} 專案`);

