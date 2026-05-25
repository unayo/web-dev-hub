export const useFirebaseFallback = () => {
  const notes = useState<any[]>('notes-stream', () => []);
  const isFirestoreBlocked = useState<boolean>('firestore-status', () => false);

  const syncSaveNote = async (id: string, payload: { title: string; category: string; content: string }) => {
    const notePayload = {
      ...payload,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = notes.value.findIndex(n => n.id === id);
    const updatedPayload = { ...notePayload, id, source: 'local' };
    
    if (existingIndex > -1) {
      notes.value[existingIndex] = updatedPayload;
    } else {
      notes.value.unshift(updatedPayload);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('web_dev_hub_notes_nuxt', JSON.stringify(notes.value));
    }
    return { success: true, cloud: false };
  };

  const syncDeleteNote = async (id: string) => {
    notes.value = notes.value.filter(n => n.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('web_dev_hub_notes_nuxt', JSON.stringify(notes.value));
    }
    return true;
  };

  const loadLocalStorage = () => {
    if (typeof window === 'undefined') return;
    const localData = localStorage.getItem('web_dev_hub_notes_nuxt');
    if (localData) {
      notes.value = JSON.parse(localData);
    } else {
      // 封裝安全十六進位 Unicode 轉義字元 \x60 防範編譯意外截斷
      notes.value = [
        {
          id: 'mock-1',
          title: '⚡ TypeScript 進階：利用 Mapped Types 構建安全過濾接口',
          category: 'essentials',
          content: '在寫複雜的全棧架構時，TypeScript 的 Mapped Types 與泛型約束是極佳防護工具。\n\n\x60\x60\x60typescript\ntype ReadOnlyProps<T> = {\n  readonly [P in keyof T]: T[P];\n};\n\x60\x60\x60',
          updatedAt: new Date().toISOString(),
          source: 'local'
        },
        {
          id: 'mock-2',
          title: '🎨 現代 CSS：完美的自適應毛玻璃效果 (Glassmorphism)',
          category: 'styling',
          content: '利用 CSS 的 \x60backdrop-filter\x60 與極薄的白邊框，可以在瀏覽器中完美復刻 Apple 設計的高級感。',
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          source: 'local'
        }
      ];
      localStorage.setItem('web_dev_hub_notes_nuxt', JSON.stringify(notes.value));
    }
  };

  return {
    notes,
    isFirestoreBlocked,
    syncSaveNote,
    syncDeleteNote,
    loadLocalStorage
  };
};