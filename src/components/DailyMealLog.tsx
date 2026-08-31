import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  TrendingDown,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { LoggedMeal, MealCategory, DailyNutritionGoal } from '../types';

interface DailyMealLogProps {
  loggedMeals: LoggedMeal[];
  onDeleteMeal: (id: string) => void;
  onClearDay: () => void;
  dailyGoal: DailyNutritionGoal;
  onUpdateGoal: (newGoal: DailyNutritionGoal) => void;
}

export const DailyMealLog: React.FC<DailyMealLogProps> = ({
  loggedMeals,
  onDeleteMeal,
  onClearDay,
  dailyGoal,
  onUpdateGoal,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [tempTargetKcal, setTempTargetKcal] = useState<number>(dailyGoal.targetCalories);

  // Daily totals
  const totalCalories = loggedMeals.reduce((acc, m) => acc + m.totalCalories, 0);
  const totalProtein = loggedMeals.reduce((acc, m) => acc + m.proteinGrams, 0);
  const totalCarbs = loggedMeals.reduce((acc, m) => acc + m.carbsGrams, 0);
  const totalFat = loggedMeals.reduce((acc, m) => acc + m.fatGrams, 0);
  const totalSaved = loggedMeals.reduce((acc, m) => acc + m.caloriesSaved, 0);

  const remainingKcal = dailyGoal.targetCalories - totalCalories;
  const progressPercent = Math.min(100, Math.round((totalCalories / dailyGoal.targetCalories) * 100));

  const handlePrint = () => {
    window.print();
  };

  const handleSaveGoal = () => {
    onUpdateGoal({
      ...dailyGoal,
      targetCalories: tempTargetKcal,
    });
    setIsEditingGoal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Daily Progress Overview Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">Daily Calorie & Macro Log</h2>
            </div>
            <p className="text-xs text-slate-400">
              Track your daily food intake and celebrate calories saved through AI swaps.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition border border-slate-700/60"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export Log</span>
            </button>
            {loggedMeals.length > 0 && (
              <button
                onClick={onClearDay}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950 text-rose-300 text-xs font-medium border border-rose-800/40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Meters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Consumed vs Target */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Consumed Today</span>
              <button
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="text-[10px] text-emerald-400 hover:underline"
              >
                {isEditingGoal ? 'Cancel' : 'Edit Target'}
              </button>
            </div>

            {isEditingGoal ? (
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="number"
                  value={tempTargetKcal}
                  onChange={(e) => setTempTargetKcal(parseInt(e.target.value, 10) || 2000)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm font-mono text-white"
                />
                <button
                  onClick={handleSaveGoal}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black font-mono text-white">
                  {totalCalories}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  / {dailyGoal.targetCalories} kcal
                </span>
              </div>
            )}

            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  progressPercent > 100 ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              {remainingKcal >= 0 ? `${remainingKcal} kcal remaining` : `${Math.abs(remainingKcal)} kcal over budget`}
            </span>
          </div>

          {/* Calorie Reduction Savings */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span className="uppercase tracking-wider">AI Calorie Savings</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black font-mono text-emerald-300">
                -{totalSaved}
              </span>
              <span className="text-xs text-emerald-400 font-mono">kcal saved</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Total energy saved by adopting AI suggested ingredient & cooking swaps today!
            </p>
          </div>

          {/* Daily Macros Distribution */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Macronutrient Totals
            </span>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-cyan-400 block">Protein</span>
                <span className="text-sm font-bold text-white">{totalProtein}g</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-amber-400 block">Carbs</span>
                <span className="text-sm font-bold text-white">{totalCarbs}g</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-rose-400 block">Fat</span>
                <span className="text-sm font-bold text-white">{totalFat}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logged Meals List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-emerald-400" />
          Logged Meals ({loggedMeals.length})
        </h3>

        {loggedMeals.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <Flame className="w-8 h-8 mx-auto text-slate-600" />
            <h4 className="text-sm font-semibold text-slate-300">No Meals Logged Today</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan a dish with your PC webcam or pick a sample food, then click "Log to Journal" to record it here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {loggedMeals.map((meal) => (
              <div
                key={meal.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5">
                  {meal.imageUrl ? (
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <Flame className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-emerald-300">
                        {meal.mealCategory}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {meal.caloriesSaved > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          -{meal.caloriesSaved} kcal Saved
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white">{meal.name}</h4>
                    <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                      <span>P: {meal.proteinGrams}g</span>
                      <span>•</span>
                      <span>C: {meal.carbsGrams}g</span>
                      <span>•</span>
                      <span>F: {meal.fatGrams}g</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-white">
                      {meal.totalCalories}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">kcal</span>
                  </div>

                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
