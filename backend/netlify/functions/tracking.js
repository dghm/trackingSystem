// Netlify Function for tracking API
// 處理 /api/tracking, /api/tracking-public, /api/health 等請求

// 本地開發時使用資料庫連接
let dbConnection = null;
let airtableConnection = null;

// 載入環境變數的函數
// 優先順序：
// 1. 本地 .env 檔案（本地開發時優先使用）
// 2. Netlify Dashboard 環境變數（生產環境或 netlify dev 同步的）
function loadEnvVars() {
  const path = require('path');
  const fs = require('fs');

  // 先嘗試從 .env 檔案載入（本地開發優先）
  // 優先順序：backend/.env > repository root/.env
  // 注意：使用 override: true 確保 .env 的值會覆蓋 Netlify 同步的環境變數
  const envPaths = [
    path.resolve(__dirname, '../../.env'), // backend/.env (優先，專案專屬設定)
    path.resolve(__dirname, '../../../../../../.env'), // repository root/.env (最後)
  ];

  let loadedFromFile = false;
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      // 在載入 .env 前先清除 Netlify 的環境變數，確保完全覆蓋
      delete process.env.AIRTABLE_BASE_ID;
      delete process.env.AIRTABLE_API_KEY;
      delete process.env.AIRTABLE_SHIPMENTS_TABLE;

      // 使用 override: true 確保 .env 的值會覆蓋已存在的環境變數（包括 Netlify 同步的）
      require('dotenv').config({ path: envPath, override: true });
      console.log(
        '✅ 已載入本地 .env 檔案（強制覆蓋 Netlify 環境變數）:',
        envPath
      );
      console.log('🔍 Base ID =', process.env.AIRTABLE_BASE_ID);
      loadedFromFile = true;
      break;
    }
  }

  // 檢查是否在 Netlify 生產環境（不是 netlify dev）
  const isNetlifyProduction =
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    (process.env.NETLIFY && process.env.NETLIFY_DEV !== 'true');

  console.log('🔧 initConnections() - 環境變數狀態:');
  console.log(
    '  AIRTABLE_API_KEY:',
    process.env.AIRTABLE_API_KEY ? 'SET' : 'NOT SET'
  );
  console.log('  AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID || 'NOT SET');
  console.log('  BACKEND_API_URL:', process.env.BACKEND_API_URL || 'NOT SET');

  if (isNetlifyProduction) {
    console.log('✅ 使用 Netlify 生產環境變數（從 Dashboard 設定）');
  } else if (!loadedFromFile) {
    console.log(
      '⚠️ 未找到 .env 檔案，使用環境變數（Netlify Dashboard 或系統環境變數）'
    );
  }
}

// 初始化連接模組（簡化版）
function initConnections() {
  // 簡化：直接載入 airtable 模組（它會自己處理環境變數）
  if (!airtableConnection) {
    try {
      airtableConnection = require('./airtable');
      console.log('✅ 已載入 Airtable 模組');
    } catch (error) {
      console.log('⚠️ 無法載入 Airtable 模組:', error.message);
      airtableConnection = null;
    }
  }

  // 其次使用 MongoDB（如果已設定）
  if (
    !airtableConnection &&
    process.env.MONGODB_URI &&
    !process.env.BACKEND_API_URL
  ) {
    try {
      const mongoPath = require('path').resolve(
        __dirname,
        '../../../database/connection'
      );
      dbConnection = require(mongoPath);
      console.log('✅ 已載入 MongoDB 連接模組');
    } catch (error) {
      console.log('⚠️ MongoDB 連接模組未找到，將使用 API 模式');
    }
  }
}

// 不在模組載入時初始化，而是在 handler 執行時才初始化
// 這樣可以確保環境變數已經正確載入

exports.handler = async (event, context) => {
  // 載入環境變數（優先使用 .env 檔案）
  loadEnvVars();
  
  // 簡化：直接初始化連接（airtable.js 會自己處理環境變數載入）
  initConnections();
  
  console.log('🔍 Handler 初始化完成');
  console.log('  airtableConnection:', airtableConnection ? 'SET' : 'NOT SET');
  console.log('  AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? 'SET' : 'NOT SET');
  console.log('  AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID || 'NOT SET');
  // 處理 CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // 處理 OPTIONS 請求（CORS preflight）
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const { httpMethod, path: eventPath, queryStringParameters, body } = event;

  // 如果 queryStringParameters 中有 path 參數，使用它來判斷端點（用於本地開發）
  const effectivePath = queryStringParameters?.path || eventPath;

  // 記錄 path 以便調試
  console.log('🔍 Event path:', eventPath);
  console.log('🔍 Effective path:', effectivePath);
  console.log('🔍 Event queryStringParameters:', queryStringParameters);

  try {
    // 處理 /api/health 端點（支援重定向後的 path）
    if (
      effectivePath.includes('/api/health') ||
      effectivePath.includes('/health')
    ) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'TailorMed Tracking API',
          airtable: process.env.AIRTABLE_API_KEY
            ? 'configured'
            : 'not configured',
        }),
      };
    }

    // 處理 /api/update-checkbox 端點（更新 checkbox 欄位）
    if (effectivePath.includes('/api/update-checkbox')) {
      if (httpMethod !== 'POST') {
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({
            error: 'Method not allowed',
            message: 'Only POST method is supported',
          }),
        };
      }

      try {
        const parsedBody = body ? JSON.parse(body) : {};
        const { recordId, checkboxUpdates } = parsedBody;

        if (!recordId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Missing recordId',
              message: 'recordId is required',
            }),
          };
        }

        if (!checkboxUpdates || typeof checkboxUpdates !== 'object') {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Missing checkboxUpdates',
              message: 'checkboxUpdates object is required',
            }),
          };
        }

        // 確保 airtableConnection 已初始化
        if (!airtableConnection) {
          initConnections();
        }

        if (!airtableConnection || !airtableConnection.updateCheckboxFields) {
          return {
            statusCode: 503,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Airtable not configured',
              message: 'Airtable connection is not available',
            }),
          };
        }

        const { updateCheckboxFields } = airtableConnection;
        const updatedRecord = await updateCheckboxFields(
          recordId,
          checkboxUpdates
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: updatedRecord,
          }),
        };
      } catch (error) {
        console.error('❌ 更新 checkbox 失敗:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Update failed',
            message: error.message,
          }),
        };
      }
    }

    // 處理 /api/list 端點（獲取所有貨件列表）
    if (
      effectivePath.includes('/api/list') ||
      effectivePath.includes('/list')
    ) {
      if (httpMethod !== 'GET') {
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({
            error: 'Method not allowed',
            message: 'Only GET method is supported',
          }),
        };
      }

      try {
        // 確保 airtableConnection 已初始化
        if (!airtableConnection) {
          initConnections();
        }

        if (!airtableConnection || !airtableConnection.getAllShipments) {
          return {
            statusCode: 503,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Airtable not configured',
              message: 'Airtable connection is not available',
            }),
          };
        }

        const { getAllShipments } = airtableConnection;

        // 在查詢前再次確認環境變數（確保使用 .env 的值）
        const pathModule = require('path');
        const fs = require('fs');
        const envPath = pathModule.resolve(__dirname, '../../.env');
        if (fs.existsSync(envPath)) {
          require('dotenv').config({ path: envPath, override: true });
        }

        console.log(
          '🔍 /api/list - 使用的 Base ID:',
          process.env.AIRTABLE_BASE_ID
        );
        console.log(
          '🔍 /api/list - 使用的 Table:',
          process.env.AIRTABLE_SHIPMENTS_TABLE
        );

        // 從 query parameters 取得選項
        const maxRecords = queryStringParameters?.maxRecords
          ? parseInt(queryStringParameters.maxRecords, 10)
          : 100;
        const sortField = queryStringParameters?.sortField || 'Last Update';
        const sortDirection = queryStringParameters?.sortDirection || 'desc';

        const shipments = await airtableConnection.getAllShipments({
          maxRecords,
          sortField,
          sortDirection,
        });

        console.log('📦 /api/list - 返回記錄數:', shipments.length);
        if (shipments.length > 0) {
          console.log(
            '📦 /api/list - 第一筆記錄訂單編號:',
            shipments[0].orderNo
          );
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            count: shipments.length,
            data: shipments,
          }),
        };
      } catch (error) {
        console.error('❌ 獲取列表失敗:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Failed to fetch shipments list',
            message: error.message,
          }),
        };
      }
    }

    // 處理 /api/tracking 和 /api/tracking-public 端點（支援重定向後的 path）
    // Netlify 重定向後，path 可能是 /.netlify/functions/tracking
    // 但只有在不是 /api/list 的情況下才處理 tracking
    if (
      (effectivePath.includes('/api/tracking') ||
        effectivePath.includes('/api/tracking-public') ||
        effectivePath.includes('/.netlify/functions/tracking') ||
        effectivePath === '/tracking') &&
      !effectivePath.includes('/api/list') &&
      !effectivePath.includes('/list')
    ) {
      let orderNo, trackingNo;

      // GET 請求：從 query parameters 取得
      if (httpMethod === 'GET') {
        orderNo = queryStringParameters?.orderNo;
        trackingNo = queryStringParameters?.trackingNo;
      }

      // POST 請求：從 body 取得
      if (httpMethod === 'POST') {
        const parsedBody = body ? JSON.parse(body) : {};
        orderNo = parsedBody.order || parsedBody.orderNo;
        trackingNo = parsedBody.job || parsedBody.trackingNo;
      }

      // 驗證參數
      if (!orderNo || !trackingNo) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing parameters',
            message: 'Both orderNo and trackingNo are required',
          }),
        };
      }

      console.log('🔍 /api/tracking - 檢查 Airtable 連接...');
      console.log(
        '  airtableConnection:',
        airtableConnection ? 'SET' : 'NOT SET'
      );
      console.log(
        '  AIRTABLE_BASE_ID (載入前):',
        process.env.AIRTABLE_BASE_ID || 'NOT SET'
      );

      // 確保 airtableConnection 已初始化（和列表端點一樣）
      if (!airtableConnection) {
        console.log('⚠️ airtableConnection 未初始化，重新初始化...');
        initConnections();
      }

      // 如果連接模組仍未初始化，重新初始化（因為環境變數可能剛載入）
      if (
        !airtableConnection &&
        process.env.AIRTABLE_API_KEY &&
        process.env.AIRTABLE_BASE_ID &&
        !process.env.BACKEND_API_URL
      ) {
        try {
          // 在 Netlify Function 環境中，優先使用同目錄下的 database 模組
          // 如果不存在，則嘗試使用相對路徑
          const pathModule = require('path');
          const fs = require('fs');

          // 在 Netlify 部署環境中，直接使用相對路徑 require
          // airtable.js 應該在同一個目錄下
          try {
            // 先嘗試直接 require（最簡單的方式）
            airtableConnection = require('./airtable');
            console.log(
              '✅ 已載入 Airtable 連接模組（在 handler 中，直接 require）'
            );
          } catch (requireError) {
            // 如果直接 require 失敗，嘗試使用完整路徑
            console.log(
              '⚠️ 直接 require 失敗，嘗試使用完整路徑:',
              requireError.message
            );
            const localPath = pathModule.join(__dirname, 'airtable.js');
            const fallbackPath = pathModule.resolve(
              __dirname,
              '../../../database/airtable.js'
            );

            if (fs.existsSync(localPath)) {
              // 清除緩存
              if (require.cache[localPath]) {
                delete require.cache[localPath];
              }
              airtableConnection = require(localPath);
              console.log(
                '✅ 已載入 Airtable 連接模組（在 handler 中，使用完整路徑）:',
                localPath
              );
            } else if (fs.existsSync(fallbackPath)) {
              if (require.cache[fallbackPath]) {
                delete require.cache[fallbackPath];
              }
              airtableConnection = require(fallbackPath);
              console.log(
                '✅ 已載入 Airtable 連接模組（在 handler 中，使用備用路徑）:',
                fallbackPath
              );
            } else {
              console.error('❌ 無法找到 airtable 模組，嘗試的路徑:');
              console.error('  - ./airtable (相對路徑)');
              console.error('  -', localPath);
              console.error('  -', fallbackPath);
              console.error('  - __dirname:', __dirname);
              throw new Error(
                `Cannot find airtable module. Checked: ./airtable, ${localPath}, ${fallbackPath}`
              );
            }
          }
          console.log('✅ 已載入 Airtable 連接模組（在 handler 中）');
        } catch (error) {
          console.log('⚠️ Airtable 連接模組載入失敗:', error.message);
          console.log('⚠️ Error stack:', error.stack);
        }
      }

      // 檢查條件
      const hasAirtableConfig =
        process.env.AIRTABLE_API_KEY &&
        process.env.AIRTABLE_BASE_ID &&
        !process.env.BACKEND_API_URL;
      console.log('hasAirtableConfig:', hasAirtableConfig);
      console.log(
        'airtableConnection after check:',
        airtableConnection ? 'SET' : 'NOT SET'
      );

      if (airtableConnection && hasAirtableConfig) {
        try {
          console.log('✅ Using Airtable connection');
          console.log('🔍 Querying:', orderNo, trackingNo);
          const { findShipment, findTimeline } = airtableConnection;

          // 查詢貨件資料
          let shipment;
          try {
            shipment = await findShipment(orderNo, trackingNo);
            console.log(
              '📦 Shipment result:',
              shipment ? 'Found' : 'Not found'
            );
            if (shipment) {
              console.log('📦 Shipment details:', {
                orderNo: shipment.orderNo,
                trackingNo: shipment.trackingNo,
                origin: shipment.origin,
                destination: shipment.destination,
              });
            }
          } catch (queryError) {
            console.error('❌ Airtable query error:', queryError);
            console.error('❌ Error stack:', queryError.stack);
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Airtable query failed',
                message: queryError.message,
              }),
            };
          }

          if (!shipment) {
            console.log('⚠️ No shipment found for:', orderNo, trackingNo);
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                success: false,
                message: 'No record found. Please verify the tracking number.',
              }),
            };
          }

          // 查詢時間軸資料（傳入 shipment 的原始欄位以便生成 timeline）
          const timeline = await findTimeline(trackingNo, shipment._raw);

          // 格式化回應資料
          const responseData = {
            success: true,
            data: {
              id: shipment.id,
              orderNo: shipment.orderNo,
              trackingNo: shipment.trackingNo,
              status: shipment.status || 'pending',
              origin: shipment.origin || '',
              destination: shipment.destination || '',
              packageCount: shipment.packageCount || 1,
              weight: shipment.weight || '',
              eta: shipment.eta || '',
              invoiceNo: shipment.invoiceNo || '',
              mawb: shipment.mawb || '',
              lastUpdate: shipment.lastUpdate || '',
              transportType: shipment.transportType || '', // 包含 Transport Type
              timeline: timeline.map((item) => ({
                step: item.step,
                title: item.title,
                time: item.time || item.date,
                status: item.status || 'pending',
                isEvent: item.isEvent || false,
                date: item.date,
                isOrderCompleted: item.isOrderCompleted || false, // 包含訂單完成狀態
              })),
            },
          };

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(responseData),
          };
        } catch (error) {
          console.error('Airtable query error:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Airtable query failed',
              message: error.message,
            }),
          };
        }
      }

      // 其次使用本地 MongoDB 連接（如果已設定 MONGODB_URI 且沒有設定 BACKEND_API_URL）
      if (
        dbConnection &&
        process.env.MONGODB_URI &&
        !process.env.BACKEND_API_URL
      ) {
        try {
          const { findShipment, findTimeline } = dbConnection;

          // 查詢貨件資料
          const shipment = await findShipment(orderNo, trackingNo);

          if (!shipment) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                success: false,
                message: 'No record found. Please verify the tracking number.',
              }),
            };
          }

          // 查詢時間軸資料（如果 shipment 有 _raw 欄位，傳入以便生成 timeline）
          const timeline = await findTimeline(
            trackingNo,
            shipment._raw || shipment
          );

          // 格式化回應資料
          const responseData = {
            success: true,
            data: {
              id: shipment._id?.toString() || shipment.id,
              orderNo: shipment.orderNo,
              trackingNo: shipment.trackingNo,
              status: shipment.status || 'pending',
              origin: shipment.origin,
              destination: shipment.destination,
              packageCount: shipment.packageCount || 1,
              weight: shipment.weight,
              eta: shipment.eta,
              invoiceNo: shipment.invoiceNo,
              lastUpdate: shipment.lastUpdate || shipment.updatedAt,
              timeline: timeline.map((item) => ({
                step: item.step,
                title: item.title || item.status,
                time: item.time || item.date,
                status: item.status || 'pending',
                isEvent: item.isEvent || false,
                date: item.date,
              })),
            },
          };

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(responseData),
          };
        } catch (error) {
          console.error('Database query error:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Database query failed',
              message: error.message,
            }),
          };
        }
      }

      // 連接後端 API（如果已設定環境變數）
      const backendApiUrl = process.env.BACKEND_API_URL;

      if (backendApiUrl) {
        try {
          // 構建後端 API URL
          const apiKey =
            queryStringParameters?.apiKey || process.env.BACKEND_API_KEY;
          let backendUrl = `${backendApiUrl}/api/tracking?orderNo=${encodeURIComponent(
            orderNo
          )}&trackingNo=${encodeURIComponent(trackingNo)}`;

          if (apiKey) {
            backendUrl += `&apiKey=${encodeURIComponent(apiKey)}`;
          }

          // 呼叫後端 API
          const backendResponse = await fetch(backendUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(process.env.BACKEND_API_KEY && {
                Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
              }),
            },
          });

          if (!backendResponse.ok) {
            if (backendResponse.status === 404) {
              return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                  success: false,
                  message:
                    'No record found. Please verify the tracking number.',
                }),
              };
            }

            if (backendResponse.status === 429) {
              const errorData = await backendResponse.json().catch(() => ({}));
              return {
                statusCode: 429,
                headers,
                body: JSON.stringify({
                  success: false,
                  message:
                    errorData.message ||
                    'Query limit reached (10 per hour). Please try again later.',
                }),
              };
            }

            throw new Error(
              `Backend API returned status ${backendResponse.status}`
            );
          }

          const backendData = await backendResponse.json();

          // 確保返回格式一致
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: backendData.data || backendData,
            }),
          };
        } catch (error) {
          console.error('Backend API error:', error);

          // 如果後端 API 失敗，返回錯誤（不返回 mock 資料）
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Backend service unavailable',
              message:
                'Unable to connect to backend service. Please try again later.',
            }),
          };
        }
      }

      // 如果沒有設定任何資料來源，返回錯誤
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'No record found. Please verify the tracking number.',
        }),
      };
    }

    // 處理 /api/tracking/timeline/:trackingNo（如果需要）
    if (path.includes('/api/tracking/timeline/')) {
      const trackingNo = path.split('/timeline/')[1];

      if (!trackingNo) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing trackingNo',
            message: 'Tracking number is required',
          }),
        };
      }

      // 查詢時間軸事件
      // 如果沒有設定任何資料來源，返回錯誤
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'No timeline found for this tracking number.',
        }),
      };
    }

    // 未找到對應的路由
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Not found',
        message: 'API endpoint not found',
      }),
    };
  } catch (error) {
    console.error('❌ Tracking API error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
    };
  }
};
