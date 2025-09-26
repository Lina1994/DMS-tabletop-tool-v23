
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import './MissionGeneratorSettingsModal.css';
import API_BASE_URL from '../../apiConfig';
import generateUniqueId from '../../utils/idGenerator';

function MissionGeneratorSettingsModal({ campaignId, onClose }) {
  const [categories] = useState([
    { name: 'Lugares', key: 'lugares' },
    { name: 'NPCs', key: 'npcs' },
    { name: 'Problemas', key: 'problemas' },
    { name: 'Villanos', key: 'villanos' },
    { name: 'Recompensas', key: 'recompensas' },
    { name: 'Giros', key: 'giros' },
    { name: 'Tipos de Misión (Combate)', key: 'tiposMision_combate' },
    { name: 'Tipos de Misión (Exploración)', key: 'tiposMision_exploracion' },
    { name: 'Tipos de Misión (Social)', key: 'tiposMision_social' },
    { name: 'Tipos de Misión (Misterio)', key: 'tiposMision_misterio' },
    { name: 'Tipos de Misión (Recolección)', key: 'tiposMision_recoleccion' },
  ]);
  const [rarities] = useState(['comun', 'epica', 'legendaria']);

  const [selectedCategory, setSelectedCategory] = useState(categories[0].key);
  const [selectedRarity, setSelectedRarity] = useState(rarities[0]);
  const [entries, setEntries] = useState([]);
  const [newEntryValue, setNewEntryValue] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, [selectedCategory, selectedRarity, campaignId]);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/generator-entries/${campaignId}?category=${selectedCategory}&rarity=${selectedRarity}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching generator entries:', error);
    }
  };

  const handleAddOrUpdateEntry = async () => {
    if (!newEntryValue.trim()) return;

    try {
      if (editingEntry) {
        // Update existing entry
        const updatedEntry = {
          id: editingEntry.id,
          category: selectedCategory,
          rarity: selectedRarity,
          value: newEntryValue.trim(),
          campaign_id: campaignId,
        };
        const response = await fetch(`${API_BASE_URL}/generator-entries/${editingEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEntry),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        setEditingEntry(null);
      } else {
        // Add new entry
        const newEntry = {
          id: generateUniqueId('generatorEntry'),
          category: selectedCategory,
          rarity: selectedRarity,
          value: newEntryValue.trim(),
          campaign_id: campaignId,
        };
        const response = await fetch(`${API_BASE_URL}/generator-entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntry),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNewEntryValue('');
      fetchEntries(); // Refresh the list
    } catch (error) {
      console.error('Error adding/updating generator entry:', error);
    }
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setNewEntryValue(entry.value);
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/generator-entries/${entryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchEntries(); // Refresh the list
    } catch (error) {
      console.error('Error deleting generator entry:', error);
    }
  };

  const handleExportEntries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/generator-entries/${campaignId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const allEntries = await response.json();

      if (allEntries.length === 0) {
        alert('No hay entradas para exportar.');
        return;
      }

      const exportData = allEntries.map(entry => ({
        'Categoria': entry.category,
        'Rareza': entry.rarity,
        'Valor': entry.value,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "EntradasGenerador");
      XLSX.writeFile(workbook, `entradas_generador_${campaignId}.xlsx`);

    } catch (error) {
      console.error("Error exporting entries:", error);
      alert(`Error al exportar las entradas: ${error.message}`);
    }
  };

  const handleImportEntries = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const formattedEntries = json.map(row => {
          if (!row['Categoria'] || !row['Rareza'] || !row['Valor'] || !rarities.includes(row['Rareza']) || !categories.some(c => c.key === row['Categoria'])) {
            throw new Error(`Fila inválida o con datos faltantes: ${JSON.stringify(row)}`);
          }
          return {
            id: uuidv4(),
            campaign_id: campaignId,
            category: row['Categoria'],
            rarity: row['Rareza'],
            value: String(row['Valor']),
          };
        });

        const response = await fetch(`${API_BASE_URL}/generator-entries/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId, entries: formattedEntries }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        alert('Entradas importadas y añadidas correctamente.');
        fetchEntries(); // Refresh the current view

      } catch (error) {
        console.error("Error importing entries:", error);
        alert(`Error al importar el archivo: ${error.message}`);
      } finally {
        event.target.value = null;
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content mission-generator-settings-modal">
        <h2>Configuración del Generador de Misiones</h2>
        
        <div className="controls">
          <div className="select-group">
            <label htmlFor="category-select">Categoría:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setNewEntryValue('');
                setEditingEntry(null);
              }}
            >
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="select-group">
            <label htmlFor="rarity-select">Rareza:</label>
            <select
              id="rarity-select"
              value={selectedRarity}
              onChange={(e) => {
                setSelectedRarity(e.target.value);
                setNewEntryValue('');
                setEditingEntry(null);
              }}
            >
              {rarities.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="entry-management">
          <input
            type="text"
            value={newEntryValue}
            onChange={(e) => setNewEntryValue(e.target.value)}
            placeholder="Nueva entrada..."
            className="text-input"
          />
          <button className="button primary" onClick={handleAddOrUpdateEntry}>
            {editingEntry ? 'Actualizar Entrada' : 'Añadir Entrada'}
          </button>
          {editingEntry && (
            <button className="button secondary" onClick={() => {
              setEditingEntry(null);
              setNewEntryValue('');
            }}>
              Cancelar Edición
            </button>
          )}
        </div>

        <ul className="entries-list">
          {entries.length === 0 ? (
            <li className="no-entries">No hay entradas para esta categoría y rareza.</li>
          ) : (
            entries.map((entry) => (
              <li key={entry.id} className="entry-item">
                <span>{entry.value}</span>
                <div className="entry-actions">
                  <button className="button small" onClick={() => handleEditClick(entry)}>Editar</button>
                  <button className="button small danger" onClick={() => handleDeleteEntry(entry.id)}>Eliminar</button>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="modal-actions excel-actions">
          <input
            type="file"
            id="import-entries"
            accept=".xlsx, .xls"
            onChange={handleImportEntries}
            style={{ display: 'none' }}
          />
          <label htmlFor="import-entries" className="button">Importar de Excel</label>
          <button className="button" onClick={handleExportEntries}>Exportar a Excel</button>
        </div>

        <div className="modal-actions">
          <button className="button secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

MissionGeneratorSettingsModal.propTypes = {
  campaignId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MissionGeneratorSettingsModal;
