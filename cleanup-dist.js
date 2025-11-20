// 清理 dist 目錄的舊編譯產物
// 只保留客戶專屬目錄（client-b, tailormed 等）

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');

if (!fs.existsSync(DIST_DIR)) {
  console.log('dist 目錄不存在，無需清理');
  process.exit(0);
}

// 讀取所有客戶配置，取得應該保留的客戶ID
const clientsDir = path.join(__dirname, 'config', 'clients');
const keepDirs = [];

if (fs.existsSync(clientsDir)) {
  const clientFiles = fs.readdirSync(clientsDir)
    .filter(file => file.endsWith('.config.js'))
    .map(file => file.replace('.config.js', ''));
  
  keepDirs.push(...clientFiles);
  console.log(`📋 找到 ${clientFiles.length} 個客戶配置：${clientFiles.join(', ')}`);
}

// 要保留的目錄和檔案
const KEEP_ITEMS = [
  ...keepDirs,
  '.gitkeep', // 如果有保留檔案
];

// 要刪除的項目
const itemsToRemove = [];

fs.readdirSync(DIST_DIR).forEach(item => {
  const itemPath = path.join(DIST_DIR, item);
  const stats = fs.statSync(itemPath);
  
  // 如果不在保留清單中，標記為刪除
  if (!KEEP_ITEMS.includes(item)) {
    itemsToRemove.push({
      path: itemPath,
      name: item,
      isDirectory: stats.isDirectory(),
      size: stats.size
    });
  }
});

if (itemsToRemove.length === 0) {
  console.log('✅ dist 目錄已經乾淨，沒有需要移除的項目');
  process.exit(0);
}

console.log(`\n🗑️  準備移除 ${itemsToRemove.length} 個項目：`);
itemsToRemove.forEach(item => {
  const size = item.isDirectory ? '(目錄)' : `(${item.size} bytes)`;
  console.log(`   - ${item.name} ${size}`);
});

// 詢問是否確認（在非互動環境中直接執行）
console.log('\n⚠️  即將刪除上述項目...');

// 執行刪除
let removedCount = 0;
itemsToRemove.forEach(item => {
  try {
    if (item.isDirectory) {
      fs.rmSync(item.path, { recursive: true, force: true });
    } else {
      fs.unlinkSync(item.path);
    }
    removedCount++;
    console.log(`   ✅ 已移除 ${item.name}`);
  } catch (error) {
    console.error(`   ❌ 移除失敗 ${item.name}: ${error.message}`);
  }
});

console.log(`\n🎉 清理完成！已移除 ${removedCount}/${itemsToRemove.length} 個項目`);
console.log(`📁 保留的客戶目錄：${keepDirs.join(', ')}`);

