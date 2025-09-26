import React, { useEffect } from 'react';
import './CharacterSheetModal.css';
import { usePanoramicView } from '../../contexts/PanoramicViewContext';

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

function CharacterSheetModal({ onClose, character }) {
  const { panoramicCharacter, setPanoramicCharacter } = usePanoramicView();

  useEffect(() => {
    if (ipcRenderer) {
      const handleCharacterChange = (event, char) => {
        setPanoramicCharacter(char);
      };

      ipcRenderer.on('panoramic-character-changed', handleCharacterChange);
      ipcRenderer.send('request-panoramic-character'); // Request initial state

      return () => {
        ipcRenderer.removeListener('panoramic-character-changed', handleCharacterChange);
      };
    }
  }, [setPanoramicCharacter]); // Dependencia añadida para setPanoramicCharacter

  if (!character) return null;

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  const isCharacterInPanoramic = panoramicCharacter && panoramicCharacter.id === character.id;

  const handlePanoramicViewClick = () => {
    if (ipcRenderer) {
      if (isCharacterInPanoramic) {
        ipcRenderer.send('update-panoramic-character', null);
      } else {
        ipcRenderer.send('update-panoramic-character', character);
      }
    }
  };

  const renderImage = () => {
    if (character.image) {
      if (character.image.startsWith('data:image')) {
        return <img src={character.image} alt={character.name} className="character-sheet-image" />;
      } else {
        return <img src={character.image} alt={character.name} className="character-sheet-image" />;
      }
    }
    return null;
  };

  const maxHp = character.maxHitPoints || 0;
  const currentHp = character.currentHitPoints || 0;
  const tempHp = character.temporaryHitPoints || 0;
  const currentHpPercentage = maxHp > 0 ? (currentHp / maxHp) * 100 : 0;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      {/* Nuevo contenedor para el botón de vista panorámica */}
      {character.image && (
        <div className="panoramic-action-button-container">
          <button
            type="button"
            onClick={handlePanoramicViewClick}
            className="panoramic-view-btn" // Nueva clase para estilos
          >
            {isCharacterInPanoramic ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.09 18.09 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.09 18.09 0 0 1-2.06 2.94M1 1l22 22"></path><path d="M10.5 10.5c-.92.92-1.5 2.12-1.5 3.5a3.5 3.5 0 0 0 3.5 3.5c1.38 0 2.58-.58 3.5-1.5"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
            {/* Texto del botón, si es necesario, o solo el icono */}
          </button>
        </div>
      )}

      <div className="modal-content wide-modal-content">
        <h2>Detalles del Personaje</h2>
        <form>
          {/* ... (rest of the form is unchanged) ... */}
          <div className="character-info-grid">
            <div className="form-group character-name-field">
              <label htmlFor="name">Nombre del Personaje:</label>
              <p>{character.name || 'N/A'}</p>
            </div>

            <div className="form-group">
              <label htmlFor="charClass">Clase:</label>
              <p>{character.class || 'N/A'}</p>
            </div>
            <div className="form-group">
              <label htmlFor="level">Nivel:</label>
              <p>{character.level || 'N/A'}</p>
            </div>
            <div className="form-group">
              <label htmlFor="background">Trasfondo:</label>
              <p>{character.background || 'N/A'}</p>
            </div>
            <div className="form-group">
              <label htmlFor="race">Raza:</label>
              <p>{character.race || 'N/A'}</p>
            </div>
            <div className="form-group">
              <label htmlFor="alignment">Alineamiento:</label>
              <p>{character.alignment || 'N/A'}</p>
            </div>
            <div className="form-group">
              <label htmlFor="playerName">Nombre del Jugador:</label>
              <p>{character.playerName || 'N/A'}</p>
            </div>
            <div className="form-group">
              <label htmlFor="experiencePoints">Puntos de Experiencia:</label>
              <p>{character.experiencePoints || 'N/A'}</p>
            </div>
          </div>

          <fieldset>
            <legend>Atributos</legend>
            <div className="form-group-inline">
              <label htmlFor="strength">Fuerza:</label>
              <p>{character.strength || 'N/A'}</p>
              <label htmlFor="dexterity">Destreza:</label>
              <p>{character.dexterity || 'N/A'}</p>
              <label htmlFor="constitution">Constitución:</label>
              <p>{character.constitution || 'N/A'}</p>
              <label htmlFor="intelligence">Inteligencia:</label>
              <p>{character.intelligence || 'N/A'}</p>
              <label htmlFor="wisdom">Sabiduría:</label>
              <p>{character.wisdom || 'N/A'}</p>
              <label htmlFor="charisma">Carisma:</label>
              <p>{character.charisma || 'N/A'}</p>
            </div>
          </fieldset>

          <div className="form-group-inline">
            <label htmlFor="proficiencyBonus">Bonificación por Competencia:</label>
            <p>{character.proficiencyBonus || 'N/A'}</p>
            <label htmlFor="armorClass">Clase de Armadura:</label>
            <p>{character.armorClass || 'N/A'}</p>
            <label htmlFor="initiative">Iniciativa:</label>
            <p>{character.initiative || 'N/A'}</p>
            <label htmlFor="speed">Velocidad:</label>
            <p>{character.speed || 'N/A'}</p>
          </div>

          <div className="form-group">
            <label>Puntos de Golpe:</label>
            <div className="health-bar-group-container">
              <div className="main-hp-bar-container">
                <div className="health-bar-red" style={{ width: `${currentHpPercentage}%` }}></div>
                <span className="hp-text">{currentHp} / {maxHp}</span>
              </div>
              {tempHp > 0 && (
                <div className="temp-hp-bar-container" style={{ width: `${(tempHp / maxHp) * 100}%` }}>
                  <div className="health-bar-temp"></div>
                  <span className="hp-text-temp">+{tempHp}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="hitDice">Dados de Golpe:</label>
            <p>{character.hitDice || 'N/A'}</p>
          </div>
          <div className="form-group">
            <label htmlFor="otherProficienciesAndLanguages">Otras Competencias e Idiomas:</label>
            <p>{character.otherProficienciesAndLanguages || 'N/A'}</p>
          </div>
          <div className="form-group">
            <label htmlFor="equipment">Equipo:</label>
            <p>{character.equipment || 'N/A'}</p>
          </div>
          <div className="form-group">
            <label htmlFor="featuresAndTraits">Rasgos y Atributos:</label>
            <p>{character.featuresAndTraits || 'N/A'}</p>
          </div>

          <fieldset>
            <legend>Descripción Física</legend>
            <div className="form-group-inline">
              <label htmlFor="age">Edad:</label>
              <p>{character.age || 'N/A'}</p>
              <label htmlFor="height">Altura:</label>
              <p>{character.height || 'N/A'}</p>
              <label htmlFor="weight">Peso:</label>
              <p>{character.weight || 'N/A'}</p>
            </div>
            <div className="form-group-inline">
              <label htmlFor="eyes">Ojos:</label>
              <p>{character.eyes || 'N/A'}</p>
              <label htmlFor="skin">Piel:</label>
              <p>{character.skin || 'N/A'}</p>
              <label htmlFor="hair">Pelo:</label>
              <p>{character.hair || 'N/A'}</p>
            </div>
          </fieldset>

          <div className="form-group">
            <label>Imagen:</label>
            {renderImage() || <p>N/A</p>}
          </div>

          <fieldset>
            <legend>Aptitud Mágica</legend>
            <div className="form-group">
              <label htmlFor="spellcastingAbility">Aptitud Mágica:</label>
              <p>{character.spellcastingAbility || 'N/A'}</p>
            </div>
            <div className="form-group">
              <label htmlFor="spellSaveDC">CD Tirada de Salvación de Conjuros:</label>
              <p>{character.spellSaveDC || 'N/A'}</p>
            </div>
            <div className="form-group">
              <label htmlFor="spellAttackBonus">Bonificador de Ataque de Conjuro:</label>
              <p>{character.spellAttackBonus || 'N/A'}</p>
            </div>
          </fieldset>

          <div className="form-group">
            <label htmlFor="campaign">Campaña:</label>
            <p>{character.campaign_name || 'N/A'}</p>
          </div>

          {/* MODIFIED: Button text and action are now dynamic based on IPC state */}
          <div className="modal-actions">
            {character.image && (
              <button type="button" onClick={handlePanoramicViewClick}>
                {isCharacterInPanoramic ? 'Retirar de la Vista Panorámica' : 'Enviar a Vista Panorámica'}
              </button>
            )}
            <button type="button" onClick={onClose}>Cerrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CharacterSheetModal;