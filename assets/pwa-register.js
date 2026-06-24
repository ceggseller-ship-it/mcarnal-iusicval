// Service Worker Registration Script
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Add to Home Screen detection for iOS
let deferredPrompt;
const addToHomeScreenBtn = document.createElement('div');
addToHomeScreenBtn.style.display = 'none';

// For Android
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Optional: Show a custom "Add to Home Screen" button
  // Uncomment the following lines if you want to show a custom button
  /*
  addToHomeScreenBtn.style.display = 'block';
  addToHomeScreenBtn.addEventListener('click', () => {
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
  */
});

// For iOS detection
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Check if the app is running in standalone mode (already installed)
const isInStandaloneMode = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || 
         document.referrer.includes('android-app://');
};

// Show iOS install instructions if needed
if (isIOS() && !isInStandaloneMode()) {
  // You can add custom code here to show iOS installation instructions
  // For example, a small popup or banner with instructions
  console.log('iOS device detected, not in standalone mode');
}