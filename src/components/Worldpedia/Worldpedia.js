import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorldpedia } from '../../contexts/WorldpediaContext';
import { useCampaign } from '../../contexts/CampaignContext';
import API_BASE_URL from '../../apiConfig';

import WorldpediaNavigationTree from './WorldpediaNavigationTree';
import WorldpediaEditor from './WorldpediaEditor';
import WorldpediaSearchBar from './WorldpediaSearchBar';
import CharacterSheetModal from '../Characters/CharacterSheetModal';
import MonsterSheetModal from '../Bestiary/MonsterSheetModal';
import MapSheetModal from '../Maps/MapSheetModal';
import MissionSheetModal from '../Missions/MissionSheetModal';
import SpellSheetModal from '../Spells/SpellSheetModal';

import styles from './Worldpedia.module.css';

const Worldpedia = () => {
  const navigate = useNavigate();
  const { entries, selectEntry, selectedEntryId, fetchEntries } = useWorldpedia();
  const { currentCampaign } = useCampaign();

  // State for Modals
  const [showCharacterSheetModal, setShowCharacterSheetModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  
  const [showMonsterSheetModal, setShowMonsterSheetModal] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState(null);

  const [showMapSheetModal, setShowMapSheetModal] = useState(false);
  const [selectedMap, setSelectedMap] = useState(null);

  const [showMissionSheetModal, setShowMissionSheetModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  
  const [showSpellSheetModal, setShowSpellSheetModal] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState(null);

  useEffect(() => {
    if (currentCampaign?.id) {
      fetchEntries(currentCampaign.id);
    }
  }, [currentCampaign, fetchEntries]);

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  const handleNavigate = (slug) => {
    const targetEntry = entries.find(e => e.slug === slug);
    if (targetEntry) {
      selectEntry(targetEntry.id);
    }
  };

  // --- Character Sheet Handlers ---
  const handleOpenCharacterSheet = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok for character fetch');
      }
      const characterData = await response.json();
      setSelectedCharacter(characterData);
      setShowCharacterSheetModal(true);
    } catch (error) {
      console.error('Error fetching character for modal:', error);
    }
  };

  const handleCloseCharacterSheet = () => {
    setShowCharacterSheetModal(false);
    setSelectedCharacter(null);
  };

  // --- Monster Sheet Handlers ---
  const handleOpenMonsterSheet = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/monsters/${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok for monster fetch');
      }
      const monsterData = await response.json();
      setSelectedMonster(monsterData);
      setShowMonsterSheetModal(true);
    } catch (error) {
      console.error('Error fetching monster for modal:', error);
    }
  };

  const handleCloseMonsterSheet = () => {
    setShowMonsterSheetModal(false);
    setSelectedMonster(null);
  };

  // --- Map Sheet Handlers ---
  const handleOpenMapSheet = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maps/${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok for map fetch');
      }
      const mapData = await response.json();
      setSelectedMap(mapData);
      setShowMapSheetModal(true);
    } catch (error) {
      console.error('Error fetching map for modal:', error);
    }
  };

  const handleCloseMapSheet = () => {
    setShowMapSheetModal(false);
    setSelectedMap(null);
  };

  // --- Spell Sheet Handlers ---
  const handleOpenSpellSheet = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/spells/${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok for spell fetch');
      }
      const spellData = await response.json();
      setSelectedSpell(spellData);
      setShowSpellSheetModal(true);
    } catch (error) {
      console.error('Error fetching spell for modal:', error);
    }
  };

  const handleCloseSpellSheet = () => {
    setShowSpellSheetModal(false);
    setSelectedSpell(null);
  };

  // --- Mission Sheet Handlers ---
  const handleOpenMissionSheet = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok for mission fetch');
      }
      const missionData = await response.json();
      setSelectedMission(missionData);
      setShowMissionSheetModal(true);
    } catch (error) {
      console.error('Error fetching mission for modal:', error);
    }
  };

  const handleCloseMissionSheet = () => {
    setShowMissionSheetModal(false);
    setSelectedMission(null);
  };

  return (
    <div className={styles.worldpediaLayout}>
      <div className={styles.sidebar}>
        <WorldpediaSearchBar />
        <WorldpediaNavigationTree />
      </div>
      <div className={styles.mainContent}>
        <WorldpediaEditor 
          selectedEntry={selectedEntry}
          onNavigate={handleNavigate}
          onOpenCharacterSheet={handleOpenCharacterSheet}
          onOpenMonsterSheet={handleOpenMonsterSheet}
          onOpenMapSheet={handleOpenMapSheet}
          onOpenMissionSheet={handleOpenMissionSheet}
          onOpenSpellSheet={handleOpenSpellSheet}
        />
      </div>

      {showCharacterSheetModal && selectedCharacter && (
        <CharacterSheetModal
          character={selectedCharacter}
          onClose={handleCloseCharacterSheet}
        />
      )}

      {showMonsterSheetModal && selectedMonster && (
        <MonsterSheetModal
          monster={selectedMonster}
          onClose={handleCloseMonsterSheet}
        />
      )}

      {showMapSheetModal && selectedMap && (
        <MapSheetModal
          map={selectedMap}
          onClose={handleCloseMapSheet}
        />
      )}

      {showMissionSheetModal && selectedMission && (
        <MissionSheetModal
          mission={selectedMission}
          onClose={handleCloseMissionSheet}
        />
      )}

      {showSpellSheetModal && selectedSpell && (
        <SpellSheetModal
          spell={selectedSpell}
          onClose={handleCloseSpellSheet}
        />
      )}
    </div>
  );
};

export default Worldpedia;