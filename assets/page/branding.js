// Default branding configuration
const defaultBranding = {
    name: "PRYWATNY DOWÓD",
    logo: "assets/page/images/logo.svg"
};

// Try to fetch branding, fallback to defaults
fetch("/get/branding")
    .then((response) => {
        if (!response.ok) {
            throw new Error('Branding endpoint not available');
        }
        return response.json();
    })
    .then((result) => {
        applyBranding(result);
    })
    .catch((error) => {
        console.warn('Using default branding:', error.message);
        applyBranding(defaultBranding);
    });

function applyBranding(branding) {
    document.querySelectorAll(".name").forEach((element) => {
        element.innerHTML = branding.name;
    });
    document.querySelectorAll(".name_caps").forEach((element) => {
        element.innerHTML = branding.name.toUpperCase();
    });
    document.querySelectorAll(".logo").forEach((element) => {
        element.src = branding.logo;
        element.onerror = function() {
            // Fallback if logo doesn't exist
            this.style.display = 'none';
        };
    });
    document.querySelectorAll(".icon").forEach((element) => {
        element.href = branding.logo;
    });
}
