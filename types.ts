export enum ImageSize {
  Size1K = '1K',
  Size2K = '2K',
  Size4K = '4K'
}

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  description: string;
  visualPrompt: string;
  generatedImageUrl?: string;
  isLoading: boolean;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Extend the Window interface to include the AI Studio global
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}