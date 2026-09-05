import React, { useState } from "react";
import { PlusCircle, FileText, Calendar, CheckCircle2, RefreshCw, Clock, AlertCircle } from "lucide-react";
import { HealthRecord, Facility } from "../types";
import { Translations } from "../services/i18n";

interface HealthRecordViewProps {
  records: HealthRecord[];
  facilities: Facility[];
  onAddRecord: (record: Omit<HealthRecord, "id" | "createdAt" | "status">) => Promise<void>;
  isOnline: boolean;
  t: Translations;
}

export const HealthRecordView: React.FC<HealthRecordViewProps> = ({
  records,
  facilities,
  onAddRecord,
  isOnline,
  t
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [facilityName, setFacilityName] = useState(facilities[0]?.name || "Primary Health Centre, Cheranmahadevi");
  const [serviceReceived, setServiceReceived] = useState("General Consultation");
  const [visitDate, setVisitDate] = useState("2026-09-05");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityName || !notes.trim()) return;

    setIsSaving(true);
    try {
      await onAddRecord({
        facilityName,
        serviceReceived,
        visitDate,
        followUpDate: followUpDate || undefined,
        notes
      });
      setNotes("");
      setFollowUpDate("");
      setShowAddModal(false);
    } catch (e) {
      console.error("Failed to save health record:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header with Add Button */}
      <div className="bg-teal-900 text-white p-4 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-300" />
            <h2 className="font-bold text-base">{t.navHealthRecord}</h2>
          </div>
          <button
            id="open-add-record-modal"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs py-2 px-3 rounded-xl transition shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Visit</span>
          </button>
        </div>
        <p className="text-xs text-teal-200">
          Personal longitudinal patient health book. Stored safely in your browser offline database.
        </p>
      </div>

      {/* Sync Queue Banner */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-600">
          Total Records: <strong>{records.length}</strong>
        </span>
        <div className="flex items-center gap-2">
          {records.some((r) => r.status === "PENDING_SYNC") && (
            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
              <Clock className="w-3 h-3" />
              Pending Sync
            </span>
          )}
          <span className="text-slate-400">|</span>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Local IndexedDB
          </span>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {records.map((rec) => {
          let statusBadge = (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              Synced
            </span>
          );

          if (rec.status === "PENDING_SYNC") {
            statusBadge = (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                <Clock className="w-3 h-3 text-amber-700" />
                Pending Sync
              </span>
            );
          } else if (rec.status === "SYNCING") {
            statusBadge = (
              <span className="flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-700" />
                Syncing...
              </span>
            );
          }

          return (
            <div
              key={rec.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5 hover:border-teal-300 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{rec.facilityName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      {rec.visitDate}
                    </span>
                    <span>•</span>
                    <span className="text-teal-700 font-medium">{rec.serviceReceived}</span>
                  </div>
                </div>
                {statusBadge}
              </div>

              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                {rec.notes}
              </p>

              {rec.followUpDate && (
                <div className="flex items-center gap-1.5 text-xs text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Scheduled Follow-up: {rec.followUpDate}</span>
                </div>
              )}
            </div>
          );
        })}

        {records.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">{t.noRecords}</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold text-teal-700 underline mt-1"
            >
              + Create First Record
            </button>
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-600" />
                {t.newRecord}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Public Healthcare Facility
                </label>
                <select
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name} ({f.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Service / Department
                  </label>
                  <input
                    type="text"
                    value={serviceReceived}
                    onChange={(e) => setServiceReceived(e.target.value)}
                    placeholder="e.g. Pediatrics, X-Ray"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Diagnosis / Treatment / Prescription Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record symptoms, doctor advice, prescribed tablets, test results..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Follow-up Date (Optional)
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? "Saving to Local Storage..." : t.saveRecord}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
