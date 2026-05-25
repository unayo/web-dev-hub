# Web Dev Hub

一個基於 Nuxt 3 構建的技術筆記系統，整合 Cloud Firestore 作為後端儲存，並導入 Google Gemini API 實現多模態技術除錯與內容自動優化。

## Tech Stack

- Framework: Nuxt 3 (Vue 3 Composition API)

- Styling: Tailwind CSS

- Database: Firebase Cloud Firestore (附帶本機 LocalStorage 智慧備援機制)

- DevOps: Vercel/Netlify 自動化部署


## Core Features

- composables/:

- - useFirebaseFallback.ts: 實作 Firebase 監聽與 LocalStorage 雙軌備援機制。

- - useGeminiRouter.ts: 封裝 Gemini API 請求，包含指數型退避 (Exponential Backoff) 重試邏輯。

- components/:

- - BoardWorkspace.vue: 處理筆記串流、Tabs 切換與 Modals 定位上下文。

- - AiCopilot.vue: AI 互動介面，包含影像轉 Base64 處理與 Paste Hook 事件監聽。

- - NoteCard.vue: 隨筆展示組件，封裝 preview mask 與 Hover 互動樣式。

├── assets/css/main.css      # 全局特效與物理樣式
├── components/
│   ├── AiCopilot.vue       # AI 空間 (含波形與 Aurora 動畫)
│   ├── BoardWorkspace.vue  # 雙欄位切換與 Modals 邏輯
│   └── NoteCard.vue        # 隨筆物理卡片
├── composables/
│   ├── useFirebaseFallback.ts # 雲端/本機備援邏輯
│   └── useGeminiRouter.ts   # AI 路由引擎與重試演算法
├── nuxt.config.ts           # 全域架構設定
└── app.vue                  # 應用主進入點與全域 Toast 管理


## 核心功能規格
1. 雲端/本機雙軌備援
  機制: 應用初始化時嘗試連接 Firestore。

  錯誤處理: 若遭遇 Permission Denied 或連線逾時，系統自動將 isFirestoreBlocked 設為 true，並將資料操作導向 localStorage（key: web_dev_hub_notes_nuxt）。

  監聽同步: 使用 onSnapshot 進行即時數據更新，並透過 watch 監聽本機狀態變更。

2. 多模態 AI 引擎 (Semantic Auto-routing)
  輸入類型: 支援 text/plain 與 image/jpeg (base64)。

  路由規則:

    視覺輸入: 觸發視覺除錯 Prompt 模板。
    Bug 輸入: 觸發結構化除錯模板 (### 核心病灶 -> ### 解決方案 -> ### 觀念延伸)。
    一般觀念: 觸發教學式模板。

  重試機制: 內建 fetchWithBackoff，針對 5xx 錯誤進行 5 次遞增間隔重試。

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
# web-dev-hub
