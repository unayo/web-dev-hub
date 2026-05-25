export const useGeminiRouter = () => {
  const customApiKey = useState<string>('gemini-api-key', () => {
    return typeof window !== 'undefined' ? localStorage.getItem('web_dev_hub_gemini_key') || '' : '';
  });

  const generateReport = async (prompt: string, imageBase64 = '', imageMimeType = '') => {
    const apiKey = customApiKey.value || '';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    let systemInstruction = "你是一位精通 Web 全棧開發的頂尖技術專家。";
    if (imageBase64) {
      systemInstruction += "請針對使用者附加的截圖進行視覺排查，強制輸出：### 👁️ 視覺診斷發現、### 🛠️ 診斷修復代碼、### 💡 核心避坑盲點。";
    } else if (prompt.toLowerCase().match(/(error|bug|crash|exception|fail|除錯|error)/)) {
      systemInstruction += "請診斷此 Bug，強制輸出：### 💻 核心病灶、### 🛠️ 解決方案與最佳實踐、### 💡 觀念舉一反三。";
    } else {
      systemInstruction += "請解答觀念，強制輸出：### 📝 核心概念、### 🛠️ 實戰代碼示範、### 💡 常見盲點與延伸。";
    }

    const payload = {
      contents: [{
        parts: [
          ...(imageBase64 ? [{ inlineData: { mimeType: imageMimeType, data: imageBase64 } }] : []),
          { text: prompt }
        ]
      }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("AI Engine Overloaded");
    const result = await response.json();
    return result?.candidates?.[0]?.content?.parts?.[0]?.text || "無效的 AI 解析回傳";
  };

  const polishDraft = async (content: string) => {
    const apiKey = customApiKey.value || '';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: content }] }],
      systemInstruction: { parts: [{ text: "你是一位技術隨筆美化助手。請直接將草稿潤飾成排版完美的 Markdown 本文，嚴禁帶有任何寒暄前言與後語。" }] }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return result?.candidates?.[0]?.content?.parts?.[0]?.text || content;
  };

  return {
    customApiKey,
    generateReport,
    polishDraft
  };
};