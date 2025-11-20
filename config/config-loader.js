// 配置載入器
// 根據環境變數 CLIENT_ID 載入對應的客戶配置

const path = require('path');
const fs = require('fs');

// 預設客戶（如果沒有指定）
const DEFAULT_CLIENT = 'tailormed';

// 取得客戶ID（從環境變數或命令列參數）
function getClientId() {
  // 優先使用環境變數
  if (process.env.CLIENT_ID) {
    return process.env.CLIENT_ID;
  }
  
  // 其次使用命令列參數
  const args = process.argv.slice(2);
  const clientIndex = args.indexOf('--client');
  if (clientIndex !== -1 && args[clientIndex + 1]) {
    return args[clientIndex + 1];
  }
  
  // 預設使用 TailorMed
  return DEFAULT_CLIENT;
}

// 載入客戶配置
function loadClientConfig(clientId) {
  const configPath = path.join(__dirname, 'clients', `${clientId}.config.js`);
  
  if (!fs.existsSync(configPath)) {
    console.warn(`⚠️  客戶配置檔不存在: ${configPath}`);
    console.warn(`   使用預設配置: ${DEFAULT_CLIENT}`);
    return loadClientConfig(DEFAULT_CLIENT);
  }
  
  try {
    const config = require(configPath);
    console.log(`✅ 已載入客戶配置: ${config.clientName} (${config.clientId})`);
    return config;
  } catch (error) {
    console.error(`❌ 載入客戶配置失敗: ${error.message}`);
    console.warn(`   使用預設配置: ${DEFAULT_CLIENT}`);
    return loadClientConfig(DEFAULT_CLIENT);
  }
}

// 匯出配置
const clientId = getClientId();
const config = loadClientConfig(clientId);

module.exports = {
  config,
  clientId,
  getClientId,
  loadClientConfig
};

