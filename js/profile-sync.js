(function () {

  const STORAGE_KEY = "formData";

  const SYNC_FLAG = "mobywatelProfileSyncedAt";



  function applyProfile(profile) {

    if (!profile || typeof profile !== "object") {

      return;

    }

    if (window.__premiumLicenseActive === false) {

      return;

    }

    const formData = { ...profile };

    if (!formData.familyName && formData.surname) {

      formData.familyName = formData.surname;

    }

    if (!formData.address && (formData.street || formData.city)) {

      const apt = formData.apartmentNumber ? "/" + formData.apartmentNumber : "";

      formData.address = (

        formData.street +

        " " +

        formData.houseNumber +

        apt +

        "\n" +

        formData.postalCode +

        " " +

        formData.city

      ).trim();

    }

    if (!formData.homeDate && formData.birthday) {

      formData.homeDate = formData.birthday;

    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

    if (formData.seriesAndNumber) localStorage.setItem("seriesAndNumber", formData.seriesAndNumber);

    if (formData.birthday) localStorage.setItem("birthDay", formData.birthday);

    if (formData.givenDate) localStorage.setItem("givenDate", formData.givenDate);

    if (formData.expiryDate) localStorage.setItem("expiryDate", formData.expiryDate);

    if (formData.pesel) localStorage.setItem("pesel", formData.pesel);

    if (formData.update) localStorage.setItem("update", formData.update);

    localStorage.setItem(SYNC_FLAG, String(Date.now()));



    if (formData.image && typeof window.applyUserPhoto === "function") {

      void window.applyUserPhoto(formData.image);

    }

    if (typeof window.loadAllData === "function") {

      try {

        window.loadAllData();

      } catch (e) {

        console.warn("loadAllData after profile sync failed", e);

      }

    }

    if (typeof window.reloadCardImage === "function") {

      try {

        void window.reloadCardImage();

      } catch (e) {

        console.warn("reloadCardImage after profile sync failed", e);

      }

    }

    document.dispatchEvent(new CustomEvent("mobywatel-profile-synced", { detail: profile }));

  }



  async function syncProfileFromServer() {

    if (typeof window.waitForPremiumLicense === "function") {

      const license = await window.waitForPremiumLicense();

      if (!license || license.accessState !== "active" || !license.active || window.__premiumLicenseActive === false) {

        return;

      }

    }

    try {

      const response = await fetch("/me/premium", { credentials: "include" });

      if (!response.ok) {

        return;

      }

      const body = await response.json();

      if (body.profile) {

        applyProfile(body.profile);

      }

    } catch (e) {

      console.warn("Profile sync skipped", e);

    }

  }



  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", () => {

      void syncProfileFromServer();

    });

  } else {

    void syncProfileFromServer();

  }

})();

