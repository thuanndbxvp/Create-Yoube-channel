
export interface ChannelAssets {
  channelNames: string[];
  description: string;
  hashtags: string[];
  thumbnailSuggestion: string;
  logoSuggestion: string;
}

export type ResultData = ChannelAssets | string | null;

export enum AppTab {
  GENERATOR = 'GENERATOR',
  ANALYZER = 'ANALYZER',
}
