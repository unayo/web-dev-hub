<template>
  <div class="w-full flex flex-col">
    
    <!-- Segmented Tab Switcher (完全復刻圖一效果：在所有螢幕尺寸均由圓角 Pill 切換) -->
    <div class="bg-black/[0.04] p-1 rounded-2xl flex w-full max-w-md mx-auto mb-8 shadow-inner select-none shrink-0">
      <button 
        @click="activeTab = 'notes'" 
        :class="activeTab === 'notes' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-zinc-500 hover:text-stone-800'"
        class="flex-1 py-2 rounded-xl text-center text-xs transition-all duration-300 flex items-center justify-center gap-2"
      >
        <i class="fa-solid fa-book-bookmark text-[10px]"></i> 
        技術隨筆 ({{ filteredNotes.length }})
      </button>
      <button 
        @click="activeTab = 'ai'" 
        :class="activeTab === 'ai' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-zinc-500 hover:text-stone-800'"
        class="flex-1 py-2 rounded-xl text-center text-xs transition-all duration-300 flex items-center justify-center gap-2"
      >
        <i class="fa-solid fa-wand-magic-sparkles text-[10px]"></i> 
        AI 智慧導師
      </button>
    </div>

    <!-- VIEWPORT 1: TECHNICAL NOTES STREAM -->
    <div v-show="activeTab === 'notes'" class="flex flex-col space-y-5 w-full animate-fade-in">
      
      <!-- Search & Filter Console -->
      <div class="bg-white border border-black/[0.04] rounded-2xl p-6 space-y-4 shadow-sm">
        <div class="relative">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜尋隨筆..." 
            class="w-full pl-9 pr-9 py-2.5 bg-[#f5f5f7] border border-transparent focus:border-stone-200 focus:bg-white focus:outline-none rounded-lg text-xs text-stone-900 placeholder-stone-400 spring-transition"
          >
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-stone-900 spring-transition text-xs">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none text-xs">
          <button @click="selectCategory('all')" :class="selectedCategory === 'all' ? 'bg-stone-900 text-white font-semibold' : 'bg-black/5 text-zinc-500'" class="px-3.5 py-1.5 rounded-lg spring-transition whitespace-nowrap">全部</button>
          <button v-for="(val, key) in categories" :key="key" @click="selectCategory(key)" :class="selectedCategory === key ? 'bg-stone-900 text-white font-semibold' : 'bg-black/5 text-zinc-500'" class="px-3.5 py-1.5 rounded-lg spring-transition whitespace-nowrap flex items-center gap-2">
            <span :class="val.color" class="w-2 h-2 rounded-full"></span>
            {{ val.zh }}
          </button>
        </div>
      </div>

      <!-- COLLAPSIBLE "撰寫隨筆" CARD - Image 1 Drawer Style -->
      <div class="apple-card rounded-2xl overflow-hidden transition-all duration-300">
        <div @click="isDraftExpanded = !isDraftExpanded" class="p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-stone-50/50 transition-colors">
          <div class="flex items-center gap-3">
            <i class="fa-regular fa-pen-to-square text-stone-700"></i>
            <span class="text-xs font-bold text-stone-900">撰寫隨筆</span>
          </div>
          <div class="flex items-center gap-2.5 text-[11px] font-normal text-zinc-400">
            <span>{{ isDraftExpanded ? '點擊此處收合' : '點擊展開速寫' }}</span>
            <i class="fa-solid text-[10px]" :class="isDraftExpanded ? 'fa-minus' : 'fa-plus'"></i>
          </div>
        </div>

        <div v-show="isDraftExpanded" class="border-t border-black/[0.04] p-6 bg-white space-y-4">
          <div class="flex flex-col sm:flex-row gap-3">
            <input v-model="quickNoteTitle" type="text" placeholder="隨筆標題 (如：TS 泛型技巧)" class="flex-grow bg-[#f5f5f7] border border-transparent focus:border-stone-200 focus:bg-white focus:outline-none px-4 py-2.5 text-xs text-stone-900 rounded-lg spring-transition" />
            <select v-model="quickNoteCategory" class="bg-[#f5f5f7] border border-transparent text-xs text-stone-700 rounded-lg px-3 py-2.5 focus:outline-none cursor-pointer">
              <option v-for="(val, key) in categories" :key="key" :value="key">{{ val.zh }}</option>
            </select>
          </div>
          <textarea v-model="quickNoteContent" placeholder="在此寫入 Markdown 內容與程式碼..." class="w-full h-32 bg-[#f5f5f7] border border-transparent focus:border-stone-200 focus:bg-white focus:outline-none p-3.5 text-xs text-stone-900 rounded-lg font-mono resize-none spring-transition"></textarea>
          <div class="flex justify-end">
            <button @click="saveQuickNote" :disabled="!quickNoteTitle.trim() || !quickNoteContent.trim()" class="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white disabled:opacity-20 font-semibold text-xs rounded-full spring-transition">儲存並發布</button>
          </div>
        </div>
      </div>

      <!-- NOTES LIST STREAM -->
      <div class="flex flex-col space-y-4 pr-1">
        <TransitionGroup name="note-list">
          <NoteCard v-for="note in filteredNotes" :key="note.id" :note="note" :categories="categories" @click="openReaderModal(note)" @edit="openEditModal" @delete="confirmDeleteNote" />
        </TransitionGroup>
        
        <div v-if="filteredNotes.length === 0" class="border border-dashed border-stone-200 rounded-2xl p-12 text-center text-zinc-400 bg-white">
          <i class="fa-solid fa-folder-open text-2xl mb-2 text-stone-300"></i>
          <p class="text-xs">未找到任何相關隨筆</p>
        </div>
      </div>
    </div>

    <!-- VIEWPORT 2: AI CO-PILOT WORKSPACE -->
    <div v-show="activeTab === 'ai'" class="w-full animate-fade-in">
      <AiCopilot @toast="(p) => emit('toast', p)" @load-to-editor="loadAiResult" />
    </div>

    <!-- MODAL 1: HIGH CLASS READ-ONLY VIEWER -->
    <div v-if="showReaderModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div @click="showReaderModal = false" class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div class="bg-white border border-black/[0.05] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 spring-transition max-h-[85vh] flex flex-col">
        <div class="px-8 py-5 border-b border-black/[0.04] flex items-center justify-between bg-stone-50/50 shrink-0">
          <div class="flex items-center gap-3">
            <span :class="categories[activeNoteForView?.category]?.bg" class="px-3 py-1 rounded text-xs font-medium">{{ categories[activeNoteForView?.category]?.zh }}</span>
            <span class="text-xs text-zinc-400 font-mono">{{ formatDate(activeNoteForView?.updatedAt) }}</span>
          </div>
          <button @click="showReaderModal = false" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-zinc-400 hover:text-stone-950"><i class="fa-solid fa-xmark text-sm"></i></button>
        </div>
        <div class="p-8 overflow-y-auto flex-grow bg-white">
          <h2 class="text-lg font-bold text-stone-900 mb-5 leading-snug">{{ activeNoteForView?.title }}</h2>
          <div class="markdown-body text-sm text-stone-800 leading-relaxed" v-html="renderMarkdown(activeNoteForView?.content)"></div>
        </div>
        <div class="px-8 py-5 border-t border-black/[0.04] flex items-center justify-end gap-3 bg-stone-50 shrink-0">
          <button @click="showReaderModal = false" class="px-5 py-2.5 bg-black/5 hover:bg-black/[0.08] rounded-full text-xs text-stone-700 font-medium">關閉</button>
          <button @click="switchToEditFromReader" class="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-full">編輯此隨筆</button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: WRITE / EDIT COMPOSER -->
    <div v-if="showWriteModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div @click="showWriteModal = false" class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div class="bg-white border border-black/[0.05] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10 spring-transition max-h-[90vh] flex flex-col">
        <div class="px-8 py-5 border-b border-black/[0.04] flex items-center justify-between bg-stone-50/50 shrink-0">
          <h3 class="font-semibold text-xs text-stone-900">{{ isEditing ? '修改技術隨筆內容' : '撰寫全新技術隨筆' }}</h3>
          <button @click="showWriteModal = false" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-zinc-400 hover:text-stone-950"><i class="fa-solid fa-xmark text-sm"></i></button>
        </div>
        <div class="p-8 space-y-6 overflow-y-auto flex-grow">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">隨筆標題</label>
              <input type="text" v-model="form.title" class="w-full px-4 py-3 bg-[#f5f5f7] border border-transparent focus:border-stone-200 focus:bg-white focus:outline-none rounded-xl text-xs text-stone-900 spring-transition">
            </div>
            <div class="space-y-2">
              <label class="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">技術類別</label>
              <select v-model="form.category" class="w-full px-4 py-3 bg-[#f5f5f7] border border-transparent focus:border-stone-200 focus:bg-white focus:outline-none rounded-xl text-xs text-stone-700 cursor-pointer">
                <option v-for="(val, key) in categories" :key="key" :value="key">{{ val.zh }}</option>
              </select>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">隨筆本文 (Markdown)</label>
              <button @click="runEnhance" :disabled="isEnhancing || !form.content.trim()" class="text-[10.5px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 disabled:opacity-20 font-medium">
                <i class="fa-solid fa-wand-magic-sparkles" :class="isEnhancing ? 'animate-spin' : ''"></i>
                <span>{{ isEnhancing ? 'AI 正在極光潤飾...' : 'AI 格式潤飾與擴寫' }}</span>
              </button>
            </div>
            <textarea v-model="form.content" class="w-full h-56 bg-[#f5f5f7] border border-transparent focus:border-stone-200 focus:bg-white focus:outline-none rounded-xl p-4 text-xs text-stone-900 font-mono resize-none spring-transition"></textarea>
          </div>
        </div>
        <div class="px-8 py-5 border-t border-black/[0.04] flex items-center justify-end gap-3 bg-stone-50 shrink-0">
          <button @click="showWriteModal = false" class="px-5 py-2.5 bg-black/5 rounded-full text-xs text-stone-700 font-medium">取消</button>
          <button @click="saveStandardNote" :disabled="!form.title.trim() || !form.content.trim()" class="px-5 py-2.5 bg-stone-900 text-white font-semibold text-xs rounded-full">確認發布</button>
        </div>
      </div>
    </div>

    <!-- MODAL 3: ELEGANT DELETE CONFIRMATION -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div @click="showDeleteModal = false" class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div class="relative z-10 bg-white border border-black/[0.05] rounded-3xl w-full max-w-xs p-6 space-y-4 text-center">
        <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100"><i class="fa-solid fa-trash-can text-sm"></i></div>
        <div class="space-y-1">
          <h3 class="font-semibold text-stone-900 text-xs">確認永久刪除這份隨筆？</h3>
          <p class="text-[10.5px] text-zinc-400 font-light">該項目將自本機與同步雲端永久移除。</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="showDeleteModal = false" class="w-1/2 py-2 bg-black/5 rounded-full text-xs text-stone-700 font-medium">保留</button>
          <button @click="executeDelete" class="w-1/2 py-2 bg-red-600 text-white font-semibold rounded-full text-xs">確認刪除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue';

const { notes, syncSaveNote, syncDeleteNote, loadLocalStorage } = useFirebaseFallback();
const { polishDraft } = useGeminiRouter();

const emit = defineEmits(['toast']);

const activeTab = ref<string>('notes'); // 切換隨筆與 AI 面板
const searchQuery = ref('');
const selectedCategory = ref<string>('all'); 
const isDraftExpanded = ref(false);
const isEnhancing = ref(false);

const showWriteModal = ref(false);
const showDeleteModal = ref(false);
const showReaderModal = ref(false);
const isEditing = ref(false);

const quickNoteTitle = ref('');
const quickNoteContent = ref('');
const quickNoteCategory = ref('essentials');

const form = reactive({
  id: '',
  title: '',
  category: 'essentials',
  content: ''
});

const activeNoteForDelete = ref<any>(null);
const activeNoteForView = ref<any>(null);

// 導入極強型別介面宣告，完美消除 categories[index] 印表機紅字
interface CategoryValue {
  zh: string;
  bg: string;
  color: string;
}

const categories: Record<string, CategoryValue> = {
  essentials: { zh: 'JS & TS 原生系統', bg: 'bg-indigo-50 text-indigo-700 border border-indigo-100', color: 'bg-indigo-500' },
  styling: { zh: 'CSS 佈局與美學', bg: 'bg-pink-50 text-pink-700 border border-pink-100', color: 'bg-pink-500' },
  frameworks: { zh: '現代框架與架構', bg: 'bg-purple-50 text-purple-700 border border-purple-100', color: 'bg-purple-500' },
  troubleshoot: { zh: '踩坑診斷與除錯', bg: 'bg-amber-50 text-amber-700 border border-amber-100', color: 'bg-amber-500' },
  snippets: { zh: '實用工具與算法', bg: 'bg-sky-50 text-sky-700 border border-sky-100', color: 'bg-sky-500' }
};

const selectCategory = (cat: string) => {
  selectedCategory.value = cat;
  triggerHighlight();
};

const filteredNotes = computed(() => {
  let result = notes.value;
  if (selectedCategory.value !== 'all') {
    result = result.filter(n => n.category === selectedCategory.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }
  return result;
});

const renderMarkdown = (text: string) => (window as any).marked ? (window as any).marked.parse(text) : text;
const formatDate = (isoStr: string) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

const triggerHighlight = () => {
  nextTick(() => {
    if ((window as any).Prism) (window as any).Prism.highlightAll();
  });
};

const saveQuickNote = async () => {
  const targetId = 'note-' + crypto.randomUUID();
  await syncSaveNote(targetId, {
    title: quickNoteTitle.value.trim(),
    category: quickNoteCategory.value,
    content: quickNoteContent.value.trim()
  });
  emit('toast', { msg: '技術隨筆已成功發布！', type: 'success' });
  quickNoteTitle.value = '';
  quickNoteContent.value = '';
  isDraftExpanded.value = false;
  triggerHighlight();
};

const openReaderModal = (note: any) => {
  activeNoteForView.value = note;
  showReaderModal.value = true;
  triggerHighlight();
};

const switchToEditFromReader = () => {
  const note = activeNoteForView.value;
  showReaderModal.value = false;
  openEditModal(note);
};

const openEditModal = (note: any) => {
  isEditing.value = true;
  form.id = note.id;
  form.title = note.title;
  form.category = note.category;
  form.content = note.content;
  showWriteModal.value = true;
};

const saveStandardNote = async () => {
  const targetId = form.id || 'note-' + crypto.randomUUID();
  await syncSaveNote(targetId, {
    title: form.title,
    category: form.category,
    content: form.content
  });
  emit('toast', { msg: '標準隨筆已儲存同步完成', type: 'success' });
  showWriteModal.value = false;
  triggerHighlight();
};

const runEnhance = async () => {
  isEnhancing.value = true;
  try {
    form.content = await polishDraft(form.content);
    emit('toast', { msg: 'AI 格式美化潤飾完畢！', type: 'success' });
  } catch (e) {
    emit('toast', { msg: 'AI 潤飾連線逾時', type: 'error' });
  } finally {
    isEnhancing.value = false;
    triggerHighlight();
  }
};

const confirmDeleteNote = (note: any) => {
  activeNoteForDelete.value = note;
  showDeleteModal.value = true;
};

const executeDelete = async () => {
  if (activeNoteForDelete.value) {
    await syncDeleteNote(activeNoteForDelete.value.id);
    emit('toast', { msg: '隨筆項目已永久移除', type: 'success' });
    showDeleteModal.value = false;
    activeNoteForDelete.value = null;
  }
};

const loadAiResult = (content: string) => {
  activeTab.value = 'notes'; // 回到隨筆頁面
  isDraftExpanded.value = true; // 打開速寫區
  quickNoteTitle.value = '✨ AI 智慧問答診斷存檔';
  quickNoteCategory.value = 'snippets';
  quickNoteContent.value = content;
  triggerHighlight();
};

onMounted(() => {
  loadLocalStorage();
  triggerHighlight();
});
</script>

<style>
.note-list-enter-active, .note-list-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.note-list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.note-list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(5px);
}
.note-list-move {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>