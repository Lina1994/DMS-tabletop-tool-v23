import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../../contexts/CampaignContext';
import SearchableMultiSelector from '../shared/SearchableMultiSelector/SearchableMultiSelector';
import API_BASE_URL from '../../apiConfig';
import './EditMissionModal.css';

const EditMissionModal = ({ mission, onClose, onEditMission }) => {
    const { currentCampaign: campaign } = useCampaign();

    // Form fields state
    const [title, setTitle] = useState(mission.title);
    const [type, setType] = useState(mission.type);
    const [description, setDescription] = useState(mission.description);
    const [reward, setReward] = useState(mission.reward);
    const [complication, setComplication] = useState(mission.complication);
    const [notes, setNotes] = useState(mission.notes);
    const [status, setStatus] = useState(mission.status);

    // Data for selectors
    const [availableCharacters, setAvailableCharacters] = useState([]);
    const [availableMaps, setAvailableMaps] = useState([]);
    const [availableEnemies, setAvailableEnemies] = useState([]);
    const [availableEncounters, setAvailableEncounters] = useState([]);

    // Selected items state
    const [selectedCharacters, setSelectedCharacters] = useState([]);
    const [selectedMaps, setSelectedMaps] = useState([]);
    const [selectedEnemies, setSelectedEnemies] = useState([]);
    const [selectedEncounters, setSelectedEncounters] = useState([]);

    useEffect(() => {
        const fetchAvailableData = async () => {
            if (!campaign || !campaign.id) return;
            try {
                const campaignId = campaign.id;
                const [mapsRes, charsRes, monstersRes, encountersRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/campaigns/${campaignId}/maps`),
                    fetch(`${API_BASE_URL}/campaigns/${campaignId}/characters`),
                    fetch(`${API_BASE_URL}/monsters`), // Monsters are global
                    fetch(`${API_BASE_URL}/campaigns/${campaignId}/encounters`),
                ]);
                const mapsData = await mapsRes.json();
                const charsData = await charsRes.json();
                const monstersData = await monstersRes.json();
                const encountersData = await encountersRes.json();

                const allMaps = mapsData || [];
                const allChars = charsData || [];
                const allEnemies = monstersData || [];
                const allEncounters = encountersData || [];

                setAvailableMaps(allMaps);
                setAvailableCharacters(allChars);
                setAvailableEnemies(allEnemies);
                setAvailableEncounters(allEncounters);

                // Pre-select items based on mission data
                setSelectedCharacters(allChars.filter(c => mission.client.includes(c.id)));
                setSelectedMaps(allMaps.filter(m => mission.location.includes(m.id)));
                setSelectedEnemies(allEnemies.filter(e => mission.enemies.includes(e.id)));
                setSelectedEncounters(allEncounters.filter(e => mission.encounters.includes(e.id)));

            } catch (error) {
                console.error('Error fetching available data for mission modal:', error);
            }
        };
        fetchAvailableData();
    }, [campaign, mission]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedMission = {
            ...mission,
            title,
            type,
            description,
            reward,
            complication,
            notes,
            status,
            client: selectedCharacters.map(c => c.id),
            location: selectedMaps.map(m => m.id),
            enemies: selectedEnemies.map(en => en.id),
            encounters: selectedEncounters.map(enc => enc.id),
        };
        onEditMission(updatedMission);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content mission-modal">
                <h2>Editar Misión</h2>
                <form onSubmit={handleSubmit} className="mission-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Título:</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Tipo:</label>
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="combate">Combate</option>
                                <option value="exploración">Exploración</option>
                                <option value="social">Social</option>
                                <option value="misterio">Misterio</option>
                                <option value="recolección">Recolección</option>
                            </select>
                        </div>
                        <div className="form-group full-width">
                            <label>Descripción:</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Recompensa:</label>
                            <input type="text" value={reward} onChange={(e) => setReward(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Complicación:</label>
                            <input type="text" value={complication} onChange={(e) => setComplication(e.target.value)} />
                        </div>
                         <div className="form-group full-width">
                            <label>Notas:</label>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Estado:</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="sin aceptar">Sin Aceptar</option>
                                <option value="aceptada">Aceptada</option>
                                <option value="completada">Completada</option>
                            </select>
                        </div>
                    </div>

                    <SearchableMultiSelector availableItems={availableCharacters} selectedItems={selectedCharacters} onAdd={useCallback(item => setSelectedCharacters(prev => [...prev, item]), [])} onRemove={useCallback(index => setSelectedCharacters(prev => prev.filter((_, i) => i !== index)), [])} itemType="Clientes" searchPlaceholder="Buscar personajes..." />
                    <SearchableMultiSelector availableItems={availableMaps} selectedItems={selectedMaps} onAdd={useCallback(item => setSelectedMaps(prev => [...prev, item]), [])} onRemove={useCallback(index => setSelectedMaps(prev => prev.filter((_, i) => i !== index)), [])} itemType="Mapas" searchPlaceholder="Buscar mapas..." />
                    <SearchableMultiSelector availableItems={availableEnemies} selectedItems={selectedEnemies} onAdd={useCallback(item => setSelectedEnemies(prev => [...prev, item]), [])} onRemove={useCallback(index => setSelectedEnemies(prev => prev.filter((_, i) => i !== index)), [])} itemType="Enemigos" searchPlaceholder="Buscar enemigos..." />
                    <SearchableMultiSelector availableItems={availableEncounters} selectedItems={selectedEncounters} onAdd={useCallback(item => setSelectedEncounters(prev => [...prev, item]), [])} onRemove={useCallback(index => setSelectedEncounters(prev => prev.filter((_, i) => i !== index)), [])} itemType="Encuentros" searchPlaceholder="Buscar encuentros..." />

                    <div className="form-actions">
                        <button type="submit" className="button primary">Guardar Cambios</button>
                        <button type="button" className="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EditMissionModal.propTypes = {
    mission: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onEditMission: PropTypes.func.isRequired,
};

export default EditMissionModal;