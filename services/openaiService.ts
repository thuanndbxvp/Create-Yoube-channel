import { ChannelIdeaSet, LANGUAGES } from "../types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const callOpenAIForJson = async (apiKey: string, model: string, messages: any[]) => {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const callOpenAIForText = async (apiKey: string, model: string, messages: any[]) => {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const generateChannelAssets = async (idea: string, language: string, numResults: number, apiKey: string, model: string): Promise<ChannelIdeaSet[]> => {
    const languageName = (LANGUAGES as Record<string, string>)[language] || 'Tiếng Việt';
    const vietnameseExplanationInstruction = language !== 'vi-VN'
    ? `Because the selected language is not Vietnamese, provide a brief explanation in Vietnamese for the following fields: 'channelName_vi', 'description_vi', 'bannerIdea_vi', 'logoIdea_vi'.`
    : `Do not provide Vietnamese explanation fields like 'channelName_vi' as the requested language is already Vietnamese.`;

    const systemPrompt = `You are a creative expert and YouTube channel building strategist. Your task is to generate ${numResults} complete and distinct channel idea sets based on a user's core idea.
You MUST return a JSON object with a single key "ideas" which is an array of these sets.
Each set must contain:
- channelName: A creative, unique, and catchy YouTube channel name in the requested language.
- description: A detailed, engaging, and SEO-optimized YouTube channel description in the requested language.
- hashtags: An array of 15 relevant hashtags, including both general and niche tags, in the requested language.
- bannerIdea: A detailed description of the idea for the channel's banner, including layout, colors, and content.
- logoIdea: A detailed description of the idea for the channel's logo, including icon, colors, and style.
- bannerPrompt: A detailed prompt in English for an image generation AI (like Midjourney, DALL-E) to create the channel banner.
- logoPrompt: A detailed prompt in English for an image generation AI to create the channel logo.
- channelName_vi (optional): Explanation of the channel name's meaning in Vietnamese. Only provide if the requested language is not Vietnamese.
- description_vi (optional): Summary of the channel description in Vietnamese. Only provide if the requested language is not Vietnamese.
- bannerIdea_vi (optional): Explanation of the banner idea in Vietnamese. Only provide if the requested language is not Vietnamese.
- logoIdea_vi (optional): Explanation of the logo idea in Vietnamese. Only provide if the requested language is not Vietnamese.

Key requirements:
1.  **Language:** 'channelName', 'description', and 'hashtags' MUST be in: **${languageName}**.
2.  **Image Prompts:** 'bannerPrompt' and 'logoPrompt' MUST be in English.
3.  **Diversity:** Each idea set must have a unique approach and style.
4.  ${vietnameseExplanationInstruction}`;

    const userPrompt = `User's core idea: "${idea}"`;

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ];

    const jsonString = await callOpenAIForJson(apiKey, model, messages);
    const result = JSON.parse(jsonString);
    
    if (!result.ideas || !Array.isArray(result.ideas)) {
         throw new Error("AI response is not in the expected format (missing 'ideas' array).");
    }
    
    return result.ideas as ChannelIdeaSet[];
};

export const analyzeCompetitorData = async (prompt: string, excelData: string, apiKey: string, model: string): Promise<string> => {
    const systemPrompt = `You are a data analyst specializing in YouTube strategy.
Your task is to analyze data about competitor channels and fulfill the requests in the provided prompt.
The data is the content of an Excel file, with each sheet (a channel) separated by "--- START OF SHEET: [sheet name] ---" and "--- END OF SHEET: [sheet name] ---". Inside each section is CSV-like data.
Provide a detailed, insightful analysis and actionable strategic recommendations. Present the analysis in Vietnamese, clearly and coherently, using Markdown for formatting.`;

    const userPrompt = `User's prompt:
---
${prompt}
---

Competitor data from Excel:
---
${excelData}
---`;
    
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ];
    
    return await callOpenAIForText(apiKey, model, messages);
};
