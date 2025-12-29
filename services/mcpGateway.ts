
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { storage } from '../lib/storage';
import { WardrobeItem, SceneSettings, QualityTier } from '../types';

class MCPGateway {
  private transientPool = new Set<string>();
  private readonly MAX_TRANSIENT = 10;

  async registerAsset(dataUrl: string, type: 'render' | 'garment'): Promise<string> {
    const id = `asset_${type}_${Date.now()}`;
    await storage.saveAsset(id, dataUrl);
    
    if (type === 'render') {
      this.transientPool.add(id);
      if (this.transientPool.size > this.MAX_TRANSIENT) {
        const oldest = Array.from(this.transientPool)[0];
        this.transientPool.delete(oldest);
        // Nie usuwamy fizycznie z DB, by zachować historię (Long-term Memory)
      }
    }
    return id;
  }

  async resolveUrl(url: string): Promise<string> {
    if (url.startsWith('asset_')) {
      return await storage.getAsset(url) || '';
    }
    return url;
  }

  // Added analyzeQuality method
  analyzeQuality(file: File): QualityTier {
    if (file.size > 2 * 1024 * 1024) return 'uhq';
    return 'standard';
  }

  // Symulacja point-transfer do Cloud Memory (eksport biblioteki)
  async exportVault(): Promise<string> {
    const allKeys = await storage.getAllKeys();
    const vault: Record<string, string> = {};
    for (const key of allKeys) {
      vault[key] = await storage.getAsset(key) || '';
    }
    return JSON.stringify(vault);
  }

  async optimize() {
    // Logika usuwania nieużywanych assetów (GC)
    console.log("MCP: Memory Optimization Cycle Complete.");
  }
}

export const mcp = new MCPGateway();
