# 多客戶系統快速開始指南

## 🚀 快速開始

### 編譯 TailorMed 版本（預設）
```bash
node compile-multi-client.js
# 或
CLIENT_ID=tailormed node compile-multi-client.js
```

### 編譯客戶B版本
```bash
CLIENT_ID=client-b node compile-multi-client.js
```

### 編譯結果
- TailorMed: `dist/tailormed/index.html`
- 客戶B: `dist/client-b/index.html`

## 📝 建立新客戶的步驟

### 1. 建立客戶配置檔
```bash
# 複製範本
cp config/clients/tailormed.config.js config/clients/新客戶ID.config.js
```

### 2. 編輯配置檔
修改以下內容：
- `clientId`: 客戶ID（用於目錄名稱）
- `clientName`: 客戶顯示名稱
- `brand`: Logo、網站連結等
- `colors`: 品牌色彩
- `content`: 文字內容
- `features`: 功能開關

### 3. 準備客戶資源
將客戶的 logo 和圖片放入：
```
frontend/Assets/
  ├── 客戶logo.png
  ├── 客戶logo-mobile.png
  └── 客戶favicon.svg
```

### 4. 編譯
```bash
CLIENT_ID=新客戶ID node compile-multi-client.js
```

### 5. 查看結果
```bash
open dist/新客戶ID/index.html
```

## 🎨 配置範例對比

### TailorMed（客戶A）
- 主色：深藍色 `#143463`
- 副色：淺藍色 `#97d3df`
- 強調色：紅色 `#bb2749`
- 文字：英文

### 客戶B
- 主色：深綠色 `#2C5F2D`
- 副色：淺綠色 `#97BC62`
- 強調色：橘色 `#FF6B35`
- 文字：繁體中文

## 📂 目錄結構說明

```
trackingSystem/
├── config/
│   ├── config-loader.js          # 配置載入器
│   ├── clients/
│   │   ├── tailormed.config.js   # TailorMed 配置
│   │   └── client-b.config.js    # 客戶B 配置
│   └── README.md                  # 詳細說明文件
├── compile-multi-client.js       # 多客戶編譯腳本
├── compile.js                     # 原始編譯腳本（單一客戶）
└── dist/
    ├── tailormed/                 # TailorMed 編譯結果
    └── client-b/                  # 客戶B 編譯結果
```

## ⚙️ 進階使用

### 同時編譯多個客戶
建立一個腳本 `build-all.sh`：
```bash
#!/bin/bash
CLIENT_ID=tailormed node compile-multi-client.js
CLIENT_ID=client-b node compile-multi-client.js
```

### 在 package.json 中加入腳本
```json
{
  "scripts": {
    "build": "node compile-multi-client.js",
    "build:tailormed": "CLIENT_ID=tailormed node compile-multi-client.js",
    "build:client-b": "CLIENT_ID=client-b node compile-multi-client.js",
    "build:all": "npm run build:tailormed && npm run build:client-b"
  }
}
```

## 🔍 檢查配置是否正確

編譯時會顯示：
```
✅ 已載入客戶配置: TailorMed (tailormed)
🚚 開始編譯 TailorMed (tailormed)...
```

如果配置檔有問題，會自動使用預設配置（TailorMed）。

## 💡 提示

1. **保持配置檔簡潔**：只修改需要客製化的部分
2. **測試色彩對比**：確保文字在背景上清晰可讀
3. **Logo 尺寸**：建議使用 SVG 格式以獲得最佳效果
4. **功能開關**：可以關閉不需要的功能（如 dryIceTracking）

