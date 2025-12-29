
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { RotateCcwIcon, LayoutGridIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { mcp } from '../services/mcpGateway';
import { Compare } from './ui/compare';
import { cn } from '../lib/utils';

interface CanvasProps {
  displayImageUrl: string | null;
  baseModelUrl?: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose: (action: string) => void;
  currentAction: string;
  canUndo: boolean;
  onUndo: () => void;
  onSave: () => void;
}

const PRODUCTION_MODES = [
  { id: 'env', label: 'Scene Context', actions: ["Neutral Studio", "Parisian Balcony", "Cyber Alley", "Luxury Suite", "Rainy Window"] },
  { id: 'light', label: 'Light Mapping', actions: ["Soft Studio", "Golden Hour", "Dramatic Rim", "Sunlight", "Cyber Glow"] },
  { id: 'pose', label: 'Directive', actions: ["Editorial Pose", "Dynamic Catwalk", "Casual Walk", "Couture Sitting", "Catwalk Turn"] }
];

const Canvas: React.FC<CanvasProps> = ({ 
    displayImageUrl, 
    baseModelUrl,
    onStartOver, 
    isLoading, 
    loadingMessage, 
    onSelectPose, 
    currentAction, 
    canUndo,
    onUndo,
    onSave
}) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [resolvedBaseUrl, setResolvedBaseUrl] = useState<string | null>(null);
  const [showMirror, setShowMirror] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);

  useEffect(() => {
    if (displayImageUrl) mcp.resolveUrl(displayImageUrl).then(setResolvedUrl);
    if (baseModelUrl) mcp.resolveUrl(baseModelUrl).then(setResolvedBaseUrl);
  }, [displayImageUrl, baseModelUrl]);

  return (
    <div className="flex-grow relative flex flex-col items-center justify-center bg-[#F5F5F7] p-8 overflow-hidden">
      
      {/* Top Controller */}
      <div className="absolute top-10 left-10 right-10 z-40 flex justify-between items-center pointer-events-none">
        <button onClick={onStartOver} disabled={isLoading} className="pointer-events-auto p-5 bg-white border border-gray-200 rounded-[28px] shadow-2xl hover:border-black transition-all active:scale-95 disabled:opacity-30">
          <RotateCcwIcon className="w-5 h-5 text-black" />
        </button>

        <div className="pointer-events-auto flex gap-4 bg-white/95 backdrop-blur-3xl p-2.5 rounded-[36px] shadow-2xl border border-gray-100">
          <button onClick={() => setShowMirror(!showMirror)} disabled={isLoading} className={cn("p-4 rounded-[26px] transition-all", showMirror ? "bg-[#1D1D1F] text-white" : "bg-gray-100 text-black")}>
            <LayoutGridIcon className="w-6 h-6" />
          </button>
          <button onClick={onUndo} disabled={!canUndo || isLoading} className="px-12 py-4 bg-gray-100 text-black rounded-[26px] text-[11px] font-black uppercase tracking-widest disabled:opacity-20">Undo</button>
          <button onClick={onSave} disabled={isLoading} className="px-14 py-4 bg-[#1D1D1F] text-white rounded-[26px] text-[11px] font-black uppercase tracking-widest hover:bg-black shadow-lg">Vault Snapshot</button>
        </div>
      </div>

      {/* Global Mutex Loading */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/40 backdrop-blur-[8px] z-[60] flex flex-col items-center justify-center text-center">
             <div className="bg-[#1D1D1F] text-white p-16 rounded-[56px] shadow-2xl flex flex-col items-center gap-10 border border-white/10 scale-110">
                <Spinner />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-400 mb-2 animate-pulse">Production Cycle Active</p>
                  <p className="text-base font-medium opacity-60 italic max-w-xs leading-relaxed">"{loadingMessage}"</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Viewport Area */}
      <div className="relative w-full h-full flex items-center justify-center p-20">
        <AnimatePresence mode="wait">
          {resolvedUrl ? (
             showMirror && resolvedBaseUrl ? (
                <Compare key="mirror" firstImage={resolvedBaseUrl} secondImage={resolvedUrl} className="w-full h-full max-w-5xl max-h-[82vh] rounded-[72px] shadow-2xl bg-white border-[12px] border-white" slideMode="drag" />
             ) : (
                <motion.img
                  key={resolvedUrl} src={resolvedUrl}
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="max-w-full max-h-[82vh] object-contain rounded-[72px] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.25)] bg-white border-[12px] border-white"
                />
             )
          ) : <div className="p-20"><Spinner /></div>}
        </AnimatePresence>
      </div>

      {/* Production Selection - Bottom Console */}
      <div className="absolute bottom-12 inset-x-0 flex flex-col items-center gap-6 z-40 pointer-events-none px-10">
        <div className="pointer-events-auto flex gap-3 bg-white/90 p-2 rounded-[32px] shadow-xl border border-gray-100">
           {PRODUCTION_MODES.map((m, idx) => (
             <button key={m.id} onClick={() => setActiveGroup(idx)} className={cn("px-6 py-3 rounded-[24px] text-[9px] font-black uppercase tracking-widest transition-all", activeGroup === idx ? "bg-black text-white" : "text-gray-400 hover:text-black")}>
               {m.label}
             </button>
           ))}
        </div>
        <div className="pointer-events-auto flex gap-4 bg-white/95 backdrop-blur-3xl border border-gray-100 p-5 rounded-[56px] shadow-2xl overflow-x-auto no-scrollbar max-w-4xl scroll-smooth">
          {PRODUCTION_MODES[activeGroup].actions.map((action) => (
            <button key={action} onClick={() => onSelectPose(action)} disabled={isLoading} className={cn("px-10 py-6 rounded-[44px] text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all", currentAction === action ? "bg-black text-white scale-105 shadow-xl" : "bg-gray-100 text-gray-400 hover:text-black")}>
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
