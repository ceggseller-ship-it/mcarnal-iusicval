var token = localStorage.getItem("activeToken");
var isAdmin = localStorage.getItem("isAdmin");
var currentPage = window.location.pathname;

console.log('Common.js - token:', token ? 'present' : 'missing', 'isAdmin:', isAdmin, 'currentPage:', currentPage);

// Only validate if we're on protected pages
const protectedPages = ['/dashboard.html', '/generator.html'];
const adminPages = ['/tokens.html'];

// Wyłącz automatyczną walidację - każda strona sama sprawdza autoryzację
console.log('Common.js - skipping automatic validation');

// if (protectedPages.some(page => currentPage.includes(page))) {
//     validate();
// } else if (adminPages.some(page => currentPage.includes(page))) {
//     validateAdmin();
// }

function validate() {
    // Regular user validation - requires activeToken
    if (!token) {
        sendToError();
        return;
    }
    
    // Try to validate token with the backend
    const API_URL = 'https://backendm-9np8.onrender.com';
    
    fetch(`${API_URL}/api/verify`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Token validation failed');
        }
        return response.json();
    })
    .then((result) => {
        if (!result.success || !result.valid) {
            sendToError();
        }
    })
    .catch((error) => {
        console.warn('Token validation error:', error);
        // Don't redirect on network errors, allow offline usage
        if (error.message.includes('Failed to fetch')) {
            console.log('Working offline - skipping token validation');
        } else {
            sendToError();
        }
    });
}

function validateAdmin() {
    // Admin validation - requires isAdmin flag and valid session
    if (isAdmin !== 'true') {
        sendToError();
        return;
    }
    
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
        sendToError();
        return;
    }
    
    const sessionAge = Date.now() - parseInt(adminSession);
    // Admin session expires after 24 hours
    if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminSession');
        sendToError();
        return;
    }
}

function sendToError() {
    localStorage.removeItem("activeToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminSession");
    window.location.href = "login.html";
}
