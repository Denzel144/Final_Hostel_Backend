const bcrypt = require('bcryptjs');
const { readData, writeData } = require('./fileOperations');

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin' // Changed to just 'admin'
};

async function initializeAdmin() {
    try {
        const data = readData('users.json');
        
        // Check if admin already exists
        const adminExists = data.data.some(user => user.role === 'admin');
        if (adminExists) {
            console.log('Admin account already exists');
            return;
        }

        // Hash admin password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, salt);

        // Create admin user
        const adminUser = {
            ...ADMIN_CREDENTIALS,
            password: hashedPassword,
            id: 'admin',
            createdAt: new Date().toISOString()
        };

        // Add admin to users
        data.data.push(adminUser);
        writeData('users.json', data);
        
        console.log('Admin account created successfully');
    } catch (error) {
        console.error('Error initializing admin:', error);
    }
}

module.exports = { initializeAdmin, ADMIN_CREDENTIALS }; 