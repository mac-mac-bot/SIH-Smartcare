import React, { useState } from "react";
import { Shield, Building2, User, Activity, Pill, Check, RefreshCw, AlertCircle } from "lucide-react";
import { Facility, ServiceStatus, DoctorStatus, MedicineStatus } from "../types";
import { Translations } from "../services/i18n";

interface StaffDashboardProps {
  facilities: Facility[];
  onStaffUpdate: (update: {
    facilityId: string;
    entity: "services" | "diagnostics" | "doctors" | "medicines";
    field: string;
    newValue: any;
    updatedBy: string;
    reason: string;
  }) => Promise<any>;
  t: Translations;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  facilities,
  onStaffUpdate,
  t
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    facilities[1]?.id || facilities[0]?.id || "hosp-2"
  );
  const [staffName, setStaffName] = useState("Staff Nurse Priya V.");
  const [staffRole, setStaffRole] = useState("Duty Nurse / In-Charge");
  const [activeTab, setActiveTab] = useState<"services" | "diagnostics" | "doctors" | "medicines">("diagnostics");
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null);

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  const handleUpdate = async (
    entity: "services" | "diagnostics" | "doctors" | "medicines",
    field: string,
    newValue: any,
    reason: string = "Routine availability update"
  ) => {
    setIsUpdating(true);
    setLastActionStatus(null);
    try {
      await onStaffUpdate({
        facilityId: selectedFacility.id,
        entity,
        field,
        newValue,
        updatedBy: `${staffName} (${staffRole})`,
        reason
      });
      setLastActionStatus(`Updated ${field} -> ${newValue}. Audit record created.`);
      setTimeout(() => setLastActionStatus(null), 4000);
    } catch (e) {
      console.error("Staff update error:", e);
      setLastActionStatus("Update failed. Check connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!selectedFacility) {
    return <div className="p-4 text-center">Loading facility data...</div>;
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Staff Identity Card */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-3 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-400" />
            <h2 className="font-bold text-base">{t.staffPortal}</h2>
          </div>
          <span className="text-[10px] bg-teal-900/80 text-teal-300 font-mono px-2 py-0.5 rounded border border-teal-700">
            ROLE: FACILITY_STAFF
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Assigned Public Facility</label>
            <select
              id="staff-facility-select"
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-teal-500"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Author / Duty Staff</label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          Last record update: <strong>{selectedFacility.last_updated}</strong> by <em>{selectedFacility.updated_by}</em>
        </p>
      </div>

      {/* Confirmation notification banner */}
      {lastActionStatus && (
        <div className="bg-emerald-900/90 text-emerald-100 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-700 shadow animate-fade-in">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{lastActionStatus}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: "diagnostics", label: "Diagnostics", icon: <Activity className="w-4 h-4" /> },
          { id: "services", label: "Services", icon: <Building2 className="w-4 h-4" /> },
          { id: "doctors", label: "Doctors", icon: <User className="w-4 h-4" /> },
          { id: "medicines", label: "Medicines", icon: <Pill className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === tab.id
                ? "border-teal-600 text-teal-700 bg-teal-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* DIAGNOSTICS TAB */}
      {activeTab === "diagnostics" && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
            <strong>Demo Scenario Helper:</strong> To test dynamic ranking, change <strong>X-Ray</strong> from <em>AVAILABLE</em> to <em>UNAVAILABLE</em> or vice-versa, then return to patient Find Care view to see the ranking score update!
          </div>

          {["X-Ray", "ECG", "Blood Test", "Ultrasound"].map((diagName) => {
            const diagInfo = selectedFacility.diagnostics?.[diagName];
            const currentStatus = (typeof diagInfo === "object" ? diagInfo.status : diagInfo) || "UNAVAILABLE";

            return (
              <div
                key={diagName}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <h3 className="font-bold text-slate-900 text-sm">{diagName}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    currentStatus === "AVAILABLE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : currentStatus === "LIMITED"
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-rose-50 text-rose-700 border-rose-300"
                  }`}>
                    Current: {currentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(["AVAILABLE", "LIMITED", "UNAVAILABLE"] as ServiceStatus[]).map((st) => (
                    <button
                      key={st}
                      id={`btn-${diagName.toLowerCase().replace(/\s+/g, "-")}-${st.toLowerCase()}`}
                      disabled={isUpdating}
                      onClick={() =>
                        handleUpdate(
                          "diagnostics",
                          diagName,
                          st,
                          st === "UNAVAILABLE"
                            ? "Equipment calibration or maintenance"
                            : "Routine operational verified"
                        )
                      }
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                        currentStatus === st
                          ? "bg-teal-700 text-white border-teal-700 shadow"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SERVICES TAB */}
      {activeTab === "services" && (
        <div className="space-y-3">
          {Object.entries(selectedFacility.services || {}).map(([serviceName, currentStatus]) => (
            <div
              key={serviceName}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{serviceName}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  currentStatus === "AVAILABLE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : currentStatus === "LIMITED"
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-rose-50 text-rose-700 border-rose-300"
                }`}>
                  {currentStatus}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["AVAILABLE", "LIMITED", "UNAVAILABLE"] as ServiceStatus[]).map((st) => (
                  <button
                    key={st}
                    disabled={isUpdating}
                    onClick={() => handleUpdate("services", serviceName, st)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition ${
                      currentStatus === st
                        ? "bg-teal-700 text-white border-teal-700"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DOCTORS TAB */}
      {activeTab === "doctors" && (
        <div className="space-y-3">
          {(selectedFacility.doctors || []).map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                  <p className="text-xs text-slate-500">{doc.specialty} • {doc.room}</p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  doc.status === "ON_DUTY"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : doc.status === "OFF_DUTY"
                    ? "bg-slate-100 text-slate-700 border-slate-300"
                    : "bg-rose-50 text-rose-700 border-rose-300"
                }`}>
                  {doc.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["ON_DUTY", "OFF_DUTY", "LEAVE"] as DoctorStatus[]).map((dst) => (
                  <button
                    key={dst}
                    disabled={isUpdating}
                    onClick={() => handleUpdate("doctors", doc.id, dst, `Shift roster update for ${doc.name}`)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition ${
                      doc.status === dst
                        ? "bg-teal-700 text-white border-teal-700"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {dst.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MEDICINES TAB */}
      {activeTab === "medicines" && (
        <div className="space-y-3">
          {(selectedFacility.medicines || []).map((med) => (
            <div
              key={med.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                  <p className="text-xs text-slate-500">Generic: {med.generic}</p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  med.status === "IN_STOCK"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : med.status === "LOW_STOCK"
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-rose-50 text-rose-700 border-rose-300"
                }`}>
                  {med.status.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] as MedicineStatus[]).map((mst) => (
                  <button
                    key={mst}
                    disabled={isUpdating}
                    onClick={() => handleUpdate("medicines", med.name, mst, `Drug inventory check for ${med.name}`)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition ${
                      med.status === mst
                        ? "bg-teal-700 text-white border-teal-700"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {mst.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
