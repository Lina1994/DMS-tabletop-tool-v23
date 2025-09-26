const path = require('path');
const fs = require('fs');
const db = require('./config/database'); // Usamos la nueva conexión centralizada

const generateBackendId = (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Spell CRUD
function getSpells() {
    try {
        const stmt = db.prepare('SELECT * FROM spells');
        return { success: true, data: stmt.all() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getSpellById(id) {
    try {
        const stmt = db.prepare('SELECT * FROM spells WHERE id = ?');
        const spell = stmt.get(id);
        return { success: true, data: spell };
    } catch (error) {
        console.error('Backend: Error in getSpellById:', error.message);
        return { success: false, error: error.message };
    }
}

function addSpell(spell) {
    console.log('Backend: addSpell called with:', spell);
    try {
        const spellToInsert = {
            ...spell,
            level: spell.level === '' ? null : parseInt(spell.level, 10),
            is_ritual: spell.is_ritual ? 1 : 0,
            requires_concentration: spell.requires_concentration ? 1 : 0,
            has_material_components: spell.has_material_components ? 1 : 0
        };
        const stmt = db.prepare('INSERT INTO spells (id, name, school, level, range, duration, cost, is_ritual, requires_concentration, has_material_components, components, classes, description, damage_attack, aoe, saving_throw, higher_level_casting) VALUES (@id, @name, @school, @level, @range, @duration, @cost, @is_ritual, @requires_concentration, @has_material_components, @components, @classes, @description, @damage_attack, @aoe, @saving_throw, @higher_level_casting)');
        const info = stmt.run(spellToInsert);
        console.log('Backend: addSpell successful, info:', info);
        return { success: true, id: spell.id };
    } catch (error) {
        console.error('Backend: Error in addSpell:', error);
        return { success: false, error: error.message };
    }
}

function updateSpell(spell) {
    try {
        const spellToUpdate = {
            ...spell,
            level: spell.level === '' ? null : parseInt(spell.level, 10),
            is_ritual: spell.is_ritual ? 1 : 0,
            requires_concentration: spell.requires_concentration ? 1 : 0,
            has_material_components: spell.has_material_components ? 1 : 0
        };
        const stmt = db.prepare('UPDATE spells SET name = @name, school = @school, level = @level, range = @range, duration = @duration, cost = @cost, is_ritual = @is_ritual, requires_concentration = @requires_concentration, has_material_components = @has_material_components, components = @components, classes = @classes, description = @description, damage_attack = @damage_attack, aoe = @aoe, saving_throw = @saving_throw, higher_level_casting = @higher_level_casting WHERE id = @id');
        const info = stmt.run(spellToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteSpell(spellId) {
    try {
        const stmt = db.prepare('DELETE FROM spells WHERE id = ?');
        const info = stmt.run(spellId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteAllSpells() {
    try {
        const stmt = db.prepare('DELETE FROM spells');
        const info = stmt.run();
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function syncSpells(spells) {
    try {
        deleteAllSpells(); // Clear existing spells
        const insert = db.prepare('INSERT INTO spells (id, name, school, level, range, duration, cost, is_ritual, requires_concentration, has_material_components, components, classes, description, damage_attack, aoe, saving_throw, higher_level_casting) VALUES (@id, @name, @school, @level, @range, @duration, @cost, @is_ritual, @requires_concentration, @has_material_components, @components, @classes, @description, @damage_attack, @aoe, @saving_throw, @higher_level_casting)');
        db.transaction((data) => {
            for (const spell of data) {
                const spellToInsert = {
                    ...spell,
                    level: spell.level === '' ? null : parseInt(spell.level, 10),
                    is_ritual: spell.is_ritual ? 1 : 0,
                    requires_concentration: spell.requires_concentration ? 1 : 0,
                    has_material_components: spell.has_material_components ? 1 : 0
                };
                insert.run(spellToInsert);
            }
        })(spells);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Calendar CRUD
function getCalendar(campaignId) {
    try {
        const stmt = db.prepare('SELECT * FROM calendars WHERE campaign_id = ?');
        const calendar = stmt.get(campaignId);
        if (calendar) {
            // Parse JSON strings back to arrays/objects
            calendar.month_names = JSON.parse(calendar.month_names);
            calendar.days_in_month = JSON.parse(calendar.days_in_month);
            calendar.weekday_names = JSON.parse(calendar.weekday_names);
        }
        return { success: true, data: calendar };
    } catch (error) {
        console.error('Error getting calendar:', error);
        return { success: false, error: error.message };
    }
}

function addCalendar(calendar) {
    try {
        const stmt = db.prepare('INSERT INTO calendars (id, campaign_id, num_months, month_names, days_in_month, days_in_week, weekday_names, current_year) VALUES (@id, @campaign_id, @num_months, @month_names, @days_in_month, @days_in_week, @weekday_names, @current_year)');
        const calendarToInsert = {
            ...calendar,
            month_names: JSON.stringify(calendar.month_names),
            days_in_month: JSON.stringify(calendar.days_in_month),
            weekday_names: JSON.stringify(calendar.weekday_names),
        };
        const info = stmt.run(calendarToInsert);
        return { success: true, id: calendar.id };
    } catch (error) {
        console.error('Error adding calendar:', error);
        return { success: false, error: error.message };
    }
}

function updateCalendar(calendar) {
    try {
        const stmt = db.prepare('UPDATE calendars SET num_months = @num_months, month_names = @month_names, days_in_month = @days_in_month, days_in_week = @days_in_week, weekday_names = @weekday_names, current_year = @current_year WHERE id = @id');
        const calendarToUpdate = {
            ...calendar,
            month_names: JSON.stringify(calendar.month_names),
            days_in_month: JSON.stringify(calendar.days_in_month),
            weekday_names: JSON.stringify(calendar.weekday_names),
        };
        const info = stmt.run(calendarToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteCalendar(calendarId) {
    try {
        const stmt = db.prepare('DELETE FROM calendars WHERE id = ?');
        const info = stmt.run(calendarId);
        return { success: true, changes: info.changes };
    } catch (error) {
        console.error('Error deleting calendar:', error);
        return { success: false, error: error.message };
    }
}

// Diary Entry CRUD
function getDiaryEntry(campaignId, year, monthIndex, day) {
    try {
        const stmt = db.prepare('SELECT * FROM diary_entries WHERE campaign_id = ? AND year = ? AND month_index = ? AND day = ?');
        const entry = stmt.get(campaignId, year, monthIndex, day);
        return { success: true, data: entry };
    } catch (error) {
        console.error('Error getting diary entry:', error);
        return { success: false, error: error.message };
    }
}

function addDiaryEntry(entry) {
    try {
        console.log('Attempting to add diary entry:', entry);
        const stmt = db.prepare('INSERT INTO diary_entries (id, campaign_id, year, month_index, day, content) VALUES (@id, @campaign_id, @year, @month_index, @day, @content)');
        const info = stmt.run(entry);
        console.log('Successfully added diary entry. Info:', info);
        return { success: true, id: entry.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateDiaryEntry(entry) {
    try {
        const stmt = db.prepare('UPDATE diary_entries SET content = @content, updated_at = CURRENT_TIMESTAMP WHERE id = @id');
        const info = stmt.run(entry);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteDiaryEntry(id) {
    try {
        const stmt = db.prepare('DELETE FROM diary_entries WHERE id = ?');
        const info = stmt.run(id);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getAllDiaryEntriesForCampaignAndYear(campaignId, year) {
    try {
        console.log(`Fetching diary entries for Campaign ID: ${campaignId}, Year: ${year}`);
        const stmt = db.prepare('SELECT * FROM diary_entries WHERE campaign_id = ? AND year = ?');
        const entries = stmt.all(campaignId, year);
        console.log(`Found ${entries.length} diary entries for Campaign ID: ${campaignId}, Year: ${year}`);
        return { success: true, data: entries };
    } catch (error) {
        console.error('Error getting all diary entries for campaign and year:', error);
        return { success: false, error: error.message };
    }
}

// World Map CRUD
function getWorldMaps(campaignId) {
    try {
        const stmt = db.prepare('SELECT * FROM world_maps WHERE campaign_id = ?');
        const data = stmt.all(campaignId);
        const worldMapsWithImageData = data.map(map => {
            const newMap = { ...map };
            if (newMap.image_data) {
                newMap.image_data = `data:image/png;base64,${newMap.image_data.toString('base64')}`;
            }
            return newMap;
        });
        return { success: true, data: worldMapsWithImageData };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function addWorldMap(worldMap) {
    try {
        let imageDataBuffer = null;
        if (worldMap.image_data) {
            const base64Data = worldMap.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }
        const newWorldMapId = worldMap.id || generateBackendId('worldmap');
        const stmt = db.prepare('INSERT INTO world_maps (id, name, image_data, campaign_id) VALUES (@id, @name, @image_data, @campaign_id)');
        const worldMapToInsert = {
            id: newWorldMapId,
            name: worldMap.name,
            image_data: imageDataBuffer,
            campaign_id: worldMap.campaign_id,
        };
        const info = stmt.run(worldMapToInsert);
        return { success: true, id: newWorldMapId };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateWorldMap(worldMap) {
    try {
        let imageDataBuffer = null;
        if (worldMap.image_data && worldMap.image_data.startsWith('data:image')) {
            const base64Data = worldMap.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }
        const stmt = db.prepare('UPDATE world_maps SET name = @name, image_data = @image_data, campaign_id = @campaign_id WHERE id = @id');
        const worldMapToUpdate = {
            id: worldMap.id,
            name: worldMap.name,
            image_data: imageDataBuffer,
            campaign_id: worldMap.campaign_id,
        };
        const info = stmt.run(worldMapToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteWorldMap(worldMapId) {
    try {
        const stmt = db.prepare('DELETE FROM world_maps WHERE id = ?');
        const info = stmt.run(worldMapId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// World Map Markers CRUD
function getWorldMapMarkers(worldMapId) {
    try {
        const stmt = db.prepare('SELECT * FROM world_map_markers WHERE world_map_id = ?');
        const markers = stmt.all(worldMapId);
        // A robust parser that handles null, JSON arrays, and legacy single IDs
        const safeParseMarkerLink = (jsonString) => {
            if (!jsonString) return [];
            try {
                return JSON.parse(jsonString);
            } catch (e) {
                // If parsing fails, assume it's a legacy single ID string and wrap it in an array
                return [jsonString];
            }
        };

        const parsedMarkers = markers.map(marker => ({
            ...marker,
            linked_maps: safeParseMarkerLink(marker.linked_maps),
            linked_characters: safeParseMarkerLink(marker.linked_characters),
            linked_enemies: safeParseMarkerLink(marker.linked_enemies),
            linked_encounter: safeParseMarkerLink(marker.linked_encounter),
        }));
        return { success: true, data: parsedMarkers };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function addWorldMapMarker(marker) {
    try {
        const newMarkerId = marker.id || generateBackendId('marker');
        const stmt = db.prepare('INSERT INTO world_map_markers (id, world_map_id, x, y, name, description, notes, linked_maps, linked_characters, linked_enemies, linked_encounter, icon_type, icon_color) VALUES (@id, @world_map_id, @x, @y, @name, @description, @notes, @linked_maps, @linked_characters, @linked_enemies, @linked_encounter, @icon_type, @icon_color)');
        const markerToInsert = {
            id: newMarkerId,
            world_map_id: marker.world_map_id,
            x: marker.x,
            y: marker.y,
            name: marker.name,
            description: marker.description,
            notes: marker.notes || null,
            linked_maps: marker.linked_maps ? JSON.stringify(marker.linked_maps) : null,
            linked_characters: marker.linked_characters ? JSON.stringify(marker.linked_characters) : null,
            linked_enemies: marker.linked_enemies ? JSON.stringify(marker.linked_enemies) : null,
            linked_encounter: marker.linked_encounter ? JSON.stringify(marker.linked_encounter) : null,
            icon_type: marker.icon_type || 'circle',
            icon_color: marker.icon_color || '#ff0000'
        };
        const info = stmt.run(markerToInsert);
        return { success: true, id: newMarkerId };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateWorldMapMarker(marker) {
    try {
        const stmt = db.prepare('UPDATE world_map_markers SET name = @name, description = @description, notes = @notes, linked_maps = @linked_maps, linked_characters = @linked_characters, linked_enemies = @linked_enemies, linked_encounter = @linked_encounter, icon_type = @icon_type, icon_color = @icon_color WHERE id = @id');
        const markerToUpdate = {
            id: marker.id,
            name: marker.name,
            description: marker.description,
            notes: marker.notes || null,
            linked_maps: marker.linked_maps ? JSON.stringify(marker.linked_maps) : null,
            linked_characters: marker.linked_characters ? JSON.stringify(marker.linked_characters) : null,
            linked_enemies: marker.linked_enemies ? JSON.stringify(marker.linked_enemies) : null,
            linked_encounter: marker.linked_encounter ? JSON.stringify(marker.linked_encounter) : null,
            icon_type: marker.icon_type,
            icon_color: marker.icon_color
        };
        const info = stmt.run(markerToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteWorldMapMarker(markerId) {
    try {
        const stmt = db.prepare('DELETE FROM world_map_markers WHERE id = ?');
        const info = stmt.run(markerId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Mission CRUD
function getMissionsByCampaign(campaignId) {
    try {
        const stmt = db.prepare('SELECT * FROM missions WHERE campaign_id = ?');
        const missions = stmt.all(campaignId);
        const parsedMissions = missions.map(mission => ({
            ...mission,
            name: mission.title, // Add name property for frontend compatibility
            client: mission.client ? JSON.parse(mission.client) : [],
            location: mission.location ? JSON.parse(mission.location) : [],
            encounters: mission.encounters ? JSON.parse(mission.encounters) : [],
            enemies: mission.enemies ? JSON.parse(mission.enemies) : [],
        }));
        return { success: true, data: parsedMissions };
    } catch (error) {
        console.error('Error in getMissionsByCampaign:', error.message);
        return { success: false, error: error.message };
    }
}

function getMissionById(id) {
    try {
        const stmt = db.prepare('SELECT * FROM missions WHERE id = ?');
        const mission = stmt.get(id);
        if (mission) {
            mission.name = mission.title;
            mission.client = mission.client ? JSON.parse(mission.client) : [];
            mission.location = mission.location ? JSON.parse(mission.location) : [];
            mission.encounters = mission.encounters ? JSON.parse(mission.encounters) : [];
            mission.enemies = mission.enemies ? JSON.parse(mission.enemies) : [];
        }
        return { success: true, data: mission };
    } catch (error) {
        console.error('Error in getMissionById:', error.message);
        return { success: false, error: error.message };
    }
}

function addMission(mission) {
    try {
        const newMissionId = mission.id || generateBackendId('mission');
        const stmt = db.prepare('INSERT INTO missions (id, title, type, description, client, location, reward, encounters, enemies, complication, notes, status, campaign_id) VALUES (@id, @title, @type, @description, @client, @location, @reward, @encounters, @enemies, @complication, @notes, @status, @campaign_id)');
        const missionToInsert = {
            id: newMissionId,
            title: mission.title,
            type: mission.type,
            description: mission.description,
            client: mission.client ? JSON.stringify(mission.client) : null,
            location: mission.location ? JSON.stringify(mission.location) : null,
            reward: mission.reward,
            encounters: mission.encounters ? JSON.stringify(mission.encounters) : null,
            enemies: mission.enemies ? JSON.stringify(mission.enemies) : null,
            complication: mission.complication,
            notes: mission.notes,
            status: mission.status,
            campaign_id: mission.campaign_id
        };
        const info = stmt.run(missionToInsert);
        return { success: true, id: newMissionId };
    } catch (error) {
        console.error('Error in addMission:', error.message);
        return { success: false, error: error.message };
    }
}

function updateMission(mission) {
    try {
        const stmt = db.prepare('UPDATE missions SET title = @title, type = @type, description = @description, client = @client, location = @location, reward = @reward, encounters = @encounters, enemies = @enemies, complication = @complication, notes = @notes, status = @status, campaign_id = @campaign_id WHERE id = @id');
        const missionToUpdate = {
            id: mission.id,
            title: mission.title,
            type: mission.type,
            description: mission.description,
            client: mission.client ? JSON.stringify(mission.client) : null,
            location: mission.location ? JSON.stringify(mission.location) : null,
            reward: mission.reward,
            encounters: mission.encounters ? JSON.stringify(mission.encounters) : null,
            enemies: mission.enemies ? JSON.stringify(mission.enemies) : null,
            complication: mission.complication,
            notes: mission.notes,
            status: mission.status,
            campaign_id: mission.campaign_id
        };
        const info = stmt.run(missionToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        console.error('Error in updateMission:', error.message);
        return { success: false, error: error.message };
    }
}

function deleteMission(missionId) {
    try {
        const stmt = db.prepare('DELETE FROM missions WHERE id = ?');
        const info = stmt.run(missionId);
        return { success: true, changes: info.changes };
    } catch (error) {
        console.error('Error in deleteMission:', error.message);
        return { success: false, error: error.message };
    }
}

// Generator Entries CRUD
function addGeneratorEntry(entry) {
    try {
        const newEntryId = entry.id || generateBackendId('generatorEntry');
        const stmt = db.prepare('INSERT INTO generator_entries (id, category, rarity, value, campaign_id) VALUES (@id, @category, @rarity, @value, @campaign_id)');
        const entryToInsert = {
            id: newEntryId,
            category: entry.category,
            rarity: entry.rarity,
            value: entry.value,
            campaign_id: entry.campaign_id
        };
        const info = stmt.run(entryToInsert);
        return { success: true, id: newEntryId };
    } catch (error) {
        console.error('Error in addGeneratorEntry:', error.message);
        return { success: false, error: error.message };
    }
}

function getGeneratorEntries(campaignId, category = null, rarity = null) {
    try {
        let query = 'SELECT * FROM generator_entries WHERE campaign_id = ?';
        const params = [campaignId];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (rarity) {
            query += ' AND rarity = ?';
            params.push(rarity);
        }

        const stmt = db.prepare(query);
        const entries = stmt.all(...params);
        return { success: true, data: entries };
    } catch (error) {
        console.error('Error in getGeneratorEntries:', error.message);
        return { success: false, error: error.message };
    }
}

function updateGeneratorEntry(entry) {
    try {
        const stmt = db.prepare('UPDATE generator_entries SET category = @category, rarity = @rarity, value = @value, campaign_id = @campaign_id WHERE id = @id');
        const info = stmt.run(entry);
        return { success: true, changes: info.changes };
    } catch (error) {
        console.error('Error in updateGeneratorEntry:', error.message);
        return { success: false, error: error.message };
    }
}

function deleteGeneratorEntry(entryId) {
    try {
        const stmt = db.prepare('DELETE FROM generator_entries WHERE id = ?');
        const info = stmt.run(entryId);
        return { success: true, changes: info.changes };
    } catch (error) {
        console.error('Error in deleteGeneratorEntry:', error.message);
        return { success: false, error: error.message };
    }
}

function syncGeneratorEntries(campaignId, entries) {
    const insertStmt = db.prepare('INSERT OR IGNORE INTO generator_entries (id, campaign_id, category, rarity, value) VALUES (@id, @campaign_id, @category, @rarity, @value)');

    const syncTransaction = db.transaction(() => {
        for (const entry of entries) {
            insertStmt.run(entry);
        }
    });

    try {
        syncTransaction();
        return { success: true };
    } catch (error) {
        console.error('Error in syncGeneratorEntries:', error.message);
        return { success: false, error: error.message };
    }
}


// Helper function to generate a 'slug' from a title
const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove non-word chars except -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

// --- Worldpedia CRUD ---

/**
 * Gets all worldpedia entries for a campaign.
 * @param {number} campaignId The ID of the campaign.
 * @returns {Array} An array of entry objects.
 */
function getAllEntriesByCampaign(campaignId) {
  try {
    const stmt = db.prepare('SELECT * FROM worldpedia_entries WHERE campaign_id = ? ORDER BY is_folder DESC, title ASC');
    return { success: true, data: stmt.all(campaignId) };
  } catch (error) {
    console.error('Error in getAllEntriesByCampaign:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Gets a single entry by its ID.
 * @param {number} id The ID of the entry.
 * @returns {Object} The entry object.
 */
function getEntryById(id) {
  try {
    const stmt = db.prepare('SELECT * FROM worldpedia_entries WHERE id = ?');
    const entry = stmt.get(id);
    return { success: true, data: entry };
  } catch (error) {
    console.error('Error in getEntryById:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Creates a new worldpedia entry.
 * @param {Object} entryData The data for the new entry.
 * @returns {Object} Result of the operation.
 */
function createEntry({ campaign_id, title, content, parent_id, is_folder }) {
  try {
    const slug = generateSlug(title);
    // To ensure slug is unique, append a counter if it already exists
    let finalSlug = slug;
    let counter = 1;
    const slugCheckStmt = db.prepare('SELECT 1 FROM worldpedia_entries WHERE slug = ? AND campaign_id = ?');
    while (slugCheckStmt.get(finalSlug, campaign_id)) {
        finalSlug = `${slug}-${counter}`;
        counter++;
    }

    const stmt = db.prepare(`
      INSERT INTO worldpedia_entries (campaign_id, title, slug, content, parent_id, is_folder, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const info = stmt.run(campaign_id, title, finalSlug, content, parent_id, is_folder ? 1 : 0);
    return { success: true, id: info.lastInsertRowid, title, slug: finalSlug };
  } catch (error) {
    console.error('Error in createEntry:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Updates an existing worldpedia entry.
 * @param {number} id The ID of the entry to update.
 * @param {Object} entryData The new data.
 * @returns {Object} Result of the operation.
 */
function updateEntry(id, entryData) {
  try {
    const currentEntry = db.prepare('SELECT campaign_id FROM worldpedia_entries WHERE id = ?').get(id);
    if (!currentEntry) {
        return { success: false, error: 'Entry not found' };
    }

    // Prevent key fields from being updated directly
    delete entryData.id;
    delete entryData.campaign_id;
    delete entryData.slug;
    
    // If title is being updated, generate a new unique slug
    if (entryData.title) {
        const newSlug = generateSlug(entryData.title);
        let finalSlug = newSlug;
        let counter = 1;
        const slugCheckStmt = db.prepare('SELECT 1 FROM worldpedia_entries WHERE slug = ? AND campaign_id = ? AND id != ?');
        while (slugCheckStmt.get(finalSlug, currentEntry.campaign_id, id)) {
            finalSlug = `${newSlug}-${counter}`;
            counter++;
        }
        entryData.slug = finalSlug;
    }

    const fields = Object.keys(entryData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(entryData);

    if (fields.length === 0) {
      return { success: false, error: "No fields to update provided." };
    }

    const stmt = db.prepare(`UPDATE worldpedia_entries SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    const info = stmt.run(...values, id);
    return { success: true, changes: info.changes };
  } catch (error) {
    console.error('Error in updateEntry:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Deletes an entry, including all its descendants if it's a folder.
 * @param {number} id The ID of the entry to delete.
 * @returns {Object} Result of the operation.
 */
function deleteEntry(id) {
    const deleteTransaction = db.transaction((entryId) => {
        const entry = db.prepare('SELECT id, is_folder FROM worldpedia_entries WHERE id = ?').get(entryId);
        if (!entry) {
            return { changes: 0 }; // Nothing to delete
        }

        const idsToDelete = [entryId];

        if (entry.is_folder) {
            const findDescendantIds = (parentId) => {
                const children = db.prepare('SELECT id, is_folder FROM worldpedia_entries WHERE parent_id = ?').all(parentId);
                for (const child of children) {
                    idsToDelete.push(child.id);
                    if (child.is_folder) {
                        findDescendantIds(child.id);
                    }
                }
            };
            findDescendantIds(entryId);
        }

        const placeholders = idsToDelete.map(() => '?').join(',');
        const stmt = db.prepare(`DELETE FROM worldpedia_entries WHERE id IN (${placeholders})`);
        const info = stmt.run(...idsToDelete);
        return { changes: info.changes };
    });

    try {
        const result = deleteTransaction(id);
        return { success: true, changes: result.changes };
    } catch (error) {
        console.error("Error in deleteEntry transaction:", error.message);
        return { success: false, error: error.message };
    }
}

function searchEntries(campaignId, query) {
  try {
    const lowerCaseQuery = `%${query.toLowerCase()}%`;
    const stmt = db.prepare(`
      SELECT * FROM worldpedia_entries
      WHERE campaign_id = ? AND (
        LOWER(title) LIKE ? OR
        (is_folder = 0 AND content IS NOT NULL AND LOWER(content) LIKE ?)
      )
    `);
    const results = stmt.all(campaignId, lowerCaseQuery, lowerCaseQuery);
    return { success: true, data: results };
  } catch (error) {
    console.error('Error in searchEntries:', error.message);
    return { success: false, error: error.message };
  }
}


module.exports = {
    db,
    getSpells,
    getSpellById,
    addSpell,
    updateSpell,
    deleteSpell,
    deleteAllSpells,
    syncSpells,
    getCalendar,
    addCalendar,
    updateCalendar,
    deleteCalendar,
    getDiaryEntry,
    addDiaryEntry,
    updateDiaryEntry,
    deleteDiaryEntry,
    getAllDiaryEntriesForCampaignAndYear,
    generateBackendId,
    getWorldMaps,
    addWorldMap,
    updateWorldMap,
    deleteWorldMap,
    getWorldMapMarkers,
    addWorldMapMarker,
    updateWorldMapMarker,
    deleteWorldMapMarker,
    getMissionsByCampaign,
    getMissionById, // <-- AÑADIDO
    addMission,
    updateMission,
    deleteMission,
    addGeneratorEntry,
    getGeneratorEntries,
    updateGeneratorEntry,
    deleteGeneratorEntry,
    syncGeneratorEntries,
    // Worldpedia
    getAllEntriesByCampaign,
    getEntryById,
    createEntry,
    updateEntry,
    deleteEntry,
    searchEntries
};