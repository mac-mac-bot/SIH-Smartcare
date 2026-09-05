import React, { useState, useEffect } from "react";
import { Building, Activity, UserCheck, AlertOctagon, History, MapPin, RefreshCw, ShieldAlert } from "lucide-react";
import { Facility, AuditLogItem } from "../types";
import { Translations } from "../services/i18n";

interface AdminDashboardProps {
  facilities: Facility[];
  auditLogs: AuditLogItem[];
  t: Translations;
  onRefreshMetrics: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  facilities,
  auditLogs = [],
  t,
  onRefreshMetrics
}) => {
  const [filterStaleOnly, setFilterStaleOnly] = useState(false);
  const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];

  // Compute metrics from current facilities state
  const totalFacilities = facilities.length;
  let activeFacilities = 0;
  let needsConfirmFacilities = 0;
  let staleFacilities = 0;
  let totalDocs = 0;
  let docsOnDuty = 0;
  let xrayAvailable = 0;
  let ecgAvailable = 0;
  let medicineShortages = 0;

  facilities.forEach((fac) => {
    const hours = fac.hours_ago !== undefined ? fac.hours_ago : 2.0;
    if (hours < 6.0) activeFacilities++;
    else if (hours <= 24.0) needsConfirmFacilities++;
    else staleFacilities++;

    (fac.doctors || []).forEach((d) => {
      totalDocs++;
      if (d.status === "ON_DUTY") docsOnDuty++;
    });

    if (fac.diagnostics?.["X-Ray"]?.status === "AVAILABLE" || fac.services?.["X-Ray"] === "AVAILABLE") {
      xrayAvailable++;
    }
    if (fac.diagnostics?.["ECG"]?.status === "AVAILABLE" || fac.services?.["ECG"] === "AVAILABLE") {
      ecgAvailable++;
    }

    (fac.medicines || []).forEach((m) => {
      if (m.status === "LOW_STOCK" || m.status === "OUT_OF_STOCK") {
        medicineShortages++;
      }
    });
  });

  const doctorReadinessPct = totalDocs > 0 ? Math.round((docsOnDuty / totalDocs) * 100) : 0;

  const displayFacilities = filterStaleOnly
    ? facilities.filter((f) => (f.hours_ago || 0) >= 24.0)
    : facilities;

  return (
    <div className="space-y-4 pb-20">
      {/* Admin District Header */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-2 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="font-bold text-base">Tirunelveli & Tenkasi District Console</h2>
              <p className="text-[11px] text-teal-300">Public Health Operational Readiness & Audit Monitor</p>
            </div>
          </div>
          <button
            onClick={onRefreshMetrics}
            className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-300 hover:text-white"
            title="Refresh district stats"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] text-slate-500 font-medium">Total Facilities</p>
          <p className="text-xl font-black text-slate-900 mt-1">{totalFacilities}</p>
          <p className="text-[10px] text-teal-700 font-semibold mt-0.5">District Network</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/30">
          <p className="text-[11px] text-emerald-800 font-medium">Active (&lt; 6h)</p>
          <p className="text-xl font-black text-emerald-700 mt-1">{activeFacilities}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Verified Recent</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/30">
          <p className="text-[11px] text-amber-800 font-medium">Needs Confirmation</p>
          <p className="text-xl font-black text-amber-700 mt-1">{needsConfirmFacilities}</p>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">6 – 24 hrs</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/30">
          <p className="text-[11px] text-rose-800 font-medium">Stale (&gt; 24h)</p>
          <p className="text-xl font-black text-rose-700 mt-1">{staleFacilities}</p>
          <p className="text-[10px] text-rose-600 font-semibold mt-0.5">Outdated Warning</p>
        </div>
      </div>

      {/* Secondary Readiness Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Doctor Readiness */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              Doctor Roster
            </span>
            <span className="font-bold text-teal-700">{doctorReadinessPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${doctorReadinessPct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            {docsOnDuty} of {totalDocs} registered doctors currently on duty
          </p>
        </div>

        {/* Diagnostic Readiness */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              Diagnostics
            </span>
            <span className="font-bold text-slate-800">
              {xrayAvailable} X-Ray / {ecgAvailable} ECG
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(xrayAvailable / totalFacilities) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">Public facilities offering active radiology</p>
        </div>

        {/* Medicine Shortages */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
              Drug Shortages
            </span>
            <span className="font-bold text-amber-700">{medicineShortages} Items</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Low or depleted stock items flagged across hospital dispensaries
          </p>
        </div>
      </div>

      {/* Facilities Overview List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Facility Freshness & Status</h3>
          <button
            onClick={() => setFilterStaleOnly(!filterStaleOnly)}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition ${
              filterStaleOnly
                ? "bg-rose-100 text-rose-800 border-rose-300"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {filterStaleOnly ? "Showing Stale Only" : "Filter Stale (>24h)"}
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
          {displayFacilities.map((fac) => {
            const hours = fac.hours_ago !== undefined ? fac.hours_ago : 2.0;
            const isStale = hours >= 24.0;
            const isNeedsConfirm = hours >= 6.0 && hours < 24.0;

            return (
              <div key={fac.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                <div>
                  <p className="font-bold text-slate-800">{fac.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {fac.type} • {fac.taluk} • Updated: {fac.time_desc || "Recent"} by {fac.updated_by}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                  isStale
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : isNeedsConfirm
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {isStale ? "STALE" : isNeedsConfirm ? "NEEDS CONFIRM" : "VERIFIED"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Audit Log Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-2 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
            <History className="w-4 h-4 text-teal-600" />
            <span>District Audit Trail & Micro-Delta Log</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">{safeAuditLogs.length} events</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {safeAuditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              No audit events logged yet. Updates made in the Staff Portal will appear here in real-time.
            </p>
          ) : (
            safeAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-800">{log.facilityName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {log.updatedAt ? new Date(log.updatedAt).toLocaleTimeString() : "Recent"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1.5 flex-wrap">
                  <span className="bg-slate-200 text-slate-700 px-1.5 rounded font-mono text-[10px]">
                    {log.entity}
                  </span>
                  <span>Field: <strong>{log.field}</strong></span>
                  <span>({log.oldValue} ➔ <strong className="text-teal-700">{log.newValue}</strong>)</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Staff: {log.updatedBy} {log.reason && `• Note: ${log.reason}`}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
