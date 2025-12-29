
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const DB_NAME = 'FitCheck_Studio_DB';
const DB_VERSION = 1;
const STORES = {
  ASSETS: 'assets', // Obrazy binarne (Blob)
  METADATA: 'metadata' // Metadane obiektów
};

class AssetStorage {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORES.ASSETS)) db.createObjectStore(STORES.ASSETS);
        if (!db.objectStoreNames.contains(STORES.METADATA)) db.createObjectStore(STORES.METADATA);
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveAsset(id: string, data: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORES.ASSETS, 'readwrite');
      transaction.objectStore(STORES.ASSETS).put(data, id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getAsset(id: string): Promise<string | null> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORES.ASSETS, 'readonly');
      const request = transaction.objectStore(STORES.ASSETS).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  // Added missing getAllKeys method
  async getAllKeys(): Promise<string[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORES.ASSETS, 'readonly');
      const request = transaction.objectStore(STORES.ASSETS).getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAsset(id: string): Promise<void> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(STORES.ASSETS, 'readwrite');
    transaction.objectStore(STORES.ASSETS).delete(id);
  }

  async clearObsolete(activeIds: string[]): Promise<void> {
    if (!this.db) return;
    const transaction = this.db!.transaction(STORES.ASSETS, 'readwrite');
    const store = transaction.objectStore(STORES.ASSETS);
    const request = store.getAllKeys();
    request.onsuccess = () => {
      const keys = request.result as string[];
      keys.forEach(key => {
        if (!activeIds.includes(key)) store.delete(key);
      });
    };
  }
}

export const storage = new AssetStorage();
