import React, { useState, useEffect } from 'react';
import { useCampaign } from '../../contexts/CampaignContext';
import styles from './ExternalLinkModal.module.css';

const ENTITY_TYPES = {
  character: 'Personajes',
  monster: 'Bestiario',
  map: 'Mapas',
  mission: 'Misiones',
  spell: 'Hechizos',
};

const ExternalLinkModal = ({ show, onClose, onLinkInsert }) => {
  const { currentCampaign } = useCampaign();
  const campaignId = currentCampaign?.id;
  const [activeTab, setActiveTab] = useState('character');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!show) {
      setSearchTerm(''); // Reset search term when modal is closed or opened
    }
  }, [show]);

  useEffect(() => {
    if (!show || !campaignId) return;

    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      let url = '';
      switch (activeTab) {
        case 'character':
          url = `/campaigns/${campaignId}/characters`;
          break;
        case 'monster':
          url = '/monsters';
          break;
        case 'map':
          url = `/campaigns/${campaignId}/maps`;
          break;
        case 'mission':
          url = `/campaigns/${campaignId}/missions`;
          break;
        case 'spell':
          url = '/spells';
          break;
        default:
          setLoading(false);
          return;
      }

      try {
        const response = await fetch(`http://localhost:3001${url}`);
        if (!response.ok) {
          throw new Error(`Error al cargar datos para ${ENTITY_TYPES[activeTab]}`);
        }
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [activeTab, show, campaignId]);

  const handleSelect = (item) => {
    onLinkInsert(activeTab, item.id, item.name);
    onClose();
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!show) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Insertar Enlace Externo</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.tabs}>
            {Object.entries(ENTITY_TYPES).map(([key, name]) => (
              <button 
                key={key} 
                className={`${styles.tabButton} ${activeTab === key ? styles.active : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className={styles.tabContent}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {loading && <p>Cargando...</p>}
            {error && <p className={styles.errorText}>{error}</p>}
            {!loading && !error && (
              <ul className={styles.linkList}>
                {filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <li key={item.id} onClick={() => handleSelect(item)}>
                      {item.name}
                    </li>
                  ))
                ) : (
                  <p>No se encontraron elementos que coincidan con la búsqueda.</p>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalLinkModal;