const jwt = require('jsonwebtoken');
const { ADMIN_CREDENTIALS } = require('./initAdmin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id,
            username: user.username,
            role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Verify admin credentials
const verifyAdminCredentials = (username, password) => {
    return username === ADMIN_CREDENTIALS.username && 
           password === ADMIN_CREDENTIALS.password;
};

module.exports = {
    generateToken,
    verifyToken,
    verifyAdminCredentials
}; 