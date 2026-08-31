import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Utensils,
  ChefHat,
  ShieldCheck,
  Flame,
  Dumbbell,
  Droplet,
  Wheat,
  Zap,
  HelpCircle,
  BookmarkPlus,
  BookOpen,
} from 'lucide-react';
import {
  MealAnalysisResult,
  CalorieReductionSuggestion,
  ReducedMealPreset,
} from '../types';

interface CalorieReductionPanelProps {
  meal: MealAnalysisResult;
  onApplyAllSwaps: () => void;
  onToggleSwap: (swapId: string) => void;
  onLogMealWithSavings: (savedKcal: number, reducedCalories: number) => void;
}

export const CalorieReductionPanel: React.FC<CalorieReductionPanelProps> = ({
  meal,
  onApplyAllSwaps,
  onToggleSwap,
  onLogMealWithSavings,
}) => {
  const [activeTab, setActiveTab] = useState<'swaps' | 'comparison' | 'recipe'>('swaps');

  // Base meal totals
  const baseCalories = Math.round(
    meal.items.reduce((acc, item) => acc + item.macros.calories, 0)
  );
  const baseProtein = Math.round(
    meal.items.reduce((acc, item) => acc + item.macros.proteinGrams, 0)
  );
  const baseCarbs = Math.round(
    meal.items.reduce((acc, item) => acc + item.macros.carbsGrams, 0)
  );
  const baseFat = Math.round(
    meal.items.reduce((acc, item) => acc + item.macros.fatGrams, 0)
  );

  // Calculate dynamic savings based on currently applied/toggled swaps
  const activeSwaps = meal.reductionSuggestions.filter((s) => s.applied);
  const dynamicCaloriesSaved = activeSwaps.reduce((acc, s) => acc + s.caloriesSaved, 0);
  const dynamicFatSaved = activeSwaps.reduce((acc, s) => acc + (s.fatSavedGrams || 0), 0);
  const dynamicCarbsSaved = activeSwaps.reduce((acc, s) => acc + (s.carbsSavedGrams || 0), 0);
  const dynamicProteinDiff = activeSwaps.reduce((acc, s) => acc + (s.proteinDifferenceGrams || 0), 0);

  const reducedCalories = Math.max(50, baseCalories - dynamicCaloriesSaved);
  const reducedFat = Math.max(0, baseFat - dynamicFatSaved);
  const reducedCarbs = Math.max(0, baseCarbs - dynamicCarbsSaved);
  const reducedProtein = Math.max(0, baseProtein + dynamicProteinDiff);

  const percentageSaved = baseCalories > 0 ? Math.round((dynamicCaloriesSaved / baseCalories) * 100) : 0;

  // Trigger celebratory confetti on high calorie reduction
  const triggerCelebration = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#34d399', '#2dd4bf', '#38bdf8', '#fbbf24'],
    });
  };

  const handleToggle = (id: string) => {
    onToggleSwap(id);
    const swap = meal.reductionSuggestions.find((s) => s.id === id);
    if (swap && !swap.applied) {
      triggerCelebration();
    }
  };

  const handleApplyAll = () => {
    onApplyAllSwaps();
    triggerCelebration();
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'ingredient_swap':
        return { label: 'Ingredient Swap', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'portion_tweak':
        return { label: 'Portion Rebalance', color: 'bg-cyan-950 text-cyan-300 border-cyan-800' };
      case 'cooking_method':
        return { label: 'Cooking Method', color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'sauce_modifier':
        return { label: 'Sauce / Dressing Swap', color: 'bg-teal-950 text-teal-300 border-teal-800' };
      case 'side_swap':
        return { label: 'Healthier Side', color: 'bg-indigo-950 text-indigo-300 border-indigo-800' };
      default:
        return { label: 'Smart Tweak', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Low-Calorie Transformation Summary */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Smart Calorie Reduction Advisor
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Reduce Calories Without Sacrificing Flavor
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Apply culinary substitutions, portion rebalancing, and lighter cooking methods tailored specifically to this meal.
            </p>
          </div>

          {/* Live Calorie Savings Meter Card */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 shadow-xl flex items-center space-x-4 min-w-[240px]">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Savings
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black font-mono text-emerald-400">
                  -{dynamicCaloriesSaved}
                </span>
                <span className="text-xs font-bold text-emerald-300 font-mono">kcal</span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold block">
                {percentageSaved}% total meal reduction
              </span>
            </div>
          </div>
        </div>

        {/* Action button row */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleApplyAll}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply All Suggested Swaps</span>
            </button>

            <button
              onClick={() => onLogMealWithSavings(dynamicCaloriesSaved, reducedCalories)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4 text-teal-400" />
              <span>Log Reduced Meal to Journal</span>
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('swaps')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'swaps' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Swaps ({meal.reductionSuggestions.length})
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'comparison' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Before vs After Simulator
            </button>
            <button
              onClick={() => setActiveTab('recipe')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'recipe' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Chef's Lean Recipe
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Interactive Swaps Checklist */}
      {activeTab === 'swaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center">
              <Zap className="w-4 h-4 mr-2 text-amber-400" />
              Targeted Low-Calorie Substitutions & Kitchen Hacks
            </h3>
            <span className="text-xs text-slate-400">
              Toggle any card to recalculate live calories
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {meal.reductionSuggestions.map((swap) => {
              const badge = getCategoryBadge(swap.category);
              return (
                <div
                  key={swap.id}
                  onClick={() => handleToggle(swap.id)}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    swap.applied
                      ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-400 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start space-x-3.5 max-w-2xl">
                    {/* Checkbox */}
                    <div
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        swap.applied
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'bg-slate-950 border-slate-700 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                          {swap.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                          Flavor: {swap.flavorImpact}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white tracking-tight">
                        {swap.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {swap.explanation}
                      </p>

                      <div className="pt-1 flex items-start space-x-2 text-xs text-emerald-400 font-medium">
                        <Utensils className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>
                          <strong>How to do it:</strong> {swap.howToApply}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Calorie impact tag on right */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 shrink-0">
                    <span className="text-xs font-semibold text-slate-400">
                      Savings
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      -{swap.caloriesSaved} kcal
                    </span>
                    {swap.fatSavedGrams && (
                      <span className="text-[11px] font-mono text-rose-400">
                        -{swap.fatSavedGrams}g fat
                      </span>
                    )}
                    {swap.carbsSavedGrams && (
                      <span className="text-[11px] font-mono text-amber-400">
                        -{swap.carbsSavedGrams}g carbs
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Before vs After Side-by-Side Simulator */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ORIGINAL MEAL CARD */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800">
                    Original As Scanned
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Standard Preparation
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-rose-400">
                    {baseCalories}
                  </span>
                  <span className="text-xs text-slate-400 block font-mono">kcal</span>
                </div>
              </div>

              {/* Macro bars */}
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Protein: {baseProtein}g</span>
                  <span className="text-cyan-400 font-bold">
                    {Math.round((baseProtein * 4 / Math.max(1, baseCalories)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, baseProtein * 2)}%` }} />
                </div>

                <div className="flex justify-between pt-1">
                  <span>Carbohydrates: {baseCarbs}g</span>
                  <span className="text-amber-400 font-bold">
                    {Math.round((baseCarbs * 4 / Math.max(1, baseCalories)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, baseCarbs)}%` }} />
                </div>

                <div className="flex justify-between pt-1">
                  <span>Total Fat: {baseFat}g</span>
                  <span className="text-rose-400 font-bold">
                    {Math.round((baseFat * 9 / Math.max(1, baseCalories)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, baseFat * 2)}%` }} />
                </div>
              </div>

              <p className="text-xs text-slate-400 pt-2 leading-relaxed">
                Standard cooking techniques, full-fat dressings, and original starch proportions.
              </p>
            </div>

            {/* OPTIMIZED LEAN MEAL CARD */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-emerald-950/40 border-2 border-emerald-500/60 shadow-2xl space-y-4 relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950">
                    AI Optimized Version
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {meal.reducedPreset.recipeTitle}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-emerald-400">
                    {reducedCalories}
                  </span>
                  <span className="text-xs text-emerald-300 block font-mono">kcal</span>
                </div>
              </div>

              {/* Macro bars */}
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Protein: {reducedProtein}g</span>
                  <span className="text-cyan-400 font-bold">
                    {Math.round((reducedProtein * 4 / Math.max(1, reducedCalories)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min(100, reducedProtein * 2)}%` }} />
                </div>

                <div className="flex justify-between pt-1">
                  <span>Carbohydrates: {reducedCarbs}g</span>
                  <span className="text-amber-400 font-bold">
                    {Math.round((reducedCarbs * 4 / Math.max(1, reducedCalories)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, reducedCarbs)}%` }} />
                </div>

                <div className="flex justify-between pt-1">
                  <span>Total Fat: {reducedFat}g</span>
                  <span className="text-rose-400 font-bold">
                    {Math.round((reducedFat * 9 / Math.max(1, reducedCalories)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: `${Math.min(100, reducedFat * 2)}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/40 text-xs text-emerald-200">
                ✨ <strong>Net Calorie Deficit Created:</strong> You save <strong>{dynamicCaloriesSaved} kcal</strong> (-{percentageSaved}%) with {activeSwaps.length} swaps active.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Chef's Lean Recipe Blueprint */}
      {activeTab === 'recipe' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <ChefHat className="w-5 h-5" />
            <span>Step-by-Step Low-Calorie Cooking Guide: {meal.reducedPreset.recipeTitle}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {meal.reducedPreset.summary}
          </p>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Preparation Adjustments:
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {meal.reducedPreset.keyTechniques.map((technique, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-start space-x-3"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span>{technique}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
