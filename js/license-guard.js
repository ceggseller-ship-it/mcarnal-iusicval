(function () {
  var PROFILE_KEYS = [
    "formData",
    "seriesAndNumber",
    "birthDay",
    "givenDate",
    "expiryDate",
    "pesel",
    "update",
    "cardUpdate",
    "mobywatelProfileSyncedAt",
    "cardData",
    "dowody",
    "documents",
    "editingDocument",
    "code",
    "qrCode",
    "selected_doc_index",
    "card_token",
    "token",
    "userData"
  ];

  var WARN_KEYS = {
    30: "mobywatelWarnShown30",
    10: "mobywatelWarnShown10",
    1: "mobywatelWarnShown1"
  };

  var LOCK_VARIANTS = {
    expired: {
      modifier: "expired",
      badge: "Wygasły",
      title: "mObywatel wygasł",
      primaryLabel: "Odnów dostęp",
      primaryHref: "/zakup.html",
      secondaryLabel: "Moje konto",
      secondaryHref: "/user-panel.html"
    },
    pending_verification: {
      modifier: "pending",
      badge: "Weryfikacja",
      title: "Weryfikacja płatności",
      primaryLabel: "Sprawdź status",
      primaryHref: "/user-panel.html",
      secondaryLabel: "Strona główna",
      secondaryHref: "/index.html"
    },
    no_access: {
      modifier: "no_access",
      badge: "Brak dostępu",
      title: "Brak dostępu do mObywatel",
      primaryLabel: "Kup dostęp",
      primaryHref: "/zakup.html",
      secondaryLabel: "Moje konto",
      secondaryHref: "/user-panel.html"
    },
    rejected: {
      modifier: "rejected",
      badge: "Odrzucono",
      title: "Płatność odrzucona",
      primaryLabel: "Skontaktuj się / kup ponownie",
      primaryHref: "/zakup.html",
      secondaryLabel: "Moje konto",
      secondaryHref: "/user-panel.html"
    }
  };

  var state = {
    status: null,
    ready: false,
    locked: false
  };

  document.documentElement.classList.add("premium-license-pending");

  function isProfileKey(key) {
    return PROFILE_KEYS.indexOf(key) !== -1;
  }

  function clearProfileStorage() {
    PROFILE_KEYS.forEach(function (key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    });
  }

  function formatValidTo(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function formatRemaining(license) {
    if (!license || !license.active) return "brak aktywnego dostępu";
    if (license.daysRemaining >= 1) {
      return license.daysRemaining + " " + (license.daysRemaining === 1 ? "dzień" : "dni");
    }
    if (license.hoursRemaining >= 1) {
      return license.hoursRemaining + " " + (license.hoursRemaining === 1 ? "godzina" : "godz.");
    }
    return "mniej niż godzinę";
  }

  function warnTitle(level) {
    if (level === 1) return "mObywatel wygaśnie jutro lub dziś";
    if (level === 10) return "mObywatel wygaśnie za mniej niż 10 dni";
    return "mObywatel wygaśnie za mniej niż 30 dni";
  }

  function lockMessage(license) {
    var accessState = license && license.accessState;

    if (accessState === "pending_verification") {
      return (
        license.purchase && license.purchase.message
          ? license.purchase.message
          : "Jeszcze nie zweryfikowaliśmy Twojej płatności. mObywatel będzie dostępny po zatwierdzeniu zamówienia."
      ) + " Do tego czasu dane aplikacji są niedostępne.";
    }

    if (accessState === "rejected") {
      return (
        license.purchase && license.purchase.message
          ? license.purchase.message
          : "Twoja płatność została odrzucona."
      ) + " Skontaktuj się z obsługą lub złóż nowe zamówienie.";
    }

    if (accessState === "no_access") {
      return "Nie masz jeszcze aktywnego mObywatel. Kup dostęp w sklepie, aby korzystać z aplikacji.";
    }

    if (license && license.entitlementValidTo) {
      return (
        "Twój mObywatel wygasł " +
        formatValidTo(license.entitlementValidTo) +
        ". Odnów dostęp w sklepie, aby z powrotem korzystać z aplikacji."
      );
    }

    return "Twój mObywatel wygasł. Odnów dostęp w sklepie, aby z powrotem korzystać z aplikacji.";
  }

  function resolveLockVariant(license) {
    var accessState = (license && license.accessState) || "expired";
    return LOCK_VARIANTS[accessState] || LOCK_VARIANTS.expired;
  }

  function installStorageBlock() {
    if (window.__premiumStorageBlockInstalled) return;
    window.__premiumStorageBlockInstalled = true;
    var originalSetItem = localStorage.setItem.bind(localStorage);
    var originalGetItem = localStorage.getItem.bind(localStorage);

    localStorage.setItem = function (key, value) {
      if (state.locked && isProfileKey(key)) return;
      return originalSetItem(key, value);
    };

    localStorage.getItem = function (key) {
      if (state.locked && isProfileKey(key)) return null;
      return originalGetItem(key);
    };
  }

  function buildLockHtml(license) {
    var variant = resolveLockVariant(license);
    var message = lockMessage(license);

    return (
      '<div id="premium-license-lock" class="premium-access-overlay premium-access-overlay--' +
      variant.modifier +
      '" role="dialog" aria-modal="true" aria-labelledby="premium-license-lock-title">' +
      '<div class="premium-access-card">' +
      '<img class="premium-access-logo" src="/premium/images/logo_large.svg" alt="mObywatel">' +
      '<div class="premium-access-badge">' +
      variant.badge +
      "</div>" +
      '<h1 id="premium-license-lock-title">' +
      variant.title +
      "</h1>" +
      "<p>" +
      message +
      "</p>" +
      '<div class="premium-access-actions">' +
      '<a class="premium-access-btn" href="' +
      variant.primaryHref +
      '">' +
      variant.primaryLabel +
      "</a>" +
      '<a class="premium-access-link" href="' +
      variant.secondaryHref +
      '">' +
      variant.secondaryLabel +
      "</a>" +
      "</div></div></div>"
    );
  }

  function mountLockScreen(license) {
    state.locked = true;
    window.__premiumLicenseActive = false;
    clearProfileStorage();
    installStorageBlock();

    document.documentElement.classList.remove("premium-license-pending");
    document.documentElement.classList.add("premium-license-expired");

    function renderLock() {
      document.body.innerHTML = buildLockHtml(license);
    }

    renderLock();

    var observer = new MutationObserver(function () {
      if (!document.getElementById("premium-license-lock")) {
        renderLock();
      }
      document.querySelectorAll("body > *:not(#premium-license-lock)").forEach(function (node) {
        node.remove();
      });
    });
    observer.observe(document.body, { childList: true, subtree: false });
  }

  function showWarning(license) {
    if (!license || !license.warningLevel) return;
    var storageKey = WARN_KEYS[license.warningLevel];
    if (!storageKey || sessionStorage.getItem(storageKey) === "1") return;

    sessionStorage.setItem(storageKey, "1");

    var overlay = document.createElement("div");
    overlay.id = "premium-license-warn";
    overlay.innerHTML =
      '<div class="premium-license-warn-card" role="dialog" aria-modal="true">' +
      '<div class="premium-access-badge">Zbliża się koniec</div>' +
      "<h2>" +
      warnTitle(license.warningLevel) +
      "</h2>" +
      "<p>Do końca mObywatel pozostało: <strong>" +
      formatRemaining(license) +
      "</strong>" +
      (license.entitlementValidTo ? " (ważny do " + formatValidTo(license.entitlementValidTo) + ")." : ".") +
      "</p>" +
      '<button type="button">Rozumiem</button>' +
      "</div>";

    overlay.querySelector("button").addEventListener("click", function () {
      overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  function finishActive(license) {
    window.__premiumLicenseActive = true;
    document.documentElement.classList.remove("premium-license-pending");
    showWarning(license);
  }

  function whenDomReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function applyStatus(license) {
    state.status = license;
    state.ready = true;
    window.__premiumLicenseStatus = license;

    whenDomReady(function () {
      if (license && license.accessState === "active" && license.active) {
        finishActive(license);
        return;
      }
      mountLockScreen(license);
    });
  }

  var fetchPromise = fetch("/me/premium/status", { credentials: "include" })
    .then(function (response) {
      if (response.status === 401) {
        window.location.href =
          "/logowanie.html?next=" + encodeURIComponent(window.location.pathname + window.location.search);
        return null;
      }
      if (!response.ok) {
        throw new Error("status " + response.status);
      }
      return response.json();
    })
    .then(function (license) {
      if (license) applyStatus(license);
      return license;
    })
    .catch(function () {
      applyStatus({
        active: false,
        expired: true,
        accessState: "expired",
        entitlementValidTo: null,
        daysRemaining: 0,
        hoursRemaining: 0,
        warningLevel: null,
        purchase: null
      });
      return state.status;
    });

  window.waitForPremiumLicense = function () {
    return fetchPromise;
  };
})();
