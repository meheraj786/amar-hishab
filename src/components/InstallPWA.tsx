import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, check if already installed
    if (
      iOS &&
      "standalone" in window.navigator &&
      (window.navigator as any).standalone
    ) {
      setIsInstallable(false);
    } else if (!iOS) {
      // For non-iOS browsers, assume installable unless we know otherwise
      // The beforeinstallprompt event will confirm
      setTimeout(() => {
        if (!deferredPrompt) {
          setIsInstallable(true); // Show button for manual install instructions
        }
      }, 1000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Modern PWA install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      // Manual install instructions
      if (isIOS) {
        alert(
          "iOS Safari তে ইনস্টল করার জন্য:\n\n" +
            "১. Share বাটনে ক্লিক করুন (□)\n" +
            "২. 'Add to Home Screen' এ ক্লিক করুন\n" +
            "৩. 'Add' বাটনে ক্লিক করুন",
        );
      } else {
        alert(
          "আপনার ব্রাউজার সরাসরি ইনস্টল সাপোর্ট করছে না।\n\n" +
            "১. ব্রাউজারের ৩-ডট মেনুতে ক্লিক করুন।\n" +
            "২. 'Install App' বা 'Add to Home Screen' এ ক্লিক করুন।",
        );
      }
    }
  };

  // Don't show button if already installed on iOS
  if (
    isIOS &&
    "standalone" in window.navigator &&
    (window.navigator as any).standalone
  ) {
    return null;
  }

  // Show button for all cases where installation might be possible
  return (
    <Button
      onClick={handleInstall}
      className={`w-full text-white shadow-lg flex items-center justify-center gap-2 px-6 py-6 rounded-2xl text-base ${
        isInstallable
          ? "bg-emerald-600 hover:bg-emerald-700 animate-pulse"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
      size="lg"
    >
      <Download size={22} />
      {isInstallable ? "অ্যাপ হোম স্ক্রিনে যোগ করুন" : "ইনস্টল নির্দেশনা"}
    </Button>
  );
}
