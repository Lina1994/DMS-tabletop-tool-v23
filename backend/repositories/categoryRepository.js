const db = require('../config/database');

function addCategory(category) {
    try {
        const stmt = db.prepare('INSERT INTO categories (id, shop_id, name, columns_definition) VALUES (@id, @shop_id, @name, @columns_definition)');
        const info = stmt.run({
            id: category.id,
            shop_id: category.shop_id,
            name: category.name,
            columns_definition: JSON.stringify(category.columns || [])
        });
        return { success: true, id: category.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateCategory(category) {
    try {
        const stmt = db.prepare('UPDATE categories SET name = @name, columns_definition = @columns_definition WHERE id = @id');
        const info = stmt.run({
            id: category.id,
            name: category.name,
            columns_definition: JSON.stringify(category.columns || [])
        });
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteCategory(categoryId) {
    try {
        db.transaction(() => {
            db.prepare('DELETE FROM items WHERE category_id = ?').run(categoryId);
            db.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);
        })();
        return { success: true, changes: 1 };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getCategoryById(categoryId) {
    console.log(`Backend: getCategoryById called with ID: ${categoryId}`);
    try {
        const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
        const category = stmt.get(categoryId);
        console.log('Backend: Raw category from DB:', category);
        if (category && category.columns_definition) {
            category.columns = JSON.parse(category.columns_definition);
            console.log('Backend: Parsed category columns:', category.columns);
        } else {
            category.columns = [];
            console.log('Backend: No columns_definition or category found, setting empty array.');
        }
        console.log('Backend: Returning category:', category);
        return { success: true, data: category };
    } catch (error) {
        console.error('Backend: Error in getCategoryById:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
};