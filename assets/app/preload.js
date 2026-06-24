(function () {
    'use strict';

    var seen = {};
    var entryHidden = false;

    function ensurePreloaderMount() {
        if (!document.body) return null;
        var el = document.getElementById('app-preloader');
        if (!el) {
            el = document.createElement('div');
            el.id = 'app-preloader';
            el.className = 'app-preloader';
            el.setAttribute('aria-busy', 'true');
            el.setAttribute('aria-live', 'polite');
            el.innerHTML = '<div class="app-preloader__spinner" aria-hidden="true"></div>';
            document.body.insertBefore(el, document.body.firstChild);
        }
        return el;
    }

    /** Synchroniczne schowanie — ważne przy bfcache (back bez ponownego `load`). */
    function dismissPreloaderHard() {
        var el = document.getElementById('app-preloader');
        if (!el) return;
        entryHidden = true;
        el.setAttribute('aria-busy', 'false');
        el.classList.add('app-preloader--done', 'app-preloader--hidden');
    }

    function hideEntryPreloader() {
        if (entryHidden) return;
        entryHidden = true;
        var el = document.getElementById('app-preloader');
        if (!el) return;
        el.setAttribute('aria-busy', 'false');
        el.classList.add('app-preloader--done');
        setTimeout(function () {
            el.classList.add('app-preloader--hidden');
        }, 420);
    }

    function showOverlay() {
        var el = ensurePreloaderMount();
        if (!el) return;
        entryHidden = false;
        el.classList.remove('app-preloader--done', 'app-preloader--hidden');
        el.setAttribute('aria-busy', 'true');
    }

    window.showNavigationPreloader = function (href) {
        showOverlay();
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                window.location.href = href;
            });
        });
    };

    /**
     * history.back() + pełny overlay psuje często WebKit (snap bfcache, brak load).
     * Cofanie bez nakładki — nadal bezpieczne dzięki pagehide/pageshow.
     */
    window.runWithNavigationOverlay = function (fn) {
        try {
            fn();
        } catch (e) {}
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensurePreloaderMount);
    } else {
        ensurePreloaderMount();
    }

    window.addEventListener('load', function () {
        var fallback = setTimeout(hideEntryPreloader, 3200);
        var done = function () {
            clearTimeout(fallback);
            hideEntryPreloader();
        };
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(done).catch(done);
        } else {
            done();
        }
    });

    /* Wróć z innej strony: bez drugiego `load` — trzeba zdjąć preloader ręcznie. */
    window.addEventListener('pageshow', function (ev) {
        if (ev.persisted) {
            dismissPreloaderHard();
        }
    });

    /* Zapis do bfcache z widocznym overlay (np. przed sendTo) — czyścimy, żeby po powrocie nie było „martwej” warstwy. */
    window.addEventListener('pagehide', function (ev) {
        if (ev.persisted) {
            dismissPreloaderHard();
        }
    });

    function preconnectFonts() {
        var a = document.createElement('link');
        a.rel = 'preconnect';
        a.href = 'https://fonts.googleapis.com';
        document.head.appendChild(a);
        var b = document.createElement('link');
        b.rel = 'preconnect';
        b.href = 'https://fonts.gstatic.com';
        b.crossOrigin = '';
        document.head.appendChild(b);
    }
    preconnectFonts();

    var PRELOAD_URLS = [
        'documents.html',
        'services.html',
        'qr.html',
        'more.html',
        'card.html',
        'id.html',
        'server-offline.html',
        'shortcuts.html',
        'show.html',
        'scan.html',
        'pesel.html',
        'document.html',
        'assets/app/preloader.css',
        'assets/app/documents.css',
        'assets/app/main.css',
        'assets/app/flow.css',
        'assets/app/services.css',
        'assets/app/qr.css',
        'assets/app/more.css',
        'assets/app/server-offline.css',
        'assets/app/document.css',
        'assets/app/pesel.css',
        'css/main.css',
        'css/card.css',
        'css/id.css',
        'css/scan.css',
        'css/show.css',
        'css/shortcuts.css',
        'assets/app/bar.js',
        'assets/app/manifest.js',
        'assets/app/flow.js',
        'assets/app/document.js',
        'assets/cache.js',
        'js/bar.js',
        'js/encode.js',
        'js/card.js',
        'js/manifest.js',
        'js/cache.js',
        'js/html5-qrcode.js',
        'js/show.js',
        'sw.js',
        'assets/app/images/card_background.webp',
        'assets/app/images/logo_large.svg',
        'assets/app/images/logo.svg',
        'assets/app/images/bell.svg',
        'assets/app/images/card_eagle.svg',
        'images/plate.png',
        'images/flag.webp',
        'images/eagle.gif',
        'images/back_blue.svg',
        'images/help.svg',
        'images/placeholder.svg',
        'images/valid.svg',
        'images/confirm.svg',
        'images/id_data.png',
        'images/lock.svg',
        'images/right_arrow.svg'
    ];

    function warmUrl(url) {
        if (!url || seen[url]) return;
        seen[url] = true;
        var link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    function scheduleWarmAll() {
        var i = 0;
        function pump() {
            var batch = 5;
            while (i < PRELOAD_URLS.length && batch-- > 0) {
                warmUrl(PRELOAD_URLS[i++]);
            }
            if (i < PRELOAD_URLS.length) {
                setTimeout(pump, 28);
            }
        }
        function start() {
            pump();
        }
        if ('requestIdleCallback' in window) {
            requestIdleCallback(start, { timeout: 3500 });
        } else {
            setTimeout(start, 180);
        }
    }

    scheduleWarmAll();
})();
