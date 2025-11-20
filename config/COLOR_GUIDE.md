# 顏色配置指南

## 如何更改客戶 B 的顏色

### 1. 編輯配置檔

打開 `config/clients/client-b.config.js`，找到 `colors` 區塊：

```javascript
colors: {
  primary: '#2C5F2D',      // 主色（按鈕、標題、主要元素）
  secondary: '#97BC62',    // 副色（次要元素、背景）
  accent: '#FF6B35',       // 強調色（連結、強調按鈕）
  neutralLight: '#F5F5F5', // 淺色背景
  neutralDark: '#1A1A1A',  // 深色文字
  neutralGray: '#666666',  // 灰色文字
  baseWhite: '#FFFFFF',    // 白色背景
}
```

### 2. 修改顏色值

直接修改十六進位顏色代碼（格式：`#RRGGBB`）

**範例：**

```javascript
colors: {
  primary: '#1E3A8A',      // 改為深藍色
  secondary: '#60A5FA',    // 改為淺藍色
  accent: '#F59E0B',       // 改為琥珀色
  // ... 其他顏色
}
```

### 3. 重新編譯

修改後執行：

```bash
CLIENT_ID=client-b node compile-multi-client.js
```

### 4. 查看結果

編譯後的樣式會自動更新到：

```
dist/client-b/css/variables.css
```

## 顏色使用說明

### primary（主色）

- 用於：主要按鈕、標題、重要元素
- 建議：使用品牌主色，對比度要足夠

### secondary（副色）

- 用於：次要按鈕、背景色、輔助元素
- 建議：與主色協調，通常較淺

### accent（強調色）

- 用於：連結、強調按鈕、重要提示
- 建議：與主色形成對比，吸引注意

### neutralLight（淺色）

- 用於：背景、卡片背景
- 建議：接近白色但略帶色調

### neutralDark（深色）

- 用於：主要文字
- 建議：深色但不要太黑（避免過於刺眼）

### neutralGray（灰色）

- 用於：次要文字、說明文字
- 建議：中等灰色，易讀但不搶眼

### baseWhite（白色）

- 用於：純白背景、卡片
- 通常保持 `#FFFFFF`

## 顏色選擇工具

### 線上工具

1. **Coolors.co** - 配色生成器

   - https://coolors.co/
   - 可以生成協調的配色方案

2. **Adobe Color** - 色彩輪

   - https://color.adobe.com/
   - 可以選擇互補色、相似色等

3. **Material Design Color Tool**
   - https://material.io/resources/color/
   - 可以測試對比度和可讀性

### 顏色格式

- 使用十六進位格式：`#RRGGBB`
- 例如：`#2C5F2D`（深綠色）
- 不支援透明度（如果需要，需在 CSS 中額外設定）

## 快速測試

修改顏色後，可以：

1. 重新編譯
2. 在瀏覽器中開啟 `dist/client-b/trackTimelineUI.html`
3. 檢查按鈕、標題、連結等元素的顏色是否正確

## 範例配色方案

### 藍色系

```javascript
primary: '#1E3A8A',    // 深藍
secondary: '#60A5FA',  // 淺藍
accent: '#F59E0B',    // 琥珀
```

### 紫色系

```javascript
primary: '#5B21B6',   // 深紫
secondary: '#A78BFA', // 淺紫
accent: '#10B981',    // 綠色
```

### 紅色系

```javascript
primary: '#991B1B',   // 深紅
secondary: '#F87171', // 淺紅
accent: '#FBBF24',    // 黃色
```
