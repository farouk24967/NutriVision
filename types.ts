export interface NutrientInfo {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
}

export interface FoodItem extends NutrientInfo {
  id: string;
  name: string;
  confidence?: number;
  portionSize?: string; // e.g., "100g" or "1 bowl"
  imageUrl?: string;
  timestamp: Date;
}

export type SubscriptionTier = 'free' | 'pro' | 'elite';

export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  age: number;
  weight: number; // kg
  height: number; // cm
  goal: 'weight_loss' | 'maintenance' | 'muscle_gain';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  streak: number;
  lastActiveDate: string; // ISO Date string
  lastQuizDate?: string; // ISO Date string for the last completed daily challenge
  points: number;
  subscription: SubscriptionTier;
  subscriptionExpiry?: string;
}

export interface MealPlanItem {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  description: string;
  nutrients: NutrientInfo;
}

export interface DailyPlan {
  day: string;
  meals: MealPlanItem[];
}

export interface WeeklyPlan {
  week: DailyPlan[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type ViewState = 'dashboard' | 'scanner' | 'planner' | 'profile' | 'premium';

export type Language = 'en' | 'fr' | 'es' | 'de' | 'ar';

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}