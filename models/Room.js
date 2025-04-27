const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    hostelBlock: {
        type: String,
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['single', 'shared2', 'shared4'],
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    currentOccupancy: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available'
    },
    amenities: [{
        type: String
    }],
    price: {
        type: Number,
        required: true
    },
    description: String,
    photos: [{
        type: String // URLs to room photos
    }],
    occupants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    maintenanceHistory: [{
        date: Date,
        description: String,
        resolvedDate: Date
    }],
    lastModified: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update currentOccupancy when occupants are modified
roomSchema.pre('save', function(next) {
    if (this.isModified('occupants')) {
        this.currentOccupancy = this.occupants.length;
        
        // Update status based on occupancy
        if (this.currentOccupancy === 0) {
            this.status = 'available';
        } else if (this.currentOccupancy >= this.capacity) {
            this.status = 'occupied';
        }
    }
    next();
});

module.exports = mongoose.model('Room', roomSchema); 