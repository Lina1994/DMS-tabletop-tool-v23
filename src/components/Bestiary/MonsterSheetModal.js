import React, { useState, useEffect, useRef } from 'react';
import './MonsterSheetModal.css';
import { usePanoramicView } from '../../contexts/PanoramicViewContext'; // Importar el contexto

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

function MonsterSheetModal({ onClose, monster, onUpdateMonster, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMonster, setEditedMonster] = useState(monster);
  const modalRef = useRef(null);

  // --- INICIO DE LA MODIFICACIÓN ---
  const { panoramicCharacter, setPanoramicCharacter } = usePanoramicView(); // Usar el contexto

  useEffect(() => {
    if (ipcRenderer) {
      const handleCharacterChange = (event, char) => { // Este manejador ahora puede recibir un monstruo o personaje
        setPanoramicCharacter(char);
      };

      ipcRenderer.on('panoramic-character-changed', handleCharacterChange);
      ipcRenderer.send('request-panoramic-character'); // Request initial state

      return () => {
        ipcRenderer.removeListener('panoramic-character-changed', handleCharacterChange);
      };
    }
  }, [setPanoramicCharacter]);
  // --- FIN DE LA MODIFICACIÓN ---

  useEffect(() => {
    setEditedMonster(monster);
  }, [monster]);

  useEffect(() => {
    if (modalRef.current) {
      const styles = window.getComputedStyle(modalRef.current);
      console.log('Modal classes:', modalRef.current.className);
      console.log('Modal width:', styles.width);
      console.log('Modal max-width:', styles.maxWidth);
    }
  }, [monster]);

  if (!monster) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedMonster(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSave = () => {
    onUpdateMonster(editedMonster);
    setIsEditing(false);
    onClose();
  };

  const handleCancel = () => {
    setEditedMonster(monster); // Reset to original monster data
    setIsEditing(false);
  };

  const renderField = (label, name, value) => {
    if (isEditing) {
      return (
        <div className="form-group">
          <label htmlFor={name}>{label}:</label>
          {name === 'traits' || name === 'actions' || name === 'legendaryActions' || name === 'reactions' || name === 'description' ? (
            <textarea id={name} name={name} value={value || ''} onChange={handleChange}></textarea>
          ) : (
            <input type="text" id={name} name={name} value={value || ''} onChange={handleChange} />
          )}
        </div>
      );
    } else {
      return <p><strong>{label}:</strong> {value}</p>;
    }
  };

  // --- INICIO DE LA MODIFICACIÓN ---
  // Determinar si el monstruo actual es el que está en la vista panorámica
  const isMonsterInPanoramic = panoramicCharacter && panoramicCharacter.id === monster.id;

  const handlePanoramicViewClick = () => {
    if (ipcRenderer) {
      if (isMonsterInPanoramic) {
        ipcRenderer.send('update-panoramic-character', null); // Retirar el monstruo
      } else {
        // Enviar el monstruo a la vista panorámica. Asegurarse de que tenga 'image' y 'name'.
        ipcRenderer.send('update-panoramic-character', {
          id: monster.id,
          name: monster.name,
          image: monster.image // Asumiendo que el monstruo tiene una propiedad 'image'
        });
      }
    }
  };
  // --- FIN DE LA MODIFICACIÓN ---

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Nuevo contenedor para el botón de vista panorámica, similar al de CharacterSheetModal */}
      {monster.image && (
        <div className="panoramic-action-button-container">
          <button
            type="button"
            onClick={handlePanoramicViewClick}
            className="panoramic-view-btn"
          >
            {isMonsterInPanoramic ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.09 18.09 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.09 18.09 0 0 1-2.06 2.94M1 1l22 22"></path><path d="M10.5 10.5c-.92.92-1.5 2.12-1.5 3.5a3.5 3.5 0 0 0 3.5 3.5c1.38 0 2.58-.58 3.5-1.5"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
          </button>
        </div>
      )}

      <div ref={modalRef} className="modal-content monster-sheet-modal-content" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <input type="text" name="name" value={editedMonster.name || ''} onChange={handleChange} className="monster-name-edit" />
        ) : (
          <h2>{monster.name}</h2>
        )}
        <div className="monster-details-grid">
          {monster.image && (
            <div className="monster-image-container">
              <img src={monster.image} alt={monster.name} className="monster-image-sheet" />
            </div>
          )}
          <div className="detail-group">
            {renderField('VD', 'vd', editedMonster.vd)}
            {renderField('Tipo', 'type', editedMonster.type)}
            {renderField('Alineamiento', 'alignment', editedMonster.alignment)}
            {renderField('Origen', 'origin', editedMonster.origin)}
            {renderField('Tamaño', 'size', editedMonster.size)}
            {renderField('PX', 'px', editedMonster.px)}
            {renderField('Armadura', 'armor', editedMonster.armor)}
            {renderField('Puntos de golpe', 'hp', editedMonster.hp)}
            {renderField('Velocidad', 'speed', editedMonster.speed)}
          </div>

          <div className="detail-group">
            <h3>Estadísticas</h3>
            {renderField('FUE', 'str', editedMonster.str)}
            {renderField('DES', 'dex', editedMonster.dex)}
            {renderField('CONS', 'con', editedMonster.con)}
            {renderField('INT', 'int', editedMonster.int)}
            {renderField('SAB', 'wis', editedMonster.wis)}
            {renderField('CAR', 'car', editedMonster.car)}
          </div>

          <div className="detail-group full-width">
            {renderField('Tiradas de salvación', 'savingThrows', editedMonster.savingThrows)}
            {renderField('Habilidades', 'skills', editedMonster.skills)}
            {renderField('Sentidos', 'senses', editedMonster.senses)}
            {renderField('Idiomas', 'languages', editedMonster.languages)}
            {renderField('Resistencias al daño', 'damageResistances', editedMonster.damageResistances)}
            {renderField('Inmunidades al daño', 'damageImmunities', editedMonster.damageImmunities)}
            {renderField('Inmunidades al estado', 'conditionImmunities', editedMonster.conditionImmunities)}
            {renderField('Vulnerabilidades al daño', 'damageVulnerabilities', editedMonster.damageVulnerabilities)}
          </div>

          <div className="detail-group full-width">
            <h3>Rasgos</h3>
            {renderField('Rasgos', 'traits', editedMonster.traits)}
          </div>
          <div className="detail-group full-width">
            <h3>Acciones</h3>
            {renderField('Acciones', 'actions', editedMonster.actions)}
          </div>
          <div className="detail-group full-width">
            <h3>Acciones legendarias</h3>
            {renderField('Acciones legendarias', 'legendaryActions', editedMonster.legendaryActions)}
          </div>
          <div className="detail-group full-width">
            <h3>Reacciones</h3>
            {renderField('Reacciones', 'reactions', editedMonster.reactions)}
          </div>
          <div className="detail-group full-width">
            <h3>Descripción</h3>
            {renderField('Descripción', 'description', editedMonster.description)}
          </div>
          {isEditing && (
            <div className="detail-group full-width">
              {renderField('URL de la Imagen', 'image', editedMonster.image)}
            </div>
          )}
        </div>
        <div className="modal-actions">
          {isEditing ? (
            <>
              <button type="button" onClick={handleSave}>Guardar</button>
              <button type="button" onClick={handleCancel}>Cancelar</button>
            </>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)}>Editar</button>
          )}
          <button type="button" onClick={() => onDelete(monster.id, monster.name)}>Eliminar</button>
          <button type="button" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default MonsterSheetModal;