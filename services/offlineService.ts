// Offline mode service for Gabu's Tutor
// Handles caching, offline detection, and data synchronization

export interface OfflineData {
  bookmarks: any[];
  progress: any;
  recentTopics: string[];
  settings: any;
  lastSync: Date;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  isSyncing: boolean;
}

class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = navigator.onLine;
  private syncStatus: SyncStatus = {
    isOnline: this.isOnline,
    lastSync: null,
    pendingChanges: 0,
    isSyncing: false
  };
  private listeners: ((status: SyncStatus) => void)[] = [];

  private constructor() {
    this.setupEventListeners();
    this.loadOfflineData();
  }

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateSyncStatus();
      this.syncData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateSyncStatus();
    });

    // Listen for storage changes to track pending changes
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('gabu-')) {
        this.updatePendingChanges();
      }
    });
  }

  private updateSyncStatus(): void {
    this.syncStatus = {
      ...this.syncStatus,
      isOnline: this.isOnline,
      lastSync: this.isOnline ? new Date() : this.syncStatus.lastSync
    };
    this.notifyListeners();
  }

  private updatePendingChanges(): void {
    // Count items that need syncing
    const pending = this.getPendingSyncItems().length;
    this.syncStatus = {
      ...this.syncStatus,
      pendingChanges: pending
    };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  public isAppOnline(): boolean {
    return this.isOnline;
  }

  // Cache data for offline use
  public cacheData(key: string, data: any): void {
    try {
      const offlineData: OfflineData = {
        bookmarks: JSON.parse(localStorage.getItem('gabu-bookmarks') || '[]'),
        progress: JSON.parse(localStorage.getItem('gabu-progress') || '{}'),
        recentTopics: JSON.parse(localStorage.getItem('gabu-recent-topics') || '[]'),
        settings: JSON.parse(localStorage.getItem('gabu-settings') || '{}'),
        lastSync: new Date()
      };

      localStorage.setItem(`gabu-offline-${key}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));

      // Mark as pending sync if offline
      if (!this.isOnline) {
        this.markForSync(key);
      }
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  // Retrieve cached data
  public getCachedData(key: string): any | null {
    try {
      const cached = localStorage.getItem(`gabu-offline-${key}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.data;
      }
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
    }
    return null;
  }

  // Load offline data on app start
  private loadOfflineData(): void {
    try {
      const offlineData = localStorage.getItem('gabu-offline-data');
      if (offlineData) {
        const parsed = JSON.parse(offlineData);
        this.syncStatus.lastSync = new Date(parsed.lastSync);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  // Mark data for sync when online
  private markForSync(key: string): void {
    const pending = this.getPendingSyncItems();
    if (!pending.includes(key)) {
      pending.push(key);
      localStorage.setItem('gabu-pending-sync', JSON.stringify(pending));
      this.updatePendingChanges();
    }
  }

  private getPendingSyncItems(): string[] {
    try {
      const pending = localStorage.getItem('gabu-pending-sync');
      return pending ? JSON.parse(pending) : [];
    } catch {
      return [];
    }
  }

  // Sync data when back online
  public async syncData(): Promise<void> {
    if (!this.isOnline || this.syncStatus.isSyncing) return;

    this.syncStatus.isSyncing = true;
    this.notifyListeners();

    try {
      const pending = this.getPendingSyncItems();
      
      // Simulate sync process (in real app, this would sync with server)
      for (const key of pending) {
        await this.syncItem(key);
      }

      // Clear pending items
      localStorage.removeItem('gabu-pending-sync');
      
      this.syncStatus = {
        ...this.syncStatus,
        lastSync: new Date(),
        pendingChanges: 0,
        isSyncing: false
      };

      // Save offline data
      localStorage.setItem('gabu-offline-data', JSON.stringify({
        lastSync: this.syncStatus.lastSync
      }));

    } catch (error) {
      console.error('Sync failed:', error);
      this.syncStatus.isSyncing = false;
    }

    this.notifyListeners();
  }

  private async syncItem(key: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this would upload to server
    console.log(`Syncing item: ${key}`);
  }

  // Get offline capabilities status
  public getOfflineCapabilities(): {
    canWorkOffline: boolean;
    cachedItems: number;
    lastSync: Date | null;
  } {
    const cachedItems = Object.keys(localStorage)
      .filter(key => key.startsWith('gabu-offline-'))
      .length;

    return {
      canWorkOffline: true,
      cachedItems,
      lastSync: this.syncStatus.lastSync
    };
  }

  // Clear offline cache
  public clearOfflineCache(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('gabu-offline-'));
    keys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('gabu-pending-sync');
    this.updatePendingChanges();
  }
}

export const offlineService = OfflineService.getInstance();
