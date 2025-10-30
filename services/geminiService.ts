import { GoogleGenAI, Type } from "@google/genai";
import { ApiProviderType, ChannelIdeaSet, LANGUAGES } from "../types";

const channelIdeaSetSchema = {
  type: Type.OBJECT,
  properties: {
    channelName: {
      type: Type.STRING,
      description: "Một tên kênh YouTube sáng tạo, độc đáo và hấp dẫn, bằng ngôn ngữ được yêu cầu.",
    },
    description: {
      type: Type.STRING,
      description: "Một đoạn mô tả kênh YouTube chi tiết, hấp dẫn và tối ưu SEO, bằng ngôn ngữ được yêu cầu.",
    },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "15 hashtag liên quan, bao gồm cả hashtag chung và hashtag ngách, bằng ngôn ngữ được yêu cầu.",
    },
    bannerIdea: {
      type: Type.STRING,
      description: "Mô tả chi tiết về ý tưởng cho banner của kênh (ảnh bìa), bao gồm bố cục, màu sắc, và nội dung.",
    },
    logoIdea: {
      type: Type.STRING,
      description: "Mô tả chi tiết về ý tưởng cho logo của kênh, bao gồm biểu tượng, màu sắc và phong cách.",
    },
    bannerPrompt: {
        type: Type.STRING,
        description: "Một prompt chi tiết, bằng tiếng Anh, để sử dụng với các công cụ AI tạo hình ảnh (như Midjourney, DALL-E) để tạo ra banner kênh.",
    },
    logoPrompt: {
        type: Type.STRING,
        description: "Một prompt chi tiết, bằng tiếng Anh, để sử dụng với các công cụ AI tạo hình ảnh để tạo ra logo kênh.",
    },
    channelName_vi: {
        type: Type.STRING,
        description: "Giải thích ý nghĩa hoặc concept của tên kênh bằng tiếng Việt. Chỉ cung cấp trường này nếu ngôn ngữ được yêu cầu không phải là tiếng Việt.",
    },
    description_vi: {
        type: Type.STRING,
        description: "Tóm tắt mô tả kênh bằng tiếng Việt. Chỉ cung cấp trường này nếu ngôn ngữ được yêu cầu không phải là tiếng Việt.",
    },
    bannerIdea_vi: {
        type: Type.STRING,
        description: "Giải thích ý tưởng banner bằng tiếng Việt. Chỉ cung cấp trường này nếu ngôn ngữ được yêu cầu không phải là tiếng Việt.",
    },
    logoIdea_vi: {
        type: Type.STRING,
        description: "Giải thích ý tưởng logo bằng tiếng Việt. Chỉ cung cấp trường này nếu ngôn ngữ được yêu cầu không phải là tiếng Việt.",
    }
  },
  required: ["channelName", "description", "hashtags", "bannerIdea", "logoIdea", "bannerPrompt", "logoPrompt"],
};

const finalSchema = {
    type: Type.ARRAY,
    items: channelIdeaSetSchema,
    description: "Một danh sách các bộ ý tưởng kênh hoàn chỉnh."
}

export const generateChannelAssets = async (idea: string, language: string, numResults: number, apiKey: string, model: string): Promise<ChannelIdeaSet[]> => {
  if (!apiKey) throw new Error("API Key is required.");
  
  const ai = new GoogleGenAI({ apiKey });

  const languageName = (LANGUAGES as Record<string, string>)[language] || 'Tiếng Việt';
  
  const vietnameseExplanationInstruction = language !== 'vi-VN'
    ? `4.  **Chú thích Tiếng Việt:** Vì ngôn ngữ được chọn không phải là tiếng Việt, hãy cung cấp thêm một phần giải thích ngắn gọn bằng tiếng Việt cho các mục sau: 'channelName_vi', 'description_vi', 'bannerIdea_vi', 'logoIdea_vi'.`
    : '';

  const prompt = `Bạn là một chuyên gia sáng tạo và chiến lược xây dựng kênh YouTube. Dựa trên ý tưởng sau đây, hãy tạo ra ${numResults} bộ ý tưởng kênh hoàn chỉnh và riêng biệt.
Đối với mỗi bộ ý tưởng, hãy cung cấp đầy đủ các thông tin theo cấu trúc JSON được yêu cầu.

Yêu cầu quan trọng:
1.  **Ngôn ngữ:** Phần 'channelName', 'description', và 'hashtags' PHẢI được viết bằng ngôn ngữ sau: **${languageName}**.
2.  **Prompt hình ảnh:** Phần 'bannerPrompt' và 'logoPrompt' PHẢI được viết bằng tiếng Anh để tương thích với các mô hình AI tạo hình ảnh.
3.  **Sự đa dạng:** Mỗi bộ ý tưởng phải có một hướng tiếp cận, một phong cách riêng.
${vietnameseExplanationInstruction}

Ý tưởng gốc của người dùng: "${idea}"`;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: finalSchema,
    },
  });

  const jsonText = response.text.trim();
  const parsedResponse = JSON.parse(jsonText);
  
  if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
      throw new Error("Phản hồi từ AI không phải là một danh sách các ý tưởng.");
  }
  
  return parsedResponse as ChannelIdeaSet[];
};

export const analyzeCompetitorData = async (prompt: string, excelData: string, apiKey: string, model: string): Promise<string> => {
    if (!apiKey) throw new Error("API Key is required.");

    const ai = new GoogleGenAI({ apiKey });
    
    const fullPrompt = `Bạn là một nhà phân tích dữ liệu chuyên về chiến lược YouTube. 
Nhiệm vụ của bạn là phân tích dữ liệu về các kênh đối thủ cạnh tranh và thực hiện các yêu cầu trong prompt được cung cấp.
Dữ liệu được cung cấp là nội dung của một file Excel, với mỗi sheet (tương ứng một kênh) được phân tách bằng "--- START OF SHEET: [tên sheet] ---" và "--- END OF SHEET: [tên sheet] ---". Bên trong mỗi phần là dữ liệu dạng CSV.
Hãy đưa ra một bản phân tích chi tiết, sâu sắc và các đề xuất chiến lược có thể hành động.

Prompt của người dùng:
---
${prompt}
---

Dữ liệu đối thủ từ Excel:
---
${excelData}
---

Hãy trình bày kết quả phân tích bằng tiếng Việt một cách rõ ràng, mạch lạc, sử dụng Markdown để định dạng.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: fullPrompt,
  });

  return response.text;
};

export const validateApiKey = async (provider: ApiProviderType, apiKey: string): Promise<{ success: boolean; error?: string }> => {
    if (provider === 'gemini') {
        try {
            const ai = new GoogleGenAI({ apiKey });
            // A very simple, fast, and cheap request to validate the key
            await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'h' });
            return { success: true };
        } catch (e: any) {
            console.error("Gemini Key Validation Error:", e);
            return { success: false, error: e.message || 'API Key không hợp lệ hoặc có lỗi mạng.' };
        }
    }
    if (provider === 'openai') {
        try {
            const response = await fetch("https://api.openai.com/v1/models", {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || 'Unknown OpenAI API error');
            }
            return { success: true };
        } catch (e: any) {
            console.error("OpenAI Key Validation Error:", e);
            return { success: false, error: e.message || 'API Key không hợp lệ hoặc có lỗi mạng.' };
        }
    }
    return { success: false, error: 'Provider không được hỗ trợ để xác thực.' };
};