const db = require('../config/database');

function getMonsters() {
    try {
        const stmt = db.prepare('SELECT * FROM monsters');
        return { success: true, data: stmt.all() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getMonsterById(id) {
    try {
        const stmt = db.prepare('SELECT * FROM monsters WHERE id = ?');
        const monster = stmt.get(id);
        return { success: true, data: monster };
    } catch (error) {
        console.error('Backend: Error in getMonsterById:', error.message);
        return { success: false, error: error.message };
    }
}

function addMonster(monster) {
    console.log('Backend: addMonster called with:', monster);
    try {
        const monsterToInsert = {
            ...monster,
            car: monster.cha, // Map 'cha' from frontend to 'car' for DB
            token_type: monster.token_type || 'color',
            token_value: monster.token_value || '#ffcccb'
        };
        const stmt = db.prepare('INSERT INTO monsters (id, name, vd, type, alignment, origin, size, px, armor, hp, speed, str, dex, con, int, wis, car, savingThrows, skills, senses, languages, damageResistances, damageImmunities, conditionImmunities, damageVulnerabilities, traits, actions, legendaryActions, reactions, description, image, token_type, token_value) VALUES (@id, @name, @vd, @type, @alignment, @origin, @size, @px, @armor, @hp, @speed, @str, @dex, @con, @int, @wis, @car, @savingThrows, @skills, @senses, @languages, @damageResistances, @damageImmunities, @conditionImmunities, @damageVulnerabilities, @traits, @actions, @legendaryActions, @reactions, @description, @image, @token_type, @token_value)');
        const info = stmt.run(monsterToInsert);
        console.log('Backend: addMonster successful, info:', info);
        return { success: true, id: monster.id }; // Return the ID that was passed in
    } catch (error) {
        console.error('Backend: Error in addMonster:', error.message);
        return { success: false, error: error.message };
    }
}

function updateMonster(monster) {
    try {
        const monsterToUpdate = {
            ...monster,
            car: monster.cha // Map 'cha' from frontend to 'car' for DB
        };
        const stmt = db.prepare('UPDATE monsters SET name = @name, vd = @vd, type = @type, alignment = @alignment, origin = @origin, size = @size, px = @px, armor = @armor, hp = @hp, speed = @speed, str = @str, dex = @dex, con = @con, int = @int, wis = @wis, car = @car, savingThrows = @savingThrows, skills = @skills, senses = @senses, languages = @languages, damageResistances = @damageResistances, damageImmunities = @damageImmunities, conditionImmunities = @conditionImmunities, damageVulnerabilities = @damageVulnerabilities, traits = @traits, actions = @actions, legendaryActions = @legendaryActions, reactions = @reactions, description = @description, image = @image, token_type = @token_type, token_value = @token_value WHERE id = @id');
        const info = stmt.run(monsterToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteMonster(monsterId) {
    try {
        const stmt = db.prepare('DELETE FROM monsters WHERE id = ?');
        const info = stmt.run(monsterId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteAllMonsters() {
    try {
        const stmt = db.prepare('DELETE FROM monsters');
        const info = stmt.run();
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    getMonsters,
    getMonsterById,
    addMonster,
    updateMonster,
    deleteMonster,
    deleteAllMonsters,
};