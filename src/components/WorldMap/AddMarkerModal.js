import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import SearchableMultiSelector from '../shared/SearchableMultiSelector/SearchableMultiSelector';
import IconPicker from './IconPicker';
import './AddMarkerModal.css';
import API_BASE_URL from '../../apiConfig';
import { useCampaign } from '../../contexts/CampaignContext';

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

const AddMarkerModal = ({ onClose, worldMapId, x, y, editingMarker }) => {
    const { currentCampaign } = useCampaign();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [iconType, setIconType] = useState('circle');
    const [iconColor, setIconColor] = useState('#ff0000');
    const [selectedMaps, setSelectedMaps] = useState([]);
    const [selectedCharacters, setSelectedCharacters] = useState([]);
    const [selectedEnemies, setSelectedEnemies] = useState([]);
    const [selectedEncounters, setSelectedEncounters] = useState([]);

    const [availableMaps, setAvailableMaps] = useState([]);
    const [availableCharacters, setAvailableCharacters] = useState([]);
    const [availableEnemies, setAvailableEnemies] = useState([]);
    const [availableEncounters, setAvailableEncounters] = useState([]);

    useEffect(() => {
        const fetchAvailableData = async () => {
            if (!currentCampaign || !currentCampaign.id) return;

            try {
                const campaignId = currentCampaign.id;
                const [mapsRes, charsRes, monstersRes, encountersRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/campaigns/${campaignId}/maps`),
                    fetch(`${API_BASE_URL}/campaigns/${campaignId}/characters`),
                    fetch(`${API_BASE_URL}/monsters`), // Monsters are global, not campaign-specific
                    fetch(`${API_BASE_URL}/campaigns/${campaignId}/encounters`),
                ]);
                const mapsData = await mapsRes.json();
                const charsData = await charsRes.json();
                const monstersData = await monstersRes.json();
                const encountersData = await encountersRes.json();
                setAvailableMaps(mapsData.data || mapsData || []);
                setAvailableCharacters(charsData.data || charsData || []);
                setAvailableEnemies(monstersData.data || monstersData || []);
                setAvailableEncounters(encountersData.data || encountersData || []);
            } catch (error) {
                console.error('Error fetching available data:', error);
            }
        };
        fetchAvailableData();
    }, [currentCampaign]);

    useEffect(() => {
        if (editingMarker) {
            setName(editingMarker.name || '');
            setDescription(editingMarker.description || '');
            setNotes(editingMarker.notes || '');
            setIconType(editingMarker.icon_type || 'circle');
            setIconColor(editingMarker.icon_color || '#ff0000');

            const linkedMapIds = safeJSONParse(editingMarker.linked_maps);
            setSelectedMaps(linkedMapIds.map(id => availableMaps.find(m => m.id === id)).filter(Boolean));

            const linkedCharIds = safeJSONParse(editingMarker.linked_characters);
            setSelectedCharacters(linkedCharIds.map(id => availableCharacters.find(c => c.id === id)).filter(Boolean));

            const linkedEnemyIds = safeJSONParse(editingMarker.linked_enemies);
            setSelectedEnemies(linkedEnemyIds.map(id => availableEnemies.find(e => e.id === id)).filter(Boolean));

            const linkedEncounterIds = safeJSONParse(editingMarker.linked_encounter);
            setSelectedEncounters(linkedEncounterIds.map(id => availableEncounters.find(e => e.id === id)).filter(Boolean));

        } else {
            setName('');
            setDescription('');
            setNotes('');
            setIconType('circle');
            setIconColor('#ff0000');
            setSelectedMaps([]);
            setSelectedCharacters([]);
            setSelectedEnemies([]);
            setSelectedEncounters([]);
        }
    }, [editingMarker, availableMaps, availableCharacters, availableEnemies, availableEncounters]);

    const handleAddMap = useCallback((map) => setSelectedMaps(prev => [...prev, map]), []);
    const handleRemoveMap = useCallback((index) => setSelectedMaps(prev => prev.filter((_, i) => i !== index)), []);
    const handleAddCharacter = useCallback((char) => setSelectedCharacters(prev => [...prev, char]), []);
    const handleRemoveCharacter = useCallback((index) => setSelectedCharacters(prev => prev.filter((_, i) => i !== index)), []);
    const handleAddEnemy = useCallback((enemy) => setSelectedEnemies(prev => [...prev, enemy]), []);
    const handleRemoveEnemy = useCallback((index) => setSelectedEnemies(prev => prev.filter((_, i) => i !== index)), []);
    const handleAddEncounter = useCallback((enc) => setSelectedEncounters(prev => [...prev, enc]), []);
    const handleRemoveEncounter = useCallback((index) => setSelectedEncounters(prev => prev.filter((_, i) => i !== index)), []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const markerData = {
            name,
            description,
            notes,
            icon_type: iconType,
            icon_color: iconColor,
            linked_maps: selectedMaps.map(item => item.id),
            linked_characters: selectedCharacters.map(item => item.id),
            linked_enemies: selectedEnemies.map(item => item.id),
            linked_encounter: selectedEncounters.map(item => item.id),
            x: editingMarker ? editingMarker.x : x,
            y: editingMarker ? editingMarker.y : y,
        };

        try {
            const url = editingMarker
                ? `${API_BASE_URL}/worldmaps/markers/${editingMarker.id}`
                : `${API_BASE_URL}/worldmaps/${worldMapId}/markers`;
            const method = editingMarker ? 'PUT' : 'POST';
            const body = editingMarker ? markerData : { ...markerData, world_map_id: worldMapId };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                onClose();
            } else {
                console.error(`Failed to ${editingMarker ? 'update' : 'add'} marker`);
            }
        } catch (error) {
            console.error(`Error ${editingMarker ? 'updating' : 'adding'} marker:`, error);
        }
    }, [name, description, notes, iconType, iconColor, selectedMaps, selectedCharacters, selectedEnemies, selectedEncounters, x, y, editingMarker, worldMapId, onClose]);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{editingMarker ? 'Editar Marcador' : 'Añadir Marcador'}</h2>
                <form onSubmit={handleSubmit}>
                    <label>Nombre:<input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></label>
                    <label>Descripción:<textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label>
                    <label>Notas:<textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></label>

                    <div className="icon-controls">
                        <IconPicker value={iconType} onChange={setIconType} color={iconColor} />
                        <div className="color-picker-container">
                            <label htmlFor="iconColor">Color</label>
                            <input type="color" id="iconColor" value={iconColor} onChange={(e) => setIconColor(e.target.value)} />
                        </div>
                    </div>

                    <SearchableMultiSelector availableItems={availableMaps} selectedItems={selectedMaps} onAdd={handleAddMap} onRemove={handleRemoveMap} itemType="Mapas" searchPlaceholder="Buscar mapas..." />
                    <SearchableMultiSelector availableItems={availableCharacters} selectedItems={selectedCharacters} onAdd={handleAddCharacter} onRemove={handleRemoveCharacter} itemType="Personajes" searchPlaceholder="Buscar personajes..." />
                    <SearchableMultiSelector availableItems={availableEnemies} selectedItems={selectedEnemies} onAdd={handleAddEnemy} onRemove={handleRemoveEnemy} itemType="Enemigos" searchPlaceholder="Buscar enemigos..." />
                    <SearchableMultiSelector availableItems={availableEncounters} selectedItems={selectedEncounters} onAdd={handleAddEncounter} onRemove={handleRemoveEncounter} itemType="Encuentros" searchPlaceholder="Buscar encuentros..." />

                    <button type="submit">{editingMarker ? 'Guardar Cambios' : 'Añadir'}</button>
                    <button type="button" onClick={onClose}>Cancelar</button>
                </form>
            </div>
        </div>
    );
};

AddMarkerModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    worldMapId: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    editingMarker: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string,
        notes: PropTypes.string,
        icon_type: PropTypes.string,
        icon_color: PropTypes.string,
        linked_maps: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        linked_characters: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        linked_enemies: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        linked_encounter: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        x: PropTypes.number,
        y: PropTypes.number,
    }),
};

export default AddMarkerModal;
