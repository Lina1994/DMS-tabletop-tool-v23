import React, { useState, useEffect } from 'react';
import './MapSheetModal.css';
import API_BASE_URL from '../../apiConfig';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext'; // Import the audio player context

// Securely initialize ipcRenderer
let ipcRenderer = null;
if (window.require) {
  try {
    const electron = window.require('electron');
    if (electron && electron.ipcRenderer) {
      ipcRenderer = electron.ipcRenderer;
    }
  } catch (e) {
    console.warn("Could not load electron.ipcRenderer:", e);
  }
}

function MapSheetModal({ onClose, map, onUpdateMap }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMap, setEditedMap] = useState(map);
  const [songs, setSongs] = useState([]);
  const { playSong, currentSong } = useAudioPlayer(); // Get audio player functions

  useEffect(() => {
    setEditedMap(map);
  }, [map]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/songs`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchSongs();
  }, []);

  if (!map) {
    return null;
  }

  const handleSendToPlayerView = (e) => {
    e.stopPropagation(); // Prevent modal from closing
    if (!map) return;

    // Only proceed if in Electron environment
    if (ipcRenderer) {
      // 1. Send map to player window (no alert)
      ipcRenderer.send('display-map-player-window', map);

      // 2. Replicate the music logic from Maps.js
      const newSong = map.song_id && map.song_name && map.song_filePath
        ? { id: map.song_id, name: map.song_name, filePath: map.song_filePath }
        : null;
    
      if (newSong) {
        if (!currentSong || (currentSong.id !== newSong.id)) {
          playSong(newSong);
        }
      }
    } else {
      console.log('Not in Electron environment, cannot send to player view.');
      // Optionally, you could alert the user or handle this case differently.
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedMap(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSave = () => {
    onUpdateMap(editedMap);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMap(map);
    setIsEditing(false);
  };

  const renderField = (label, name, value) => {
    if (isEditing) {
      if (name === 'notes') {
        return (
          <div className="form-group">
            <label htmlFor={name}>{label}:</label>
            <textarea id={name} name={name} value={value || ''} onChange={handleChange} className="notes-textarea"></textarea>
          </div>
        );
      } else {
        return (
          <div className="form-group">
            <label htmlFor={name}>{label}:</label>
            <input type="text" id={name} name={name} value={value || ''} onChange={handleChange} />
          </div>
        );
      }
    }
    return <p><strong>{label}:</strong> {value}</p>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-wrapper-ext">
        {ipcRenderer && ( // Only show the button in Electron
          <button onClick={handleSendToPlayerView} className="external-send-btn">
            Enviar a<br/>Jugadores
          </button>
        )}
        <div className="modal-content map-sheet-modal-content" onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <input type="text" name="name" value={editedMap.name || ''} onChange={handleChange} className="map-name-edit" />
          ) : (
            <h2>{map.name}</h2>
          )}
          <div className="map-details-grid">
            {map.image_data && (
              <div className="map-image-container">
                <img src={map.image_data} alt={map.name} className="map-image-sheet" />
              </div>
            )}
            {map.panoramic_view_data && (
              <div className="map-image-container panoramic-view-container">
                <h3>Vista Panorámica</h3>
                <img src={map.panoramic_view_data} alt={`Panoramic View of ${map.name}`} className="panoramic-image-sheet" />
              </div>
            )}
            <div className="detail-group full-width">
              {renderField('Nombre', 'name', editedMap.name)}
              {renderField('Grupo', 'group_name', editedMap.group_name)}
              {renderField('Notas', 'notes', editedMap.notes)}
              {isEditing && renderField('URL de la Imagen', 'image_data', editedMap.image_data)}
              {isEditing && (
                <div className="form-group">
                  <label htmlFor="song_id">Canción Asociada:</label>
                  <select id="song_id" name="song_id" value={editedMap.song_id || ''} onChange={handleChange}>
                    <option value="">-- Seleccionar Canción --</option>
                    {songs.map(song => (
                      <option key={song.id} value={song.id}>{song.name} ({song.group_name})</option>
                    ))}
                  </select>
                </div>
              )}
              {!isEditing && map.song_name && (
                <p><strong>Canción Asociada:</strong> {map.song_name}</p>
              )}
              {isEditing && (
                <div className="form-group">
                  <label htmlFor="easy_battle_song_id">Canción Batalla Fácil:</label>
                  <select id="easy_battle_song_id" name="easy_battle_song_id" value={editedMap.easy_battle_song_id || ''} onChange={handleChange}>
                    <option value="">-- Seleccionar Canción --</option>
                    {songs.map(song => (
                      <option key={song.id} value={song.id}>{song.name} ({song.group_name})</option>
                    ))}
                  </select>
                </div>
              )}
              {!isEditing && map.easy_battle_song_name && (
                <p><strong>Canción Batalla Fácil:</strong> {map.easy_battle_song_name}</p>
              )}
              {isEditing && (
                <div className="form-group">
                  <label htmlFor="medium_battle_song_id">Canción Batalla Media:</label>
                  <select id="medium_battle_song_id" name="medium_battle_song_id" value={editedMap.medium_battle_song_id || ''} onChange={handleChange}>
                    <option value="">-- Seleccionar Canción --</option>
                    {songs.map(song => (
                      <option key={song.id} value={song.id}>{song.name} ({song.group_name})</option>
                    ))}
                  </select>
                </div>
              )}
              {!isEditing && map.medium_battle_song_name && (
                <p><strong>Canción Batalla Media:</strong> {map.medium_battle_song_name}</p>
              )}
              {isEditing && (
                <div className="form-group">
                  <label htmlFor="hard_battle_song_id">Canción Batalla Difícil:</label>
                  <select id="hard_battle_song_id" name="hard_battle_song_id" value={editedMap.hard_battle_song_id || ''} onChange={handleChange}>
                    <option value="">-- Seleccionar Canción --</option>
                    {songs.map(song => (
                      <option key={song.id} value={song.id}>{song.name} ({song.group_name})</option>
                    ))}
                  </select>
                </div>
              )}
              {!isEditing && map.hard_battle_song_name && (
                <p><strong>Canción Batalla Difícil:</strong> {map.hard_battle_song_name}</p>
              )}
              {isEditing && (
                <div className="form-group">
                  <label htmlFor="deadly_battle_song_id">Canción Batalla Mortal:</label>
                  <select id="deadly_battle_song_id" name="deadly_battle_song_id" value={editedMap.deadly_battle_song_id || ''} onChange={handleChange}>
                    <option value="">-- Seleccionar Canción --</option>
                    {songs.map(song => (
                      <option key={song.id} value={song.id}>{song.name} ({song.group_name})</option>
                    ))}
                  </select>
                </div>
              )}
              {!isEditing && map.deadly_battle_song_name && (
                <p><strong>Canción Batalla Mortal:</strong> {map.deadly_battle_song_name}</p>
              )}
              {isEditing && (
                <div className="form-group">
                  <label htmlFor="extreme_battle_song_id">Canción Batalla Extrema:</label>
                  <select id="extreme_battle_song_id" name="extreme_battle_song_id" value={editedMap.extreme_battle_song_id || ''} onChange={handleChange}>
                    <option value="">-- Seleccionar Canción --</option>
                    {songs.map(song => (
                      <option key={song.id} value={song.id}>{song.name} ({song.group_name})</option>
                    ))}
                  </select>
                </div>
              )}
              {!isEditing && map.extreme_battle_song_name && (
                <p><strong>Canción Batalla Extrema:</strong> {map.extreme_battle_song_name}</p>
              )}
            </div>
          </div>
          <div className="modal-actions">
            {isEditing ? (
              <>
                <button type="button" onClick={handleSave}>Guardar</button>
                <button type="button" onClick={handleCancel}>Cancelar</button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)}>Editar</button>
            )}
            <button type="button" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapSheetModal;
