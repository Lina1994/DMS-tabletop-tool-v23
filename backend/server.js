const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { setupDatabase } = require('./migrations/run-migrations');
const monsterRepository = require('./repositories/monsterRepository');
const mapRepository = require('./repositories/mapRepository');
const shopRepository = require('./repositories/shopRepository');
const categoryRepository = require('./repositories/categoryRepository');
const itemRepository = require('./repositories/itemRepository');
const campaignRepository = require('./repositories/campaignRepository');
const encounterRepository = require('./repositories/encounterRepository');
const characterRepository = require('./repositories/characterRepository');
const songRepository = require('./repositories/songRepository');
const { 
    db, 
     
    addSong, 
    updateSong, 
    deleteSong, 
     
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
    getMissionById,
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
} = require('./database');

const app = express();
const port = 3001;

// Define the path to the music folder
const musicPath = path.join(__dirname, '..', 'data', 'music');

app.use(cors());
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ limit: '250mb', extended: true }));

// Serve static files from the music folder
app.use('/music', express.static(musicPath));

// Initialize database
setupDatabase();

// API Endpoints for Monsters
app.get('/monsters', (req, res) => {
    const result = monsterRepository.getMonsters();
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.get('/monsters/:id', (req, res) => {
    const monsterId = req.params.id;
    const result = monsterRepository.getMonsterById(monsterId);
    if (result.success) {
        if (result.data) {
            res.json(result.data);
        } else {
            res.status(404).json({ error: 'Monster not found' });
        }
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/monsters', (req, res) => {
    const result = addMonster(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/monsters/:id', (req, res) => {
    const monster = { ...req.body, id: req.params.id };
    const result = updateMonster(monster);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/monsters/:id', (req, res) => {
    const result = deleteMonster(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/monsters', (req, res) => {
    const result = monsterRepository.deleteAllMonsters();
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Spells
app.get('/spells', (req, res) => {
    const result = getSpells();
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.get('/spells/:id', (req, res) => {
    const spellId = req.params.id;
    const result = getSpellById(spellId);
    if (result.success) {
        if (result.data) {
            res.json(result.data);
        } else {
            res.status(404).json({ error: 'Spell not found' });
        }
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/spells', (req, res) => {
    const result = addSpell(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/spells/:id', (req, res) => {
    const spell = { ...req.body, id: req.params.id };
    const result = updateSpell(spell);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/spells/:id', (req, res) => {
    const result = deleteSpell(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/spells', (req, res) => {
    const result = deleteAllSpells();
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.post('/spells/sync', (req, res) => {
    console.log('Backend: /spells/sync called with:', req.body);
    const result = syncSpells(req.body);
    if (result.success) {
        res.status(200).json({ message: 'Spells synced successfully' });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.get('/spells/export', (req, res) => {
    // This will require more logic later to generate an Excel file
    res.status(501).json({ message: 'Spell export not yet implemented' });
});

// API Endpoints for Maps
app.get('/maps', (req, res) => {
    const result = mapRepository.getMaps();
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.get('/maps/:id', (req, res) => {
    const mapId = req.params.id;
    const result = mapRepository.getMapById(mapId);
    if (result.success) {
        if (result.data) {
            res.json(result.data);
        } else {
            res.status(404).json({ error: 'Map not found' });
        }
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.get('/campaigns/:campaignId/maps', (req, res) => {
    const { campaignId } = req.params;
    const result = mapRepository.getMapsByCampaign(campaignId);
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/maps/bulk', (req, res) => {
    const result = addMaps(req.body);
    if (result.success) {
        res.status(201).json(result.ids);
    }
});

app.post('/maps', (req, res) => {
    const result = mapRepository.addMap(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/maps/:id', (req, res) => {
    const map = { ...req.body, id: req.params.id };
    const result = mapRepository.updateMap(map);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/maps/:id', (req, res) => {
    const result = mapRepository.deleteMap(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Shops
app.get('/shops', (req, res) => {
    const result = shopRepository.getShops();
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.get('/campaigns/:campaignId/shops', (req, res) => {
    const { campaignId } = req.params;
    const result = getShopsByCampaign(campaignId);
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/shops/sync', (req, res) => {
    console.log('Backend: /shops/sync called with:', req.body);
    const result = syncShops(req.body);
    if (result.success) {
        res.status(200).json({ message: 'Shops synced successfully' });
    }
});

app.post('/shops', (req, res) => {
    const result = addShop(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/shops/:id', (req, res) => {
    const shop = { ...req.body, id: req.params.id };
    const result = updateShop(shop);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/shops/:id', (req, res) => {
    const result = deleteShop(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Categories (Sections)
app.get('/categories/:id', (req, res) => {
    const result = getCategoryById(req.params.id);
    if (result.success) {
        if (result.data) {
            res.json(result.data);
        } else {
            res.status(404).json({ error: 'Category not found' });
        }
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/shops/:shopId/sections', (req, res) => {
    const { shopId } = req.params;
    const newSection = { ...req.body, id: generateBackendId('section'), shop_id: shopId };
    const result = addCategory(newSection);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/sections/:id', (req, res) => {
    const section = { ...req.body, id: req.params.id };
    const result = updateCategory(section);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/sections/:id', (req, res) => {
    const result = deleteCategory(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Items
app.post('/items', (req, res) => {
    const newItem = { ...req.body, id: generateBackendId('item'), data: req.body };
    const result = addItem(newItem);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/items/:id', (req, res) => {
    const item = { ...req.body, id: req.params.id, data: req.body };
    const result = updateItem(item);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/items/:id', (req, res) => {
    const result = deleteItem(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Songs
app.get('/songs', (req, res) => {
    const result = songRepository.getSongs();
    if (result.success) {
        // Prepend the base URL for the music files
        const songsWithFullPaths = result.data.map(song => ({
            ...song,
            filePath: song.filePath ? `/music/${path.basename(song.filePath)}` : ''
        }));
        res.json(songsWithFullPaths);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/songs', (req, res) => {
    const result = addSong(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/songs/:id', (req, res) => {
    const song = { ...req.body, id: req.params.id };
    const result = updateSong(song);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/songs/:id', (req, res) => {
    const result = songRepository.deleteSong(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Campaigns
app.get('/campaigns', (req, res) => {
    const result = campaignRepository.getCampaigns();
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/campaigns', (req, res) => {
    const result = campaignRepository.addCampaign(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/campaigns/:id', (req, res) => {
    const campaign = { ...req.body, id: req.params.id };
    const result = campaignRepository.updateCampaign(campaign);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/campaigns/:id', (req, res) => {
    const result = campaignRepository.deleteCampaign(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Characters
app.get('/characters', (req, res) => {
    const campaignId = req.query.campaignId; // Get campaignId from query parameter
    const result = characterRepository.getCharacters(campaignId);
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.get('/characters/:id', (req, res) => { // ADDED THIS ROUTE
    const characterId = req.params.id;
    const result = characterRepository.getCharacterById(characterId);
    if (result.success) {
        if (result.data) {
            res.json(result.data);
        } else {
            res.status(404).json({ error: 'Character not found' });
        }
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.get('/campaigns/:campaignId/characters', (req, res) => {
    const { campaignId } = req.params;
    const result = characterRepository.getCharactersByCampaign(campaignId);
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/characters', (req, res) => {
    // Ensure is_player_character is explicitly passed, defaulting to false if not provided
    const characterData = { ...req.body, is_player_character: !!req.body.is_player_character };
    const result = characterRepository.addCharacter(characterData);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/characters/:id', (req, res) => {
    // Ensure is_player_character is explicitly passed, defaulting to false if not provided
    const characterData = { ...req.body, id: req.params.id, is_player_character: !!req.body.is_player_character };
    const result = characterRepository.updateCharacter(characterData);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/characters/:id', (req, res) => {
    const result = characterRepository.deleteCharacter(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Encounters
app.get('/encounters', (req, res) => {
    const result = encounterRepository.getEncounters();
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.get('/encounters/:id', (req, res) => {
    const encounterId = req.params.id;
    const result = encounterRepository.getEncounterById(encounterId);
    if (result.success) {
        if (result.data) {
            res.json(result.data);
        }
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.get('/campaigns/:campaignId/encounters', (req, res) => {
    const { campaignId } = req.params;
    const result = encounterRepository.getEncountersByCampaign(campaignId);
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/encounters', (req, res) => {
    try {
        const result = encounterRepository.addEncounter(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/encounters/:id', (req, res) => {
    try {
        const encounter = { ...req.body, id: req.params.id };
        const result = encounterRepository.updateEncounter(encounter);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/encounters/:id', (req, res) => {
    const result = encounterRepository.deleteEncounter(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Calendars
app.get('/calendars/:campaignId', (req, res) => {
    const result = getCalendar(req.params.campaignId);
    if (result.success) {
        // If no calendar is found, result.data will be null/undefined. Send null explicitly.
        res.json(result.data || null);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/calendars', (req, res) => {
    const result = addCalendar(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/calendars/:id', (req, res) => {
    const calendar = { ...req.body, id: req.params.id };
    const result = updateCalendar(calendar);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/calendars/:id', (req, res) => {
    const result = deleteCalendar(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Diary Entries
app.get('/diary/:campaignId/:year/:monthIndex/:day', (req, res) => {
    const { campaignId, year, monthIndex, day } = req.params;
    const result = getDiaryEntry(campaignId, year, parseInt(monthIndex, 10), parseInt(day, 10));
    if (result.success) {
        res.json(result.data || null);
    }
});

// New endpoint to get all diary entries for a campaign and year
app.get('/diary/campaign/:campaignId/year/:year', (req, res) => {
    const { campaignId } = req.params;
    const result = getAllDiaryEntriesForCampaignAndYear(campaignId, year);
    if (result.success) {
        res.json(result.data);
    }
});

app.post('/diary', (req, res) => {
    const result = addDiaryEntry(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/diary/:id', (req, res) => {
    const entry = { ...req.body, id: req.params.id };
    const result = updateDiaryEntry(entry);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/diary/:id', (req, res) => {
    const result = deleteDiaryEntry(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for World Maps
app.get('/campaigns/:campaignId/worldmaps', (req, res) => {
    const result = getWorldMaps(req.params.campaignId);
    if (result.success) {
        res.json(result.data);
    }
});

app.post('/worldmaps', (req, res) => {
    const result = addWorldMap(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/worldmaps/:id', (req, res) => {
    const worldMap = { ...req.body, id: req.params.id };
    const result = updateWorldMap(worldMap);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/worldmaps/:id', (req, res) => {
    const result = deleteWorldMap(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for World Map Markers
app.get('/worldmaps/:worldMapId/markers', (req, res) => {
    const result = getWorldMapMarkers(req.params.worldMapId);
    if (result.success) {
        res.json(result.data);
    }
});

app.post('/worldmaps/:worldMapId/markers', (req, res) => {
    const { world_map_id, x, y, name, description, notes, icon_type, icon_color, linked_maps, linked_characters, linked_enemies, linked_encounter } = req.body;
    const result = addWorldMapMarker({
        world_map_id,
        x,
        y,
        name,
        description,
        notes,
        icon_type,
        icon_color,
        linked_maps,
        linked_characters,
        linked_enemies,
        linked_encounter
    });
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/worldmaps/markers/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, notes, icon_type, icon_color, linked_maps, linked_characters, linked_enemies, linked_encounter } = req.body;
    const result = updateWorldMapMarker({
        id,
        name,
        description,
        notes,
        icon_type,
        icon_color,
        linked_maps,
        linked_characters,
        linked_enemies,
        linked_encounter
    });
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/worldmaps/markers/:id', (req, res) => {
    const result = deleteWorldMapMarker(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Missions
app.get('/campaigns/:campaignId/missions', (req, res) => {
    const { campaignId } = req.params;
    const result = getMissionsByCampaign(campaignId);
    if (result.success) {
        res.json(result.data);
    }
});

app.get('/missions/:id', (req, res) => {
    const missionId = req.params.id;
    const result = getMissionById(missionId);
    if (result.success) {
        if (result.data) {
            res.json(result.data);
        } else {
            res.status(404).json({ error: 'Mission not found' });
        }
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/missions', (req, res) => {
    const result = addMission(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.put('/missions/:id', (req, res) => {
    const mission = { ...req.body, id: req.params.id };
    const result = updateMission(mission);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/missions/:id', (req, res) => {
    const result = deleteMission(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Generator Entries
app.get('/generator-entries/:campaignId', (req, res) => {
    const { campaignId } = req.params;
    const { category, rarity } = req.query;
    const result = getGeneratorEntries(campaignId, category, rarity);
    if (result.success) {
        res.json(result.data);
    }
});

app.post('/generator-entries', (req, res) => {
    const result = addGeneratorEntry(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    }
});

app.post('/generator-entries/sync', (req, res) => {
    const { campaignId, entries } = req.body;
    if (!campaignId || !Array.isArray(entries)) {
        return res.status(400).json({ error: 'Invalid request body. campaignId and entries array are required.' });
    }
    const result = syncGeneratorEntries(campaignId, entries);
    if (result.success) {
        res.status(200).json({ message: 'Generator entries synced successfully' });
    }
});

app.put('/generator-entries/:id', (req, res) => {
    const entry = { ...req.body, id: req.params.id };
    const result = updateGeneratorEntry(entry);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

app.delete('/generator-entries/:id', (req, res) => {
    const result = deleteGeneratorEntry(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    }
});

// API Endpoints for Worldpedia
const worldpediaImagesPath = path.join(__dirname, '..', 'public', 'worldpedia_images');
if (!fs.existsSync(worldpediaImagesPath)) {
    fs.mkdirSync(worldpediaImagesPath, { recursive: true });
}
app.use('/worldpedia_images', express.static(worldpediaImagesPath));

app.post('/api/worldpedia/upload-image', (req, res) => {
    try {
        const { imageData } = req.body;
        if (!imageData || !imageData.startsWith('data:image')) {
            return res.status(400).json({ success: false, error: 'Invalid image data' });
        }

        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        const dataBuffer = Buffer.from(base64Data, 'base64');
        const fileExtension = imageData.substring(imageData.indexOf('/') + 1, imageData.indexOf(';'));
        const fileName = `wp_img_${Date.now()}.${fileExtension}`;
        const filePath = path.join(worldpediaImagesPath, fileName);

        fs.writeFileSync(filePath, dataBuffer);

        const imageUrl = `/worldpedia_images/${fileName}`;
        res.json({ success: true, url: imageUrl });

    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ success: false, error: 'Server error during image upload' });
    }
});

app.get('/api/worldpedia', (req, res) => {
    const { campaignId } = req.query;
    if (!campaignId) {
        return res.status(400).json({ error: 'campaignId is required' });
    }
    try {
        const result = getAllEntriesByCampaign(campaignId);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/worldpedia/search', (req, res) => {
    const { campaignId, q } = req.query;
    if (!campaignId || q === undefined) {
        return res.status(400).json({ error: 'campaignId and q (query) are required.' });
    }
    try {
        const result = searchEntries(campaignId, q);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/worldpedia/:id', (req, res) => {
    try {
        const result = getEntryById(req.params.id);
        if (result.success) {
            if (result.data) {
                res.json(result.data);
            } else {
                res.status(404).json({ error: 'Entry not found' });
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/worldpedia', (req, res) => {
    const { campaign_id, title, content, parent_id = null, is_folder = false } = req.body;
    if (!campaign_id || !title || content === undefined) {
        return res.status(400).json({ error: 'Missing required fields: campaign_id, title, content' });
    }
    try {
        const result = createEntry({ campaign_id, title, content, parent_id, is_folder });
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/worldpedia/:id', (req, res) => {
    try {
        const result = updateEntry(req.params.id, req.body);
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/worldpedia/:id', (req, res) => {
    try {
        const result = deleteEntry(req.params.id);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Backend server listening at http://0.0.0.0:${port}`);
});