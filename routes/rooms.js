const express = require('express');
const router = express.Router();
const { addItem, updateItem, findByCriteria, findById } = require('../utils/fileOperations');

// Get all rooms
router.get('/', (req, res) => {
    try {
        const { status, type, block } = req.query;
        let rooms = findByCriteria('rooms.json', {});

        if (status) {
            rooms = rooms.filter(room => room.status === status);
        }
        if (type) {
            rooms = rooms.filter(room => room.type === type);
        }
        if (block) {
            rooms = rooms.filter(room => room.hostelBlock === block);
        }

        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a specific room
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const room = findById('rooms.json', id);
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new room (admin only)
router.post('/', (req, res) => {
    try {
        const room = {
            ...req.body,
            currentOccupancy: 0,
            status: 'available',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        const savedRoom = addItem('rooms.json', room);
        if (!savedRoom) {
            return res.status(500).json({ message: 'Error saving room' });
        }

        res.status(201).json(savedRoom);
    } catch (error) {
        console.error('Error adding room:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update room details (admin only)
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updates = {
            ...req.body,
            lastModified: new Date().toISOString()
        };

        const updatedRoom = updateItem('rooms.json', id, updates);
        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json(updatedRoom);
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update room occupancy
router.patch('/:id/occupancy', (req, res) => {
    try {
        const { id } = req.params;
        const { action, userId } = req.body; // action: 'add' or 'remove'

        const room = findById('rooms.json', id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        let updatedOccupants = [...room.occupants];
        if (action === 'add') {
            if (room.currentOccupancy >= room.capacity) {
                return res.status(400).json({ message: 'Room is at full capacity' });
            }
            updatedOccupants.push(userId);
        } else if (action === 'remove') {
            updatedOccupants = updatedOccupants.filter(id => id !== userId);
        }

        const updatedRoom = updateItem('rooms.json', id, {
            occupants: updatedOccupants,
            currentOccupancy: updatedOccupants.length,
            status: updatedOccupants.length >= room.capacity ? 'occupied' : 'available',
            lastModified: new Date().toISOString()
        });

        res.json(updatedRoom);
    } catch (error) {
        console.error('Error updating room occupancy:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 