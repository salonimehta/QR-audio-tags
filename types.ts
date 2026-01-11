
export interface AudioMessage {
  id: string;
  title: string;
  audioData: string; // Base64
  createdAt: number;
  description?: string;
  emoji?: string;
}

export enum AppView {
  SCANNER = 'scanner',
  CREATOR = 'creator',
  LIBRARY = 'library'
}

export interface GeminiResponse {
  title: string;
  description: string;
  emoji: string;
}
