import { SavedHighlight } from '../types/recorder';

const DB_NAME = 'clutchclip_db';
const DB_VERSION = 1;
const STORE_NAME = 'highlights';

class IndexedDbStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  async saveHighlight(clip: Omit<SavedHighlight, 'videoUrl'>): Promise<SavedHighlight> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        ...clip,
      };

      const request = store.put(record);

      request.onsuccess = () => {
        const videoUrl = URL.createObjectURL(clip.blob);
        resolve({
          ...clip,
          videoUrl,
        });
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAllHighlights(): Promise<SavedHighlight[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev'); // newest first
      const results: SavedHighlight[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const item = cursor.value;
          const videoUrl = URL.createObjectURL(item.blob);
          results.push({
            ...item,
            videoUrl,
          });
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteHighlight(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateHighlightTitle(id: string, newTitle: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result;
        if (item) {
          item.title = newTitle;
          const putReq = store.put(item);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async getStorageQuotaEstimate(highlights?: SavedHighlight[]): Promise<StorageQuotaEstimate> {
    const highlightsBytes = (highlights || []).reduce(
      (sum, h) => sum + (h.fileSizeBytes || h.blob?.size || 0),
      0
    );

    let browserUsageBytes = highlightsBytes;
    let quotaBytes = 2 * 1024 * 1024 * 1024; // 2 GB fallback if navigator.storage is unavailable
    let isRealQuota = false;

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const details = (estimate as StorageEstimate & { usageDetails?: { indexedDB?: number } }).usageDetails;
        if (typeof estimate.quota === 'number' && estimate.quota > 0) {
          quotaBytes = estimate.quota;
          isRealQuota = true;
        }
        const reportedIdb = details?.indexedDB ?? estimate.usage ?? 0;
        browserUsageBytes = Math.max(highlightsBytes, reportedIdb);
      } catch {
        // Fallback to calculated bytes
      }
    }

    const availableBytes = Math.max(0, quotaBytes - browserUsageBytes);
    const percentUsed = quotaBytes > 0 ? Math.min(100, (browserUsageBytes / quotaBytes) * 100) : 0;
    const highlightsPercentOfQuota = quotaBytes > 0 ? Math.min(100, (highlightsBytes / quotaBytes) * 100) : 0;

    return {
      highlightsBytes,
      browserUsageBytes,
      quotaBytes,
      availableBytes,
      percentUsed,
      highlightsPercentOfQuota,
      isRealQuota,
    };
  }
}

export interface StorageQuotaEstimate {
  highlightsBytes: number;
  browserUsageBytes: number;
  quotaBytes: number;
  availableBytes: number;
  percentUsed: number;
  highlightsPercentOfQuota: number;
  isRealQuota: boolean;
}

export const indexedDbStorage = new IndexedDbStorageService();

