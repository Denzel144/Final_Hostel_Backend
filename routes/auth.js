// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { addItem, findByCriteria } = require('../utils/fileOperations');
const { ADMIN_CREDENTIALS } = require('../utils/initAdmin');

// Student Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, studentId, phone, gender, emergencyContact } = req.body;

        // Check if user already exists
        const existingUsers = findByCriteria('users.json', { email });
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new student user
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: 'student',
            studentId,
            phone,
            gender,
            emergencyContact,
            createdAt: new Date().toISOString()
        };

        // Save user to file
        const savedUser = addItem('users.json', newUser);
        if (!savedUser) {
            return res.status(500).json({ message: 'Error saving user' });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = savedUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Student Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find student by email
        const users = findByCriteria('users.json', { email, role: 'student' });
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Login (completely separate endpoint)
router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Only allow admin login with predefined credentials
        if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Find admin user
        const users = findByCriteria('users.json', { username, role: 'admin' });
        if (users.length === 0) {
            return res.status(401).json({ message: 'Admin account not found' });
        }

        const admin = users[0];

        // Remove password from response
        const { password: _, ...adminWithoutPassword } = admin;
        res.json(adminWithoutPassword);
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

