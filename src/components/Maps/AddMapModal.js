import React, { useState, useEffect } from 'react';
import { useCampaign } from '../../contexts/CampaignContext';
import './AddMapModal.css';
import API_BASE_URL from '../../apiConfig';

function AddMapModal({ onClose, onAddMap, onAddMaps }) {
  const { currentCampaign } = useCampaign();
  const [mapName, setMapName] = useState('');
  const [mapGroup, setMapGroup] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [mapFile, setMapFile] = useState(null);
  const [mapFiles, setMapFiles] = useState([]);
  const [dimensions, setDimensions] = useState(null);
  const [panoramicViewFile, setPanoramicViewFile] = useState(null);
  const [panoramicViewUrl, setPanoramicViewUrl] = useState('');
  const [panoramicViewPreview, setPanoramicViewPreview] = useState(null);
  const [keepOpen, setKeepOpen] = useState(false);
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
    fetch(`${API_BASE_URL}/campaigns`)
      .then(response => response.json())
      .then(data => setCampaigns(data))
      .catch(error => console.error('Error fetching campaigns:', error));

    fetch(`${API_BASE_URL}/songs`)
      .then(response => response.json())
      .then(data => setSongs(data))
      .catch(error => console.error('Error fetching songs:', error));

    if (currentCampaign) {
      setSelectedCampaign(currentCampaign.id);
    }
  }, [currentCampaign]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 1) {
      setMapFiles(Array.from(e.target.files));
      setMapFile(null);
    } else {
      const file = e.target.files[0];
      setMapFile(file);
      setMapFiles([]);

      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            setDimensions({ width: img.width, height: img.height });
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mapFiles.length > 0) {
      const mapsData = [];
      for (const file of mapFiles) {
        const reader = new FileReader();
        const promise = new Promise((resolve, reject) => {
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              resolve({
                name: file.name.replace(/\.[^/.]+$/, ""),
                group: mapGroup,
                imageData: event.target.result,
                originalWidth: img.width,
                originalHeight: img.height,
                campaign_id: selectedCampaign,
                song_id: selectedSong,
                easy_battle_song_id: easyBattleSong,
                medium_battle_song_id: mediumBattleSong,
                hard_battle_song_id: hardBattleSong,
                deadly_battle_song_id: deadlyBattleSong,
                extreme_battle_song_id: extremeBattleSong
              });
            };
            img.onerror = reject;
            img.src = event.target.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
                mapsData.push(await promise);
      }
      onAddMaps(mapsData.map(map => ({ ...map, panoramic_view_data: panoramicViewPreview || panoramicViewUrl })));
      if (!keepOpen) {
        onClose();
      } else {
        setMapFiles([]);
        setMapGroup('');
        setPanoramicViewFile(null);
        setPanoramicViewUrl('');
        setPanoramicViewPreview(null);
      }
    } else if (mapFile) {
      let imageData = null;
      const reader = new FileReader();
      reader.readAsDataURL(mapFile);
      reader.onload = () => {
        imageData = reader.result;
        onAddMap({
          name: mapName,
          group: mapGroup,
          url: mapUrl,
          imageData,
          panoramic_view_data: panoramicViewPreview || panoramicViewUrl,
          originalWidth: dimensions.width,
          originalHeight: dimensions.height,
          keepOpen: keepOpen,
          campaign_id: selectedCampaign,
          song_id: selectedSong,
          easy_battle_song_id: easyBattleSong,
          medium_battle_song_id: mediumBattleSong,
          hard_battle_song_id: hardBattleSong,
          deadly_battle_song_id: deadlyBattleSong,
          extreme_battle_song_id: extremeBattleSong
        });
        if (!keepOpen) {
          onClose();
        } else {
          setMapName('');
          setMapGroup('');
          setMapUrl('');
          setMapFile(null);
          setDimensions(null);
          setPanoramicViewFile(null);
          setPanoramicViewUrl('');
          setPanoramicViewPreview(null);
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };
    } else {
      onAddMap({
        name: mapName,
        group: mapGroup,
        url: mapUrl,
        panoramic_view_data: panoramicViewPreview || panoramicViewUrl,
        keepOpen: keepOpen,
        campaign_id: selectedCampaign,
        song_id: selectedSong,
        easy_battle_song_id: easyBattleSong,
        medium_battle_song_id: mediumBattleSong,
        hard_battle_song_id: hardBattleSong,
        deadly_battle_song_id: deadlyBattleSong,
        extreme_battle_song_id: extremeBattleSong
      });
      if (!keepOpen) {
        onClose();
      } else {
        setMapName('');
        setMapGroup('');
        setMapUrl('');
        setPanoramicViewFile(null);
        setPanoramicViewUrl('');
        setPanoramicViewPreview(null);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Añadir Nuevo Mapa</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="mapName">Nombre del Mapa:</label>
            <input
              type="text"
              id="mapName"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              required={mapFiles.length === 0}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapGroup">Grupo:</label>
            <input
              type="text"
              id="mapGroup"
              value={mapGroup}
              onChange={(e) => setMapGroup(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapUrl">URL del Mapa:</label>
            <input
              type="url"
              id="mapUrl"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapFile">Archivo de Mapa:</label>
            <input
              type="file"
              id="mapFile"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapFolder">Carpeta de Mapas:</label>
            <input
              type="file"
              id="mapFolder"
              onChange={handleFileChange}
              webkitdirectory=""
              directory=""
              multiple
            />
          </div>

          <div className="form-group">
            <label htmlFor="panoramicViewUrl">URL Vista Panorámica:</label>
            <input
              type="url"
              id="panoramicViewUrl"
              value={panoramicViewUrl}
              onChange={(e) => {
                setPanoramicViewUrl(e.target.value);
                setPanoramicViewFile(null); // Clear file if URL is typed
                setPanoramicViewPreview(null); // Clear preview
              }}
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
              onChange={(e) => setSelectedCampaign(e.target.value)}
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
              onChange={(e) => setSelectedSong(e.target.value)}
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
              onChange={(e) => setEasyBattleSong(e.target.value)}
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
              onChange={(e) => setMediumBattleSong(e.target.value)}
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
              onChange={(e) => setHardBattleSong(e.target.value)}
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
              onChange={(e) => setDeadlyBattleSong(e.target.value)}
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
              onChange={(e) => setExtremeBattleSong(e.target.value)}
            >
              <option value="">Sin canción</option>
              {songs.map(song => (
                <option key={song.id} value={song.id}>
                  {song.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="keepOpen"
              checked={keepOpen}
              onChange={(e) => setKeepOpen(e.target.checked)}
            />
            <label htmlFor="keepOpen">Mantener abierto después de añadir</label>
          </div>

          <div className="modal-actions">
            <button type="submit">Añadir Mapa</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMapModal;