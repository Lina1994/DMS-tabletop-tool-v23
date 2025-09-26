const db = require('../config/database');

function addItem(item) {
    try {
        const stmt = db.prepare('INSERT INTO items (id, category_id, data) VALUES (@id, @category_id, @data)');
        const info = stmt.run({
            id: item.id,
            category_id: item.category_id,
            data: JSON.stringify(item.data || {})
        });
        return { success: true, id: item.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateItem(item) {
    try {
        const stmt = db.prepare('UPDATE items SET data = @data WHERE id = @id');
        const info = stmt.run({
            id: item.id,
            data: JSON.stringify(item.data || {})
        });
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteItem(itemId) {
    try {
        const stmt = db.prepare('DELETE FROM items WHERE id = ?');
        const info = stmt.run(itemId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    addItem,
    updateItem,
    deleteItem,
};