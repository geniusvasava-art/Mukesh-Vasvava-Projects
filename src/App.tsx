/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WebcamScanner } from './components/WebcamScanner';
import { InteractiveFoodViewer } from './components/InteractiveFoodViewer';
import { NutritionBreakdown } from './components/NutritionBreakdown';
import { CalorieReductionPanel } from './components/CalorieReductionPanel';
import { DailyMealLog } from './components/DailyMealLog';
import { PortionCalibrationGuide } from './components/PortionCalibrationGuide';
import { MealAssistantChat } from './components/MealAssistantChat';
import { SAMPLE_MEALS, SampleMeal } from './data/sampleFoods';
import { analyzeFoodImage } from './services/api';
import { MealAnalysisResult, LoggedMeal, DailyNutritionGoal, MealCategory } from './types';
import {
  Camera,
  HeartPulse,
  Sparkles,
  BookOpen,
  Compass,
  AlertCircle,
  CheckCircle2,
  BookmarkPlus,
  ArrowRight,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const LOCAL_STORAGE_MEALS_KEY = 'calorie_detect_logged_meals_v1';
const LOCAL_STORAGE_GOAL_KEY = 'calorie_detect_daily_goal_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'analyzer' | 'reduction' | 'journal' | 'guide'>('scanner');
  const [activeMeal, setActiveMeal] = useState<MealAnalysisResult | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Daily Log state persisted in localStorage
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MEALS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse logged meals from localStorage');
    }
    return [];
  });

  const [dailyGoal, setDailyGoal] = useState<DailyNutritionGoal>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_GOAL_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse goal from localStorage');
    }
    return {
      targetCalories: 2000,
      targetProteinGrams: 140,
      targetCarbsGrams: 200,
      targetFatGrams: 65,
    };
  });

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_MEALS_KEY, JSON.stringify(loggedMeals));
    } catch (e) {
      console.warn('Failed to save meals');
    }
  }, [loggedMeals]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_GOAL_KEY, JSON.stringify(dailyGoal));
    } catch (e) {
      console.warn('Failed to save goal');
    }
  }, [dailyGoal]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Analyze new webcam/photo capture
  const handleAnalyzeImage = async (
    imageDataUrl: string,
    notes?: string,
    referenceScale?: string
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const result = await analyzeFoodImage(imageDataUrl, notes, referenceScale);
      result.imageUrl = imageDataUrl;
      setActiveMeal(result);
      if (result.items.length > 0) {
        setSelectedItemId(result.items[0].id);
      }
      setActiveTab('analyzer');
      showToast(`Analyzed ${result.mealName}! Check your portion and nutrition breakdown.`, 'success');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Failed to analyze food image. Please try again or select a sample dish.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select Sample Meal for instant test
  const handleSelectSample = (sample: SampleMeal) => {
    setActiveMeal(sample.result);
    if (sample.result.items.length > 0) {
      setSelectedItemId(sample.result.items[0].id);
    }
    setActiveTab('analyzer');
    showToast(`Loaded ${sample.name} preset!`, 'info');
  };

  // Adjust item portion weight with real-time macro recalculation
  const handleUpdateItemWeight = (itemId: string, newWeightGrams: number) => {
    if (!activeMeal) return;

    const safeWeight = Math.max(5, newWeightGrams);
    const updatedItems = activeMeal.items.map((item) => {
      if (item.id === itemId) {
        const factor = safeWeight / 100;
        const newMacros = {
          calories: Math.round(item.per100g.calories * factor),
          proteinGrams: Math.round(item.per100g.proteinGrams * factor * 10) / 10,
          carbsGrams: Math.round(item.per100g.carbsGrams * factor * 10) / 10,
          fatGrams: Math.round(item.per100g.fatGrams * factor * 10) / 10,
          fiberGrams: item.per100g.fiberGrams ? Math.round(item.per100g.fiberGrams * factor * 10) / 10 : 0,
          sugarGrams: item.per100g.sugarGrams ? Math.round(item.per100g.sugarGrams * factor * 10) / 10 : 0,
          saturatedFatGrams: item.per100g.saturatedFatGrams ? Math.round(item.per100g.saturatedFatGrams * factor * 10) / 10 : 0,
          sodiumMg: item.per100g.sodiumMg ? Math.round(item.per100g.sodiumMg * factor) : 0,
        };
        return {
          ...item,
          estimatedWeightGrams: safeWeight,
          macros: newMacros,
        };
      }
      return item;
    });

    // Recompute total macros
    const newTotalMacros = {
      calories: Math.round(updatedItems.reduce((acc, i) => acc + i.macros.calories, 0)),
      proteinGrams: Math.round(updatedItems.reduce((acc, i) => acc + i.macros.proteinGrams, 0)),
      carbsGrams: Math.round(updatedItems.reduce((acc, i) => acc + i.macros.carbsGrams, 0)),
      fatGrams: Math.round(updatedItems.reduce((acc, i) => acc + i.macros.fatGrams, 0)),
      fiberGrams: Math.round(updatedItems.reduce((acc, i) => acc + (i.macros.fiberGrams || 0), 0)),
    };

    setActiveMeal({
      ...activeMeal,
      items: updatedItems,
      totalMacros: newTotalMacros,
    });
  };

  // Reset portion weights back to AI baseline scan
  const handleResetWeights = () => {
    if (!activeMeal) return;
    const resetItems = activeMeal.items.map((item) => {
      const factor = item.originalWeightGrams / 100;
      return {
        ...item,
        estimatedWeightGrams: item.originalWeightGrams,
        macros: {
          calories: Math.round(item.per100g.calories * factor),
          proteinGrams: Math.round(item.per100g.proteinGrams * factor * 10) / 10,
          carbsGrams: Math.round(item.per100g.carbsGrams * factor * 10) / 10,
          fatGrams: Math.round(item.per100g.fatGrams * factor * 10) / 10,
          fiberGrams: item.per100g.fiberGrams ? Math.round(item.per100g.fiberGrams * factor * 10) / 10 : 0,
          sugarGrams: item.per100g.sugarGrams ? Math.round(item.per100g.sugarGrams * factor * 10) / 10 : 0,
          saturatedFatGrams: item.per100g.saturatedFatGrams ? Math.round(item.per100g.saturatedFatGrams * factor * 10) / 10 : 0,
          sodiumMg: item.per100g.sodiumMg ? Math.round(item.per100g.sodiumMg * factor) : 0,
        },
      };
    });

    const newTotalMacros = {
      calories: Math.round(resetItems.reduce((acc, i) => acc + i.macros.calories, 0)),
      proteinGrams: Math.round(resetItems.reduce((acc, i) => acc + i.macros.proteinGrams, 0)),
      carbsGrams: Math.round(resetItems.reduce((acc, i) => acc + i.macros.carbsGrams, 0)),
      fatGrams: Math.round(resetItems.reduce((acc, i) => acc + i.macros.fatGrams, 0)),
      fiberGrams: Math.round(resetItems.reduce((acc, i) => acc + (i.macros.fiberGrams || 0), 0)),
    };

    setActiveMeal({
      ...activeMeal,
      items: resetItems,
      totalMacros: newTotalMacros,
    });
    showToast('Portion weights reset to original AI scan.', 'info');
  };

  // Toggle single low-calorie suggestion
  const handleToggleSwap = (swapId: string) => {
    if (!activeMeal) return;
    const updatedSwaps = activeMeal.reductionSuggestions.map((s) => {
      if (s.id === swapId) {
        return { ...s, applied: !s.applied };
      }
      return s;
    });
    setActiveMeal({
      ...activeMeal,
      reductionSuggestions: updatedSwaps,
    });
  };

  // Apply all low-calorie suggestions
  const handleApplyAllSwaps = () => {
    if (!activeMeal) return;
    const updatedSwaps = activeMeal.reductionSuggestions.map((s) => ({
      ...s,
      applied: true,
    }));
    setActiveMeal({
      ...activeMeal,
      reductionSuggestions: updatedSwaps,
    });
    showToast('All low-calorie swaps applied! Look at the calorie difference.', 'success');
  };

  // Log meal into daily journal
  const handleLogMeal = (
    savedKcal: number = 0,
    reducedCaloriesOverride?: number,
    category: MealCategory = 'lunch'
  ) => {
    if (!activeMeal) return;

    const finalCalories =
      reducedCaloriesOverride !== undefined
        ? reducedCaloriesOverride
        : Math.round(activeMeal.items.reduce((acc, i) => acc + i.macros.calories, 0));

    const newLogEntry: LoggedMeal = {
      id: 'log-' + Date.now(),
      date: new Date().toISOString(),
      mealCategory: category,
      name: activeMeal.mealName,
      imageUrl: activeMeal.imageUrl,
      totalCalories: finalCalories,
      proteinGrams: Math.round(activeMeal.items.reduce((acc, i) => acc + i.macros.proteinGrams, 0)),
      carbsGrams: Math.round(activeMeal.items.reduce((acc, i) => acc + i.macros.carbsGrams, 0)),
      fatGrams: Math.round(activeMeal.items.reduce((acc, i) => acc + i.macros.fatGrams, 0)),
      fiberGrams: Math.round(activeMeal.items.reduce((acc, i) => acc + (i.macros.fiberGrams || 0), 0)),
      appliedSwapsCount: activeMeal.reductionSuggestions.filter((s) => s.applied).length,
      caloriesSaved: savedKcal,
      itemsCount: activeMeal.items.length,
    };

    setLoggedMeals((prev) => [newLogEntry, ...prev]);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast(`Logged "${activeMeal.mealName}" (${finalCalories} kcal) to today's journal!`, 'success');
    setActiveTab('journal');
  };

  const handleDeleteMeal = (id: string) => {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== id));
    showToast('Meal removed from journal.', 'info');
  };

  const handleClearDay = () => {
    setLoggedMeals([]);
    showToast('Daily journal cleared.', 'info');
  };

  const handleResetNewScan = () => {
    setActiveMeal(null);
    setSelectedItemId(null);
    setActiveTab('scanner');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border text-xs font-semibold ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActiveMeal={Boolean(activeMeal)}
        loggedMeals={loggedMeals}
        dailyGoal={dailyGoal}
        onResetNewScan={handleResetNewScan}
      />

      {/* Main Applet Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error alert if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-xs text-rose-200 flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong>Analysis Notice:</strong> {errorMessage}
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Webcam Scanner & Camera Viewfinder */}
        {activeTab === 'scanner' && (
          <WebcamScanner
            onAnalyzeImage={handleAnalyzeImage}
            onSelectSample={handleSelectSample}
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* Tab 2: Nutrition & Portion Analyzer */}
        {activeTab === 'analyzer' && activeMeal && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Plate Food Viewer with Visual Bounding Pins (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <InteractiveFoodViewer
                  imageUrl={activeMeal.imageUrl}
                  items={activeMeal.items}
                  selectedItemId={selectedItemId}
                  onSelectItem={(id) => setSelectedItemId(id)}
                  mealName={activeMeal.mealName}
                />

                {/* Quick Log Bar on Left */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-white block">Ready to record?</span>
                    <span className="text-[11px] text-slate-400">Add to your daily calorie tracker</span>
                  </div>
                  <button
                    onClick={() => handleLogMeal(0)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Log to Daily Journal</span>
                  </button>
                </div>

                {/* Interactive Nutritionist Assistant */}
                <MealAssistantChat meal={activeMeal} />
              </div>

              {/* Right Column: Nutrition Breakdown + Portion Weight Sliders (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <NutritionBreakdown
                  meal={activeMeal}
                  onUpdateItemWeight={handleUpdateItemWeight}
                  onResetWeights={handleResetWeights}
                  selectedItemId={selectedItemId}
                  onSelectItem={(id) => setSelectedItemId(id)}
                  onGoToReduction={() => setActiveTab('reduction')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Calorie Reduction Advisor ("How we reduce calories") */}
        {activeTab === 'reduction' && activeMeal && (
          <div className="space-y-6">
            <CalorieReductionPanel
              meal={activeMeal}
              onApplyAllSwaps={handleApplyAllSwaps}
              onToggleSwap={handleToggleSwap}
              onLogMealWithSavings={(savedKcal, reducedCalories) =>
                handleLogMeal(savedKcal, reducedCalories)
              }
            />

            {/* Nutritionist Q&A for reduction */}
            <MealAssistantChat meal={activeMeal} />
          </div>
        )}

        {/* Tab 4: Daily Meal Journal */}
        {activeTab === 'journal' && (
          <DailyMealLog
            loggedMeals={loggedMeals}
            onDeleteMeal={handleDeleteMeal}
            onClearDay={handleClearDay}
            dailyGoal={dailyGoal}
            onUpdateGoal={(newGoal) => setDailyGoal(newGoal)}
          />
        )}

        {/* Tab 5: Portion & Calorie Calibration Guide */}
        {activeTab === 'guide' && <PortionCalibrationGuide />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CalorieDetect AI • PC Vision Food Recognition & Low-Calorie Optimizer</span>
          <span className="text-[11px] font-mono text-slate-600">
            Powered by Gemini 3.7 Flash Multimodal Vision
          </span>
        </div>
      </footer>
    </div>
  );
}
