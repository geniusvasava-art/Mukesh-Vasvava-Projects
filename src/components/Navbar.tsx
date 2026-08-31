import React from 'react';
import { Camera, Flame, Sparkles, BookOpen, Compass, RotateCcw, ShieldCheck, HeartPulse, Mic } from 'lucide-react';
import { LoggedMeal, DailyNutritionGoal } from '../types';

interface NavbarProps {
  activeTab: 'scanner' | 'analyzer' | 'reduction' | 'journal' | 'guide';
  setActiveTab: (tab: 'scanner' | 'analyzer' | 'reduction' | 'journal' | 'guide') => void;
  hasActiveMeal: boolean;
  loggedMeals: LoggedMeal[];
  dailyGoal: DailyNutritionGoal;
  onResetNewScan: () => void;
  onOpenVoiceAssist: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasActiveMeal,
  loggedMeals,
  dailyGoal,
  onResetNewScan,
  onOpenVoiceAssist,
}) => {
  const totalConsumedToday = loggedMeals.reduce((acc, m) => acc + m.totalCalories, 0);
  const totalSavedToday = loggedMeals.reduce((acc, m) => acc + m.caloriesSaved, 0);
  const remainingKcal = Math.max(0, dailyGoal.targetCalories - totalConsumedToday);
  const progressPercent = Math.min(100, Math.round((totalConsumedToday / dailyGoal.targetCalories) * 100));

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('scanner')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Flame className="w-6 h-6 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                  CalorieDetect<span className="text-emerald-400 font-mono">.AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-400" /> PC Vision 3.7
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Webcam Food Portion & Low-Calorie Optimizer
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'scanner'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera & Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('analyzer')}
              disabled={!hasActiveMeal}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !hasActiveMeal
                  ? 'text-slate-600 cursor-not-allowed'
                  : activeTab === 'analyzer'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Nutrition Breakdown</span>
              {hasActiveMeal && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            </button>

            <button
              onClick={() => setActiveTab('reduction')}
              disabled={!hasActiveMeal}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !hasActiveMeal
                  ? 'text-slate-600 cursor-not-allowed'
                  : activeTab === 'reduction'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'text-emerald-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reduce Calories</span>
              {hasActiveMeal && (
                <span className="px-1.5 py-0.2 bg-emerald-400/20 text-emerald-300 rounded text-[10px]">
                  AI Swaps
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'journal'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Daily Log ({loggedMeals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Portion Guide</span>
            </button>
          </nav>

          {/* Daily Quick Meter & Action Buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Voice Assist Trigger Button */}
            <button
              onClick={onOpenVoiceAssist}
              className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition transform active:scale-95 cursor-pointer"
              title="Open AI Voice Assistant for hands-free queries and commands"
            >
              <Mic className="w-3.5 h-3.5 animate-bounce" />
              <span>Voice Assist</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
              </span>
            </button>

            {/* Daily Calorie Mini Gauge */}
            <div
              className="hidden sm:flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700 transition"
              onClick={() => setActiveTab('journal')}
              title="Click to view daily meal log and targets"
            >
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  Today's Budget
                </span>
                <span className="text-xs font-bold text-slate-200">
                  <span className="text-emerald-400 font-mono">{totalConsumedToday}</span> / {dailyGoal.targetCalories} kcal
                </span>
              </div>
              <div className="w-12 h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    progressPercent > 100 ? 'bg-rose-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {totalSavedToday > 0 && (
                <div className="flex items-center space-x-1 pl-1 border-l border-slate-800 text-[11px] font-semibold text-teal-300">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  <span>-{totalSavedToday}</span>
                </div>
              )}
            </div>

            {hasActiveMeal && (
              <button
                onClick={onResetNewScan}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition border border-slate-700/60"
                title="Start a new food scan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">New Scan</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Tab Scroll Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-2 scrollbar-none border-t border-slate-800/60 items-center">
          <button
            onClick={onOpenVoiceAssist}
            className="whitespace-nowrap px-3 py-1 rounded-md text-xs font-bold bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 flex items-center space-x-1 shrink-0"
          >
            <Mic className="w-3 h-3" />
            <span>Voice Assist</span>
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-semibold ${
              activeTab === 'scanner' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 bg-slate-800/60'
            }`}
          >
            📸 Scanner
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            disabled={!hasActiveMeal}
            className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-semibold ${
              !hasActiveMeal
                ? 'text-slate-600 bg-slate-900'
                : activeTab === 'analyzer'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 bg-slate-800/60'
            }`}
          >
            📊 Nutrition
          </button>
          <button
            onClick={() => setActiveTab('reduction')}
            disabled={!hasActiveMeal}
            className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-semibold ${
              !hasActiveMeal
                ? 'text-slate-600 bg-slate-900'
                : activeTab === 'reduction'
                ? 'bg-emerald-400 text-slate-950 font-bold'
                : 'text-emerald-300 bg-slate-800/60'
            }`}
          >
            💡 Reduce Calories
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-semibold ${
              activeTab === 'journal' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 bg-slate-800/60'
            }`}
          >
            📖 Log ({loggedMeals.length})
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-semibold ${
              activeTab === 'guide' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 bg-slate-800/60'
            }`}
          >
            📏 Portion Guide
          </button>
        </div>
      </div>
    </header>
  );
};

