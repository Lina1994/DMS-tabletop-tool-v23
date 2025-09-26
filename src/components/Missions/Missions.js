import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../../contexts/CampaignContext';
import { useDate } from '../../contexts/DateContext';
import API_BASE_URL from '../../apiConfig';
import MissionCard from './MissionCard/MissionCard';
import AddMissionModal from './AddMissionModal';
import EditMissionModal from './EditMissionModal';
import MissionSheetModal from './MissionSheetModal';
import ConfirmModal from '../Maps/ConfirmModal';
import InfoModal from '../shared/InfoModal/InfoModal';
import generateUniqueId from '../../utils/idGenerator';
import MissionGeneratorSettingsModal from './MissionGeneratorSettingsModal';
import GeneratedMissionModal from './GeneratedMissionModal';
import styles from './Missions.module.css';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentCampaign: campaign } = useCampaign();
  const { selectedDay } = useDate();

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showGeneratorSettingsModal, setShowGeneratorSettingsModal] = useState(false);
  const [showGeneratedMissionModal, setShowGeneratedMissionModal] = useState(false);

  // State for selected/to-delete items
  const [selectedMission, setSelectedMission] = useState(null);
  const [missionToDelete, setMissionToDelete] = useState(null);
  const [infoModalMessage, setInfoModalMessage] = useState('');

  // Mission Generator State
  const [generatedMission, setGeneratedMission] = useState(null);
  const [generationRarity, setGenerationRarity] = useState('comun');
  const rarities = ['comun', 'epica', 'legendaria'];

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Collapse state
  const [collapsedGroups, setCollapsedGroups] = useState({
    aceptada: false,
    'sin aceptar': false,
    completada: true,
  });

  useEffect(() => {
    if (campaign && campaign.id) {
      fetchMissions(campaign.id);
    }
  }, [campaign]);

  const fetchMissions = async (campaignId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/missions`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMissions(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching missions:", err);
      setError("Error al cargar las misiones. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMission = async (newMission) => {
    try {
      const response = await fetch(`${API_BASE_URL}/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMission),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchMissions(campaign.id);
    } catch (err) {
      console.error("Error adding mission:", err);
    }
  };

  const handleEditMission = async (updatedMission) => {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/${updatedMission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMission),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchMissions(campaign.id);
      setShowEditModal(false);
      setSelectedMission(null);
    } catch (err) {
      console.error("Error editing mission:", err);
    }
  };

  const handleDeleteMission = async (missionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/${missionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchMissions(campaign.id);
    } catch (err) {
      console.error("Error deleting mission:", err);
    }
  };

  const handleStatusChange = async (mission, newStatus, clients) => {
    if (mission) {
      const updatedMission = { ...mission, status: newStatus };
      await handleEditMission(updatedMission, true, clients);
    }
  };

  const openDeleteConfirm = (missionId) => {
    setMissionToDelete(missionId);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteMission(missionToDelete);
    setShowConfirmModal(false);
    setMissionToDelete(null);
    setShowSheetModal(false);
  };

  const handleCardClick = (mission) => {
    setSelectedMission(mission);
    setShowSheetModal(true);
  };

  const handleEditClick = () => {
    setShowSheetModal(false);
    setShowEditModal(true);
  };

  const getRandomEntry = (entries) => {
    if (!entries || entries.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * entries.length);
    return entries[randomIndex].value;
  };

  const generateMission = async () => {
    if (!campaign || !campaign.id) {
      setInfoModalMessage('Por favor, selecciona una campaña para generar misiones.');
      setShowInfoModal(true);
      setGeneratedMission(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/generator-entries/${campaign.id}?rarity=${generationRarity}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const allEntries = await response.json();
      const categorizedEntries = allEntries.reduce((acc, entry) => {
        if (!acc[entry.category]) acc[entry.category] = [];
        acc[entry.category].push(entry);
        return acc;
      }, {});

      const missionTypeCategories = ['tiposMision_combate', 'tiposMision_exploracion', 'tiposMision_social', 'tiposMision_misterio', 'tiposMision_recoleccion'];
      const availableMissionTypeCategories = missionTypeCategories.filter(cat => categorizedEntries[cat] && categorizedEntries[cat].length > 0);

      if (availableMissionTypeCategories.length === 0) {
        setGeneratedMission(null);
        return;
      }

      const randomMissionTypeCategoryKey = availableMissionTypeCategories[Math.floor(Math.random() * availableMissionTypeCategories.length)];
      const missionTypeCategoryName = randomMissionTypeCategoryKey.replace('tiposMision_', '');

      const selectedTipoMision = getRandomEntry(categorizedEntries[randomMissionTypeCategoryKey]);
      const selectedLugar = getRandomEntry(categorizedEntries.lugares);
      const selectedNpc = getRandomEntry(categorizedEntries.npcs);
      const selectedProblema = getRandomEntry(categorizedEntries.problemas);
      const selectedVillano = getRandomEntry(categorizedEntries.villanos);
      const selectedRecompensa = getRandomEntry(categorizedEntries.recompensas);
      const selectedGiro = getRandomEntry(categorizedEntries.giros);

      if (!selectedTipoMision || !selectedLugar || !selectedNpc || !selectedProblema || !selectedVillano || !selectedRecompensa || !selectedGiro) {
        setGeneratedMission(null);
        return;
      }

      const missionTitle = selectedTipoMision;
      const missionDescription = 
        `Los personajes deben ${selectedTipoMision} en ${selectedLugar}.
` +
        `Todo comenzó cuando ${selectedNpc} ${selectedProblema}.
` +
        `Detrás de todo esto se encuentra ${selectedVillano}.`;

      const newGeneratedMission = {
        id: generateUniqueId('mission'),
        campaign_id: campaign.id,
        title: missionTitle,
        description: missionDescription,
        reward: selectedRecompensa,
        complication: selectedGiro,
        status: 'sin aceptar',
        type: missionTypeCategoryName,
      };

      setGeneratedMission(newGeneratedMission);

    } catch (err) {
      console.error('Error generating mission:', err);
      setInfoModalMessage('Error al generar la misión. Por favor, inténtalo de nuevo.');
      setShowInfoModal(true);
      setGeneratedMission(null);
    }
  };

  const handleOpenGenerator = async () => {
    await generateMission(); // Intenta generar una misión primero
    setShowGeneratedMissionModal(true); // Luego, siempre abre el modal
  };

  const handleSaveGeneratedMission = (mission) => {
    handleAddMission(mission);
    setShowGeneratedMissionModal(false);
    setGeneratedMission(null);
  };

  const handleCloseGeneratedMission = () => {
    setShowGeneratedMissionModal(false);
    setGeneratedMission(null);
  };

  const handleRegenerateMission = () => {
    generateMission();
  };

  const handleConfigureGenerator = () => {
    setShowGeneratedMissionModal(false);
    setShowGeneratorSettingsModal(true);
  };

  const toggleGroup = (groupName) => {
    setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const groupedMissions = useMemo(() => {
    const filtered = missions.filter(mission => {
      const searchTermMatch = mission.title.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = filterType === 'all' || mission.type === filterType;
      return searchTermMatch && typeMatch;
    });

    return filtered.reduce((acc, mission) => {
      const status = mission.status || 'sin aceptar';
      if (!acc[status]) acc[status] = [];
      acc[status].push(mission);
      return acc;
    }, {});
  }, [missions, searchTerm, filterType]);

  const missionOrder = ['aceptada', 'sin aceptar', 'completada'];

  return (
    <div className={styles.missionsContainer}>
      <h1>Gestión de Misiones</h1>
      <div className={styles.missionsActions}>
        <button className="button primary" onClick={() => setShowAddModal(true)}>Añadir Misión</button>
        <button className="button secondary" onClick={handleOpenGenerator}>Generador de Misiones</button>
      </div>

      <div className={styles.missionsControls}>
        <input
          type="text"
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
          <option value="all">Todos los tipos</option>
          <option value="combate">Combate</option>
          <option value="exploración">Exploración</option>
          <option value="social">Social</option>
          <option value="misterio">Misterio</option>
          <option value="recolección">Recolección</option>
        </select>
      </div>
      
      {loading && <p>Cargando misiones...</p>}
      {error && <p className="error-message">{error}</p>}
      
      <div className={styles.missionsList}>
        {!loading && !error && Object.keys(groupedMissions).length === 0 ? (
          <p>No se encontraron misiones con los filtros actuales.</p>
        ) : (
          missionOrder.map(status => (
            groupedMissions[status] && groupedMissions[status].length > 0 && (
              <div key={status} className={styles.missionGroup}>
                <div className={styles.missionGroupHeader} onClick={() => toggleGroup(status)}>
                  <h3>{status.charAt(0).toUpperCase() + status.slice(1)} ({groupedMissions[status].length})</h3>
                  <span className={`${styles.collapseIcon} ${collapsedGroups[status] ? styles.collapsed : ''}`}>
                    ▼
                  </span>
                </div>
                {!collapsedGroups[status] && (
                  <div className={styles.missionGroupContent}>
                  {
                    groupedMissions[status].map(mission => (
                      <MissionCard 
                        key={mission.id} 
                        mission={mission} 
                        onClick={handleCardClick} 
                      />
                    ))
                  }
                  </div>
                )}
              </div>
            )
          ))
        )}
      </div>

      {/* Modals */}
      {showAddModal && <AddMissionModal onAddMission={handleAddMission} onClose={() => setShowAddModal(false)} />}
      
      {showSheetModal && selectedMission && (
        <MissionSheetModal 
          mission={selectedMission} 
          onClose={() => setShowSheetModal(false)} 
          onEdit={handleEditClick}
          onDelete={openDeleteConfirm}
          onStatusChange={handleStatusChange}
        />
      )}

      {showEditModal && selectedMission && (
        <EditMissionModal 
          mission={selectedMission} 
          onEditMission={handleEditMission} 
          onClose={() => setShowEditModal(false)} 
        />
      )}

      {showConfirmModal && (
        <ConfirmModal 
          message="¿Estás seguro de que quieres eliminar esta misión? Esta acción no se puede deshacer."
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {showInfoModal && <InfoModal message={infoModalMessage} onClose={() => setShowInfoModal(false)} />}

      {showGeneratorSettingsModal && campaign && campaign.id && (
        <MissionGeneratorSettingsModal
            campaignId={campaign.id}
            onClose={() => setShowGeneratorSettingsModal(false)}
        />
      )}

      {showGeneratedMissionModal && (
        <GeneratedMissionModal
          mission={generatedMission}
          onSave={handleSaveGeneratedMission}
          onClose={handleCloseGeneratedMission}
          onRegenerate={handleRegenerateMission}
          rarity={generationRarity}
          rarities={rarities}
          onRarityChange={(e) => setGenerationRarity(e.target.value)}
          onConfigure={handleConfigureGenerator}
        />
      )}

    </div>
  );
}

Missions.propTypes = {};

export default Missions;