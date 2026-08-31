import React, { useState } from 'react';
import {
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Salad,
  Sparkles,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Info,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Minus,
  ArrowRight,
} from 'lucide-react';
import { FoodItemDetection, MealAnalysisResult, MacroNutrients } from '../types';

interface NutritionBreakdownProps {
  meal: MealAnalysisResult;
  onUpdateItemWeight: (itemId: string, newWeightGrams: number) => void;
  onResetWeights: () => void;
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onGoToReduction: () => void;
}

export const NutritionBreakdown: React.FC<NutritionBreakdownProps> = ({
  meal,
  onUpdateItemWeight,
  onResetWeights,
  selectedItemId,
  onSelectItem,
  onGoToReduction,
}) => {
  const [showMicros, setShowMicros] = useState<boolean>(false);

  // Compute live totals from the items list based on current portion slider weights
  const currentTotalCalories = Math.round(
    meal.items.reduce((acc, item) => acc + item.macros.calories, 0)
  );
  const currentTotalProtein = Math.round(
    meal.items.reduce((acc, item) => acc + item.macros.proteinGrams, 0)
  );
  const currentTotalCarbs = Math.round(
    meal.items.reduce((acc, item) => acc + item.macros.carbsGrams, 0)
  );
  const currentTotalFat = Math.round(
    meal.items.reduce((acc, item) => acc + item.macros.fatGrams, 0)
  );
  const currentTotalFiber = Math.round(
    meal.items.reduce((acc, item) => acc + (item.macros.fiberGrams || 0), 0)
  );
  const currentTotalSugar = Math.round(
    meal.items.reduce((acc, item) => acc + (item.macros.sugarGrams || 0), 0)
  );
  const currentTotalSodium = Math.round(
    meal.items.reduce((acc, item) => acc + (item.macros.sodiumMg || 0), 0)
  );
  const currentTotalSatFat = Math.round(
    meal.items.reduce((acc, item) => acc + (item.macros.saturatedFatGrams || 0), 0)
  );

  // Macro calorie energy contribution percentages
  const proteinKcal = currentTotalProtein * 4;
  const carbsKcal = currentTotalCarbs * 4;
  const fatKcal = currentTotalFat * 9;
  const sumMacroKcal = Math.max(1, proteinKcal + carbsKcal + fatKcal);

  const proteinPct = Math.round((proteinKcal / sumMacroKcal) * 100);
  const carbsPct = Math.round((carbsKcal / sumMacroKcal) * 100);
  const fatPct = Math.round((fatKcal / sumMacroKcal) * 100);

  // Nutri-Grade Color Palette
  const getNutriGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-500 text-slate-950';
      case 'B':
        return 'bg-teal-400 text-slate-950';
      case 'C':
        return 'bg-amber-400 text-slate-950';
      case 'D':
        return 'bg-orange-500 text-white';
      case 'E':
        return 'bg-rose-500 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Meal Summary Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                AI Vision Verified
              </span>
              <span
                className={`px-3 py-0.5 rounded-md text-xs font-black uppercase tracking-wider ${getNutriGradeBadge(
                  meal.healthRating.nutriGrade
                )}`}
              >
                Nutri-Grade {meal.healthRating.nutriGrade}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300">
                Glycemic Index: {meal.healthRating.glycemicIndex}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {meal.mealName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {meal.overallDescription}
            </p>
          </div>

          {/* Large Hero Calorie Metric Box */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estimated Energy
              </span>
              <div className="flex items-baseline justify-end space-x-1">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                  {currentTotalCalories}
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">kcal</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {meal.healthRating.calorieDensity}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Flame className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Action button to Calorie Reduction suggestions */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>
              AI identified <strong className="text-emerald-400">{meal.reductionSuggestions.length} low-calorie reduction swaps</strong> for this meal!
            </span>
          </div>

          <button
            onClick={onGoToReduction}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <span>See How to Reduce Calories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Core Macronutrient Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Protein */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300">Protein</span>
            </div>
            <span className="text-xs font-mono font-semibold text-cyan-400">
              {proteinPct}% kcal
            </span>
          </div>

          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-white">
              {currentTotalProtein}
            </span>
            <span className="text-xs text-slate-400">grams</span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentTotalProtein / 50) * 100)}%` }}
            />
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/50">
                <Wheat className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300">Carbs</span>
            </div>
            <span className="text-xs font-mono font-semibold text-amber-400">
              {carbsPct}% kcal
            </span>
          </div>

          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-white">
              {currentTotalCarbs}
            </span>
            <span className="text-xs text-slate-400">grams</span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentTotalCarbs / 100) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fat & Lipids */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/50">
                <Droplet className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300">Total Fat</span>
            </div>
            <span className="text-xs font-mono font-semibold text-rose-400">
              {fatPct}% kcal
            </span>
          </div>

          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-white">
              {currentTotalFat}
            </span>
            <span className="text-xs text-slate-400">grams</span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentTotalFat / 40) * 100)}%` }}
            />
          </div>
        </div>

        {/* Dietary Fiber */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                <Salad className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300">Dietary Fiber</span>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              Satiety Factor
            </span>
          </div>

          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-white">
              {currentTotalFiber}
            </span>
            <span className="text-xs text-slate-400">grams</span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentTotalFiber / 15) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Food Portion Weights & Sliders Section */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center">
              <Sliders className="w-4 h-4 mr-2 text-emerald-400" />
              Interactive Portion Tuner (Real-time Macro Recalculation)
            </h3>
            <p className="text-xs text-slate-400">
              Drag weights up or down to calibrate your exact serving size. Macros adjust automatically!
            </p>
          </div>

          <button
            onClick={onResetWeights}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition border border-slate-700/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Weights</span>
          </button>
        </div>

        {/* Item Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {meal.items.map((item) => {
            const isSelected = selectedItemId === item.id;
            const weight = item.estimatedWeightGrams;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                      {item.category.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{item.name}</h4>
                    <p className="text-[11px] text-slate-400">{item.servingDescription}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-emerald-400">
                      {Math.round(item.macros.calories)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">kcal</span>
                  </div>
                </div>

                {/* Macro pill summary */}
                <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-300 py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-800/80 mb-3">
                  <span>
                    P: <strong className="text-cyan-400">{Math.round(item.macros.proteinGrams)}g</strong>
                  </span>
                  <span>•</span>
                  <span>
                    C: <strong className="text-amber-400">{Math.round(item.macros.carbsGrams)}g</strong>
                  </span>
                  <span>•</span>
                  <span>
                    F: <strong className="text-rose-400">{Math.round(item.macros.fatGrams)}g</strong>
                  </span>
                </div>

                {/* Interactive Slider & Stepper */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Serving Weight:</span>
                    <span className="text-white font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {weight} grams
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateItemWeight(item.id, Math.max(10, weight - 20));
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="range"
                      min="10"
                      max="600"
                      step="5"
                      value={weight}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onUpdateItemWeight(item.id, parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateItemWeight(item.id, Math.min(800, weight + 20));
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick percentage adjustment chips */}
                  <div className="flex items-center justify-end space-x-1 pt-1">
                    {[0.5, 0.75, 1.0, 1.25].map((factor) => (
                      <button
                        key={factor}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateItemWeight(item.id, Math.round(item.originalWeightGrams * factor));
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800/80 hover:bg-emerald-950 hover:text-emerald-300 text-slate-400 border border-slate-700/50 transition"
                      >
                        {factor * 100}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Health Strengths & Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positives */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Nutritional Strengths</span>
          </div>
          <ul className="space-y-1.5">
            {meal.healthRating.positives.map((pos, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{pos}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Nutritional concerns */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Optimization Opportunities</span>
          </div>
          <ul className="space-y-1.5">
            {meal.healthRating.concerns.map((con, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Expandable Micronutrient Panel */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={() => setShowMicros(!showMicros)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition"
        >
          <span className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>Detailed Micronutrients (Sodium, Saturated Fat, Sugar)</span>
          </span>
          {showMicros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showMicros && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 mt-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Sodium</span>
              <span className="text-base font-black font-mono text-white">
                {currentTotalSodium} mg
              </span>
              <span className="text-[10px] text-slate-500 block">
                ~{Math.round((currentTotalSodium / 2300) * 100)}% daily limit
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Saturated Fat</span>
              <span className="text-base font-black font-mono text-white">
                {currentTotalSatFat} g
              </span>
              <span className="text-[10px] text-slate-500 block">
                ~{Math.round((currentTotalSatFat / 20) * 100)}% daily max
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Sugars</span>
              <span className="text-base font-black font-mono text-white">
                {currentTotalSugar} g
              </span>
              <span className="text-[10px] text-slate-500 block">Simple carbohydrates</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
