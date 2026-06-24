// Page mapping for navigation
const pageMap = {
    'login': 'login.html',
    'dashboard': 'dashboard.html',
    'generator': 'generator.html',
    'id': 'id.html',
    'admin': 'tokens.html',
    'home': 'index.html'
};

// Navigation function
function navigateTo(page, params = {}) {
    let url = pageMap[page] || page;
    
    // Add parameters if provided
    if (Object.keys(params).length > 0) {
        const urlParams = new URLSearchParams(params);
        url += '?' + urlParams.toString();
    }
    
    window.location.href = url;
}

// Token validation function
function validateToken(token) {
    if (!token) return false;
    
    try {
        // Basic token validation - you can enhance this
        if (token.length < 3) return false;
        
        // Check if it's admin token
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        
        return {
            valid: true,
            isAdmin: isAdmin,
            token: token
        };
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

// HTML encoding function
function htmlEncode(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Notification function
function notify(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        document.body.appendChild(notification);
    }
    
    // Set message and style based on type
    notification.textContent = message;
    
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f59e0b';
            break;
        default:
            notification.style.backgroundColor = '#6366f1';
    }
    
    // Show notification
    notification.style.transform = 'translateX(0)';
    
    // Hide after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
    }, 4000);
}

// Check authentication status
function checkAuth() {
    const activeToken = localStorage.getItem('activeToken');
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (!activeToken && isAdmin !== 'true') {
        navigateTo('login');
        return false;
    }
    
    return true;
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    // Nie wykonuj automatycznej walidacji - każda strona sama sprawdza autoryzację
    console.log('Navigation initialized');
});