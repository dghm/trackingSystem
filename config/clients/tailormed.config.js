// TailorMed 客戶配置檔
module.exports = {
  clientId: 'tailormed',
  clientName: 'TailorMed',
  
  // 品牌設定
  brand: {
    name: 'TailorMed',
    logo: './images/logo.png',
    logoMobile: './images/TM-Logo-Square.png',
    favicon: './images/tailormed-mark.svg',
    website: 'https://www.tailormed-intl.com',
    backHomeText: 'Back Home'
  },
  
  // 色彩系統
  colors: {
    primary: '#143463',
    secondary: '#97d3df',
    accent: '#bb2749',
    neutralLight: '#dfeaf3',
    neutralDark: '#222222',
    neutralGray: '#666666',
    baseWhite: '#ffffff'
  },
  
  // 文字內容
  content: {
    heroTitle: 'Track Your TailorMed Shipments Anytime',
    heroSubtitle: 'Use your order number and job ID to review the most recent shipment status available from TailorMed.',
    pageTitle: 'TailorMed｜貨件追蹤系統',
    lookupTitle: 'Shipment Tracking Lookup',
    submitButtonText: 'STATUS CHECK',
    orderNoPlaceholder: 'e.g., TM111682',
    trackingNoPlaceholder: 'e.g., GEXVC2YF',
    helpText: 'Need help? Contact your TailorMed logistics specialist at +886 2-2694-6168 for priority support.',
    descriptionTitle: 'TailorMed Shipment Tracking Notice｜Cold Chain Dedicated Service',
    descriptionText: [
      'This tracking system is exclusively provided by TailorMed for authorized clients to access current shipment information. Data is updated daily and accessible across multiple devices and platforms—no software installation required. Clients can monitor cold chain shipments anytime, anywhere.',
      'To protect the integrity and confidentiality of your shipment data, all queries are access-controlled and transmitted securely. Tracking records are used solely for logistics coordination and customer support purposes and are stored securely on our authorized data platforms.',
      'For questions or urgent inquiries, please contact your project coordinator directly. Contact us at +8862-2694-6168 or email customer-service@tailormed-intl.com. TailorMed is committed to providing reliable systems, transparent tracking, and professional service for every shipment.'
    ],
    fieldLabels: {
      orderNo: 'Job No.',
      trackingNo: 'Tracking No.'
    },
    validationMessages: {
      orderNoRequired: 'Please enter Job No.',
      trackingNoRequired: 'Please enter Tracking No.'
    },
    // Under Construction 頁面文字
    underConstruction: {
      pageTitle: 'TailorMed Tracking System is on the way.',
      titleLine1: 'Tracking System',
      titleLine2: 'is on the way.',
      subtitle: 'We\'re working hard to bring you a better way to monitor your shipments with precision and ease.\nThe service will be available soon — thank you for your understanding and continued trust.',
      backButtonText: 'Back to TailorMed',
      copyright: 'Copyright © 2025 TailorMed All Rights Reserved.',
    },
  },
  
  // Timeline 設定
  timeline: {
    international: {
      nodes: 7,
      statusCodes: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    },
    domestic: {
      nodes: 4,
      statusCodes: ['a', 'b', 'd', 'f']
    }
  },
  
  // 功能開關
  features: {
    dryIceTracking: true,
    feedbackSection: true,
    adBanner: true
  },
  
  // 字體設定
  fonts: {
    primary: 'Noto Sans, sans-serif'
  }
};

