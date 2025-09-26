import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import SearchableMultiSelector from '../shared/SearchableMultiSelector/SearchableMultiSelector';
import IconPicker from './IconPicker';
import MapSheetModal from '../Maps/MapSheetModal';
import CharacterSheetModal from '../Characters/CharacterSheetModal';
import MonsterSheetModal from '../Bestiary/MonsterSheetModal';
import EditEncounterModal from '../Encounters/EditEncounterModal';
import './MarkerDetailsModal.css';
import API_BASE_URL from '../../apiConfig';
import { useCampaign } from '../../contexts/CampaignContext'; // Import the campaign context hook

// Helper to safely parse JSON strings
const safeJSONParse = (str) => {
  if (Array.isArray(str)) return str;
  if (typeof str !== 'string') return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

// Sub-component for displaying linked items with thumbnails
const LinkedItemsDisplay = ({ title, items, type, onOpenSheet }) => {
  if (!items || items.length === 0) {
    return (
      <div className="linked-items-display">
        <p><strong>{title}:</strong> Ninguno</p>
      </div>
    );
  }

  return (
    <div className="linked-items-display">
      <strong>{title}:</strong>
      <div className="linked-items-list">
        {items.map(item => {
          const imageUrl = item.image_data || item.image;
          return (
            <div key={item.id} className="linked-item clickable" title={item.name} onClick={() => onOpenSheet(item, type)}>
              {imageUrl ? (
                <img src={imageUrl} alt={item.name} className="linked-item-thumbnail" />
              ) : (
                <div className="linked-item-placeholder" />
              )}
              <span className="linked-item-name">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

LinkedItemsDisplay.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image_data: PropTypes.string,
    image: PropTypes.string,
  })).isRequired,
  type: PropTypes.string.isRequired,
  onOpenSheet: PropTypes.func.isRequired,
};

const MarkerDetailsModal = ({ marker, onClose, onDelete, onUpdateSuccess }) => {
  const { currentCampaign } = useCampaign(); // Get the current campaign
  const [isEditing, setIsEditing] = useState(false);
  const [sheetModal, setSheetModal] = useState({ type: null, item: null });

  // State for form inputs
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editedIconType, setEditedIconType] = useState('circle');
  const [editedIconColor, setEditedIconColor] = useState('#ff0000');

  // State for multi-selectors (storing full objects)
  const [selectedMaps, setSelectedMaps] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [selectedEnemies, setSelectedEnemies] = useState([]);
  const [selectedEncounters, setSelectedEncounters] = useState([]);

  // State for all available items for selectors
  const [allMaps, setAllMaps] = useState([]);
  const [allCharacters, setAllCharacters] = useState([]);
  const [allEnemies, setAllEnemies] = useState([]);
  const [allEncounters, setAllEncounters] = useState([]);

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentCampaign || !currentCampaign.id) return; // Don't fetch if no campaign
      try {
        const campaignId = currentCampaign.id;
        const [mapsRes, charsRes, monstersRes, encountersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/campaigns/${campaignId}/maps`),
          fetch(`${API_BASE_URL}/campaigns/${campaignId}/characters`),
          fetch(`${API_BASE_URL}/monsters`), // Monsters are global
          fetch(`${API_BASE_URL}/campaigns/${campaignId}/encounters`),
        ]);
        setAllMaps(await mapsRes.json());
        setAllCharacters(await charsRes.json());
        setAllEnemies(await monstersRes.json());
        setAllEncounters(await encountersRes.json());
      } catch (error) {
        console.error('Error fetching all data for MarkerDetailsModal:', error);
      }
    };
    fetchAllData();
  }, [currentCampaign]); // Re-fetch if campaign changes

  const resetEditedFields = useCallback(() => {
    if (marker) {
        setEditedName(marker.name || '');
        setEditedDescription(marker.description || '');
        setEditedNotes(marker.notes || '');
        setEditedIconType(marker.icon_type || 'circle');
        setEditedIconColor(marker.icon_color || '#ff0000');

        const linkedMapIds = safeJSONParse(marker.linked_maps);
        setSelectedMaps(linkedMapIds.map(id => allMaps.find(m => m.id === id)).filter(Boolean));

        const linkedCharIds = safeJSONParse(marker.linked_characters);
        setSelectedCharacters(linkedCharIds.map(id => allCharacters.find(c => c.id === id)).filter(Boolean));

        const linkedEnemyIds = safeJSONParse(marker.linked_enemies);
        setSelectedEnemies(linkedEnemyIds.map(id => allEnemies.find(e => e.id === id)).filter(Boolean));

        const linkedEncounterIds = safeJSONParse(marker.linked_encounter);
        setSelectedEncounters(linkedEncounterIds.map(id => allEncounters.find(e => e.id === id)).filter(Boolean));
    }
  }, [marker, allMaps, allCharacters, allEnemies, allEncounters]);

  useEffect(() => {
    resetEditedFields();
  }, [resetEditedFields]);

  const handleOpenSheet = (item, type) => setSheetModal({ item, type });
  const handleCloseSheet = () => setSheetModal({ item: null, type: null });

  const handleAddMap = useCallback((map) => setSelectedMaps(prev => [...prev, map]), []);
  const handleRemoveMap = useCallback((index) => setSelectedMaps(prev => prev.filter((_, i) => i !== index)), []);
  const handleAddChar = useCallback((char) => setSelectedCharacters(prev => [...prev, char]), []);
  const handleRemoveChar = useCallback((index) => setSelectedCharacters(prev => prev.filter((_, i) => i !== index)), []);
  const handleAddEnemy = useCallback((enemy) => setSelectedEnemies(prev => [...prev, enemy]), []);
  const handleRemoveEnemy = useCallback((index) => setSelectedEnemies(prev => prev.filter((_, i) => i !== index)), []);
  const handleAddEncounter = useCallback((enc) => setSelectedEncounters(prev => [...prev, enc]), []);
  const handleRemoveEncounter = useCallback((index) => setSelectedEncounters(prev => prev.filter((_, i) => i !== index)), []);

  const handleSave = async () => {
    const updatedMarker = {
      id: marker.id,
      name: editedName,
      description: editedDescription,
      notes: editedNotes,
      icon_type: editedIconType,
      icon_color: editedIconColor,
      linked_maps: selectedMaps.map(item => item.id),
      linked_characters: selectedCharacters.map(item => item.id),
      linked_enemies: selectedEnemies.map(item => item.id),
      linked_encounter: selectedEncounters.map(item => item.id),
      x: marker.x,
      y: marker.y,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/worldmaps/markers/${marker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMarker),
      });

      if (response.ok) {
        onUpdateSuccess();
        setIsEditing(false);
      } else {
        console.error('Failed to update marker');
      }
    } catch (error) {
      console.error('Error updating marker:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetEditedFields();
  };

  if (!marker) return null;

  return (
    <>
      <div className="marker-details-modal-overlay">
        <div className="marker-details-modal-content">
          <button className="marker-details-modal-close-btn" onClick={onClose}>&times;</button>
          <h2>{isEditing ? 'Editar Marcador' : `Detalles: ${marker.name}`}</h2>
          
          <div className="marker-details-modal-info">
            {isEditing ? (
              <>
                <label><strong>Nombre:</strong><input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} required /></label>
                <label><strong>Descripción:</strong><textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} /></label>
                <label><strong>Notas:</strong><textarea value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} /></label>
                
                <div className="icon-controls">
                  <IconPicker value={editedIconType} onChange={setEditedIconType} color={editedIconColor} />
                  <div className="color-picker-container">
                      <label htmlFor="iconColor">Color</label>
                      <input type="color" id="iconColor" value={editedIconColor} onChange={(e) => setEditedIconColor(e.target.value)} />
                  </div>
                </div>

                <SearchableMultiSelector availableItems={allMaps} selectedItems={selectedMaps} onAdd={handleAddMap} onRemove={handleRemoveMap} itemType="Mapas" searchPlaceholder="Buscar mapas..." />
                <SearchableMultiSelector availableItems={allCharacters} selectedItems={selectedCharacters} onAdd={handleAddChar} onRemove={handleRemoveChar} itemType="Personajes" searchPlaceholder="Buscar personajes..." />
                <SearchableMultiSelector availableItems={allEnemies} selectedItems={selectedEnemies} onAdd={handleAddEnemy} onRemove={handleRemoveEnemy} itemType="Enemigos" searchPlaceholder="Buscar enemigos..." />
                <SearchableMultiSelector availableItems={allEncounters} selectedItems={selectedEncounters} onAdd={handleAddEncounter} onRemove={handleRemoveEncounter} itemType="Encuentros" searchPlaceholder="Buscar encuentros..." />
              </>
            ) : (
              <>
                <p><strong>Nombre:</strong> {marker.name}</p>
                <p><strong>Descripción:</strong> {marker.description || 'Ninguna'}</p>
                <p><strong>Notas:</strong> {marker.notes || 'Ninguna'}</p>
                
                <LinkedItemsDisplay title="Mapas Vinculados" items={selectedMaps} type="map" onOpenSheet={handleOpenSheet} />
                <LinkedItemsDisplay title="Personajes Vinculados" items={selectedCharacters} type="character" onOpenSheet={handleOpenSheet} />
                <LinkedItemsDisplay title="Enemigos Vinculados" items={selectedEnemies} type="monster" onOpenSheet={handleOpenSheet} />
                <LinkedItemsDisplay title="Encuentros Vinculados" items={selectedEncounters} type="encounter" onOpenSheet={handleOpenSheet} />
              </>
            )}
          </div>

          <div className="marker-details-modal-actions">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="save-btn">Guardar Cambios</button>
                <button onClick={handleCancelEdit} className="cancel-btn">Cancelar</button>
              </>
            ) : (
              <>
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="settings-btn">Ajustes</button>
                {showSettingsMenu && (
                  <div className="settings-dropdown">
                    <button onClick={() => { setIsEditing(true); setShowSettingsMenu(false); }}>Editar</button>
                    <button onClick={() => { onDelete(marker.id, marker.name); setShowSettingsMenu(false); }}>Eliminar</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {sheetModal.type === 'map' && (
        <MapSheetModal 
          map={sheetModal.item} 
          onClose={handleCloseSheet} 
          onUpdateMap={(updatedMap) => console.log('Update Map', updatedMap)} // Placeholder
        />
      )}
      {sheetModal.type === 'character' && (
        <CharacterSheetModal 
          character={sheetModal.item} 
          onClose={handleCloseSheet} 
        />
      )}
      {sheetModal.type === 'monster' && (
        <MonsterSheetModal 
          monster={sheetModal.item} 
          onClose={handleCloseSheet} 
          onUpdateMonster={(updatedMonster) => console.log('Update Monster', updatedMonster)} // Placeholder
          onDelete={() => console.log('Delete Monster')} // Placeholder
        />
      )}
      {sheetModal.type === 'encounter' && (
        <EditEncounterModal 
          encounter={sheetModal.item} 
          onClose={handleCloseSheet} 
          onUpdateEncounter={() => { onUpdateSuccess(); handleCloseSheet(); }} 
        />
      )}
    </>
  );
};

MarkerDetailsModal.propTypes = {
  marker: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    notes: PropTypes.string,
    icon_type: PropTypes.string,
    icon_color: PropTypes.string,
    linked_maps: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    linked_characters: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    linked_enemies: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    linked_encounter: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdateSuccess: PropTypes.func.isRequired,
};

export default MarkerDetailsModal;