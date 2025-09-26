const db = require('../config/database');
const { generateBackendId } = require('../database');

// Shop CRUD
function getShops() {
    try {
        const shops = db.prepare('SELECT * FROM shops').all();
        const categories = db.prepare('SELECT * FROM categories').all();
        const items = db.prepare('SELECT * FROM items').all();

        const shopsMap = new Map(shops.map(s => [s.id, { ...s, categories: [] }]));
        const categoriesMap = new Map(categories.map(c => [
            c.id, 
            { 
                ...c, 
                columns: c.columns_definition ? JSON.parse(c.columns_definition) : [], 
                items: [] 
            }
        ]));

        items.forEach(item => {
            if (categoriesMap.has(item.category_id)) {
                categoriesMap.get(item.category_id).items.push({ ...item, ...JSON.parse(item.data) });
            }
        });

        categories.forEach(category => {
            if (shopsMap.has(category.shop_id)) {
                shopsMap.get(category.shop_id).categories.push(categoriesMap.get(category.id));
            }
        });

        return { success: true, data: Array.from(shopsMap.values()) };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getShopsByCampaign(campaignId) {
    try {
        const shops = db.prepare('SELECT * FROM shops WHERE campaign_id = ?').all(campaignId);
        const shopIds = shops.map(s => s.id);
        if (shopIds.length === 0) {
            return { success: true, data: [] };
        }

        const placeholders = shopIds.map(() => '?').join(',');
        const categories = db.prepare(`SELECT * FROM categories WHERE shop_id IN (${placeholders})`).all(...shopIds);
        const items = db.prepare(`SELECT * FROM items WHERE category_id IN (SELECT id FROM categories WHERE shop_id IN (${placeholders}))`).all(...shopIds);

        const shopsMap = new Map(shops.map(s => [s.id, { ...s, categories: [] }]));
        const categoriesMap = new Map(categories.map(c => [
            c.id, 
            { 
                ...c, 
                columns: c.columns_definition ? JSON.parse(c.columns_definition) : [], 
                items: [] 
            }
        ]));

        items.forEach(item => {
            if (categoriesMap.has(item.category_id)) {
                categoriesMap.get(item.category_id).items.push({ ...item, ...JSON.parse(item.data) });
            }
        });

        categories.forEach(category => {
            if (shopsMap.has(category.shop_id)) {
                shopsMap.get(category.shop_id).categories.push(categoriesMap.get(category.id));
            }
        });

        return { success: true, data: Array.from(shopsMap.values()) };
    } catch (error) {
        console.error('Error in getShopsByCampaign:', error.message);
        return { success: false, error: error.message };
    }
}

function addShop(shop) {
    try {
        const newShopId = generateBackendId('shop');
        const stmt = db.prepare('INSERT INTO shops (id, name) VALUES (@id, @name)');
        const info = stmt.run({ id: newShopId, name: shop.name });
        return { success: true, id: newShopId };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateShop(shop) {
    try {
        const stmt = db.prepare('UPDATE shops SET name = @name WHERE id = @id');
        const info = stmt.run(shop);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteShop(shopId) {
    try {
        db.transaction(() => {
            const categories = db.prepare('SELECT id FROM categories WHERE shop_id = ?').all(shopId);
            const categoryIds = categories.map(c => c.id);
            if (categoryIds.length > 0) {
                const placeholders = categoryIds.map(() => '?').join(',');
                db.prepare(`DELETE FROM items WHERE category_id IN (${placeholders})`).run(...categoryIds);
            }
            db.prepare('DELETE FROM categories WHERE shop_id = ?').run(shopId);
            db.prepare('DELETE FROM shops WHERE id = ?').run(shopId);
        })();
        return { success: true, changes: 1 };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteAllShops() {
    try {
        db.transaction(() => {
            db.prepare('DELETE FROM items').run();
            db.prepare('DELETE FROM categories').run();
            db.prepare('DELETE FROM shops').run();
        })();
        return { success: true, changes: 1 };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function syncShops(shops) {
    try {
        deleteAllShops();
        const insertShop = db.prepare('INSERT INTO shops (id, name) VALUES (@id, @name)');
        const insertCategory = db.prepare('INSERT INTO categories (id, shop_id, name, columns_definition) VALUES (@id, @shop_id, @name, @columns_definition)');
        const insertItem = db.prepare('INSERT INTO items (id, category_id, data) VALUES (@id, @category_id, @data)');

        db.transaction((data) => {
            for (const shop of data) {
                insertShop.run({ id: shop.id, name: shop.name });
                if (shop.categories) {
                    for (const category of shop.categories) {
                        insertCategory.run({
                            id: category.id,
                            shop_id: shop.id,
                            name: category.name,
                            columns_definition: JSON.stringify(category.columns || [])
                        });
                        if (category.items) {
                            for (const item of category.items) {
                                insertItem.run({
                                    id: item.id,
                                    category_id: item.category_id, // Use item.category_id directly
                                    data: JSON.stringify(item.data || {})
                                });
                            }
                        }
                    }
                }
            }
        })(shops);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    getShops,
    getShopsByCampaign,
    addShop,
    updateShop,
    deleteShop,
    deleteAllShops,
    syncShops,
};