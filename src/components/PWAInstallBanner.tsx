import React, { useState, useEffect } from "react";
import { Download, Share, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      <div className="bg-teal-900 text-white px-3 py-2 text-xs flex items-center justify-between border-b border-teal-800">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-teal-300" />
          <span>
            <strong>Install SmartCare App:</strong> Works 100% offline in rural areas
          </span>
        </div>

        <div className="flex items-center gap-2">
          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-2.5 py-1 rounded-lg text-xs transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Install PWA
            </button>
          ) : isIOS ? (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-1 bg-teal-700 hover:bg-teal-600 text-white px-2.5 py-1 rounded-lg text-xs transition"
            >
              <Share className="w-3.5 h-3.5" />
              iOS Install
            </button>
          ) : (
            <button
              onClick={() => alert("To install on mobile or desktop: Click your browser's menu (⋮ or Share) and select 'Add to Home screen' or 'Install App'.")}
              className="flex items-center gap-1 bg-teal-700 hover:bg-teal-600 text-white px-2.5 py-1 rounded-lg text-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="text-teal-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-800 space-y-3">
            <h3 className="text-base font-bold text-slate-900">Install SmartCare on iPhone / iPad</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              1. Tap the <strong>Share</strong> icon in Safari's bottom toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. Tap <strong>Add</strong> at top right. SmartCare will appear on your home screen and open offline!
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
