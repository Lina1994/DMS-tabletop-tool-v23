const db = require('../config/database');

function getCharacters(campaignId = null) {
    try {
        let stmt;
        if (campaignId) {
            stmt = db.prepare('SELECT c.*, ca.name AS campaign_name FROM characters c LEFT JOIN campaigns ca ON c.campaign_id = ca.id WHERE c.campaign_id = ?');
            return { success: true, data: stmt.all(campaignId).map(char => {
                if (char.image) {
                    char.image = `data:image/png;base64,${char.image.toString('base64')}`;
                }
                return char;
            }) };
        } else {
            stmt = db.prepare('SELECT c.*, ca.name AS campaign_name FROM characters c LEFT JOIN campaigns ca ON c.campaign_id = ca.id');
            return { success: true, data: stmt.all().map(char => {
                if (char.image) {
                    char.image = `data:image/png;base64,${char.image.toString('base64')}`;
                }
                return char;
            }) };
        }
    } catch (error) {
        console.error('Backend: Error in getCharacters:', error.message);
        return { success: false, error: error.message };
    }
}

function getCharactersByCampaign(campaignId) {
    console.log(`[DB] getCharactersByCampaign: Received campaignId: ${campaignId}`); // New log
    try {
        const stmt = db.prepare('SELECT c.*, ca.name AS campaign_name FROM characters c LEFT JOIN campaigns ca ON c.campaign_id = ca.id WHERE c.campaign_id = ?');
        const data = stmt.all(campaignId).map(char => {
            if (char.image) {
                char.image = `data:image/png;base64,${char.image.toString('base64')}`;
            }
            return char;
        });
        console.log(`[DB] getCharactersByCampaign: Found ${data.length} characters for campaignId: ${campaignId}`); // New log
        return { success: true, data };
    } catch (error) {
        console.error(`[DB] getCharactersByCampaign: Error for campaign ${campaignId}:`, error.message); // Modified log
        return { success: false, error: error.message };
    }
}

function addCharacter(character) {
    console.log('Backend: addCharacter called with:', character.name);
    try {
        let imageDataBuffer = null;
        if (character.image) {
            const base64Data = character.image.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }

        const stmt = db.prepare('INSERT INTO characters (id, name, class, level, background, race, alignment, playerName, experiencePoints, strength, dexterity, constitution, intelligence, wisdom, charisma, proficiencyBonus, armorClass, initiative, speed, maxHitPoints, currentHitPoints, temporaryHitPoints, hitDice, otherProficienciesAndLanguages, equipment, featuresAndTraits, age, height, weight, eyes, skin, hair, image, spellcastingAbility, spellSaveDC, spellAttackBonus, campaign_id, is_player_character, token_type, token_value) VALUES (@id, @name, @class, @level, @background, @race, @alignment, @playerName, @experiencePoints, @strength, @dexterity, @constitution, @intelligence, @wisdom, @charisma, @proficiencyBonus, @armorClass, @initiative, @speed, @maxHitPoints, @currentHitPoints, @temporaryHitPoints, @hitDice, @otherProficienciesAndLanguages, @equipment, @featuresAndTraits, @age, @height, @weight, @eyes, @skin, @hair, @image, @spellcastingAbility, @spellSaveDC, @spellAttackBonus, @campaign_id, @is_player_character, @token_type, @token_value)');
        const characterToInsert = {
            ...character,
            image: imageDataBuffer,
            level: character.level || null,
            experiencePoints: character.experiencePoints || null,
            strength: character.strength || null,
            dexterity: character.dexterity || null,
            constitution: character.constitution || null,
            intelligence: character.intelligence || null,
            wisdom: character.wisdom || null,
            charisma: character.charisma || null,
            proficiencyBonus: character.proficiencyBonus || null,
            armorClass: character.armorClass || null,
            initiative: character.initiative || null,
            speed: character.speed || null,
            maxHitPoints: character.maxHitPoints || null,
            currentHitPoints: character.currentHitPoints || null,
            temporaryHitPoints: character.temporaryHitPoints || null,
            spellSaveDC: character.spellSaveDC || null,
            spellAttackBonus: character.spellAttackBonus || null,
            age: character.age || null,
            height: character.height || null,
            weight: character.weight || null,
            eyes: character.eyes || null,
            skin: character.skin || null,
            hair: character.hair || null,
            is_player_character: character.is_player_character ? 1 : 0,
            token_type: character.token_type || 'color',
            token_value: character.token_value || '#add8e6'
        };
        const info = stmt.run(characterToInsert);
        console.log('Backend: addCharacter successful, info:', info);
        return { success: true, id: character.id };
    } catch (error) {
        console.error('Backend: Error in addCharacter:', error.message);
        return { success: false, error: error.message };
    }
}

function updateCharacter(character) {
    console.log('Backend: updateCharacter called with:', character.name);
    console.log('Backend: Raw character object received:', character); // NEW LOG
    try {
        let imageDataBuffer = null;
        if (typeof character.image === 'string' && character.image.startsWith('data:image')) {
            try {
                const base64Data = character.image.replace(/^data:image\/\w+;base64,/, "");
                imageDataBuffer = Buffer.from(base64Data, 'base64');
            } catch (imageError) {
                console.error('Backend: Error processing image data for character', character.id, ':', imageError.message);
                imageDataBuffer = null;
            }
        } else if (character.image instanceof Buffer) {
            imageDataBuffer = character.image;
        } else if (character.image === null) {
            imageDataBuffer = null;
        } else if (character.image && typeof character.image === 'object' && character.image.type === 'Buffer' && Array.isArray(character.image.data)) {
            // This is the case where the image is already a Buffer object from the database
            imageDataBuffer = Buffer.from(character.image.data);
        }
        const stmt = db.prepare('UPDATE characters SET name = @name, class = @class, level = @level, background = @background, race = @race, alignment = @alignment, playerName = @playerName, experiencePoints = @experiencePoints, strength = @strength, dexterity = @dexterity, constitution = @constitution, intelligence = @intelligence, wisdom = @wisdom, charisma = @charisma, proficiencyBonus = @proficiencyBonus, armorClass = @armorClass, initiative = @initiative, speed = @speed, maxHitPoints = @maxHitPoints, currentHitPoints = @currentHitPoints, temporaryHitPoints = @temporaryHitPoints, hitDice = @hitDice, otherProficienciesAndLanguages = @otherProficienciesAndLanguages, equipment = @equipment, featuresAndTraits = @featuresAndTraits, age = @age, height = @height, weight = @weight, eyes = @eyes, skin = @skin, hair = @hair, image = @image, spellcastingAbility = @spellcastingAbility, spellSaveDC = @spellSaveDC, spellAttackBonus = @spellAttackBonus, campaign_id = @campaign_id, is_player_character = @is_player_character, token_type = @token_type, token_value = @token_value WHERE id = @id');
        const characterToUpdate = {
            ...character,
            image: imageDataBuffer,
            level: character.level || null,
            experiencePoints: character.experiencePoints || null,
            strength: character.strength || null,
            dexterity: character.dexterity || null,
            constitution: character.constitution || null,
            intelligence: character.intelligence || null,
            wisdom: character.wisdom || null,
            charisma: character.charisma || null,
            proficiencyBonus: character.proficiencyBonus || null,
            armorClass: character.armorClass || null,
            initiative: character.initiative || null,
            speed: character.speed || null,
            maxHitPoints: character.maxHitPoints || null,
            currentHitPoints: character.currentHitPoints || null,
            temporaryHitPoints: character.temporaryHitPoints || null,
            spellSaveDC: character.spellSaveDC || null,
            spellAttackBonus: character.spellAttackBonus || null,
            is_player_character: character.is_player_character ? 1 : 0,
            token_type: character.token_type,
            token_value: character.token_value
        };
        console.log('Backend: updateCharacter received (after processing):', characterToUpdate); // Renamed this log for clarity
        const info = stmt.run(characterToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        console.error('Backend: Error in updateCharacter (outer catch):', error.message);
        return { success: false, error: error.message };
    }
}

function deleteCharacter(characterId) {
    console.log('Backend: deleteCharacter called with ID:', characterId);
    try {
        const stmt = db.prepare('DELETE FROM characters WHERE id = ?');
        const info = stmt.run(characterId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getCharacterById(id) {
    try {
        const stmt = db.prepare('SELECT c.*, ca.name AS campaign_name FROM characters c LEFT JOIN campaigns ca ON c.campaign_id = ca.id WHERE c.id = ?');
        const character = stmt.get(id);
        if (character && character.image) {
            character.image = `data:image/png;base64,${character.image.toString('base64')}`;
        }
        return { success: true, data: character };
    } catch (error) {
        console.error('Backend: Error in getCharacterById:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    getCharacters,
    getCharactersByCampaign,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacterById,
};