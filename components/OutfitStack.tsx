
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer } from '../types';
import { Trash2Icon, PlusIcon } from './icons';

interface OutfitStackProps {
  outfitHistory: OutfitLayer[];
  onRemoveLastGarment: () => void;
  onSaveOutfit: () => void;
  isSaveDisabled: boolean;
}

const OutfitStack: React.FC<OutfitStackProps> = ({ 
    outfitHistory, 
    onRemoveLastGarment, 
    onSaveOutfit,
    isSaveDisabled
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Active Look</h2>
        <button 
            onClick={onSaveOutfit}
            disabled={isSaveDisabled}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
            SAVE LOOK
        </button>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {outfitHistory.map((layer, index) => (
          <div
            key={layer.garment?.id || 'base'}
            className="flex items-center justify-between bg-white border border-gray-100 p-1.5 rounded-lg transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center overflow-hidden">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-3 text-[10px] font-bold text-gray-400 bg-gray-50 rounded-full">
                  {index + 1}
                </span>
                {layer.garment && (
                    <img src={layer.garment.url} alt={layer.garment.name} className="flex-shrink-0 w-8 h-8 object-cover rounded mr-3" />
                )}
                <span className="text-[11px] font-semibold text-gray-700 truncate" title={layer.garment?.name}>
                  {layer.garment ? layer.garment.name : 'Base Model'}
                </span>
            </div>
            {index > 0 && index === outfitHistory.length - 1 && (
               <button
                onClick={onRemoveLastGarment}
                className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50"
                aria-label={`Remove ${layer.garment?.name}`}
              >
                <Trash2Icon className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {outfitHistory.length === 1 && (
            <p className="text-center text-[10px] text-gray-400 py-4 italic">No items stacked yet.</p>
        )}
      </div>
    </div>
  );
};

export default OutfitStack;
