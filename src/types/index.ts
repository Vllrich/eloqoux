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
  synonyms?: string[];
  antonyms?: string[];
  etymology?: string;
  dateViewed: string;
  isSkipped?: boolean;
  isFavorite?: boolean;
}

export interface UserPreferences {
  selectedCategories: Category[];
  isOnboarded: boolean;
  wordsPerWeek?: number;
  notificationsEnabled?: boolean;
  notificationHour?: number;
  notificationMinute?: number;
}

export interface WeeklyStats {
  weekStart: string;
  wordCount: number;
  categoryBreakdown: Record<Category, number>;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

export interface QuizCard {
  wordId: string;
  term: string;
  definition: string;
  examples: WordExample[];
  category: Category;
  nextReviewDate: string;
  interval: number;
}

export type MilestoneType = 'words' | 'streak';

export interface Milestone {
  id: string;
  title: string;
  threshold: number;
  type: MilestoneType;
  achieved: boolean;
  achievedDate?: string;
}




