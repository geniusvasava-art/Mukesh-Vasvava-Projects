export interface MacroNutrients {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  sugarGrams?: number;
  saturatedFatGrams?: number;
  sodiumMg?: number;
  potassiumMg?: number;
  cholesterolMg?: number;
}

export interface FoodItemDetection {
  id: string;
  name: string;
  category: 'protein' | 'carbohydrate' | 'vegetable' | 'fruit' | 'dairy' | 'fat_oil' | 'sauce' | 'beverage' | 'snack_dessert' | 'composite';
  estimatedWeightGrams: number;
  originalWeightGrams: number;
  servingDescription: string;
  confidenceScore: number; // 0-100
  macros: MacroNutrients;
  per100g: MacroNutrients;
  boundingBox?: {
    top: number; // percentage 0-100
    left: number; // percentage 0-100
    width: number; // percentage 0-100
    height: number; // percentage 0-100
  };
  notes?: string;
}

export interface CalorieReductionSuggestion {
  id: string;
  title: string;
  category: 'ingredient_swap' | 'portion_tweak' | 'cooking_method' | 'side_swap' | 'sauce_modifier' | 'smart_removal';
  caloriesSaved: number;
  fatSavedGrams?: number;
  carbsSavedGrams?: number;
  sugarSavedGrams?: number;
  fiberGrams?: number;
  proteinDifferenceGrams?: number;
  applied: boolean;
  explanation: string;
  howToApply: string;
  flavorImpact: 'Virtually identical' | 'Mild difference' | 'Fresh & crisp twist' | 'Rich & lighter';
  difficulty: 'Super Easy' | 'Quick Swap' | 'Cooking Adjustment';
}

export interface ReducedMealPreset {
  recipeTitle: string;
  summary: string;
  totalCalories: number;
  originalCalories: number;
  calorieSavingsTotal: number;
  percentageSaved: number;
  macros: MacroNutrients;
  keyTechniques: string[];
}

export interface MealAnalysisResult {
  id: string;
  timestamp: string;
  mealName: string;
  overallDescription: string;
  imageUrl?: string;
  items: FoodItemDetection[];
  totalMacros: MacroNutrients;
  healthRating: {
    score: number; // 1 to 10
    nutriGrade: 'A' | 'B' | 'C' | 'D' | 'E';
    glycemicIndex: 'Low' | 'Medium' | 'High';
    calorieDensity: 'Low (<1.5 kcal/g)' | 'Moderate (1.5-3 kcal/g)' | 'High (3-5 kcal/g)' | 'Very High (>5 kcal/g)';
    positives: string[];
    concerns: string[];
  };
  reductionSuggestions: CalorieReductionSuggestion[];
  reducedPreset: ReducedMealPreset;
  portionEstimateNotes: string;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface LoggedMeal {
  id: string;
  date: string; // ISO date string
  mealCategory: MealCategory;
  name: string;
  imageUrl?: string;
  totalCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  appliedSwapsCount: number;
  caloriesSaved: number;
  itemsCount: number;
}

export interface DailyNutritionGoal {
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
}
