const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Read data from a JSON file
function readData(fileName) {
    try {
        const filePath = path.join(dataDir, fileName);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        return { data: [] };
    }
}

// Write data to a JSON file
function writeData(fileName, data) {
    try {
        const filePath = path.join(dataDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing to ${fileName}:`, error);
        return false;
    }
}

// Add a new item to a JSON file
function addItem(fileName, item) {
    const data = readData(fileName);
    item.id = Date.now().toString(); // Generate a simple ID
    data.data.push(item);
    return writeData(fileName, data) ? item : null;
}

// Update an item in a JSON file
function updateItem(fileName, id, updates) {
    const data = readData(fileName);
    const index = data.data.findIndex(item => item.id === id);
    if (index !== -1) {
        data.data[index] = { ...data.data[index], ...updates };
        return writeData(fileName, data) ? data.data[index] : null;
    }
    return null;
}

// Delete an item from a JSON file
function deleteItem(fileName, id) {
    const data = readData(fileName);
    const index = data.data.findIndex(item => item.id === id);
    if (index !== -1) {
        data.data.splice(index, 1);
        return writeData(fileName, data);
    }
    return false;
}

// Find an item by ID
function findById(fileName, id) {
    const data = readData(fileName);
    return data.data.find(item => item.id === id);
}

// Find items by criteria
function findByCriteria(fileName, criteria) {
    const data = readData(fileName);
    return data.data.filter(item => {
        return Object.entries(criteria).every(([key, value]) => {
            return item[key] === value;
        });
    });
}

module.exports = {
    readData,
    writeData,
    addItem,
    updateItem,
    deleteItem,
    findById,
    findByCriteria
}; 