import React, { useState } from "react";
import { PhoneCall, MessageSquare, AlertCircle, Shield, Flame, Ambulance, UserCheck, MapPin } from "lucide-react";
import { Translations } from "../services/i18n";

interface EmergencyBtnProps {
  t: Translations;
  userLat: number;
  userLon: number;
}

interface EmergencyService {
  id: string;
  name: string;
  tamilName: string;
  number: string;
  description: string;
  icon: React.ReactNode;
  themeColor: string;
  btnColor: string;
}

export const EmergencyBtn: React.FC<EmergencyBtnProps> = ({
  t,
  userLat,
  userLon
}) => {
  const [copied, setCopied] = useState(false);

  const emergencyServices: EmergencyService[] = [
    {
      id: "108",
      name: "108 Medical Ambulance",
      tamilName: "108 ஆம்புலன்ஸ் அவசர சேவை",
      number: "108",
      description: "Free 24x7 Government emergency medical transport across Tamil Nadu",
      icon: <Ambulance className="w-6 h-6 text-rose-600" />,
      themeColor: "border-rose-200 bg-rose-50/70",
      btnColor: "bg-rose-600 hover:bg-rose-700 text-white"
    },
    {
      id: "100",
      name: "100 Police Control",
      tamilName: "100 காவல் உதவி",
      number: "100",
      description: "State police emergency response & highway assistance",
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      themeColor: "border-blue-200 bg-blue-50/70",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white"
    },
    {
      id: "101",
      name: "101 Fire & Rescue",
      tamilName: "101 தீயணைப்பு மற்றும் மீட்பு",
      number: "101",
      description: "Tamil Nadu Fire and Rescue Services department",
      icon: <Flame className="w-6 h-6 text-orange-600" />,
      themeColor: "border-orange-200 bg-orange-50/70",
      btnColor: "bg-orange-600 hover:bg-orange-700 text-white"
    },
    {
      id: "1091",
      name: "1091 Women Helpline",
      tamilName: "1091 மகளிர் உதவி எண்",
      number: "1091",
      description: "Dedicated 24x7 support & safety helpline for women",
      icon: <UserCheck className="w-6 h-6 text-purple-600" />,
      themeColor: "border-purple-200 bg-purple-50/70",
      btnColor: "bg-purple-600 hover:bg-purple-700 text-white"
    }
  ];

  const mapLink = `https://maps.google.com/?q=${userLat.toFixed(5)},${userLon.toFixed(5)}`;
  const sosMessage = `Emergency assistance required. My location: Lat ${userLat.toFixed(5)}, Lon ${userLon.toFixed(5)}. Map link: ${mapLink}`;

  const handleCopyLocation = () => {
    navigator.clipboard?.writeText(sosMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Disclaimer / Banner */}
      <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-200" />
          <h2 className="font-bold text-base">Dual-Channel Emergency Escalation</h2>
        </div>
        <p className="text-xs text-rose-100 leading-relaxed">
          Tapping call or SMS opens your device's native phone dialer or SMS app. Works offline without active data connection.
        </p>
        <div className="bg-rose-700/80 p-2.5 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
            <span className="truncate font-mono">
              GPS: {userLat.toFixed(4)}° N, {userLon.toFixed(4)}° E
            </span>
          </div>
          <button
            onClick={handleCopyLocation}
            className="bg-rose-800 hover:bg-rose-900 text-rose-100 px-2 py-1 rounded text-[11px] font-medium shrink-0 ml-2 transition"
          >
            {copied ? "Copied!" : "Copy SOS text"}
          </button>
        </div>
      </div>

      {/* Emergency Cards */}
      <div className="grid grid-cols-1 gap-3">
        {emergencyServices.map((srv) => (
          <div
            key={srv.id}
            className={`p-4 rounded-2xl border ${srv.themeColor} shadow-sm space-y-3 transition hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                  {srv.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{srv.name}</h3>
                  <p className="text-xs text-slate-600 font-medium">{srv.tamilName}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-white/90 px-2 py-1 rounded-lg border border-slate-200 text-slate-800">
                #{srv.number}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {srv.description}
            </p>

            {/* Action Buttons: Native Call + Native SMS */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                id={`call-${srv.id}`}
                href={`tel:${srv.number}`}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs ${srv.btnColor} shadow-sm transition active:scale-98`}
              >
                <PhoneCall className="w-4 h-4" />
                Call {srv.number}
              </a>

              <a
                id={`sms-${srv.id}`}
                href={`sms:${srv.number}?body=${encodeURIComponent(sosMessage)}`}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-semibold text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition active:scale-98"
              >
                <MessageSquare className="w-4 h-4 text-slate-600" />
                SMS SOS
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Notice */}
      <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 text-center leading-relaxed">
        SmartCare-TN complies with standard public safety protocols. Emergency telephone numbers (108, 100, 101, 1091) are toll-free and accessible even with zero mobile balance.
      </div>
    </div>
  );
};
