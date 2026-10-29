// Utility helpers for PWA Installation handling

// Capture the beforeinstallprompt event as early as possible
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPWAInstallPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });

  window.addEventListener('appinstalled', () => {
    window.deferredPWAInstallPrompt = null;
    try {
      localStorage.setItem('pwa_installed', 'true');
    } catch {}
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

export const isAppInstalled = () => {
  if (typeof window === 'undefined') return false;
  try {
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://') ||
      localStorage.getItem('pwa_installed') === 'true';
    return Boolean(isStandalone);
  } catch {
    return false;
  }
};

export const getDevicePlatform = () => {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
    return 'ios';
  }
  if (/android/i.test(ua)) {
    return 'android';
  }
  return 'desktop';
};

export const promptPWAInstall = async () => {
  if (isAppInstalled()) {
    return { status: 'already-installed' };
  }

  const promptEvent = typeof window !== 'undefined' ? window.deferredPWAInstallPrompt : null;

  if (promptEvent && typeof promptEvent.prompt === 'function') {
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice && choice.outcome === 'accepted') {
        window.deferredPWAInstallPrompt = null;
        window.dispatchEvent(new CustomEvent('pwa-installed'));
        return { status: 'accepted' };
      }
      return { status: 'dismissed' };
    } catch (err) {
      console.warn('Error invoking deferred PWA prompt:', err);
    }
  }

  // Automatic prompt not available (e.g. iOS Safari, or browser already showed it)
  return {
    status: 'manual-required',
    platform: getDevicePlatform()
  };
};
