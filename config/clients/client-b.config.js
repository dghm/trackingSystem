// ◎◎ 物流公司 配置檔範例
module.exports = {
  clientId: 'client-b',
  clientName: '◎◎ 物流公司',

  // 品牌設定
  brand: {
    name: '◎◎ 物流公司',
    logo: './images/logo.png',
    logoMobile: './images/Logo-Square.png',
    favicon: './images/favicon.svg',
    website: 'https://www.client-b.com',
    backHomeText: '返回首頁',
  },

  // 色彩系統（◎◎ 物流公司的配色）
  colors: {
    primary: '#0D23A0', // 亮藍色
    secondary: '#FFB700', // 金黃色
    accent: '#FFB700', // 金黃色
    neutralLight: '#efefef',
    neutralDark: '#1E1E1E',
    neutralGray: '#666666',
    baseWhite: '#FFFFFF',
  },

  // 文字內容
  content: {
    heroTitle: '追蹤您的貨件狀態',
    heroSubtitle: '使用訂單編號和追蹤號碼查詢最新的貨件狀態資訊。',
    pageTitle: '◎◎ 物流公司｜貨件追蹤系統',
    lookupTitle: '貨件追蹤查詢',
    submitButtonText: '貨況查詢',
    orderNoPlaceholder: '例如：ORD123456',
    trackingNoPlaceholder: '例如：TRK789012',
    helpText: '需要協助？請聯繫我們的物流專員，電話：+886 2-1234-5678',
    descriptionTitle: '◎◎ 物流公司 貨件追蹤說明｜專業物流服務',
    descriptionText: [
      '本追蹤系統專為◎◎ 物流公司授權客戶提供，可隨時查詢最新貨件資訊。資料每日更新，支援多種裝置與平台，無需安裝任何軟體。客戶可隨時隨地監控貨件狀態。',
      '為保護您的貨件資料完整性與機密性，所有查詢均經過存取控制並以安全方式傳輸。追蹤記錄僅用於物流協調與客戶支援，並安全儲存於授權資料平台。',
    ],
    fieldLabels: {
      orderNo: '訂單編號',
      trackingNo: '追蹤號碼',
    },
    validationMessages: {
      orderNoRequired: '請輸入訂單編號',
      trackingNoRequired: '請輸入追蹤號碼',
    },
    // 查詢結果文字
    results: {
      successTitle: '查詢成功',
      timelineTitle: '貨件時程',
      processingText: '處理中...',
      pendingText: '待處理...',
      loadingText: '正在查詢貨件狀態，請稍候...',
      resultsTitle: '最新貨件更新',
      statusPlaceholderTitle: '追蹤狀態將顯示在此',
      statusPlaceholderText:
        '找到匹配記錄後，您將看到當前里程碑、最後更新時間戳和任何特殊處理標籤。',
      timelineDescription: '透過每個里程碑追蹤您的貨件',
      timelinePlaceholderText: '找到貨件後，時程事件將自動填充。',
      resultsNote:
        '此資訊並非即時更新。如需最新狀態，請重新整理此頁面或聯繫我們的客服團隊。',
      feedbackTitle: '感謝您使用我們的追蹤系統。',
      feedbackText1: '我們重視您的意見，並邀請您分享您的經驗。',
      feedbackText2:
        '提交完整且有效的意見表單，即可獲得 100 美元折扣券作為我們的感謝。',
      feedbackLinkText: '分享您的意見',
      trackingAnotherText: '追蹤另一個貨件',
      apiDebugTitle: 'API 回應預覽',
      apiDebugNoData: '尚未載入資料。',
      fieldLabels: {
        jobNo: '訂單編號',
        trackingNo: '追蹤號碼',
        invoiceNo: '發票號碼',
        eta: '預計到達時間',
        status: '狀態',
        lastUpdate: '最後更新',
        originalDestination: '起運地/目的地',
        packageCount: '包裹數量',
        weight: '重量',
      },
      // 步驟名稱映射表（將 API 回應的英文名稱轉換為中文）
      stepNameMapping: {
        'Order Created': '訂單已建立',
        'Shipment Collected': '貨件已收取',
        'Origin Customs Process': '起運地海關處理',
        'In Transit': '運送中',
        'Destination Customs Process': '目的地海關處理',
        'Out for Delivery': '配送中',
        'Shipment Delivered': '貨件已送達',
        'Dry Ice Refilled': '乾冰補充',
        'Dry Ice Refilled(Terminal)': '乾冰補充（終端）',
      },
    },
    // Under Construction 頁面文字
    underConstruction: {
      pageTitle: '◎◎ 物流公司 追蹤系統即將上線',
      titleLine1: '追蹤系統',
      titleLine2: '即將上線',
      subtitle:
        '我們正在努力為您提供更精準、更便捷的貨件監控服務。服務即將推出，感謝您的理解與持續信任。',
      backButtonText: '返回◎◎ 物流公司',
      copyright: 'Copyright © 2025 ◎◎ 物流公司 All Rights Reserved.',
    },
  },

  // Timeline 設定
  timeline: {
    international: {
      nodes: 7,
      statusCodes: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    },
    domestic: {
      nodes: 4,
      statusCodes: ['a', 'b', 'd', 'f'],
    },
  },

  // 功能開關
  features: {
    dryIceTracking: false, // ◎◎ 物流公司不需要乾冰追蹤
    feedbackSection: true,
    adBanner: true,
  },

  // 字體設定
  fonts: {
    primary: 'Noto Sans TC, sans-serif', // 使用繁體中文字體
  },
};
