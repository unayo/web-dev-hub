// nuxt.config.ts
export default defineNuxtConfig({
  // 1. 徹底移除 '@nuxtjs/tailwindcss'，不再讓它背後呼叫出錯的 jiti
  modules: [],

  // 2. 將全域樣式直接定義在全域空間（使用更穩健的相對路徑）
  css: ['./assets/css/main.css'],

  compatibilityDate: '2026-05-25',

  app: {
    head: {
      title: 'Web 全棧開發大師筆記 (Web Dev Hub) - Apple 經典極簡版',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' }
      ]
    }
  },

  // 3. 改由 Nuxt 3 原生完美支援的 PostCSS 機制加載 Tailwind
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  vite: {
    optimizeDeps: {
      include: ['marked', 'prismjs']
    }
  },

  ssr: false 
})