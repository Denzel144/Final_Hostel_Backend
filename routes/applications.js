const express = require('express');
const router = express.Router();
const { addItem, updateItem, findByCriteria, findById } = require('../utils/fileOperations');

// Submit a new housing application
router.post('/', async (req, res) => {
    try {
        const application = {
            ...req.body,
            status: 'pending',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        const savedApplication = addItem('applications.json', application);
        if (!savedApplication) {
            return res.status(500).json({ message: 'Error saving application' });
        }

        res.status(201).json(savedApplication);
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all applications (admin only)
router.get('/', (req, res) => {
    try {
        const { status, studentId } = req.query;
        let applications = findByCriteria('applications.json', {});

        if (status) {
            applications = applications.filter(app => app.status === status);
        }
        if (studentId) {
            applications = applications.filter(app => app.studentId === studentId);
        }

        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get application by ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const application = findById('applications.json', id);
        
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(application);
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update application status (admin only)
router.patch('/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status, roomId } = req.body;

        const application = findById('applications.json', id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const updatedApplication = updateItem('applications.json', id, {
            status,
            roomId,
            lastModified: new Date().toISOString()
        });

        // If application is approved and room is provided, update room occupancy
        if (status === 'approved' && roomId) {
            const room = findById('rooms.json', roomId);
            if (room) {
                updateItem('rooms.json', roomId, {
                    currentOccupancy: room.currentOccupancy + 1,
                    occupants: [...(room.occupants || []), application.studentId],
                    status: room.currentOccupancy + 1 >= room.capacity ? 'occupied' : 'available'
                });
            }
        }

        res.json(updatedApplication);
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 