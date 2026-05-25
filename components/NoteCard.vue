<template>
  <div class="apple-card rounded-2xl p-6 relative group cursor-pointer bg-white">
    
    <!-- Meta Category Badge & Monospace Date (與圖一比例完全一致) -->
    <div class="flex items-center justify-between mb-3 text-[11px]">
      <span :class="categories[note.category]?.bg" class="px-2.5 py-1 rounded font-medium tracking-tight">
        {{ categories[note.category]?.zh }}
      </span>
      <span class="text-zinc-400 font-mono font-light">{{ formatDate(note.updatedAt) }}</span>
    </div>

    <!-- Clean Bold Heading -->
    <h3 class="text-sm font-bold text-stone-900 mb-2 leading-snug group-hover:text-stone-700 transition-colors">
      {{ note.title }}
    </h3>

    <!-- Gradient Content Preview Truncation (高度鎖死 95px，配有漸層遮罩防止代碼撐裂版面) -->
    <div class="card-preview-mask">
      <div class="markdown-body text-xs text-stone-650" v-html="renderMarkdown(note.content)"></div>
    </div>

    <!-- Card Action Buttons -->
    <div class="border-t border-black/[0.04] mt-4 pt-3 flex items-center justify-between text-[11px] text-zinc-400">
      <span class="flex items-center gap-1.5 font-light">
        <i class="fa-solid" :class="note.source === 'firebase' ? 'fa-globe text-indigo-500' : 'fa-laptop-code'"></i>
        {{ note.source === 'firebase' ? '雲端同步' : '本機儲存' }}
      </span>
      
      <div class="flex items-center gap-2">
        <button @click.stop="emit('edit', note)" class="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md spring-transition flex items-center gap-1">
          <i class="fa-solid fa-pencil text-[9px]"></i><span>編輯</span>
        </button>
        <button @click.stop="emit('delete', note)" class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-md spring-transition flex items-center gap-1">
          <i class="fa-solid fa-trash-can text-[9px]"></i><span>刪除</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  note: any;
  categories: any;
}>();

const emit = defineEmits(['edit', 'delete']);

const renderMarkdown = (text: string) => (window as any).marked ? (window as any).marked.parse(text) : text;
const formatDate = (isoStr: string) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
</script>