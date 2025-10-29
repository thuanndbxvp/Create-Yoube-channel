import { GoogleGenAI, Type } from "@google/genai";
import { ChannelAssets } from "../types";

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this example, we'll throw an error if the key is not found.
  throw new Error("API_KEY not found in environment variables");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const channelAssetsSchema = {
  type: Type.OBJECT,
  properties: {
    channelNames: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 tên kênh YouTube sáng tạo, độc đáo và hấp dẫn.",
    },
    description: {
      type: Type.STRING,
      description: "Một đoạn mô tả kênh YouTube chi tiết, hấp dẫn và tối ưu SEO.",
    },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "15 hashtag liên quan, bao gồm cả hashtag chung và hashtag ngách.",
    },
    thumbnailSuggestion: {
      type: Type.STRING,
      description: "Mô tả chi tiết về phong cách thumbnail cho kênh, bao gồm bố cục, màu sắc, font chữ và hình ảnh.",
    },
    logoSuggestion: {
      type: Type.STRING,
      description: "Mô tả chi tiết về ý tưởng logo cho kênh, bao gồm biểu tượng, màu sắc và phong cách.",
    },
  },
  required: ["channelNames", "description", "hashtags", "thumbnailSuggestion", "logoSuggestion"],
};

export const generateChannelAssets = async (idea: string): Promise<ChannelAssets> => {
  const prompt = `Bạn là một chuyên gia chiến lược xây dựng kênh YouTube. Dựa trên ý tưởng sau đây, hãy tạo ra các nội dung cần thiết.
Ý tưởng: "${idea}"
Hãy cung cấp kết quả bằng tiếng Việt.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: channelAssetsSchema,
    },
  });

  const jsonText = response.text.trim();
  const parsedResponse = JSON.parse(jsonText);
  
  // Basic validation to ensure the response shape matches ChannelAssets
  if (
    !parsedResponse.channelNames ||
    !parsedResponse.description ||
    !parsedResponse.hashtags ||
    !parsedResponse.thumbnailSuggestion ||
    !parsedResponse.logoSuggestion
  ) {
    throw new Error("Phản hồi từ AI không đúng định dạng mong muốn.");
  }
  
  return parsedResponse as ChannelAssets;
};

export const analyzeCompetitorData = async (prompt: string, excelData: string): Promise<string> => {
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
    model: "gemini-2.5-pro",
    contents: fullPrompt,
  });

  return response.text;
};