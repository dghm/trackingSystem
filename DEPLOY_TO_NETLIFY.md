# Netlify 部署指南 - 使用 Netlify Functions

## 📋 部署前檢查清單

### 1. 確認文件結構
確保以下文件存在：
- ✅ `netlify.toml` (在 `trackingSystem/` 目錄下)
- ✅ `backend/netlify/functions/tracking.js`
- ✅ `backend/netlify/functions/airtable.js`
- ✅ `package.json` (包含所需依賴)
- ✅ `compile-multi-client.js`

### 2. 確認 netlify.toml 配置
當前配置：
```toml
[build]
  command = "CLIENT_ID=client-b node compile-multi-client.js"
  publish = "dist/client-b"
  functions = "backend/netlify/functions"

[functions]
  node_bundler = "esbuild"
```

## 🚀 部署步驟

### 步驟 1：準備 Git Repository

1. **確認代碼已提交到 Git**
   ```bash
   cd /Users/arieshsieh/Develop/Development/src/Projects/DGHM/trackingSystem
   git status
   git add .
   git commit -m "準備部署到 Netlify"
   ```

2. **推送到 GitHub**
   ```bash
   git push origin main
   ```

### 步驟 2：在 Netlify 連接 Repository

1. **登入 Netlify**
   - 前往 https://app.netlify.com
   - 使用 GitHub 帳號登入

2. **新增網站**
   - 點擊 "Add new site" → "Import an existing project"
   - 選擇 "GitHub"
   - 授權 Netlify 訪問您的 GitHub
   - 選擇您的 repository

### 步驟 3：設定 Build 配置

在 Netlify Dashboard 的 "Configure the site" 頁面：

**Base directory**: `src/Projects/DGHM/trackingSystem`
   - 如果您的 repository root 不是 `trackingSystem`，需要設定這個

**Build command**: `CLIENT_ID=client-b node compile-multi-client.js`
   - 或使用 `npm run build`（如果 package.json 有設定）

**Publish directory**: `dist/client-b`
   - 這是編譯後的靜態文件目錄

**Functions directory**: `backend/netlify/functions`
   - Netlify 會自動偵測並部署 Functions

### 步驟 4：設定環境變數

在 Netlify Dashboard → Site settings → Environment variables 設定：

**必須設定的環境變數：**
- `AIRTABLE_API_KEY` - Airtable API Key
- `AIRTABLE_BASE_ID` - Airtable Base ID (例如：`appBxp1ymN0Wrq2Gg`)
- `AIRTABLE_SHIPMENTS_TABLE` - 表格名稱 (例如：`Tracking`)

**可選環境變數：**
- `AIRTABLE_TIMELINE_TABLE` - Timeline 表格名稱 (預設：`Timeline`)

**設定方式：**
1. 進入 Netlify Dashboard
2. 選擇您的網站
3. 點擊 "Site settings" → "Environment variables"
4. 點擊 "Add a variable"
5. 輸入變數名稱和值
6. 勾選 "All scopes"（Production, Deploy previews, Branch deploys）

### 步驟 5：部署

1. **自動部署**
   - 點擊 "Deploy site"
   - Netlify 會自動開始構建和部署

2. **查看部署日誌**
   - 在 "Deploys" 標籤頁查看構建進度
   - 確認以下項目：
     - ✅ Build command 執行成功
     - ✅ Functions 安裝依賴成功
     - ✅ 部署完成

### 步驟 6：驗證部署

部署完成後，訪問以下 URL 驗證：

1. **首頁**
   - `https://your-site.netlify.app/`
   - 應該顯示查詢頁面

2. **列表頁面**
   - `https://your-site.netlify.app/dashboard-list`
   - 應該顯示貨件列表

3. **API 端點**
   - `https://your-site.netlify.app/api/health`
   - 應該返回 `{"status":"ok"}`

4. **查詢 API**
   - `https://your-site.netlify.app/api/tracking?orderNo=XXX&trackingNo=XXX`
   - 應該返回查詢結果

## 🔧 故障排除

### 問題 1：Build 失敗

**檢查：**
1. 查看 Netlify 構建日誌
2. 確認 `compile-multi-client.js` 可以正常執行
3. 確認所有依賴都已安裝

**解決：**
```bash
# 本地測試構建
cd src/Projects/DGHM/trackingSystem
CLIENT_ID=client-b node compile-multi-client.js
```

### 問題 2：Functions 無法運作

**檢查：**
1. Netlify Dashboard → Functions → tracking → Logs
2. 確認環境變數已正確設定
3. 確認 Functions 目錄路徑正確

**解決：**
- 確認 `netlify.toml` 中的 `functions = "backend/netlify/functions"` 路徑正確
- 確認環境變數在 Netlify Dashboard 已設定

### 問題 3：API 返回錯誤

**檢查：**
1. Netlify Dashboard → Functions → tracking → Logs
2. 確認 Airtable API Key 和 Base ID 正確
3. 確認 CORS 設定正確

**解決：**
- 檢查環境變數是否正確
- 確認 Airtable API Key 有正確的權限

### 問題 4：頁面無法載入資料

**檢查：**
1. 瀏覽器 Console 查看錯誤
2. Network 標籤查看 API 請求
3. Netlify Functions 日誌

**解決：**
- 確認 API 端點路徑正確（`/api/tracking`）
- 確認重定向規則正確（`netlify.toml`）

## 📝 重要提醒

1. **環境變數安全**
   - ⚠️ 不要將 `.env` 檔案提交到 Git
   - ✅ 只在 Netlify Dashboard 設定環境變數

2. **Base Directory**
   - 如果您的 repository root 不是 `trackingSystem`，需要在 Netlify Dashboard 設定 "Base directory"

3. **Functions 依賴**
   - Netlify 會自動安裝 `package.json` 中的依賴
   - 確認 `backend/netlify/functions/` 下的函數可以正常 require 依賴

4. **構建時間**
   - 首次部署可能需要 3-5 分鐘
   - 後續部署通常更快（約 1-2 分鐘）

## 🎯 快速檢查清單

部署前確認：
- [ ] `netlify.toml` 存在且配置正確
- [ ] `package.json` 包含所有依賴
- [ ] 代碼已推送到 GitHub
- [ ] Netlify 已連接 GitHub repository
- [ ] Build command 設定正確
- [ ] Publish directory 設定為 `dist/client-b`
- [ ] Functions directory 設定為 `backend/netlify/functions`
- [ ] 環境變數已在 Netlify Dashboard 設定
- [ ] 本地測試構建成功

部署後驗證：
- [ ] 網站可以正常訪問
- [ ] API 端點可以正常回應
- [ ] 列表頁面可以載入資料
- [ ] 查詢功能正常運作


