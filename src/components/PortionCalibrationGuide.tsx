import React from 'react';
import {
  Compass,
  Hand,
  PieChart,
  Layers,
  Sparkles,
  CheckCircle2,
  Droplet,
  Salad,
  Flame,
  ShieldCheck,
} from 'lucide-react';

export const PortionCalibrationGuide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs font-mono">
          <Compass className="w-4 h-4" />
          <span>Visual Food Calibration & Nutrition Science</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Portion Estimation & Calorie Density Master Guide
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Master the visual sizing cues and calorie-density heuristics used by clinical dietitians to estimate portions without a scale and reduce calories effortlessly.
        </p>
      </div>

      {/* 1. The Hand Measurement System */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center">
            <span className="text-2xl mr-2">✋</span>
            The Universal Hand Portion Method
          </h3>
          <span className="text-xs text-slate-400 font-mono">Precision ~90% accuracy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Palm */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">✋</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                Protein
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Palm of Hand</h4>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">~100g - 150g (3-4 oz)</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Thickness and diameter of your palm equals 1 serving of chicken, fish, tofu, eggs, or lean beef (~20-30g protein).
            </p>
          </div>

          {/* Fist */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">✊</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                Veggies / Grains
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Closed Fist</h4>
              <p className="text-xs font-mono text-emerald-400 mt-0.5">~1 cup volume (150-200g)</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Volume of a closed fist equals 1 cup of dense greens, broccoli, cooked brown rice, oatmeal, or whole apples.
            </p>
          </div>

          {/* Cupped Hand */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🤲</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
                Carbs / Snacks
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Cupped Hand</h4>
              <p className="text-xs font-mono text-amber-400 mt-0.5">~1/2 cup (30-50g)</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              A single cupped palm holds roughly 1/2 cup of high-energy starches, berries, lentils, beans, or pretzels.
            </p>
          </div>

          {/* Thumb */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">👍</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-800">
                Fats / Oils
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Thumb Length</h4>
              <p className="text-xs font-mono text-rose-400 mt-0.5">~1 tbsp / 14g (120 kcal)</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Length from tip to knuckle equals 1 tablespoon of olive oil, butter, peanut butter, mayonnaise, or cheese cubes.
            </p>
          </div>
        </div>
      </div>

      {/* 2. The 50/25/25 Plate Method */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
          <PieChart className="w-5 h-5" />
          <span>The Gold-Standard 50 / 25 / 25 Calorie Control Plate</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Visual Plate Canvas Representation */}
          <div className="relative aspect-square max-w-xs mx-auto rounded-full border-4 border-slate-700 bg-slate-950 p-4 flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Half 50% Top: Veggies */}
            <div className="h-[48%] rounded-t-full bg-emerald-950/70 border-b-2 border-emerald-400/60 p-4 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-black text-emerald-300 font-mono">50% PLATE</span>
              <span className="text-[11px] font-bold text-white">Non-Starchy Vegetables</span>
              <span className="text-[9px] text-emerald-400">High Volume • Ultra Low Calorie</span>
            </div>

            {/* Bottom 50% split in two */}
            <div className="h-[48%] flex space-x-2">
              <div className="w-1/2 rounded-bl-full bg-cyan-950/70 border-r-2 border-cyan-400/60 p-2 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-cyan-300 font-mono">25%</span>
                <span className="text-[10px] font-bold text-white">Lean Protein</span>
              </div>
              <div className="w-1/2 rounded-br-full bg-amber-950/70 p-2 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-amber-300 font-mono">25%</span>
                <span className="text-[10px] font-bold text-white">Complex Carbs</span>
              </div>
            </div>
          </div>

          {/* Explanation description */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-base font-bold text-white">
              Why the 50/25/25 Rule Slashes 300-500 Calories Automatically:
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300">Stomach Stretch Receptors:</strong> Filling half your plate with water-rich greens triggers gastric fullness mechanoreceptors using less than 60 kcal, preventing second helpings of high-fat starches.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300">Thermic Effect of Food (TEF):</strong> Protein requires ~25% of its caloric value just to be digested and metabolized, boosting metabolic rate compared to fats (0-3%).
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Glycemic Stability:</strong> Keeping starches to 1/4 plate prevents reactive hypoglycemia, eliminating late-afternoon sugar cravings.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The 4 Golden Calorie Reduction Rules */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2 text-teal-400" />
          The 4 Highest-Leverage Calorie Reduction Habits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-emerald-400">1. The 1-Second Oil Spray Rule</span>
            <p className="text-xs text-slate-300">
              A standard free-pour from an oil bottle adds 2 tablespoons (240 kcal / 28g fat). Using a pressurized 1-second extra virgin olive oil mist delivers 10 kcal — <strong>saving 230 kcal per meal</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-cyan-400">2. The 0% Greek Yogurt Emulsion</span>
            <p className="text-xs text-slate-300">
              Replace mayonnaise, sour cream, and heavy cream in dips and dressings with 0% Greek yogurt mixed with lemon, dill, and Dijon mustard. Drops 80% of calories while adding 12g protein.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-amber-400">3. The 50/50 Starch Volume Blend</span>
            <p className="text-xs text-slate-300">
              Never starve on tiny portions: mix 50% real rice with 50% riced cauliflower, or 50% pasta with 50% zucchini ribbons. Identical plate volume, half the carbohydrate density.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-rose-400">4. Fork-Dip Dressing Technique</span>
            <p className="text-xs text-slate-300">
              Order dressings and heavy sauces on the side. Dip your fork into the sauce before grabbing a bite of salad rather than pouring it over. Saves 150-250 kcal per restaurant meal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
