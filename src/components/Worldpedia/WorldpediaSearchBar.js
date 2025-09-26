import React, { useState, useEffect } from 'react';
import { useWorldpedia } from '../../contexts/WorldpediaContext';
import useDebounce from '../../hooks/useDebounce';
import styles from './WorldpediaSearchBar.module.css';

const WorldpediaSearchBar = () => {
  const { searchResults, searchLoading, searchError, searchEntries, selectEntry } = useWorldpedia();
  const [localQuery, setLocalQuery] = useState('');
  const debouncedQuery = useDebounce(localQuery, 300);

  useEffect(() => {
    // La función searchEntries ahora es async y viene del contexto
    searchEntries(debouncedQuery);
  }, [debouncedQuery, searchEntries]);

  const handleSelect = (entryId) => {
    selectEntry(entryId);
    setLocalQuery(''); // Limpia el input y los resultados
    searchEntries(''); // Limpia los resultados en el contexto
  };

  const showDropdown = localQuery && (searchResults.length > 0 || searchLoading || searchError);

  return (
    <div className={styles.searchContainer}>
      <input 
        type="text"
        placeholder="Buscar en la enciclopedia..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        className={styles.searchInput}
      />
      {showDropdown && (
        <ul className={styles.resultsDropdown}>
          {searchLoading && <li className={styles.loadingItem}>Buscando...</li>}
          {searchError && <li className={styles.errorItem}>{searchError}</li>}
          {!searchLoading && !searchError && searchResults.map(entry => (
            <li key={entry.id} onClick={() => handleSelect(entry.id)} className={styles.resultItem}>
              <span className={styles.itemIcon}>{entry.is_folder ? '📁' : '📄'}</span>
              {entry.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorldpediaSearchBar;