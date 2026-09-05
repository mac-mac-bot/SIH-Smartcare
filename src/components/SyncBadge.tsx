import React from "react";
import { RefreshCw, Wifi, WifiOff, CheckCircle, Database } from "lucide-react";
import { Translations } from "../services/i18n";
import { SyncMetadata } from "../types";

interface SyncBadgeProps {
  t: Translations;
  isOnline: boolean;
  syncMeta: SyncMetadata | null;
  isSyncing: boolean;
  onSync: () => void;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({
  t,
  isOnline,
  syncMeta,
  isSyncing,
  onSync
}) => {
  return (
    <div className="flex items-center gap-2 bg-emerald-950/80 text-emerald-100 px-3 py-1.5 rounded-full text-xs border border-emerald-700/50 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        {isOnline ? (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-300" />
        )}
        <span className="font-medium">
          {isOnline ? "Online" : t.offlineMode}
        </span>
      </div>

      <span className="text-emerald-400/40">|</span>

      <div className="flex items-center gap-1 text-[11px] text-emerald-200 truncate max-w-[140px] sm:max-w-none">
        {isSyncing ? (
          <span className="flex items-center gap-1 text-emerald-300 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            {t.syncing}
          </span>
        ) : syncMeta ? (
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>{syncMeta.lastSyncDate || "Synced"}</span>
            {syncMeta.payloadBytes > 0 && (
              <span className="text-[10px] bg-emerald-900/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/40">
                {syncMeta.payloadBytes} B
              </span>
            )}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-200">
            <Database className="w-3 h-3" />
            Cached local
          </span>
        )}
      </div>

      <button
        id="sync-now-button"
        onClick={onSync}
        disabled={isSyncing}
        title={t.syncNow}
        className="ml-1 p-1 hover:bg-emerald-800 rounded-full transition disabled:opacity-50 text-emerald-200 hover:text-white"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
};
