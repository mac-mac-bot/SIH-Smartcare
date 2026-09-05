import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  Smartphone,
  QrCode,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Wifi,
  AlertCircle,
  Radio,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Play
} from "lucide-react";

interface ExpoGoHubProps {
  onSwitchToMobileSimulator: () => void;
}

export const ExpoGoHub: React.FC<ExpoGoHubProps> = ({ onSwitchToMobileSimulator }) => {
  const [ipAddress, setIpAddress] = useState<string>("192.168.1.100");
  const [port, setPort] = useState<string>("8081");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const expoUrl = `exp://${ipAddress}:${port}`;

  useEffect(() => {
    // Generate QR code for the Expo URL
    QRCode.toDataURL(expoUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: "#0f766e",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, [expoUrl]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-600/60 text-teal-100 text-xs font-semibold mb-3 border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Native React Native & Expo Go Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              SmartCare-TN in Expo Go Format
            </h1>
            <p className="text-teal-100 text-sm sm:text-base max-w-xl leading-relaxed">
              The entire mobile application is built with standard <strong>React Native</strong>, <strong>Expo SDK 52</strong>, and <strong>Expo Router</strong> inside the <code className="bg-teal-900/60 px-1.5 py-0.5 rounded font-mono text-xs">/smartcare-mobile</code> directory.
            </p>
          </div>

          <button
            onClick={onSwitchToMobileSimulator}
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white text-teal-900 font-bold text-sm hover:bg-teal-50 transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Play className="w-4 h-4 text-teal-700 fill-teal-700" />
            <span>Launch In-Browser Simulator</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Code Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-4 border border-emerald-200">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Expo Go Metro QR Code</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner mb-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Expo Go QR Code"
                className="w-56 h-56 rounded-lg object-contain mx-auto"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                Generating QR code...
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 font-mono mb-4 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 max-w-full truncate">
            {expoUrl}
          </p>

          <div className="w-full text-left bg-teal-50/70 border border-teal-100 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-teal-900 mb-1 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-teal-700" />
              <span>Configure Your Local IP</span>
            </p>
            <p className="text-xs text-teal-800/80 mb-3">
              Replace with your computer's local Wi-Fi IP (run <code className="font-mono bg-teal-100 px-1 rounded">ipconfig</code> on Windows or <code className="font-mono bg-teal-100 px-1 rounded">ifconfig</code> on Mac/Linux):
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 192.168.1.100"
                className="flex-1 bg-white border border-teal-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={() => copyToClipboard(expoUrl, "expo-url")}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedCmd === "expo-url" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2 text-xs text-slate-600 text-left">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
              <span>Install <strong>Expo Go</strong> from Google Play Store or Apple App Store.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
              <span>Make sure phone and computer are on the <strong>same Wi-Fi network</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
              <span>Scan QR code using <strong>Expo Go</strong> (Android) or <strong>Camera</strong> (iOS).</span>
            </div>
          </div>
        </div>

        {/* Right Column: Execution & Architecture Guide */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Quick Start Commands */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-700" />
              <span>How to Start Expo Go from Terminal</span>
            </h3>

            <div className="space-y-3 mb-4">
              <div className="bg-slate-900 rounded-xl p-3.5 text-slate-100 font-mono text-xs flex items-center justify-between border border-slate-800">
                <div className="truncate mr-2">
                  <span className="text-teal-400">$</span> npm run mobile
                </div>
                <button
                  onClick={() => copyToClipboard("npm run mobile", "cmd1")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedCmd === "cmd1" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl p-3.5 text-slate-100 font-mono text-xs flex items-center justify-between border border-slate-800">
                <div className="truncate mr-2">
                  <span className="text-slate-500"># Or inside mobile dir:</span><br />
                  <span className="text-teal-400">$</span> cd smartcare-mobile && npx expo start
                </div>
                <button
                  onClick={() => copyToClipboard("cd smartcare-mobile && npx expo start", "cmd2")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedCmd === "cmd2" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <strong>Important for physical phones:</strong> Set the backend API URL in the mobile app's <strong>Settings tab</strong> to your computer's Wi-Fi IP (e.g. <code className="bg-amber-100 font-mono px-1 py-0.5 rounded text-[11px]">http://192.168.1.100:3000</code>). On physical phones, <code className="bg-amber-100 font-mono px-1 py-0.5 rounded text-[11px]">localhost</code> refers to the phone itself.
              </p>
            </div>
          </div>

          {/* Expo Go Structure Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-teal-700" />
              <span>Expo Router File-Based Mobile Architecture</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-teal-800">app/_layout.tsx</span>
                  <span className="text-slate-500">— Native Bottom Tabs + Brand Header</span>
                </div>
                <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-semibold text-[10px]">Root Layout</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-teal-800">app/index.tsx</span>
                  <span className="text-slate-500">— Home screen with Smart Recommendation</span>
                </div>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold text-[10px]">Screen</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-teal-800">components/MapView.tsx</span>
                  <span className="text-slate-500">— Zero-Tile Offline Vector Radar</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">100% Offline</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-teal-800">services/recommendations.ts</span>
                  <span className="text-slate-500">— Clinical Referral Formula (0.60/0.25/0.15)</span>
                </div>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold text-[10px]">Algorithm</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-teal-800">services/database.ts</span>
                  <span className="text-slate-500">— AsyncStorage Local Offline Storage</span>
                </div>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold text-[10px]">Storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
