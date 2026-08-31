import React, { useState } from 'react';
import { FoodItemDetection } from '../types';
import { Sparkles, Eye, Tag, Scale, ChevronRight } from 'lucide-react';

interface InteractiveFoodViewerProps {
  imageUrl?: string;
  items: FoodItemDetection[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  mealName: string;
}

export const InteractiveFoodViewer: React.FC<InteractiveFoodViewerProps> = ({
  imageUrl,
  items,
  selectedItemId,
  onSelectItem,
  mealName,
}) => {
  const [showBoxes, setShowBoxes] = useState<boolean>(true);

  if (!imageUrl) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
        No image captured for this analysis.
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden group select-none">
      {/* Food Photo Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={imageUrl}
          alt={mealName}
          className="w-full h-full object-cover transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Interactive Bounding Box Tags */}
        {showBoxes &&
          items.map((item, idx) => {
            const isSelected = selectedItemId === item.id;
            // Fallback default coordinates if not provided
            const box = item.boundingBox || {
              top: 20 + (idx % 3) * 25,
              left: 15 + ((idx * 30) % 65),
              width: 30,
              height: 30,
            };

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                style={{
                  top: `${Math.max(5, Math.min(80, box.top))}%`,
                  left: `${Math.max(5, Math.min(80, box.left))}%`,
                  width: `${Math.max(15, Math.min(60, box.width))}%`,
                  height: `${Math.max(15, Math.min(60, box.height))}%`,
                }}
                className={`absolute border-2 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between p-1.5 ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.5)] z-30 scale-105'
                    : 'border-emerald-500/60 bg-slate-950/40 hover:border-emerald-400 hover:bg-emerald-500/10 z-10'
                }`}
              >
                {/* Floating Tag Pill */}
                <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-slate-950/90 backdrop-blur-md border border-emerald-500/50 text-[10px] font-bold text-white shadow-lg w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="truncate max-w-[110px]">{item.name}</span>
                  <span className="text-emerald-300 font-mono font-normal">
                    {item.estimatedWeightGrams}g
                  </span>
                </div>

                {/* Macro summary pill on bottom right */}
                <div className="self-end px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[9px] font-mono text-emerald-300">
                  {Math.round(item.macros.calories)} kcal
                </div>
              </div>
            );
          })}

        {/* Top Controls Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-semibold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-xs">{mealName}</span>
          </div>

          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md border transition ${
              showBoxes
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>{showBoxes ? 'Hide Pins' : 'Show Pins'}</span>
          </button>
        </div>
      </div>

      {/* Item Quick Selection Pill Strip */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center">
          <Scale className="w-3 h-3 mr-1 text-emerald-400" /> Detected Items:
        </span>
        {items.map((item) => {
          const isSelected = selectedItemId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{item.name}</span>
              <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-950 font-bold' : 'text-emerald-400'}`}>
                {item.estimatedWeightGrams}g ({Math.round(item.macros.calories)} kcal)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
