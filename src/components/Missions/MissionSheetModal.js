import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../../contexts/CampaignContext';
import API_BASE_URL from '../../apiConfig';
import LinkedItemDisplay from './shared/LinkedItemDisplay';
import './MissionSheetModal.css';

const MissionSheetModal = ({ mission, onClose, onEdit, onDelete, onStatusChange }) => {
  const { currentCampaign: campaign } = useCampaign();
  const [resolvedClients, setResolvedClients] = useState([]);
  const [resolvedLocations, setResolvedLocations] = useState([]);
  const [resolvedEnemies, setResolvedEnemies] = useState([]);
  const [resolvedEncounters, setResolvedEncounters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndResolveData = async () => {
      if (!mission || !campaign?.id) return;

      setLoading(true);
      try {
        const campaignId = campaign.id;
        const [mapsRes, charsRes, monstersRes, encountersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/campaigns/${campaignId}/maps`),
            fetch(`${API_BASE_URL}/campaigns/${campaignId}/characters`),
            fetch(`${API_BASE_URL}/monsters`), // Monsters are global
            fetch(`${API_BASE_URL}/campaigns/${campaignId}/encounters`),
        ]);
        const allMaps = await mapsRes.json();
        const allChars = await charsRes.json();
        const allMonsters = await monstersRes.json();
        const allEncounters = await encountersRes.json();

        if (mission.client && mission.client.length > 0) {
          setResolvedClients(allChars.filter(c => mission.client.includes(c.id)));
        } else {
          setResolvedClients([]);
        }
        if (mission.location && mission.location.length > 0) {
          setResolvedLocations(allMaps.filter(m => mission.location.includes(m.id)));
        } else {
          setResolvedLocations([]);
        }
        if (mission.enemies && mission.enemies.length > 0) {
          setResolvedEnemies(allMonsters.filter(m => mission.enemies.includes(m.id)));
        } else {
          setResolvedEnemies([]);
        }
        if (mission.encounters && mission.encounters.length > 0) {
          setResolvedEncounters(allEncounters.filter(e => mission.encounters.includes(e.id)));
        } else {
          setResolvedEncounters([]);
        }

      } catch (error) {
        console.error("Error resolving mission data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndResolveData();
  }, [mission, campaign]);

  if (!mission) return null;

  const handleLocalStatusChange = (e) => {
    const newStatus = e.target.value;
    onStatusChange(mission, newStatus, resolvedClients);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content mission-sheet-modal">
        <div className="mission-sheet-header">
          <h2>{mission.title}</h2>
          <div className="status-changer-wrapper">
            <label htmlFor="status-select">Estado:</label>
            <select id="status-select" value={mission.status} onChange={handleLocalStatusChange} className="status-select">
                <option value="sin aceptar">Sin Aceptar</option>
                <option value="aceptada">Aceptada</option>
                <option value="completada">Completada</option>
            </select>
          </div>
        </div>
        <div className="mission-sheet-body">
          <p><strong>Tipo:</strong> {mission.type}</p>
          <p><strong>Descripción:</strong> {mission.description || 'N/A'}</p>
          <p><strong>Recompensa:</strong> {mission.reward || 'N/A'}</p>
          <p><strong>Complicación:</strong> {mission.complication || 'N/A'}</p>
          <p><strong>Notas:</strong> {mission.notes || 'N/A'}</p>
          
          {loading ? (
            <p>Cargando detalles...</p>
          ) : (
            <>
              <LinkedItemDisplay label="Cliente(s)" items={resolvedClients} />
              <LinkedItemDisplay label="Localización(es)" items={resolvedLocations} />
              <LinkedItemDisplay label="Enemigo(s)" items={resolvedEnemies} />
              <LinkedItemDisplay label="Encuentro(s)" items={resolvedEncounters} />
            </>
          )}
        </div>
        <div className="mission-sheet-actions">
          <button className="button" onClick={onEdit}>Editar</button>
          <button className="button danger" onClick={() => onDelete(mission.id)}>Eliminar</button>
          <button className="button primary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

MissionSheetModal.propTypes = {
  mission: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

export default MissionSheetModal;