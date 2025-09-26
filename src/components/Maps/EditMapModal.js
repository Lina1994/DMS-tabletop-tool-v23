import React, { useState, useEffect } from 'react';
import './EditMapModal.css';
import API_BASE_URL from '../../apiConfig';

function EditMapModal({ onClose, onEditMap, map }) {
  const [mapName, setMapName] = useState('');
  const [mapGroup, setMapGroup] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [mapFile, setMapFile] = useState(null);
  const [mapPreview, setMapPreview] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [panoramicViewFile, setPanoramicViewFile] = useState(null);
  const [panoramicViewUrl, setPanoramicViewUrl] = useState('');
  const [panoramicViewPreview, setPanoramicViewPreview] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState('');
  const [easyBattleSong, setEasyBattleSong] = useState('');
  const [mediumBattleSong, setMediumBattleSong] = useState('');
  const [hardBattleSong, setHardBattleSong] = useState('');
  const [deadlyBattleSong, setDeadlyBattleSong] = useState('');
  const [extremeBattleSong, setExtremeBattleSong] = useState('');

  useEffect(() => {
    if (map) {
      setMapName(map.name);
      setMapGroup(map.group || '');
      setMapUrl(map.url || '');
      setMapPreview(map.image_data || map.url || null); // Populate from image_data (Base64) or url
      setDimensions({ width: map.original_width, height: map.original_height });
      setPanoramicViewUrl(map.panoramic_view_url || ''); // Assuming a panoramic_view_url if not blob
      setPanoramicViewPreview(map.panoramic_view_data || map.panoramic_view_url || null); // Populate from panoramic_view_data (Base64) or url

      setSelectedCampaign(map.campaign_id || '');
      setSelectedSong(map.song_id || '');
      setEasyBattleSong(map.easy_battle_song_id || '');
      setMediumBattleSong(map.medium_battle_song_id || '');
      setHardBattleSong(map.hard_battle_song_id || '');
      setDeadlyBattleSong(map.deadly_battle_song_id || '');
      setExtremeBattleSong(map.extreme_battle_song_id || '');
    }
  }, [map]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/campaigns`)
      .then(response => response.json())
      .then(data => setCampaigns(data))
      .catch(error => console.error('Error fetching campaigns:', error));

    fetch(`${API_BASE_URL}/songs`)
      .then(response => response.json())
      .then(data => setSongs(data))
      .catch(error => console.error('Error fetching songs:', error));
  }, []);

  const handleNameChange = (e) => {
    setMapName(e.target.value);
  };

  const handleGroupChange = (e) => {
    setMapGroup(e.target.value);
  };

  const handleCampaignChange = (e) => {
    setSelectedCampaign(e.target.value);
  };

  const handleSongChange = (e) => {
    setSelectedSong(e.target.value);
  };

  const handleEasyBattleSongChange = (e) => {
    setEasyBattleSong(e.target.value);
  };

  const handleMediumBattleSongChange = (e) => {
    setMediumBattleSong(e.target.value);
  };

  const handleHardBattleSongChange = (e) => {
    setHardBattleSong(e.target.value);
  };

  const handleDeadlyBattleSongChange = (e) => {
    setDeadlyBattleSong(e.target.value);
  };

  const handleExtremeBattleSongChange = (e) => {
    setExtremeBattleSong(e.target.value);
  };

  const handleMapFileChange = (e) => {
    const file = e.target.files[0];
    setMapFile(file);
    setMapUrl(''); // Clear URL if file is selected

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
          setMapPreview(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      setMapPreview(null);
      setDimensions(null);
    }
  };

  const handleMapUrlChange = (e) => {
    setMapUrl(e.target.value);
    setMapFile(null); // Clear file if URL is typed
    setMapPreview(e.target.value); // Set preview directly from URL
  };

  const handlePanoramicFileChange = (e) => {
    const file = e.target.files[0];
    setPanoramicViewFile(file);
    setPanoramicViewUrl(''); // Clear URL if file is selected

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPanoramicViewPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPanoramicViewPreview(null);
    }
  };

  const handlePanoramicUrlChange = (e) => {
    setPanoramicViewUrl(e.target.value);
    setPanoramicViewFile(null); // Clear file if URL is typed
    setPanoramicViewPreview(e.target.value); // Set preview directly from URL
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEditMap({
      ...map,
      name: mapName,
      group: mapGroup,
      imageData: mapPreview || map.image_data, // Use new preview or existing data
      url: mapUrl || map.url, // Use new URL or existing URL
      original_width: dimensions ? dimensions.width : map.original_width,
      original_height: dimensions ? dimensions.height : map.original_height,
      panoramic_view_data: panoramicViewPreview || map.panoramic_view_data, // Use new panoramic preview or existing data
      panoramic_view_url: panoramicViewUrl || map.panoramic_view_url, // Use new panoramic URL or existing URL
      campaign_id: selectedCampaign,
      song_id: selectedSong,
      easy_battle_song_id: easyBattleSong,
      medium_battle_song_id: mediumBattleSong,
      hard_battle_song_id: hardBattleSong,
      deadly_battle_song_id: deadlyBattleSong,
      extreme_battle_song_id: extremeBattleSong
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Mapa</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="mapName">Nombre del Mapa:</label>
            <input
              type="text"
              id="mapName"
              value={mapName}
              onChange={handleNameChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapGroup">Grupo:</label>
            <input
              type="text"
              id="mapGroup"
              value={mapGroup}
              onChange={handleGroupChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapUrl">URL del Mapa:</label>
            <input
              type="url"
              id="mapUrl"
              value={mapUrl}
              onChange={handleMapUrlChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapFile">Archivo de Mapa:</label>
            <input
              type="file"
              id="mapFile"
              onChange={handleMapFileChange}
              accept="image/*"
            />
          </div>

          {mapPreview && (
            <div className="form-group">
              <label>Previsualización del Mapa:</label>
              <img src={mapPreview} alt="Map Preview" className="image-preview" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="panoramicViewUrl">URL Vista Panorámica:</label>
            <input
              type="url"
              id="panoramicViewUrl"
              value={panoramicViewUrl}
              onChange={handlePanoramicUrlChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="panoramicViewFile">Archivo Vista Panorámica:</label>
            <input
              type="file"
              id="panoramicViewFile"
              onChange={handlePanoramicFileChange}
              accept="image/*"
            />
          </div>

          {panoramicViewPreview && (
            <div className="form-group">
              <label>Previsualización Panorámica:</label>
              <img src={panoramicViewPreview} alt="Panoramic Preview" className="image-preview" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="campaign">Campaña:</label>
            <select
              id="campaign"
              value={selectedCampaign}
              onChange={handleCampaignChange}
            >
              <option value="">Sin campaña</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="song">Canción:</label>
            <select
              id="song"
              value={selectedSong}
              onChange={handleSongChange}
            >
              <option value="">Sin canción</option>
              {songs.map(song => (
                <option key={song.id} value={song.id}>
                  {song.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="easyBattleSong">Canción Batalla Fácil:</label>
            <select
              id="easyBattleSong"
              value={easyBattleSong}
              onChange={handleEasyBattleSongChange}
            >
              <option value="">Sin canción</option>
              {songs.map(song => (
                <option key={song.id} value={song.id}>
                  {song.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mediumBattleSong">Canción Batalla Media:</label>
            <select
              id="mediumBattleSong"
              value={mediumBattleSong}
              onChange={handleMediumBattleSongChange}
            >
              <option value="">Sin canción</option>
              {songs.map(song => (
                <option key={song.id} value={song.id}>
                  {song.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="hardBattleSong">Canción Batalla Difícil:</label>
            <select
              id="hardBattleSong"
              value={hardBattleSong}
              onChange={handleHardBattleSongChange}
            >
              <option value="">Sin canción</option>
              {songs.map(song => (
                <option key={song.id} value={song.id}>
                  {song.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="deadlyBattleSong">Canción Batalla Mortal:</label>
            <select
              id="deadlyBattleSong"
              value={deadlyBattleSong}
              onChange={handleDeadlyBattleSongChange}
            >
              <option value="">Sin canción</option>
              {songs.map(song => (
                <option key={song.id} value={song.id}>
                  {song.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="extremeBattleSong">Canción Batalla Extrema:</label>
            <select
              id="extremeBattleSong"
              value={extremeBattleSong}
              onChange={handleExtremeBattleSongChange}
            >
              <option value="">Sin canción</option>
              {songs.map(song => (
                <option key={song.id} value={song.id}>
                  {song.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="submit">Guardar Cambios</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMapModal;