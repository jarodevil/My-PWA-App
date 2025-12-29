
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import StartScreen from './components/StartScreen';
import Canvas from './components/Canvas';
import WardrobePanel from './components/WardrobeModal';
import { applyGarment, reconstructScene } from './services/geminiService';
import { WardrobeItem, SceneSettings, LAYER_ORDER, SavedCharacter } from './types';
import { defaultWardrobe } from './wardrobe';
import Footer from './components/Footer';
import { mcp } from './services/mcpGateway';
import { storage } from './lib/storage';

const App: React.FC = () => {
  const [baseModelUrl, setBaseModelUrl] = useState<string | null>(null);
  const [currentRenderUrl, setCurrentRenderUrl] = useState<string | null>(null);
  const [activeGarments, setActiveGarments] = useState<WardrobeItem[]>([]);
  const [sceneSettings, setSceneSettings] = useState<SceneSettings>({
    visualMode: 'full-body',
    quality: 'uhq',
    lighting: 'Soft Studio Light',
    environment: 'Neutral Professional Studio',
    height: 170,
    style: 'cinematic-uhq'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(() => {
    const saved = localStorage.getItem('fitcore_v15_lib');
    return saved ? JSON.parse(saved) : defaultWardrobe;
  });

  useEffect(() => {
    storage.init();
    localStorage.setItem('fitcore_v15_lib', JSON.stringify(wardrobe));
  }, [wardrobe]);

  const handleModelFinalized = async (url: string, settings: SceneSettings) => {
    setIsLoading(true);
    setLoadingMsg("Syncing Nexus Core...");
    try {
      const id = await mcp.registerAsset(url, 'render');
      setBaseModelUrl(id);
      setCurrentRenderUrl(id);
      setSceneSettings(settings);
      setHistory([id]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadCharacter = (char: SavedCharacter) => {
    setBaseModelUrl(char.imageUrl);
    setCurrentRenderUrl(char.imageUrl);
    setSceneSettings(char.settings);
    setHistory([char.imageUrl]);
  };

  const handleAddGarment = useCallback(async (garment: WardrobeItem) => {
    if (!currentRenderUrl || isLoading) return;
    setIsLoading(true);
    setLoadingMsg(`Photoroom: Mapping ${garment.name}...`);
    try {
      const newStack = [...activeGarments, garment].sort((a, b) => LAYER_ORDER[a.category] - LAYER_ORDER[b.category]);
      const current = await mcp.resolveUrl(currentRenderUrl);
      const res = await applyGarment(current, garment.url, garment, newStack, sceneSettings);
      const id = await mcp.registerAsset(res, 'render');
      setActiveGarments(newStack);
      setCurrentRenderUrl(id);
      setHistory(prev => [...prev, id]);
    } catch (e) {
      alert("AI Filter Trip or Quota. Check technical image quality.");
    } finally {
      setIsLoading(false);
    }
  }, [currentRenderUrl, activeGarments, sceneSettings, isLoading]);

  const handleSceneChange = async (directive: string) => {
    if (!baseModelUrl || isLoading) return;
    setIsLoading(true);
    setLoadingMsg(`Directing: ${directive}...`);
    try {
      const base = await mcp.resolveUrl(baseModelUrl);
      const res = await reconstructScene(base, activeGarments, directive, sceneSettings);
      const id = await mcp.registerAsset(res, 'render');
      setCurrentRenderUrl(id);
      setHistory(prev => [...prev, id]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F5F5F7] overflow-hidden flex flex-col font-sans select-none text-[#1D1D1F]">
      <AnimatePresence mode="wait">
        {!currentRenderUrl ? (
          <StartScreen onModelFinalized={handleModelFinalized} onLoadCharacter={handleLoadCharacter} />
        ) : (
          <div className="flex-grow flex flex-col md:flex-row relative">
            <Canvas 
              displayImageUrl={currentRenderUrl} 
              baseModelUrl={baseModelUrl}
              onStartOver={() => { setBaseModelUrl(null); setCurrentRenderUrl(null); setActiveGarments([]); }}
              isLoading={isLoading} loadingMessage={loadingMsg}
              onSelectPose={handleSceneChange}
              currentAction={sceneSettings.environment}
              canUndo={history.length > 1}
              onUndo={() => {
                const newHistory = [...history];
                newHistory.pop();
                const last = newHistory[newHistory.length - 1];
                setCurrentRenderUrl(last);
                setHistory(newHistory);
                setActiveGarments(prev => prev.slice(0, -1));
              }}
              onSave={() => alert("Snapshot saved to Local Vault.")}
            />

            <aside className="w-full md:w-[460px] bg-white border-l border-gray-200 p-8 flex flex-col overflow-y-auto no-scrollbar shadow-2xl z-40">
                <div className="mb-10 p-6 bg-[#1D1D1F] rounded-[32px] text-white shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                       <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isLoading ? 'Processing' : 'Obsidian Ready'}</span>
                       </div>
                       <span className="text-[9px] font-bold opacity-30">V15.CORE</span>
                    </div>
                    <div className="space-y-4">
                       <div>
                         <p className="text-[8px] opacity-40 uppercase font-black tracking-widest mb-1">Nexus Vault</p>
                         <p className="text-[11px] font-bold truncate text-indigo-300">mcp://integrated-ram-buffer</p>
                       </div>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 px-2">Active Layers</h3>
                    <div className="space-y-3">
                        {activeGarments.map((g) => (
                            <div key={g.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-[24px] border border-gray-100 shadow-sm">
                                <img src={g.url} className="w-12 h-12 rounded-[14px] object-cover shadow-sm bg-white" />
                                <div className="flex-grow">
                                  <p className="text-[11px] font-black uppercase text-black">{g.name}</p>
                                  <p className="text-[9px] font-bold text-gray-400">{g.category}</p>
                                </div>
                            </div>
                        ))}
                        {activeGarments.length === 0 && <div className="py-14 text-center border-2 border-dashed border-gray-100 rounded-[32px] text-[10px] font-black text-gray-300 uppercase tracking-widest">Base Identity Render</div>}
                    </div>
                </div>

                <div className="mt-auto">
                  <WardrobePanel 
                    wardrobe={wardrobe} activeGarmentIds={activeGarments.map(g => g.id)}
                    onGarmentSelect={(_, info) => handleAddGarment(info)}
                    isLoading={isLoading} setWardrobe={setWardrobe} onImportLibrary={() => {}}
                  />
                </div>
            </aside>
          </div>
        )}
      </AnimatePresence>
      <Footer isOnDressingScreen={!!currentRenderUrl} />
    </div>
  );
};

export default App;
