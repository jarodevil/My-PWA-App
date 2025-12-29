
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { SavedOutfit, SavedCharacter } from '../types';
import { Trash2Icon } from './icons';

interface SavedOutfitsPanelProps {
  outfits: SavedOutfit[];
  characters: SavedCharacter[];
  onLoadOutfit: (outfit: SavedOutfit) => void;
  onDeleteOutfit: (id: string) => void;
  onDeleteCharacter: (id: string) => void;
}

const SavedOutfitsPanel: React.FC<SavedOutfitsPanelProps> = ({ 
    outfits, 
    characters,
    onLoadOutfit, 
    onDeleteOutfit,
    onDeleteCharacter
}) => {
    if (outfits.length === 0 && characters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Lookbook Empty</p>
                <p className="text-[10px] mt-1">Your saved UHQ renders and characters will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 h-full overflow-y-auto pb-10 pr-1 custom-scrollbar">
            {/* Outfits Section */}
            {outfits.length > 0 && (
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Saved Looks</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {outfits.map((outfit) => (
                            <div key={outfit.id} className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <button onClick={() => onLoadOutfit(outfit)} className="w-full text-left">
                                    <div className="aspect-[3/4] overflow-hidden">
                                        <img src={outfit.previewUrl} alt={outfit.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <div className="p-2 border-t border-gray-50 bg-gray-50/30">
                                        <h4 className="text-[10px] font-bold text-gray-900 truncate">{outfit.name}</h4>
                                    </div>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteOutfit(outfit.id); }}
                                    className="absolute top-1 right-1 p-1.5 bg-white/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                >
                                    <Trash2Icon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Characters Section */}
            {characters.length > 0 && (
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Saved Personas</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {characters.map((char) => (
                            <div key={char.id} className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-[3/4] overflow-hidden">
                                    <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                                <div className="p-2 border-t border-gray-50 bg-gray-50/30">
                                    <h4 className="text-[10px] font-bold text-gray-900 truncate">{char.name}</h4>
                                    <p className="text-[8px] text-gray-400 uppercase">{char.gender} • {char.settings.style.replace(/-/g, ' ')}</p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteCharacter(char.id); }}
                                    className="absolute top-1 right-1 p-1.5 bg-white/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                >
                                    <Trash2Icon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedOutfitsPanel;
