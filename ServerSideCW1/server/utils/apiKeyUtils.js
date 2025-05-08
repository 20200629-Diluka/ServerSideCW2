const { v4: uuidv4 } = require('uuid');

// Generate a secure random API key
function generateApiKey() {
    return uuidv4();
}

// Generate expiration date for API key (30 days by default)
function generateExpiryDate(days = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return expiryDate;
}

// Format API key for display (mask the key except first and last 4 characters)
function formatApiKey(key) {
    if (!key || key.length < 10) return key;
    const firstFour = key.substring(0, 4);
    const lastFour = key.substring(key.length - 4);
    return `${firstFour}...${lastFour}`;
}

module.exports = {
    generateApiKey,
    generateExpiryDate,
    formatApiKey
}; 