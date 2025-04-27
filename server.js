// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { initializeAdmin } = require('./utils/initAdmin');

// Import routes
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const roomRoutes = require('./routes/rooms');
const adminRoutes = require('./routes/auth');
// const studentRoutes = require('./routes/student');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, '../frontend')));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialize data files if they don't exist
const dataFiles = {
    users: path.join(dataDir, 'users.json'),
    rooms: path.join(dataDir, 'rooms.json'),
    applications: path.join(dataDir, 'applications.json')
};

Object.values(dataFiles).forEach(file => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify({ data: [] }, null, 2));
    }
});

// Initialize admin account
initializeAdmin().then(() => {
    console.log('Admin initialization completed');
}).catch(err => {
    console.error('Error initializing admin:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/student', studentRoutes);

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

