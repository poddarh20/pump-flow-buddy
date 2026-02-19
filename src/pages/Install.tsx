import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Apple, Chrome } from 'lucide-react';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Smartphone className="w-14 h-14 mx-auto text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Install App on Mobile</h1>
        <p className="text-muted-foreground text-sm">
          Install Shivala Petro Mart on your phone for quick access — works like a native app!
        </p>
      </div>

      {installed && (
        <Card className="border-success bg-success/10">
          <CardContent className="pt-4 text-center text-success font-semibold">
            ✅ App installed successfully!
          </CardContent>
        </Card>
      )}

      {/* Android / Chrome */}
      {(deferredPrompt || isAndroid) && !installed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Chrome className="w-5 h-5 text-primary" /> Android / Chrome
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deferredPrompt ? (
              <Button onClick={handleInstall} className="w-full gap-2">
                <Download className="w-4 h-4" /> Install Now
              </Button>
            ) : (
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Open this page in <strong>Chrome</strong> browser</li>
                <li>Tap the <strong>⋮ menu</strong> (top right)</li>
                <li>Select <strong>"Add to Home screen"</strong></li>
                <li>Tap <strong>Add</strong> to confirm</li>
              </ol>
            )}
          </CardContent>
        </Card>
      )}

      {/* iOS */}
      {(isIOS || (!isAndroid && !deferredPrompt)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Apple className="w-5 h-5 text-primary" /> iPhone / iPad (Safari)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Open this page in <strong>Safari</strong> browser</li>
              <li>Tap the <strong>Share</strong> button <span className="font-mono bg-secondary px-1 rounded">⎙</span> at the bottom</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>Add</strong> to confirm</li>
            </ol>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Why install?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Opens instantly from your home screen</li>
            <li>Full screen — no browser address bar</li>
            <li>All data synced across all your devices</li>
            <li>Works the same on PC, Android & iPhone</li>
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        App URL: <strong className="text-foreground">{window.location.origin}</strong><br />
        Share this link with anyone who needs access on another device.
      </p>
    </div>
  );
};

export default Install;
