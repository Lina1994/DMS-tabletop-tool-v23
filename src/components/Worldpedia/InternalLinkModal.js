import React, { useEffect } from 'react';
import { useWorldpedia } from '../../contexts/WorldpediaContext';
import styles from './InternalLinkModal.module.css';

const InternalLinkModal = ({ show, onClose, onLinkInsert }) => {
  const { entries } = useWorldpedia();

  useEffect(() => {
    console.log('InternalLinkModal: show state changed to', show);
  }, [show]);

  if (!show) {
    return null;
  }

  const articles = entries.filter(entry => !entry.is_folder);

  const handleSelect = (slug) => {
    console.log('InternalLinkModal: Selected slug', slug);
    onLinkInsert(slug);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Insertar Enlace Interno</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <ul className={styles.linkList}>
            {articles.length > 0 ? (
              articles.map(article => (
                <li key={article.id} onClick={() => handleSelect(article.slug)}>
                  {article.title}
                </li>
              ))
            ) : (
              <p>No hay artículos para enlazar.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InternalLinkModal;
