// API Configuration - Automatically detects environment
const API_CONFIG = {
  // Production API endpoint
  PROD_API: 'https://resqnow-utz8.onrender.com/api',
  
  // Local development API endpoint
  LOCAL_API: 'http://localhost:5000/api',
  
  // Detect current environment
  getCurrentApiUrl: function() {
    // Check if we're running on localhost
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' || 
        window.location.hostname === '[::1]' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        window.location.hostname.endsWith('.local')) {
      return this.LOCAL_API;
    }
    // Otherwise use production API
    return this.PROD_API;
  },
  
  // Get base URL without /api for health checks
  getBaseUrl: function() {
    return this.getCurrentApiUrl().replace('/api', '');
  }
};

// Export the current API base URL
const API_BASE_URL = API_CONFIG.getCurrentApiUrl();

// Export the base URL without /api for image paths and health checks
const BASE_URL = API_CONFIG.getBaseUrl();

// Export health check endpoint
const HEALTH_CHECK_URL = `${BASE_URL}/health`;