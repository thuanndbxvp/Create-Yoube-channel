export interface ChannelIdeaSet {
  channelName: string;
  description: string;
  hashtags: string[];
  bannerIdea: string;
  logoIdea: string;
  bannerPrompt: string;
  logoPrompt: string;
  // Optional Vietnamese explanations
  channelName_vi?: string;
  description_vi?: string;
  bannerIdea_vi?: string;
  logoIdea_vi?: string;
}

export type ResultData = ChannelIdeaSet[] | string | null;

export enum AppTab {
  GENERATOR = 'GENERATOR',
  ANALYZER = 'ANALYZER',
}

export const LANGUAGES = {
  'en-US': 'Anh (Mỹ)',
  'vi-VN': 'Việt',
  'fr-FR': 'Pháp',
  'de-DE': 'Đức',
  'it-IT': 'Ý',
  'es-ES': 'Tây Ban Nha',
  'ja-JP': 'Nhật',
  'other': 'Khác (ghi rõ trong ý tưởng)',
};


// New types for API Management
export type ApiProviderType = 'gemini' | 'openai';

export interface ApiKey {
  id: string;
  provider: ApiProviderType;
  key: string;
  displayName: string;
}

export const AVAILABLE_MODELS: Record<ApiProviderType, string[]> = {
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
  ],
  openai: [
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
  ],
};

// New type for Session Management
export interface SavedSession {
  id: string;
  name: string;
  timestamp: number;
  type: AppTab;
  data: NonNullable<ResultData>;
}

// New types for Theme Management
export type Theme = 'sky' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';

export interface ThemeColors {
  '--color-primary-300': string;
  '--color-primary-400': string;
  '--color-primary-500': string;
  '--color-primary-600': string;
  '--color-primary-700': string;
  '--color-secondary-500': string;
}