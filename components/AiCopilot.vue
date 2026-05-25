<template>
  <div class="flex flex-col justify-between bg-white border border-black/[0.04] rounded-2xl p-6 shadow-sm relative min-h-[500px] flex-grow overflow-hidden h-full">
    <!-- Siri Aurora Effect Backing -->
    <div class="aurora-bg rounded-2xl"></div>

    <div class="relative z-10 flex items-center justify-between border-b border-black/[0.04] pb-4 mb-4 shrink-0">
      <div class="flex items-center gap-3">
        <div class="relative w-3.5 h-3.5 flex items-center justify-center">
          <span class="absolute w-2 h-2 rounded-full bg-indigo-500 animate-ping opacity-30"></span>
          <span class="relative w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
        </div>
        <div>
          <h3 class="font-semibold text-xs text-stone-900 tracking-tight">AI 智慧程式導師</h3>
          <p class="text-[10.5px] text-zinc-400 font-light">全模態視覺與文字除錯空間</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button @click="loadPreset" class="text-[11px] text-stone-700 hover:text-stone-900 border border-black/[0.06] px-3 py-1.5 rounded-full bg-black/5 font-semibold transition-all">範例提示</button>
        <button v-if="aiResult" @click="emit('load-to-editor', aiResult)" class="text-[11px] bg-stone-900 text-white font-semibold px-3 py-1.5 rounded-full shadow-sm transition-all">一鍵轉存為隨筆</button>
      </div>
    </div>

    <!-- Response Window -->
    <div class="relative z-10 flex-grow overflow-y-auto pr-1 max-h-[calc(100vh-290px)] min-h-[250px] mb-4">
      <div v-if="isAiLoading" class="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div class="siri-wave">
          <span class="siri-bar"></span>
          <span class="siri-bar"></span>
          <span class="siri-bar"></span>
          <span class="siri-bar"></span>
          <span class="siri-bar"></span>
        </div>
        <p class="text-xs font-semibold text-stone-900">AI 導師正在為您構思深度解答...</p>
      </div>

      <div v-else-if="aiResult" class="markdown-body text-xs text-stone-700 space-y-4 animate-fade-in" v-html="renderMarkdown(aiResult)"></div>

      <div v-else class="h-full flex flex-col items-center justify-center py-24 text-center text-zinc-400">
        <i class="fa-solid fa-brain text-3xl text-stone-200 mb-3 animate-pulse"></i>
        <p class="text-xs text-stone-800 font-semibold">AI 技術導師空間已就緒</p>
        <p class="text-[10.5px] text-zinc-400 mt-1 max-w-xs leading-relaxed font-light">直接在此貼上(Ctrl+V)錯誤影像，或是輸入技術難點發問。</p>
      </div>
    </div>

    <!-- Input Box Control Panel -->
    <div class="relative z-10 space-y-3.5 border-t border-black/[0.04] pt-4 bg-white/60 backdrop-blur-md rounded-xl p-1">
      <div v-if="attachedImg" class="flex items-center gap-2">
        <div class="relative border border-black/[0.08] rounded-xl overflow-hidden bg-stone-50 p-1 flex items-center gap-2">
          <img :src="'data:' + attachedMime + ';base64,' + attachedImg" class="h-10 w-10 object-cover rounded-lg">
          <button @click="clearImg" class="absolute top-1 right-1 bg-stone-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] shadow"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>

      <textarea v-model="aiInput" placeholder="輸入全棧開發問題 (支援拖放貼上圖片)..." class="w-full h-20 bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-stone-200 focus:outline-none rounded-xl p-3.5 text-xs font-mono transition-all resize-none" @paste="handlePaste"></textarea>
      
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <label class="cursor-pointer p-2 rounded-full hover:bg-black/5 text-zinc-500 hover:text-stone-900 transition-colors" title="上傳截圖 / 設計稿">
            <i class="fa-regular fa-image text-sm"></i>
            <input type="file" accept="image/*" @change="handleFileSelect" class="hidden">
          </label>
        </div>
        <button @click="executeAi" :disabled="isAiLoading || (!aiInput.trim() && !attachedImg)" :class="isAiLoading || (!aiInput.trim() && !attachedImg) ? 'opacity-25 bg-stone-200 text-zinc-400' : 'bg-stone-900 text-white hover:bg-stone-800'" class="px-5 py-2 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all">啟動技術智能分析</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

const emit = defineEmits(['toast', 'load-to-editor']);
const { generateReport } = useGeminiRouter();

const aiInput = ref('');
const aiResult = ref('');
const isAiLoading = ref(false);
const attachedImg = ref('');
const attachedMime = ref('');

const renderMarkdown = (text: string) => (window as any).marked ? (window as any).marked.parse(text) : text;

const handleFileSelect = (e: any) => {
  const file = e.target.files[0];
  if (file) processImage(file);
};

const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const blob = item.getAsFile();
      if (blob) {
        processImage(blob);
        emit('toast', { msg: '已自動載入截圖圖檔', type: 'success' });
      }
      break;
    }
  }
};

const processImage = (file: File) => {
  const reader = new FileReader();
  reader.onload = (event: any) => {
    const raw = event.target.result as string;
    const comma = raw.indexOf(',');
    attachedImg.value = comma > -1 ? raw.substring(comma + 1) : raw;
    attachedMime.value = file.type;
  };
  reader.readAsDataURL(file);
};

const clearImg = () => { attachedImg.value = ''; attachedMime.value = ''; };

const executeAi = async () => {
  isAiLoading.value = true;
  aiResult.value = '';
  try {
    aiResult.value = await generateReport(aiInput.value, attachedImg.value, attachedMime.value);
    emit('toast', { msg: '智慧分析報告完成', type: 'success' });
    clearImg();
  } catch (err: any) {
    emit('toast', { msg: '分析超載，請稍後重試', type: 'error' });
  } finally {
    isAiLoading.value = false;
    nextTick(() => { if ((window as any).Prism) (window as any).Prism.highlightAll(); });
  }
};

const loadPreset = () => {
  aiInput.value = "請詳細解釋什麼是 CSS 的容器查詢 (Container Queries)？它與媒體查詢 (Media Queries) 具體差別在於什麼？請提供一份簡潔的範例說明。";
  emit('toast', { msg: '範例技術提示已載入', type: 'success' });
};
</script>