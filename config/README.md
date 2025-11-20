# 多客戶配置系統使用指南

## 概述

這個系統支援多客戶配置，讓不同的客戶可以使用不同的品牌樣式、色彩、文字內容等。

## 目錄結構

```
config/
├── config-loader.js          # 配置載入器
└── clients/                   # 客戶配置檔
    ├── tailormed.config.js   # TailorMed 配置
    └── client-b.config.js    # 客戶B 配置範例
```

## 使用方式

### 1. 編譯特定客戶版本

**使用環境變數：**
```bash
CLIENT_ID=tailormed node compile-multi-client.js
CLIENT_ID=client-b node compile-multi-client.js
```

**使用命令列參數：**
```bash
node compile-multi-client.js --client tailormed
node compile-multi-client.js --client client-b
```

**預設（不指定時使用 TailorMed）：**
```bash
node compile-multi-client.js
```

### 2. 建立新客戶配置

1. 在 `config/clients/` 目錄下建立新的配置檔，例如 `client-c.config.js`
2. 複製現有配置檔作為範本
3. 修改配置內容（品牌、色彩、文字等）
4. 使用 `CLIENT_ID=client-c node compile-multi-client.js` 編譯

### 3. 配置檔結構

每個客戶配置檔應包含以下區塊：

```javascript
module.exports = {
  clientId: '客戶ID',
  clientName: '客戶名稱',
  
  brand: {
    name: '品牌名稱',
    logo: './images/logo.png',
    logoMobile: './images/logo-mobile.png',
    favicon: './images/favicon.svg',
    website: 'https://www.example.com',
    backHomeText: '返回首頁'
  },
  
  colors: {
    primary: '#顏色代碼',
    secondary: '#顏色代碼',
    accent: '#顏色代碼',
    // ... 其他顏色
  },
  
  content: {
    heroTitle: '標題文字',
    heroSubtitle: '副標題文字',
    pageTitle: '頁面標題',
    fieldLabels: {
      orderNo: '訂單編號標籤',
      trackingNo: '追蹤號碼標籤'
    }
  },
  
  timeline: {
    international: { nodes: 7, statusCodes: [...] },
    domestic: { nodes: 4, statusCodes: [...] }
  },
  
  features: {
    dryIceTracking: true,
    feedbackSection: true,
    adBanner: true
  },
  
  fonts: {
    primary: '字體名稱'
  }
};
```

## 輸出結構

編譯後的檔案會根據客戶ID輸出到不同目錄：

```
dist/
├── tailormed/          # TailorMed 版本
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── images/
└── client-b/           # 客戶B 版本
    ├── index.html
    ├── css/
    ├── js/
    └── images/
```

## 在模板中使用配置

在 Pug 模板中，配置會自動注入為 `config` 變數：

```pug
// 使用品牌名稱
h1.hero-title= config.content.heroTitle

// 使用 Logo
img.logo(src=config.brand.logo, alt=config.brand.name)

// 使用色彩（在 Stylus 中自動生成）
// 無需手動修改，會根據配置自動生成 variables.styl
```

## 注意事項

1. **Logo 和圖片**：確保客戶的 logo 和圖片放在 `frontend/Assets/` 目錄中
2. **色彩格式**：使用十六進位格式（例如：`#143463`）
3. **字體**：需要在 HTML 中引入字體，配置檔只設定字體名稱
4. **功能開關**：可以透過 `features` 區塊控制功能顯示

## 範例：建立客戶C

1. 建立配置檔：
```bash
cp config/clients/tailormed.config.js config/clients/client-c.config.js
```

2. 編輯配置檔，修改品牌資訊、色彩等

3. 將客戶C的 logo 放入 `frontend/Assets/` 目錄

4. 編譯：
```bash
CLIENT_ID=client-c node compile-multi-client.js
```

5. 查看結果：
```bash
open dist/client-c/index.html
```

