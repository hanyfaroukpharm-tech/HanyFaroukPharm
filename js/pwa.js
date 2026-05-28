let deferredPrompt = null;

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

const isInStandaloneMode =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(console.warn);
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;

  if (!isInStandaloneMode && !sessionStorage.getItem('pwa_dismissed')) {
    setTimeout(() => {
      document.getElementById('pwa-banner').style.display = 'block';
    }, 2000);
  }
});

if (isIos && !isInStandaloneMode && !sessionStorage.getItem('pwa_dismissed')) {
  setTimeout(() => {
    document.getElementById('ios-banner').style.display = 'block';
  }, 2000);
}

async function installPwa() {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;

  deferredPrompt = null;

  document.getElementById('pwa-banner').style.display = 'none';

  if (outcome === 'accepted') {
    sessionStorage.setItem('pwa_dismissed', 'true');
  }
}

function closePwaBanner() {
  document.getElementById('pwa-banner').style.display = 'none';
  sessionStorage.setItem('pwa_dismissed', 'true');
}

function closeIosBanner() {
  document.getElementById('ios-banner').style.display = 'none';
  sessionStorage.setItem('pwa_dismissed', 'true');
}

window.addEventListener('appinstalled', () => {
  document.getElementById('pwa-banner').style.display = 'none';
  document.getElementById('ios-banner').style.display = 'none';
});

window.installPwa = installPwa;
window.closePwaBanner = closePwaBanner;
window.closeIosBanner = closeIosBanner;