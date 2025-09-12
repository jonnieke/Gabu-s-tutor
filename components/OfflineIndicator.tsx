import React, { useState, useEffect } from 'react';
import { WifiIcon, WifiSlashIcon, CloudIcon, CloudSlashIcon } from './Icons';
import { offlineService, SyncStatus } from '../services/offlineService';

const OfflineIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(offlineService.getSyncStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineService.subscribe((status) => {
      setSyncStatus(status);
    });

    return unsubscribe;
  }, []);

  const getStatusColor = () => {
    if (syncStatus.isOnline) {
      return syncStatus.pendingChanges > 0 ? 'text-yellow-600' : 'text-green-600';
    }
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (syncStatus.isOnline) {
      return syncStatus.pendingChanges > 0 ? <CloudIcon className="w-4 h-4" /> : <WifiIcon className="w-4 h-4" />;
    }
    return <WifiSlashIcon className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) return 'Syncing...';
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.pendingChanges > 0) return `${syncStatus.pendingChanges} pending`;
    return 'Online';
  };

  const handleSync = () => {
    if (syncStatus.isOnline && !syncStatus.isSyncing) {
      offlineService.syncData();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
          syncStatus.isOnline
            ? 'bg-green-100 hover:bg-green-200'
            : 'bg-red-100 hover:bg-red-200'
        } ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Connection Status</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {syncStatus.lastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last sync:</span>
                  <span className="text-sm text-gray-800">
                    {syncStatus.lastSync.toLocaleTimeString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending changes:</span>
                <span className="text-sm text-gray-800">{syncStatus.pendingChanges}</span>
              </div>
            </div>

            {syncStatus.isOnline && syncStatus.pendingChanges > 0 && !syncStatus.isSyncing && (
              <button
                onClick={handleSync}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Sync Now
              </button>
            )}

            {!syncStatus.isOnline && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  You're offline. Your data will sync automatically when you're back online.
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Gabu's Tutor works offline. Your progress and bookmarks are saved locally.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
