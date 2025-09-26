const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Paths used for JSON migrations
const dataDir = path.resolve(__dirname, '..', '..', 'data');
const monstersFilePath = path.join(dataDir, 'monsters.json');
const mapsFilePath = path.join(dataDir, 'maps.json');
const shopsFilePath = path.join(dataDir, 'shops.json');

// SQL to create the tables
const createTablesStmt = `

CREATE TABLE IF NOT EXISTS worldpedia_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    parent_id INTEGER,
    is_folder BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES worldpedia_entries (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS worldpedia_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (entry_id) REFERENCES worldpedia_entries (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS worldpedia_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    target_type TEXT NOT NULL CHECK(target_type IN ('character', 'monster', 'mission', 'map', 'spell', 'shop')),
    target_id INTEGER NOT NULL,
    link_text TEXT,
    FOREIGN KEY (entry_id) REFERENCES worldpedia_entries (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS monsters (
    id TEXT PRIMARY KEY,
    name TEXT, vd TEXT, type TEXT, alignment TEXT, origin TEXT, size TEXT, px TEXT, armor TEXT, hp TEXT, speed TEXT, str TEXT, dex TEXT, con TEXT, int TEXT, wis TEXT, car TEXT, savingThrows TEXT, skills TEXT, senses TEXT, languages TEXT, damageResistances TEXT, damageImmunities TEXT, conditionImmunities TEXT, damageVulnerabilities TEXT, traits TEXT, actions TEXT, legendaryActions TEXT, reactions TEXT, description TEXT, image TEXT,
    token_type TEXT DEFAULT 'color',
    token_value TEXT DEFAULT '#ffcccb'
);

CREATE TABLE IF NOT EXISTS spells (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    school TEXT,
    level INTEGER,
    range TEXT,
    duration TEXT,
    cost TEXT,
    is_ritual BOOLEAN,
    requires_concentration BOOLEAN,
    has_material_components BOOLEAN,
    components TEXT,
    classes TEXT,
    description TEXT,
    damage_attack TEXT,
    aoe TEXT,
    saving_throw TEXT,
    higher_level_casting TEXT
);

CREATE TABLE IF NOT EXISTS maps (
    id TEXT PRIMARY KEY,
    name TEXT,
    group_name TEXT,
    url TEXT,
    imagePath TEXT,
    image_data BLOB,
    panoramic_view_data BLOB,
    keepOpen INTEGER,
    zoom REAL,
    rotation REAL,
    panX REAL,
    panY REAL,
    original_width INTEGER,
    original_height INTEGER,
    notes TEXT,
    song_id TEXT,
    campaign_id TEXT,
    easy_battle_song_id TEXT,
    medium_battle_song_id TEXT,
    hard_battle_song_id TEXT,
    deadly_battle_song_id TEXT,
    extreme_battle_song_id TEXT,
    FOREIGN KEY (song_id) REFERENCES songs (id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id),
    FOREIGN KEY (easy_battle_song_id) REFERENCES songs (id),
    FOREIGN KEY (medium_battle_song_id) REFERENCES songs (id),
    FOREIGN KEY (hard_battle_song_id) REFERENCES songs (id),
    FOREIGN KEY (deadly_battle_song_id) REFERENCES songs (id),
    FOREIGN KEY (extreme_battle_song_id) REFERENCES songs (id)
);

CREATE TABLE IF NOT EXISTS shops ( id TEXT PRIMARY KEY, name TEXT );

CREATE TABLE IF NOT EXISTS categories ( 
    id TEXT PRIMARY KEY, 
    shop_id TEXT, 
    name TEXT, 
    columns_definition TEXT, 
    FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    data TEXT, /* Stores item properties as JSON */
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    name TEXT,
    group_name TEXT,
    filePath TEXT
);

CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_data BLOB,
    description TEXT,
    author TEXT,
    game TEXT,
    participants TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class TEXT,
    level INTEGER,
    background TEXT,
    race TEXT,
    alignment TEXT,
    playerName TEXT,
    experiencePoints INTEGER,
    strength INTEGER,
    dexterity INTEGER,
    constitution INTEGER,
    intelligence INTEGER,
    wisdom INTEGER,
    charisma INTEGER,
    proficiencyBonus INTEGER,
    armorClass INTEGER,
    initiative INTEGER,
    speed INTEGER,
    maxHitPoints INTEGER,
    currentHitPoints INTEGER,
    temporaryHitPoints INTEGER,
    hitDice TEXT,
    otherProficienciesAndLanguages TEXT,
    equipment TEXT,
    featuresAndTraits TEXT,
    age TEXT,
    height TEXT,
    weight TEXT,
    eyes TEXT,
    skin TEXT,
    hair TEXT,
    image BLOB,
    spellcastingAbility TEXT,
    spellSaveDC INTEGER,
    spellAttackBonus INTEGER,
    campaign_id TEXT,
    is_player_character BOOLEAN,
    token_type TEXT DEFAULT 'color',
    token_value TEXT DEFAULT '#add8e6',
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
);

CREATE TABLE IF NOT EXISTS encounters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    campaign_id TEXT,
    song_id TEXT,
    easy_battle_song_id TEXT,
    medium_battle_song_id TEXT,
    hard_battle_song_id TEXT,
    deadly_battle_song_id TEXT,
    extreme_battle_song_id TEXT,
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE SET NULL,
    FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE SET NULL,
    FOREIGN KEY (easy_battle_song_id) REFERENCES songs (id),
    FOREIGN KEY (medium_battle_song_id) REFERENCES songs (id),
    FOREIGN KEY (hard_battle_song_id) REFERENCES songs (id),
    FOREIGN KEY (deadly_battle_song_id) REFERENCES songs (id),
    FOREIGN KEY (extreme_battle_song_id) REFERENCES songs (id)
);

CREATE TABLE IF NOT EXISTS encounter_monsters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    encounter_id TEXT NOT NULL,
    monster_id TEXT NOT NULL,
    FOREIGN KEY (encounter_id) REFERENCES encounters (id) ON DELETE CASCADE,
    FOREIGN KEY (monster_id) REFERENCES monsters (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS encounter_characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    encounter_id TEXT NOT NULL,
    character_id TEXT NOT NULL,
    FOREIGN KEY (encounter_id) REFERENCES encounters (id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS calendars (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL UNIQUE,
    num_months INTEGER NOT NULL,
    month_names TEXT NOT NULL,
    days_in_month TEXT NOT NULL,
    days_in_week INTEGER NOT NULL,
    weekday_names TEXT NOT NULL,
    current_year TEXT, /* New column for the year */
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diary_entries (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    year TEXT NOT NULL,
    month_index INTEGER NOT NULL,
    day INTEGER NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, year, month_index, day),
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS world_maps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_data BLOB,
    campaign_id TEXT NOT NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS world_map_markers (
    id TEXT PRIMARY KEY,
    world_map_id TEXT NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    linked_maps TEXT,
    linked_characters TEXT,
    linked_enemies TEXT,
    linked_encounter TEXT,
    icon_type TEXT,
    icon_color TEXT,
    FOREIGN KEY (world_map_id) REFERENCES world_maps (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT,
    description TEXT,
    client TEXT,
    location TEXT,
    reward TEXT,
    encounters TEXT,
    enemies TEXT,
    complication TEXT,
    notes TEXT,
    status TEXT,
    campaign_id TEXT,
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS generator_entries (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    rarity TEXT NOT NULL,
    value TEXT NOT NULL,
    campaign_id TEXT NOT NULL,
    UNIQUE(category, rarity, value, campaign_id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
);

`;

// Function to check if a column exists
function columnExists(tableName, columnName) {
    const result = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return result.some(column => column.name === columnName);
}

// Function to initialize the database
function setupDatabase() {
    db.exec('DROP TABLE IF EXISTS items_weapons;'); // Keep for old schema cleanup
    db.exec('DROP TABLE IF EXISTS items_armors;'); // Keep for old schema cleanup

    db.exec(createTablesStmt);

    // Migration checks...
    if (!columnExists('maps', 'song_id')) {
        console.log('Adding song_id column to maps table...');
        db.exec('ALTER TABLE maps ADD COLUMN song_id TEXT;');
    }
    // ... (all other columnExists checks) ...
    if (!columnExists('world_map_markers', 'icon_color')) {
        console.log('Adding icon_color column to world_map_markers table...');
        db.exec('ALTER TABLE world_map_markers ADD COLUMN icon_color TEXT;');
    }

    console.log('Base de datos SQLite inicializada y lista.');
    
    // Run data migration from JSONs if needed
    migrateDataFromJsons();
}

// Function to migrate data from JSON
function migrateDataFromJsons() {
    console.log('Comprobando si es necesaria la migración de datos...');
    // Migrate Monsters
    const monsterCount = db.prepare('SELECT COUNT(*) as count FROM monsters').get().count;
    if (monsterCount === 0 && fs.existsSync(monstersFilePath)) {
        const monsters = JSON.parse(fs.readFileSync(monstersFilePath, 'utf8'));
        const insert = db.prepare('INSERT INTO monsters (id, name, vd, type, alignment, origin, size, px, armor, hp, speed, str, dex, con, int, wis, car, savingThrows, skills, senses, languages, damageResistances, damageImmunities, conditionImmunities, damageVulnerabilities, traits, actions, legendaryActions, reactions, description, image) VALUES (@id, @name, @vd, @type, @alignment, @origin, @size, @px, @armor, @hp, @speed, @str, @dex, @con, @int, @wis, @car, @savingThrows, @skills, @senses, @languages, @damageResistances, @damageImmunities, @conditionImmunities, @damageVulnerabilities, @traits, @actions, @legendaryActions, @reactions, @description, @image)');
        db.transaction((data) => {
            for (const monster of data) insert.run(monster);
        })(monsters);
        console.log(`${monsters.length} monstruos migrados.`);
    }

    // ... (rest of the migration logic for maps and shops) ...

    console.log('Migración de datos completada.');
}

module.exports = { setupDatabase };
