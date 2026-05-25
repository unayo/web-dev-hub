<template>
  <div class="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col font-sans selection:bg-black/5 selection:text-black">
    
    <!-- Header: 頂部高質感 Apple 導航列 -->
    <header class="border-b border-black/[0.05] bg-white/80 backdrop-blur-xl sticky top-0 z-40 shrink-0">
      <div class="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between gap-4">
        
        <!-- Logo Section -->
        <div class="flex items-center gap-3.5">
          <div class="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-black/[0.06] shadow-sm">
            <svg class="w-5 h-5 text-zinc-850" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21C12 21 5 18 5 12V5L12 3L19 5V12C19 18 12 21 12 21Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M9 9H15M9 13H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur opacity-40"></div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-sm font-semibold tracking-tight text-stone-900">Web Dev Hub</h1>
              <span class="text-[9.5px] bg-stone-900 text-white px-2 py-0.5 rounded font-mono font-bold tracking-wide">SILVER</span>
            </div>
            <p class="text-[10.5px] text-zinc-400 font-light mt-0.5">高雅、極簡、高流暢的全棧開發隨筆與 AI 程式導師</p>
          </div>
        </div>

        <!-- Right Side Configuration Button -->
        <div class="flex items-center gap-3">
          <button @click="showKeyModal = true" class="px-4 py-2 text-xs text-zinc-500 hover:text-stone-900 bg-black/5 hover:bg-black/[0.08] rounded-full spring-transition flex items-center gap-2">
            <i class="fa-solid fa-key text-[10px]" :class="customApiKey ? 'text-indigo-600' : ''"></i>
            <span class="font-medium tracking-tight">{{ customApiKey ? '個人金鑰已啟用' : '配置 AI 金鑰' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Layout (Centered unified single-panel like Image 1) -->
    <main class="flex-grow max-w-3xl w-full mx-auto px-6 py-8 flex flex-col">
      <BoardWorkspace @toast="triggerToast" />
    </main>

    <!-- iOS Dynamic Island Style Toast System -->
    <div class="fixed top-24 right-6 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" :class="toastClass(toast.type)" class="p-3.5 border rounded-2xl backdrop-blur-xl flex items-center justify-between gap-3 pointer-events-auto spring-transition shadow-lg shadow-black/[0.02]">
          <div class="flex items-center gap-2.5 text-xs font-semibold">
            <i v-if="toast.type === 'success'" class="fa-solid fa-circle-check text-green-600"></i>
            <i v-else-if="toast.type === 'error'" class="fa-solid fa-circle-xmark text-red-500"></i>
            <i v-else class="fa-solid fa-circle-info text-blue-500"></i>
            <span class="font-normal text-stone-800">{{ toast.message }}</span>
          </div>
          <button @click="removeToast(toast.id)" class="text-zinc-400 hover:text-stone-900 text-xs spring-transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- MODAL: PERSONAL AI API KEY CONFIGURATION -->
    <div v-if="showKeyModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div @click="showKeyModal = false" class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div class="bg-white border border-black/[0.05] rounded-3xl w-full max-w-sm overflow-hidden shadow-xl relative z-10 p-6 space-y-4">
        <div class="flex items-center gap-2.5 text-stone-900">
          <i class="fa-solid fa-key text-xs"></i>
          <h3 class="font-semibold text-xs tracking-tight">配置您的 Gemini API Key</h3>
        </div>
        <p class="text-[10px] text-zinc-400 leading-relaxed font-light">
          若系統預設公共通道流量限制卡頓，請配置個人 Gemini API 金鑰。金鑰將安全儲存在本地。
        </p>
        <div class="space-y-1.5">
          <label class="text-[10px] text-stone-500 font-semibold">Gemini API Key</label>
          <input type="password" v-model="keyInput" placeholder="AIzaSy..." class="w-full px-3 py-2 bg-[#f5f5f7] border border-transparent focus:border-stone-200 focus:bg-white focus:outline-none rounded-xl text-xs text-stone-900 font-mono spring-transition">
        </div>
        <div class="flex items-center justify-between text-[9.5px] text-zinc-400 pt-1">
          <span>* 系統將優先使用此本機金鑰</span>
          <button v-if="customApiKey" @click="clearApiKey" class="text-red-500 hover:underline">清除本機金鑰</button>
        </div>
        <div class="flex items-center gap-3 pt-1">
          <button @click="showKeyModal = false" class="w-1/2 py-2.5 bg-black/5 hover:bg-black/[0.08] rounded-full text-xs text-stone-700 font-medium spring-transition">取消</button>
          <button @click="saveApiKey" class="w-1/2 py-2.5 bg-stone-900 text-white font-semibold rounded-full text-xs spring-transition shadow-sm">儲存金鑰</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const { customApiKey } = useGeminiRouter();

const showKeyModal = ref(false);
const keyInput = ref(customApiKey.value);

interface Toast {
  id: string;
  message: string;
  type: string;
}
const toasts = ref<Toast[]>([]);

const triggerToast = (payload: { msg: string; type: string }) => {
  const id = crypto.randomUUID();
  toasts.value.push({ id, message: payload.msg, type: payload.type });
  setTimeout(() => removeToast(id), 3500);
};

const removeToast = (id: string) => {
  toasts.value = toasts.value.filter(t => t.id !== id);
};

const saveApiKey = () => {
  localStorage.setItem('web_dev_hub_gemini_key', keyInput.value.trim());
  customApiKey.value = keyInput.value.trim();
  showKeyModal.value = false;
  triggerToast({ msg: '個人 API 金鑰已儲存並啟用', type: 'success' });
};

const clearApiKey = () => {
  localStorage.removeItem('web_dev_hub_gemini_key');
  customApiKey.value = '';
  keyInput.value = '';
  showKeyModal.value = false;
  triggerToast({ msg: '已回復使用系統預設共用通道', type: 'info' });
};

const toastClass = (type: string) => {
  if (type === 'success') return 'border-green-100 bg-white/95';
  if (type === 'error') return 'border-red-100 bg-white/95';
  return 'border-stone-200 bg-white/95';
};
</script>

<style>
.spring-transition {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>