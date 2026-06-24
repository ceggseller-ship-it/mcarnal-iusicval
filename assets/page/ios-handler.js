// Sprawdzenie czy urządzenie to iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// Sprawdzenie czy aplikacja jest uruchomiona w trybie standalone
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                    ('standalone' in window.navigator && window.navigator.standalone);

// Funkcja zapisująca dane w lokalnym storage z flagą trwałości
function setPersistentData(key, value) {
    try {
        // Dodanie prefiksu dla lepszej identyfikacji
        const persistentKey = 'persistent_' + key;
        localStorage.setItem(persistentKey, JSON.stringify({
            value: value,
            timestamp: new Date().getTime(),
            persistent: true
        }));
    } catch (e) {
        console.error('Error saving persistent data:', e);
    }
}

// Funkcja odczytująca trwałe dane
function getPersistentData(key) {
    try {
        const persistentKey = 'persistent_' + key;
        const data = localStorage.getItem(persistentKey);
        if (data) {
            return JSON.parse(data).value;
        }
    } catch (e) {
        console.error('Error reading persistent data:', e);
    }
    return null;
}

// Funkcja migrująca zwykłe dane do trwałych
function migrateToPersistentStorage() {
    try {
        // Lista kluczy do zmigrowania
        const keysToMigrate = ['documents', 'activeToken', 'formData', 'userSettings'];
        
        keysToMigrate.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                setPersistentData(key, JSON.parse(value));
                // Zachowujemy też normalną kopię dla kompatybilności
                localStorage.setItem(key, value);
            }
        });
    } catch (e) {
        console.error('Error during data migration:', e);
    }
}

// Funkcja przywracająca dane po ponownym uruchomieniu
function restorePersistentData() {
    try {
        const keys = Object.keys(localStorage);
        const persistentKeys = keys.filter(key => key.startsWith('persistent_'));
        
        persistentKeys.forEach(persistentKey => {
            const regularKey = persistentKey.replace('persistent_', '');
            const persistentData = localStorage.getItem(persistentKey);
            
            if (persistentData) {
                const data = JSON.parse(persistentData);
                // Przywróć dane do normalnego storage
                localStorage.setItem(regularKey, JSON.stringify(data.value));
            }
        });
    } catch (e) {
        console.error('Error restoring persistent data:', e);
    }
}

// Listener na zdarzenie beforeinstallprompt (dla iOS Safari)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    // Zachowaj zdarzenie do późniejszego użycia
    window.deferredInstallPrompt = e;
});

// Po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    if (isIOS) {
        if (!isStandalone) {
            // Pokaż instrukcję instalacji dla iOS
            showIOSInstallInstructions();
        } else {
            // Jeśli aplikacja jest już zainstalowana jako PWA
            restorePersistentData();
        }
    }
});

// Przed zamknięciem/odświeżeniem strony
window.addEventListener('beforeunload', () => {
    if (isIOS && isStandalone) {
        migrateToPersistentStorage();
    }
});

// Funkcja pokazująca instrukcję instalacji dla iOS
function showIOSInstallInstructions() {
    if (document.querySelector('.ios-install-prompt')) return;

    const prompt = document.createElement('div');
    prompt.className = 'ios-install-prompt';
    prompt.innerHTML = `
        <div class="ios-prompt-content">
            <p>Zainstaluj tę aplikację na swoim urządzeniu!</p>
            <p class="ios-install-steps">
                1. Kliknij ikonę udostępniania <span class="share-icon">⎙</span><br>
                2. Wybierz "Dodaj do ekranu głównego"
            </p>
            <button class="ios-prompt-close">Zamknij</button>
        </div>
    `;

    document.body.appendChild(prompt);

    prompt.querySelector('.ios-prompt-close').addEventListener('click', () => {
        prompt.remove();
    });
}

// Nadpisanie funkcji localStorage dla trwałego przechowywania
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    // Wywołaj oryginalną funkcję
    originalSetItem.apply(this, arguments);
    // Jeśli jesteśmy w trybie standalone na iOS, zapisz też trwałą kopię
    if (isIOS && isStandalone) {
        setPersistentData(key, JSON.parse(value));
    }
};