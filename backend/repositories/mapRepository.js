const db = require('../config/database');
const path = require('path');
const { generateBackendId } = require('../utils');

function getMaps() {
    console.log('Backend: getMaps called');
    try {
        const stmt = db.prepare('SELECT m.*, s.name AS song_name, s.filePath AS song_filePath, c.name AS campaign_name, s_easy.name AS easy_battle_song_name, s_easy.filePath AS easy_battle_song_filePath, s_medium.name AS medium_battle_song_name, s_medium.filePath AS medium_battle_song_filePath, s_hard.name AS hard_battle_song_name, s_hard.filePath AS hard_battle_song_filePath, s_deadly.name AS deadly_battle_song_name, s_deadly.filePath AS deadly_battle_song_filePath, s_extreme.name AS extreme_battle_song_name, s_extreme.filePath AS extreme_battle_song_filePath FROM maps m LEFT JOIN songs s ON m.song_id = s.id LEFT JOIN campaigns c ON m.campaign_id = c.id LEFT JOIN songs s_easy ON m.easy_battle_song_id = s_easy.id LEFT JOIN songs s_medium ON m.medium_battle_song_id = s_medium.id LEFT JOIN songs s_hard ON m.hard_battle_song_id = s_hard.id LEFT JOIN songs s_deadly ON m.deadly_battle_song_id = s_deadly.id LEFT JOIN songs s_extreme ON m.extreme_battle_song_id = s_extreme.id');
        const data = stmt.all();
        const mapsWithImageData = data.map(map => {
            const newMap = { ...map }; // Create a copy to avoid modifying the original map object
            if (newMap.image_data) {
                newMap.image_data = `data:image/png;base64,${newMap.image_data.toString('base64')}`;
            }
            if (newMap.panoramic_view_data) {
                newMap.panoramic_view_data = `data:image/png;base64,${newMap.panoramic_view_data.toString('base64')}`;
            }
            // If song_filePath exists, extract only the filename
            if (newMap.song_filePath) {
                newMap.song_filePath = path.basename(newMap.song_filePath);
            }
            if (newMap.easy_battle_song_filePath) {
                newMap.easy_battle_song_filePath = path.basename(newMap.easy_battle_song_filePath);
            }
            if (newMap.medium_battle_song_filePath) {
                newMap.medium_battle_song_filePath = path.basename(newMap.medium_battle_song_filePath);
            }
            if (newMap.hard_battle_song_filePath) {
                newMap.hard_battle_song_filePath = path.basename(newMap.hard_battle_song_filePath);
            }
            if (newMap.deadly_battle_song_filePath) {
                newMap.deadly_battle_song_filePath = path.basename(newMap.deadly_battle_song_filePath);
            }
            if (newMap.extreme_battle_song_filePath) {
                newMap.extreme_battle_song_filePath = path.basename(newMap.extreme_battle_song_filePath);
            }
            return newMap;
        });
        console.log('Backend: getMaps successful');
        return { success: true, data: mapsWithImageData };
    } catch (error) {
        console.error('Backend: Error in getMaps:', error.message);
        return { success: false, error: error.message };
    }
}

function getMapById(id) {
    console.log(`Backend: getMapById called for id: ${id}`);
    try {
        const stmt = db.prepare('SELECT m.*, s.name AS song_name, s.filePath AS song_filePath, c.name AS campaign_name, s_easy.name AS easy_battle_song_name, s_easy.filePath AS easy_battle_song_filePath, s_medium.name AS medium_battle_song_name, s_medium.filePath AS medium_battle_song_filePath, s_hard.name AS hard_battle_song_name, s_hard.filePath AS hard_battle_song_filePath, s_deadly.name AS deadly_battle_song_name, s_deadly.filePath AS deadly_battle_song_filePath, s_extreme.name AS extreme_battle_song_name, s_extreme.filePath AS extreme_battle_song_filePath FROM maps m LEFT JOIN songs s ON m.song_id = s.id LEFT JOIN campaigns c ON m.campaign_id = c.id LEFT JOIN songs s_easy ON m.easy_battle_song_id = s_easy.id LEFT JOIN songs s_medium ON m.medium_battle_song_id = s_medium.id LEFT JOIN songs s_hard ON m.hard_battle_song_id = s_hard.id LEFT JOIN songs s_deadly ON m.deadly_battle_song_id = s_deadly.id LEFT JOIN songs s_extreme ON m.extreme_battle_song_id = s_extreme.id WHERE m.id = ?');
        const map = stmt.get(id);
        if (map) {
            if (map.image_data) {
                map.image_data = `data:image/png;base64,${map.image_data.toString('base64')}`;
            }
            if (map.panoramic_view_data) {
                map.panoramic_view_data = `data:image/png;base64,${map.panoramic_view_data.toString('base64')}`;
            }
            if (map.song_filePath) {
                map.song_filePath = path.basename(map.song_filePath);
            }
        }
        return { success: true, data: map };
    } catch (error) {
        console.error('Backend: Error in getMapById:', error.message);
        return { success: false, error: error.message };
    }
}

function getMapsByCampaign(campaignId) {
    console.log(`Backend: getMapsByCampaign called for campaignId: ${campaignId}`);
    try {
        const stmt = db.prepare('SELECT m.*, s.name AS song_name, s.filePath AS song_filePath, c.name AS campaign_name, s_easy.name AS easy_battle_song_name, s_easy.filePath AS easy_battle_song_filePath, s_medium.name AS medium_battle_song_name, s_medium.filePath AS medium_battle_song_filePath, s_hard.name AS hard_battle_song_name, s_hard.filePath AS hard_battle_song_filePath, s_deadly.name AS deadly_battle_song_name, s_deadly.filePath AS deadly_battle_song_filePath, s_extreme.name AS extreme_battle_song_name, s_extreme.filePath AS extreme_battle_song_filePath FROM maps m LEFT JOIN songs s ON m.song_id = s.id LEFT JOIN campaigns c ON m.campaign_id = c.id LEFT JOIN songs s_easy ON m.easy_battle_song_id = s_easy.id LEFT JOIN songs s_medium ON m.medium_battle_song_id = s_medium.id LEFT JOIN songs s_hard ON m.hard_battle_song_id = s_hard.id LEFT JOIN songs s_deadly ON m.deadly_battle_song_id = s_deadly.id LEFT JOIN songs s_extreme ON m.extreme_battle_song_id = s_extreme.id WHERE m.campaign_id = ?');
        const data = stmt.all(campaignId);
        const mapsWithImageData = data.map(map => {
            const newMap = { ...map };
            if (newMap.image_data) {
                newMap.image_data = `data:image/png;base64,${newMap.image_data.toString('base64')}`;
            }
            if (newMap.panoramic_view_data) {
                newMap.panoramic_view_data = `data:image/png;base64,${newMap.panoramic_view_data.toString('base64')}`;
            }
            if (newMap.song_filePath) {
                newMap.song_filePath = path.basename(newMap.song_filePath);
            }
            // ... (repeat for all battle songs)
            return newMap;
        });
        return { success: true, data: mapsWithImageData };
    } catch (error) {
        console.error('Backend: Error in getMapsByCampaign:', error.message);
        return { success: false, error: error.message };
    }
}

function addMap(map) {
    console.log('Backend: addMap called with:', map.name);
    try {
        let imageDataBuffer = null;
        if (map.image_data) {
            const base64Data = map.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }

        let panoramicViewDataBuffer = null;
        if (map.panoramic_view_data) {
            const base64Data = map.panoramic_view_data.replace(/^data:image\/\w+;base64,/, "");
            panoramicViewDataBuffer = Buffer.from(base64Data, 'base64');
        }

        const newMapId = map.id || generateBackendId('map'); // Generate ID if not provided

        const stmt = db.prepare('INSERT INTO maps (id, name, group_name, url, imagePath, image_data, panoramic_view_data, keepOpen, zoom, rotation, panX, panY, original_width, original_height, notes, song_id, campaign_id, easy_battle_song_id, medium_battle_song_id, hard_battle_song_id, deadly_battle_song_id, extreme_battle_song_id) VALUES (@id, @name, @group_name, @url, @imagePath, @image_data, @panoramic_view_data, @keepOpen, @zoom, @rotation, @panX, @panY, @original_width, @original_height, @notes, @song_id, @campaign_id, @easy_battle_song_id, @medium_battle_song_id, @hard_battle_song_id, @deadly_battle_song_id, @extreme_battle_song_id)');
        const mapToInsert = {
            id: newMapId,
            name: map.name,
            group_name: map.group_name || null,
            url: map.url || null,
            imagePath: map.imagePath || null,
            image_data: imageDataBuffer,
            panoramic_view_data: panoramicViewDataBuffer,
            keepOpen: map.keepOpen ? 1 : 0,
            zoom: map.zoom || 1,
            rotation: map.rotation || 0,
            panX: map.panX || 0,
            panY: map.panY || 0,
            original_width: map.originalWidth || null,
            original_height: map.originalHeight || null,
            notes: map.notes || null,
            song_id: map.song_id || null,
            campaign_id: map.campaign_id || null,
            easy_battle_song_id: map.easy_battle_song_id || null,
            medium_battle_song_id: map.medium_battle_song_id || null,
            hard_battle_song_id: map.hard_battle_song_id || null,
            deadly_battle_song_id: map.deadly_battle_song_id || null,
            extreme_battle_song_id: map.extreme_battle_song_id || null
        };
        const info = stmt.run(mapToInsert);
        console.log('Backend: addMap successful, info:', info);
        return { success: true, id: newMapId }; // Return the newly generated ID
    } catch (error) {
        console.error('Backend: Error in addMap:', error.message);
        return { success: false, error: error.message };
    }
}

function addMaps(maps) {
    const stmt = db.prepare('INSERT INTO maps (id, name, group_name, url, imagePath, image_data, keepOpen, zoom, rotation, panX, panY, original_width, original_height, notes, song_id, campaign_id) VALUES (@id, @name, @group_name, @url, @imagePath, @image_data, @keepOpen, @zoom, @rotation, @panX, @panY, @original_width, @original_height, @notes, @song_id, @campaign_id)');
    const transaction = db.transaction((maps) => {
        const ids = [];
        for (const map of maps) {
            let imageDataBuffer = null;
            if (map.image_data) {
                const base64Data = map.image_data.replace(/^data:image\/\w+;base64,/, "");
                imageDataBuffer = Buffer.from(base64Data, 'base64');
            }
            const newMapId = map.id || generateBackendId('map'); // Generate ID if not provided
            const mapToInsert = {
                id: newMapId,
                name: map.name,
                group_name: map.group_name || null,
                url: map.url || null,
                imagePath: map.imagePath || null,
                image_data: imageDataBuffer,
                keepOpen: map.keepOpen ? 1 : 0,
                zoom: map.zoom || 1,
                rotation: map.rotation || 0,
                panX: map.panX || 0,
                panY: map.panY || 0,
                original_width: map.originalWidth || null,
                original_height: map.originalHeight || null,
                notes: map.notes || null,
                song_id: map.song_id || null,
                campaign_id: map.campaign_id || null
            };
            stmt.run(mapToInsert);
            ids.push({ id: newMapId }); // Return the newly generated ID
        }
        return ids;
    });

    try {
        const ids = transaction(maps);
        return { success: true, ids };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateMap(map) {
    console.log('Backend: updateMap called with:', map.name);
    try {
        let imageDataBuffer = null;
        if (map.image_data && map.image_data.startsWith('data:image')) {
            const base64Data = map.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }

        let panoramicViewDataBuffer = null;
        if (map.panoramic_view_data && map.panoramic_view_data.startsWith('data:image')) {
            const base64Data = map.panoramic_view_data.replace(/^data:image\/\w+;base64,/, "");
            panoramicViewDataBuffer = Buffer.from(base64Data, 'base64');
        }

        const stmt = db.prepare('UPDATE maps SET name = @name, group_name = @group_name, url = @url, imagePath = @imagePath, image_data = @image_data, panoramic_view_data = @panoramic_view_data, keepOpen = @keepOpen, zoom = @zoom, rotation = @rotation, panX = @panX, panY = @panY, original_width = @original_width, original_height = @original_height, notes = @notes, song_id = @song_id, campaign_id = @campaign_id, easy_battle_song_id = @easy_battle_song_id, medium_battle_song_id = @medium_battle_song_id, hard_battle_song_id = @hard_battle_song_id, deadly_battle_song_id = @deadly_battle_song_id, extreme_battle_song_id = @extreme_battle_song_id WHERE id = @id');
        const mapToUpdate = {
            id: map.id,
            name: map.name,
            group_name: map.group_name || null,
            url: map.url || null,
            imagePath: map.imagePath || null,
            image_data: imageDataBuffer,
            panoramic_view_data: panoramicViewDataBuffer,
            keepOpen: map.keepOpen ? 1 : 0,
            zoom: map.zoom || 1,
            rotation: map.rotation || 0,
            panX: map.panX || 0,
            panY: map.panY || 0,
            original_width: map.originalWidth || null,
            original_height: map.originalHeight || null,
            notes: map.notes || null,
            song_id: map.song_id || null,
            campaign_id: map.campaign_id || null,
            easy_battle_song_id: map.easy_battle_song_id || null,
            medium_battle_song_id: map.medium_battle_song_id || null,
            hard_battle_song_id: map.hard_battle_song_id || null,
            deadly_battle_song_id: map.deadly_battle_song_id || null,
            extreme_battle_song_id: map.extreme_battle_song_id || null
        };
        const info = stmt.run(mapToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteMap(mapId) {
    console.log('Backend: deleteMap called with ID:', mapId);
    try {
        const stmt = db.prepare('DELETE FROM maps WHERE id = ?');
        const info = stmt.run(mapId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    getMaps,
    getMapById,
    getMapsByCampaign,
    addMap,
    addMaps,
    updateMap,
    deleteMap,
};