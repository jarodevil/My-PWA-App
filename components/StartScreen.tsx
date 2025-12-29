
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from './icons';
import { Compare } from './ui/compare';
import { generateModelImage } from '../services/geminiService';
import Spinner from './Spinner';
import { getFriendlyErrorMessage, cn } from '../lib/utils';
import { Gender, BodyType, PhotographyStyle, SceneSettings, SavedCharacter, VisualMode } from '../types';
import { mcp } from '../services/mcpGateway';

interface StartScreenProps {
  onModelFinalized: (modelUrl: string, settings: SceneSettings) => void;
  onLoadCharacter: (char: SavedCharacter) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onModelFinalized, onLoadCharacter }) => {
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [visualMode, setVisualMode] = useState<VisualMode>('full-body');
  const [gender, setGender] = useState<Gender>('feminine');
  const [height, setHeight] = useState<number>(170);
  const [style, setStyle] = useState<PhotographyStyle>('cinematic-uhq');

  const handleFileSelect = useCallback(async (file: File) => {
    // Automatyczna analiza jakości
    const quality = mcp.analyzeQuality(file);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUserImageUrl(dataUrl);
        setIsGenerating(true);
        setError(null);
        try {
            const settings: SceneSettings = { 
                height, 
                style, 
                showMirror: false, 
                visualMode, 
                quality,
                lighting: 'Soft Studio Light',
                environment: 'Neutral Professional Studio'
            };
            const result = await generateModelImage(file, gender, 'regular', settings);
            setGeneratedModelUrl(result);
        } catch (err) {
            setError(getFriendlyErrorMessage(err, 'Błąd renderowania'));
            setUserImageUrl(null);
        } finally {
            setIsGenerating(false);
        }
    };
    reader.readAsDataURL(file);
  }, [gender, height, style, visualMode]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 lg:p-12 overflow-x-hidden">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Lewa kolumna: Intuicyjne sterowanie */}
        <div className="flex flex-col space-y-12 order-2 lg:order-1">
          <header>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-7xl font-serif font-bold text-gray-900 leading-[1.1]"
            >
              Twój Styl <br /><span className="italic text-indigo-500">Bez Granic</span>
            </motion.h1>
            <p className="mt-6 text-lg text-gray-400 max-w-sm">Wgraj zdjęcie, wybierz tryb i zobacz siebie w nowej odsłonie. Inteligentne dopasowanie UHQ.</p>
          </header>

          {!userImageUrl ? (
            <div className="space-y-10">
              {/* Wybór Trybu - Kluczowa zmiana UX */}
              <div className="flex p-1 bg-gray-50 rounded-2xl w-full max-w-xs border border-gray-100">
                <button onClick={() => setVisualMode('full-body')} className={cn("flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all", visualMode === 'full-body' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400')}>Pełna Sylwetka</button>
                <button onClick={() => setVisualMode('portrait')} className={cn("flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all", visualMode === 'portrait' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400')}>Portret</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kto pozuje?</p>
                    <div className="flex gap-2">
                        <button onClick={() => setGender('feminine')} className={cn("flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase", gender === 'feminine' ? "bg-black text-white border-black" : "bg-white text-gray-400 border-gray-200")}>Ona</button>
                        <button onClick={() => setGender('masculine')} className={cn("flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase", gender === 'masculine' ? "bg-black text-white border-black" : "bg-white text-gray-400 border-gray-200")}>On</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wzrost</p>
                    <div className="relative pt-2">
                        <input type="range" min="150" max="200" value={height} onChange={e => setHeight(parseInt(e.target.value))} className="w-full accent-black" />
                        <span className="absolute -top-1 right-0 text-[10px] font-bold text-gray-900">{height} cm</span>
                    </div>
                  </div>
              </div>

              <label className="group w-full h-40 rounded-[32px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 cursor-pointer transition-all bg-gray-50/50">
                <PlusIcon className="w-10 h-10 mb-2 transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Zacznij tutaj (Wgraj zdjęcie)</span>
                <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && handleFileSelect(e.target.files[0])} />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
                {isGenerating ? (
                  <div className="flex items-center gap-6 p-10 bg-gray-50 rounded-[40px] border border-gray-100">
                    <Spinner />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Analiza jakości pliku...</span>
                        <span className="font-serif italic text-2xl text-gray-900">Adaptacja sylwetki</span>
                    </div>
                  </div>
                ) : generatedModelUrl && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <button onClick={() => onModelFinalized(generatedModelUrl, { 
                        height, 
                        style, 
                        showMirror: false, 
                        visualMode, 
                        quality: 'uhq',
                        lighting: 'Soft Studio Light',
                        environment: 'Neutral Professional Studio'
                    })} className="w-full py-6 bg-black text-white font-bold rounded-[32px] shadow-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3">
                        Otwórz Garderobę 
                        <span className="text-xs opacity-50">&rarr;</span>
                    </button>
                    <button onClick={() => { setUserImageUrl(null); setGeneratedModelUrl(null); }} className="w-full text-[10px] font-bold text-gray-300 hover:text-indigo-500 uppercase tracking-widest transition-colors">Spróbuj inne zdjęcie</button>
                  </motion.div>
                )}
                {error && <div className="p-4 bg-red-50 text-red-500 text-[10px] font-bold uppercase rounded-2xl border border-red-100">{error}</div>}
            </div>
          )}
        </div>

        {/* Prawa kolumna: Estetyczny Lookbook */}
        <div className="relative order-1 lg:order-2 flex justify-center">
            <Compare 
              firstImage={userImageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"} 
              secondImage={generatedModelUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"}
              className="w-[340px] h-[510px] lg:w-[480px] lg:h-[720px] rounded-[64px] shadow-2xl border-4 border-white overflow-hidden"
              autoplay={!userImageUrl}
              autoplayDuration={3000}
            />
            {/* Dekoracyjny element */}
            <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
