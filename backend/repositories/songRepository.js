const db = require('../config/database');
const fs = require('fs');

function getSongs() {
    try {
        const stmt = db.prepare('SELECT * FROM songs');
        return { success: true, data: stmt.all() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function addSong(song) {
    console.log('Adding song to database:', song);
    try {
        const songToInsert = {
            id: song.id,
            name: song.name,
            group_name: song.group, // Map 'group' from frontend to 'group_name' for DB
            filePath: song.filePath
        };
        const stmt = db.prepare('INSERT INTO songs (id, name, group_name, filePath) VALUES (@id, @name, @group_name, @filePath)');
        const info = stmt.run(songToInsert);
        console.log('Song added successfully:', info);
        return { success: true, id: song.id }; // Return the ID that was passed in
    } catch (error) {
        console.error('Error adding song to database:', error);
        return { success: false, error: error.message };
    }
}

function updateSong(song) {
    try {
        const songToUpdate = {
            id: song.id,
            name: song.name,
            group_name: song.group, // Map 'group' from frontend to 'group_name' for DB
            filePath: song.filePath
        };
        const stmt = db.prepare('UPDATE songs SET name = @name, group_name = @group_name, filePath = @filePath WHERE id = @id');
        const info = stmt.run(songToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteSong(songId) {
    try {
        // Check if the song is associated with any map
        const referringMaps = db.prepare('SELECT id, name FROM maps WHERE song_id = ?').all(songId);
        if (referringMaps.length > 0) {
            const mapNames = referringMaps.map(m => m.name).join(', ');
            return { success: false, error: `La canción no se puede eliminar porque está asociada a los siguientes mapas: ${mapNames}` };
        }

        // Get file path before deleting the song record
        const song = db.prepare('SELECT filePath FROM songs WHERE id = ?').get(songId);
        if (!song) {
            return { success: false, error: 'No se encontró la canción para eliminar.' };
        }

        // Delete the song from the database
        const stmt = db.prepare('DELETE FROM songs WHERE id = ?');
        const info = stmt.run(songId);

        if (info.changes > 0) {
            // If the DB delete was successful, delete the physical file
            try {
                if (fs.existsSync(song.filePath)) {
                    fs.unlinkSync(song.filePath);
                    console.log(`Archivo de audio eliminado: ${song.filePath}`);
                }
            } catch (fileError) {
                console.error(`Error al eliminar el archivo de audio ${song.filePath}:`, fileError);
                // We don't return an error here, as the main DB operation was successful
            }
        }

        return { success: true, changes: info.changes };
    } catch (error) {
        console.error('Error al eliminar la canción:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    getSongs,
    addSong,
    updateSong,
    deleteSong,
};