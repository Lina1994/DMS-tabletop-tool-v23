import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import './SearchableMultiSelector.css';

const SearchableMultiSelector = ({
    availableItems,
    selectedItems,
    onAdd,
    onRemove,
    itemType, // e.g., "Mapas", "Personajes", "Enemigos"
    searchPlaceholder,
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAvailableItems = useMemo(() => {
        // First, filter out items that are already selected
        const unselectedItems = availableItems.filter(
            item => !selectedItems.some(selected => selected.id === item.id)
        );
        // Then, filter by the search term
        return unselectedItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableItems, selectedItems, searchTerm]);

    return (
        <div className="searchable-multi-selector-container">
            <div className="search-input-group">
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="lists-container">
                <div className="available-items-section">
                    <h3>{itemType} Disponibles:</h3>
                    <ul className="available-items-list">
                        {filteredAvailableItems.length > 0 ? (
                            filteredAvailableItems.map((item) => (
                                <li key={item.id} className="list-item">
                                    <span>{item.name}</span>
                                    <button type="button" onClick={() => onAdd(item)}>Añadir</button>
                                </li>
                            ))
                        ) : (
                            <li className="list-item-empty">No se encontraron {itemType.toLowerCase()}.</li>
                        )}
                    </ul>
                </div>

                <div className="selected-items-section">
                    <h3>{itemType} Seleccionados: ({selectedItems.length})</h3>
                    <ul className="selected-items-list">
                        {selectedItems.length > 0 ? (
                            selectedItems.map((item, index) => (
                                <li key={`${item.id}-${index}`} className="list-item">
                                    <span>{item.name}</span>
                                    <button type="button" onClick={() => onRemove(index)}>Eliminar</button>
                                </li>
                            ))
                        ) : (
                            <li className="list-item-empty">No hay {itemType.toLowerCase()} seleccionados.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

SearchableMultiSelector.propTypes = {
    availableItems: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    })).isRequired,
    selectedItems: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    })).isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    itemType: PropTypes.string.isRequired,
    searchPlaceholder: PropTypes.string,
};

SearchableMultiSelector.defaultProps = {
    searchPlaceholder: 'Buscar...',
};

export default SearchableMultiSelector;
