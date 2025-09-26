import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../../contexts/CampaignContext';
import SearchableMultiSelector from '../shared/SearchableMultiSelector/SearchableMultiSelector';
import API_BASE_URL from '../../apiConfig';
import { v4 as uuidv4 } from 'uuid';
import './AddMissionModal.css';

const AddMissionModal = ({ onClose, onAddMission }) => {
    const { currentCampaign: campaign } = useCampaign();

    // Form fields state
    const [title, setTitle] = useState('');
    const [type, setType] = useState('combate');
    const [description, setDescription] = useState('');
    const [reward, setReward] = useState('');
    const [complication, setComplication] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('sin aceptar');

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

                setAvailableMaps(mapsData || []);
                setAvailableCharacters(charsData || []);
                setAvailableEnemies(monstersData || []);
                setAvailableEncounters(encountersData || []);
            } catch (error) {
                console.error('Error fetching available data for mission modal:', error);
            }
        };
        fetchAvailableData();
    }, [campaign]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newMission = {
            id: uuidv4(),
            title,
            type,
            description,
            reward,
            complication,
            notes,
            status,
            campaign_id: campaign.id,
            client: selectedCharacters.map(c => c.id),
            location: selectedMaps.map(m => m.id),
            enemies: selectedEnemies.map(en => en.id),
            encounters: selectedEncounters.map(enc => enc.id),
        };
        onAddMission(newMission);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content mission-modal">
                <h2>Añadir Nueva Misión</h2>
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
                        <button type="submit" className="button primary">Añadir Misión</button>
                        <button type="button" className="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AddMissionModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onAddMission: PropTypes.func.isRequired,
};

export default AddMissionModal;