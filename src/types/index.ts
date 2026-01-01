export type Category = 
  | 'Technology'
  | 'Politics and society'
  | 'Psychology and behaviour'
  | 'Environment and sustainability'
  | 'Languages and linguistics'
  | 'Gastronomy'
  | 'Travel and cultures'
  | 'Medicine and health'
  | 'Business and entrepreneurship';

export interface WordExample {
  sentence: string;
  context?: string;
}

export interface Word {
  id: string;
  term: string;
  category: Category;
  definition: string;
  examples: WordExample[];
  dateViewed: string;
  isSkipped?: boolean;
}

export interface UserPreferences {
  selectedCategories: Category[];
  isOnboarded: boolean;
  wordsPerWeek?: number;
}

export interface WeeklyStats {
  weekStart: string;
  wordCount: number;
  categoryBreakdown: Record<Category, number>;
}




