import React from 'react';
import PropTypes from 'prop-types';
import styles from './GeneratedMissionModal.module.css';

const GeneratedMissionModal = ({ 
  mission, 
  onSave, 
  onClose, 
  onRegenerate, 
  rarity, 
  rarities, 
  onRarityChange,
  onConfigure
}) => {

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Generador de Misiones</h2>

        {/* Controles de Generación */}
        <div className={styles.generatorControls}>
          <label htmlFor="generation-rarity-select" className={styles.label}>Rareza:</label>
          <select
            id="generation-rarity-select"
            value={rarity}
            onChange={onRarityChange}
            className={styles.filterSelect}
          >
            {rarities.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
          <button type="button" className={`${styles.button} ${styles.regenerateButton}`} onClick={onRegenerate}>
            Generar
          </button>
          <button type="button" className={`${styles.button} ${styles.configureButton}`} onClick={onConfigure}>
            Configurar Entradas
          </button>
        </div>

        {/* Detalles de la Misión o Mensaje de Error */}
        {mission ? (
          <div className={styles.missionDetails}>
            <h3 className={styles.missionTitle}>{mission.title}</h3>
            <div className={styles.missionDescription}>
              {mission.description.split('\n').map((line, index) => (
                <p key={index} className={styles.descriptionLine}>{line}</p>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.noMissionMessage}>
            <p>No se ha podido generar una misión.</p>
            <p>Asegúrate de tener suficientes entradas en todas las categorías para la rareza seleccionada.</p>
          </div>
        )}

        {/* Acciones Principales */}
        <div className={styles.modalActions}>
          <button 
            type="button" 
            className={`${styles.button} ${styles.saveButton}`}
            onClick={() => onSave(mission)}
            disabled={!mission} // Deshabilitar si no hay misión
          >
            Guardar Misión
          </button>
          <button type="button" className={`${styles.button} ${styles.closeButton}`} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

GeneratedMissionModal.propTypes = {
  mission: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }), // mission ya no es isRequired
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onRegenerate: PropTypes.func.isRequired,
  rarity: PropTypes.string.isRequired,
  rarities: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRarityChange: PropTypes.func.isRequired,
  onConfigure: PropTypes.func.isRequired,
};

export default GeneratedMissionModal;