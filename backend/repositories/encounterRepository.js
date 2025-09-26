const db = require('../config/database');
const { generateBackendId } = require('../database');

function getEncounters() {
    try {
        const encounters = db.prepare(`
            SELECT 
                e.id, e.name, e.campaign_id, e.song_id,
                e.easy_battle_song_id, e.medium_battle_song_id, e.hard_battle_song_id, e.deadly_battle_song_id, e.extreme_battle_song_id,
                c.name as campaign_name,
                s.name as song_name,
                s_easy.name AS easy_battle_song_name, s_easy.filePath AS easy_battle_song_filePath,
                s_medium.name AS medium_battle_song_name, s_medium.filePath AS medium_battle_song_filePath,
                s_hard.name AS hard_battle_song_name, s_hard.filePath AS hard_battle_song_filePath,
                s_deadly.name AS deadly_battle_song_name, s_deadly.filePath AS deadly_battle_song_filePath,
                s_extreme.name AS extreme_battle_song_name, s_extreme.filePath AS extreme_battle_song_filePath
            FROM encounters e
            LEFT JOIN campaigns c ON e.campaign_id = c.id
            LEFT JOIN songs s ON e.song_id = s.id
            LEFT JOIN songs s_easy ON e.easy_battle_song_id = s_easy.id
            LEFT JOIN songs s_medium ON e.medium_battle_song_id = s_medium.id
            LEFT JOIN songs s_hard ON e.hard_battle_song_id = s_hard.id
            LEFT JOIN songs s_deadly ON e.deadly_battle_song_id = s_deadly.id
            LEFT JOIN songs s_extreme ON e.extreme_battle_song_id = s_extreme.id
        `).all();

        const monsterStmt = db.prepare(`
            SELECT m.* FROM monsters m
            JOIN encounter_monsters em ON m.id = em.monster_id
            WHERE em.encounter_id = ?
        `);
        const characterStmt = db.prepare(`
            SELECT c.* FROM characters c
            JOIN encounter_characters ec ON c.id = ec.character_id
            WHERE ec.encounter_id = ?
        `);

        for (const encounter of encounters) {
            encounter.monsters = monsterStmt.all(encounter.id);
            encounter.characters = characterStmt.all(encounter.id);
        }

        return { success: true, data: encounters };
    } catch (error) {
        console.error("Error in getEncounters:", error);
        return { success: false, error: error.message };
    }
}

function getEncountersByCampaign(campaignId) {
    try {
        const encounters = db.prepare(`
            SELECT 
                e.id, e.name, e.campaign_id, e.song_id,
                e.easy_battle_song_id, e.medium_battle_song_id, e.hard_battle_song_id, e.deadly_battle_song_id, e.extreme_battle_song_id,
                c.name as campaign_name,
                s.name as song_name,
                s_easy.name AS easy_battle_song_name, s_easy.filePath AS easy_battle_song_filePath,
                s_medium.name AS medium_battle_song_name, s_medium.filePath AS medium_battle_song_filePath,
                s_hard.name AS hard_battle_song_name, s_hard.filePath AS hard_battle_song_filePath,
                s_deadly.name AS deadly_battle_song_name, s_deadly.filePath AS deadly_battle_song_filePath,
                s_extreme.name AS extreme_battle_song_name, s_extreme.filePath AS extreme_battle_song_filePath
            FROM encounters e
            LEFT JOIN campaigns c ON e.campaign_id = c.id
            LEFT JOIN songs s ON e.song_id = s.id
            LEFT JOIN songs s_easy ON e.easy_battle_song_id = s_easy.id
            LEFT JOIN songs s_medium ON e.medium_battle_song_id = s_medium.id
            LEFT JOIN songs s_hard ON e.hard_battle_song_id = s_hard.id
            LEFT JOIN songs s_deadly ON e.deadly_battle_song_id = s_deadly.id
            LEFT JOIN songs s_extreme ON e.extreme_battle_song_id = s_extreme.id
            WHERE e.campaign_id = ?
        `).all(campaignId);

        const monsterStmt = db.prepare(`
            SELECT m.* FROM monsters m
            JOIN encounter_monsters em ON m.id = em.monster_id
            WHERE em.encounter_id = ?
        `);
        const characterStmt = db.prepare(`
            SELECT c.* FROM characters c
            JOIN encounter_characters ec ON c.id = ec.character_id
            WHERE ec.encounter_id = ?
        `);

        for (const encounter of encounters) {
            encounter.monsters = monsterStmt.all(encounter.id);
            encounter.characters = characterStmt.all(encounter.id);
        }

        return { success: true, data: encounters };
    } catch (error) {
        console.error(`Error in getEncountersByCampaign for campaign ${campaignId}:`, error);
        return { success: false, error: error.message };
    }
}

function getEncounterById(encounterId) {
    try {
        const encounter = db.prepare(`
            SELECT 
                e.id, e.name, e.campaign_id, e.song_id,
                e.easy_battle_song_id, e.medium_battle_song_id, e.hard_battle_song_id, e.deadly_battle_song_id, e.extreme_battle_song_id,
                c.name as campaign_name,
                s.name as song_name,
                s_easy.name AS easy_battle_song_name, s_easy.filePath AS easy_battle_song_filePath,
                s_medium.name AS medium_battle_song_name, s_medium.filePath AS medium_battle_song_filePath,
                s_hard.name AS hard_battle_song_name, s_hard.filePath AS hard_battle_song_filePath,
                s_deadly.name AS deadly_battle_song_name, s_deadly.filePath AS deadly_battle_song_filePath,
                s_extreme.name AS extreme_battle_song_name, s_extreme.filePath AS extreme_battle_song_filePath
            FROM encounters e
            LEFT JOIN campaigns c ON e.campaign_id = c.id
            LEFT JOIN songs s ON e.song_id = s.id
            LEFT JOIN songs s_easy ON e.easy_battle_song_id = s_easy.id
            LEFT JOIN songs s_medium ON e.medium_battle_song_id = s_medium.id
            LEFT JOIN songs s_hard ON e.hard_battle_song_id = s_hard.id
            LEFT JOIN songs s_deadly ON e.deadly_battle_song_id = s_deadly.id
            LEFT JOIN songs s_extreme ON e.extreme_battle_song_id = s_extreme.id
            WHERE e.id = ?
        `).get(encounterId);

        if (!encounter) {
            return { success: false, error: "Encounter not found" };
        }

        const monsterStmt = db.prepare(`
            SELECT m.* FROM monsters m
            JOIN encounter_monsters em ON m.id = em.monster_id
            WHERE em.encounter_id = ?
        `);
        const characterStmt = db.prepare(`
            SELECT c.* FROM characters c
            JOIN encounter_characters ec ON c.id = ec.character_id
            WHERE ec.encounter_id = ?
        `);

        encounter.monsters = monsterStmt.all(encounterId);
        encounter.characters = characterStmt.all(encounterId);

        return { success: true, data: encounter };
    } catch (error) {
        console.error("Error in getEncounterById:", error.message);
        return { success: false, error: error.message };
    }
}

const addEncounter = db.transaction((encounter) => {
    try {
        const { name, campaign_id, song_id, easy_battle_song_id, medium_battle_song_id, hard_battle_song_id, deadly_battle_song_id, extreme_battle_song_id } = encounter;
        const monsterIds = encounter.monsters || [];
        const characterIds = encounter.characters || [];
        const encounterId = encounter.id || generateBackendId('encounter');

        // Insert into encounters table
        const encounterStmt = db.prepare('INSERT INTO encounters (id, name, campaign_id, song_id, easy_battle_song_id, medium_battle_song_id, hard_battle_song_id, deadly_battle_song_id, extreme_battle_song_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        encounterStmt.run(encounterId, name, campaign_id, song_id, easy_battle_song_id, medium_battle_song_id, hard_battle_song_id, deadly_battle_song_id, extreme_battle_song_id);

        // Insert into encounter_monsters
        const monsterStmt = db.prepare('INSERT INTO encounter_monsters (encounter_id, monster_id) VALUES (?, ?)');
        for (const monsterId of monsterIds) {
            monsterStmt.run(encounterId, monsterId);
        }

        // Insert into encounter_characters
        const characterStmt = db.prepare('INSERT INTO encounter_characters (encounter_id, character_id) VALUES (?, ?)');
        for (const characterId of characterIds) {
            characterStmt.run(encounterId, characterId);
        }

        return { success: true, id: encounterId };
    } catch (error) {
        console.error("Error in addEncounter transaction:", error);
        throw error; // Re-throw the error to be caught by the caller
    }
});

const updateEncounter = db.transaction((encounter) => {
    try {
        const { id, name, campaign_id, song_id, easy_battle_song_id, medium_battle_song_id, hard_battle_song_id, deadly_battle_song_id, extreme_battle_song_id, monsters, characters } = encounter;

        // Update encounters table
        const encounterStmt = db.prepare('UPDATE encounters SET name = ?, campaign_id = ?, song_id = ?, easy_battle_song_id = ?, medium_battle_song_id = ?, hard_battle_song_id = ?, deadly_battle_song_id = ?, extreme_battle_song_id = ? WHERE id = ?');
        encounterStmt.run(name, campaign_id, song_id, easy_battle_song_id, medium_battle_song_id, hard_battle_song_id, deadly_battle_song_id, extreme_battle_song_id, id);

        // Clear old associations
        db.prepare('DELETE FROM encounter_monsters WHERE encounter_id = ?').run(id);
        db.prepare('DELETE FROM encounter_characters WHERE encounter_id = ?').run(id);

        // Insert new associations
        const monsterStmt = db.prepare('INSERT INTO encounter_monsters (encounter_id, monster_id) VALUES (?, ?)');
        for (const monsterId of monsters) {
            monsterStmt.run(id, monsterId);
        }

        const characterStmt = db.prepare('INSERT INTO encounter_characters (encounter_id, character_id) VALUES (?, ?)');
        for (const characterId of characters) {
            characterStmt.run(id, characterId);
        }

        return { success: true, id: id };
    } catch (error) {
        console.error("Error in updateEncounter transaction:", error);
        throw error;
    }
});

function deleteEncounter(encounterId) {
    try {
        const stmt = db.prepare('DELETE FROM encounters WHERE id = ?');
        const info = stmt.run(encounterId);
        // ON DELETE CASCADE will handle the junction tables
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    getEncounters,
    getEncountersByCampaign,
    getEncounterById,
    addEncounter,
    updateEncounter,
    deleteEncounter,
};