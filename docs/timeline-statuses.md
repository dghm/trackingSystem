# Timeline Status Reference

| Status                 | Date                     | Node Circle – Normal                              | Node Circle – Hover                                 | Status Text        | Time                    |
| ---------------------- | ------------------------ | ------------------------------------------------- | --------------------------------------------------- | ------------------ | ----------------------- |
| a – Executed           | 實際日期（例：`Nov 10`） | 深藍外圈 + 白色內圈 + 勾勾圖示                    | 放大 + 陰影；內圈變深藍、勾勾變白                   | (Dynamic)          | 實際時間（例：`09:00`） |
| b – Processing         | `TBD`（不顯示日）        | 紅色外圈 + 白色內圈 + 卡車圖示                    | 放大 + 陰影；內圈變紅，卡車由紅轉白色               | (Dynamic)          | `Processing...`         |
| c – In Transit         | `TBD`（不顯示日）        | 紅色外圈 + 白色內圈 + 飛機圖示（上下飄動）        | 放大 + 陰影；內圈變紅，飛機由藍轉白色，仍有飄動動畫 | (Dynamic)          | `Processing...`         |
| d – Pending            | `TBD`（不顯示日）        | 淺灰外圈 + 白色內圈，無圖示                       | 無互動（`pointer-events: none`）                    | (Dynamic)          | `--:--`                 |
| e – Order Completed    | 實際日期（例：`Nov 12`） | 深藍外圈 + 深藍內圈 + 白色勾勾圖示                | 無互動（已取消 hover）                              | (Dynamic)          | 實際時間（例：`17:45`） |
| f – Shipment Delivered | 實際日期（例：`Nov 13`） | 深藍矩形（TailorMed 標誌造型） 有 專屬 shine 動畫 | 無互動（已取消 hover）                              | Shipment Delivered | 實際時間（例：`09:10`） |

## 動態節點文字對照

### Domestic 狀態描述

| 順序 | Status Description |
| ---- | ------------------ |
| 1    | Order Created      |
| 2    | Shipment Collected |
| 3    | In Transit         |
| 4    | Shipment Delivered |

### International 狀態描述

| 順序 | Status Description          |
| ---- | --------------------------- |
| 1    | Order Created               |
| 2    | Shipment Collected          |
| 3    | Origin Customs Process      |
| 4    | In Transit                  |
| 5    | Destination Customs Process |
| 6    | Out for Delivery            |
| 7    | Shipment Delivered          |

### International 事件顯示條件

- **事件一：Dry Ice Refilled (Terminal)**

  - 狀態序列須符合 `a, a, a, a, a, d, d`（前五步為已完成 `a`，後兩步為待處理 `d`）。
  - 並且資料表中的對應欄位為勾選（True），可視為 `a, a, a, a, a, T, d, d`。
  - 若狀態符合但欄位未勾選（例：`a, a, a, a, a, F, d, d`），事件一不顯示。
  - 只要其前一個節點不是 `a`（例如為 `c` 或 `d`），無論資料表是否勾選，事件一都不顯示。

- **事件二：Dry Ice Refilled**
  - 套用相同邏輯：事件落點前一個節點必須是 `a`，並且資料欄位勾選（True）才顯示。
  - 若前一個節點為 `c` 或 `d`，或資料欄位未勾選，即使其他條件符合也不顯示。
