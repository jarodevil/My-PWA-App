
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useCallback } from 'react';
import type { WardrobeItem, MainCategory } from '../types';
import { UploadCloudIcon, CheckCircleIcon, LayoutGridIcon, PlusIcon, XIcon } from './icons';
import { CATEGORY_STRUCTURE, THEMATIC_SUB_CATEGORIES } from '../wardrobe';
import { motion, AnimatePresence } from 'framer-motion';
// Added missing import for cn utility
import { cn } from '../lib/utils';

interface WardrobePanelProps {
  onGarmentSelect: (garmentFile: File | string, garmentInfo: WardrobeItem) => void;
  activeGarmentIds: string[];
  isLoading: boolean;
  wardrobe: WardrobeItem[];
  setWardrobe: React.Dispatch<React.SetStateAction<WardrobeItem[]>>;
  onImportLibrary: (url: string) => void;
}

const urlToFile = (url: string, filename: string): Promise<File> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context.'));
            ctx.drawImage(image, 0, 0);
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Canvas toBlob failed.'));
                const file = new File([blob], filename, { type: blob.type || 'image/png' });
                resolve(file);
            }, 'image/png');
        };
        image.onerror = (error) => reject(new Error(`Could not load image. ${error}`));
        image.src = url;
    });
};

const WardrobePanel: React.FC<WardrobePanelProps> = ({ 
    onGarmentSelect, 
    activeGarmentIds, 
    isLoading, 
    wardrobe, 
    setWardrobe,
    onImportLibrary
}) => {
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<MainCategory | 'All'>('All');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | 'All'>('All');
    
    // Upload state
    const [isUploadFormOpen, setIsUploadFormOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [newGarmentName, setNewGarmentName] = useState('');
    const [uploadCategory, setUploadCategory] = useState<MainCategory>('Tops & Outerwear');
    const [uploadSubCategory, setUploadSubCategory] = useState<string>('');

    const filteredItems = useMemo(() => {
        return wardrobe.filter(item => {
            const catMatch = selectedCategory === 'All' || item.category === selectedCategory;
            const subMatch = selectedSubCategory === 'All' || item.subCategory === selectedSubCategory;
            return catMatch && subMatch;
        });
    }, [wardrobe, selectedCategory, selectedSubCategory]);

    const subCategories = useMemo(() => {
        if (selectedCategory === 'All') return [];
        return CATEGORY_STRUCTURE[selectedCategory as MainCategory] || [];
    }, [selectedCategory]);

    const handleGarmentClick = async (item: WardrobeItem) => {
        if (isLoading || activeGarmentIds.includes(item.id)) return;
        setError(null);
        try {
            if (item.isCustom && item.url.startsWith('data:')) {
                onGarmentSelect(item.url, item);
            } else {
                const file = await urlToFile(item.url, item.name);
                onGarmentSelect(file, item);
            }
        } catch (err) {
            setError(`Network error: Check brand asset permissions.`);
        }
    };

    const handleInitialFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPendingFile(e.target.files[0]);
            setNewGarmentName(e.target.files[0].name.split('.')[0]);
            setIsUploadFormOpen(true);
        }
    };

    const finalizeUpload = useCallback(() => {
        if (!pendingFile) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const newItem: WardrobeItem = {
                id: `custom-${Date.now()}`,
                name: newGarmentName || 'Unnamed Garment',
                url: dataUrl,
                category: uploadCategory,
                subCategory: uploadSubCategory || undefined,
                brand: 'Custom Library',
                isCustom: true
            };
            
            setWardrobe(prev => [newItem, ...prev]);
            setPendingFile(null);
            setIsUploadFormOpen(false);
            onGarmentSelect(pendingFile, newItem);
        };
        reader.readAsDataURL(pendingFile);
    }, [pendingFile, newGarmentName, uploadCategory, uploadSubCategory, setWardrobe, onGarmentSelect]);

    const triggerImport = () => {
        const url = prompt("Enter public JSON library URL:");
        if (url) onImportLibrary(url);
    };

    const secondarySubCategories = useMemo(() => {
        if (uploadCategory === 'Thematic' && uploadSubCategory in THEMATIC_SUB_CATEGORIES) {
            return THEMATIC_SUB_CATEGORIES[uploadSubCategory as keyof typeof THEMATIC_SUB_CATEGORIES];
        }
        return [];
    }, [uploadCategory, uploadSubCategory]);

  return (
    <div className="flex flex-col h-full pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Catalog</h2>
            <div className="flex gap-2">
                <button onClick={triggerImport} className="text-[9px] font-bold text-gray-400 hover:text-indigo-600 transition-colors">IMPORT</button>
                <button onClick={() => {
                  const data = JSON.stringify(wardrobe, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'wardrobe-catalog.json'; a.click();
                }} className="text-[9px] font-bold text-gray-400 hover:text-indigo-600 transition-colors">EXPORT</button>
            </div>
        </div>

        <div className="flex gap-4 min-h-[400px]">
            <div className="w-20 flex-shrink-0 flex flex-col gap-1 border-r border-gray-100 pr-2 overflow-y-auto custom-scrollbar">
                <button onClick={() => { setSelectedCategory('All'); setSelectedSubCategory('All'); }} className={cn("text-[9px] font-bold text-left py-2 px-2 rounded-lg transition-all", selectedCategory === 'All' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-900')}>ALL</button>
                {Object.keys(CATEGORY_STRUCTURE).map((cat) => (
                    <button key={cat} onClick={() => { setSelectedCategory(cat as MainCategory); setSelectedSubCategory('All'); }} className={cn("text-[9px] font-bold text-left py-2 px-2 rounded-lg transition-all leading-tight", selectedCategory === cat ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-gray-900')}>{cat.toUpperCase()}</button>
                ))}
            </div>

            <div className="flex-grow flex flex-col">
                {subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 pb-2 border-b border-gray-50 overflow-x-auto no-scrollbar">
                        <button onClick={() => setSelectedSubCategory('All')} className={cn("px-3 py-1 rounded-full text-[9px] font-bold border transition-all", selectedSubCategory === 'All' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500')}>ALL</button>
                        {subCategories.map((sub) => (
                            <button key={sub} onClick={() => setSelectedSubCategory(sub)} className={cn("px-3 py-1 rounded-full text-[9px] font-bold border transition-all", selectedSubCategory === sub ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500')}>{sub.toUpperCase()}</button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-grow overflow-y-auto pr-1 pb-10">
                    <label className="relative aspect-[3/4] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-400 group">
                        <PlusIcon className="w-6 h-6 mb-1 transition-transform group-hover:rotate-90"/>
                        <span className="text-[9px] font-bold uppercase">Add</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleInitialFileSelect} />
                    </label>

                    {filteredItems.map((item) => {
                        const isActive = activeGarmentIds.includes(item.id);
                        return (
                            <button key={item.id} onClick={() => handleGarmentClick(item)} disabled={isLoading || isActive} className="relative aspect-[3/4] border border-gray-100 rounded-xl overflow-hidden group">
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                    <p className="text-white text-[9px] font-bold">{item.name}</p>
                                </div>
                                {isActive && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><CheckCircleIcon className="w-5 h-5 text-white" /></div>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        <AnimatePresence>
            {isUploadFormOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed inset-x-4 bottom-24 z-50 bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-xl font-bold">Catalog New Item</h3>
                        <button onClick={() => setIsUploadFormOpen(false)}><XIcon className="w-6 h-6 text-gray-400" /></button>
                    </div>
                    
                    <div className="space-y-4">
                        <input type="text" value={newGarmentName} onChange={e => setNewGarmentName(e.target.value)} placeholder="Garment Name" className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none" />
                        <div className="grid grid-cols-2 gap-4">
                            <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value as MainCategory)} className="border border-gray-200 rounded-lg p-2 text-sm">
                                {Object.keys(CATEGORY_STRUCTURE).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <select value={uploadSubCategory} onChange={e => setUploadSubCategory(e.target.value)} className="border border-gray-200 rounded-lg p-2 text-sm">
                                <option value="">Select Sub-Category</option>
                                {CATEGORY_STRUCTURE[uploadCategory].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>
                        {secondarySubCategories.length > 0 && (
                             <div className="p-3 bg-gray-50 rounded-xl">
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Specialization Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {secondarySubCategories.map(tag => (
                                        <button key={tag} className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-[9px] hover:border-black transition-all">{tag}</button>
                                    ))}
                                </div>
                             </div>
                        )}
                        <button onClick={finalizeUpload} className="w-full bg-black text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95">Save to Library</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        {error && <p className="text-red-500 text-[10px] font-bold mt-4 p-2 bg-red-50 rounded border border-red-100">{error}</p>}
    </div>
  );
};

export default WardrobePanel;
