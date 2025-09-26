import React, { createContext, useReducer, useContext, useCallback } from 'react';
import { useCampaign } from './CampaignContext';
import API_BASE_URL from '../apiConfig';

const WorldpediaContext = createContext();

const initialState = {
  entries: [],
  loading: false,
  error: null,
  selectedEntryId: null,
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchError: null,
};

const worldpediaReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, entries: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SELECT_ENTRY':
      return { ...state, selectedEntryId: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload, searchResults: [], searchError: null };
    case 'SEARCH_START':
      return { ...state, searchLoading: true, searchError: null };
    case 'SEARCH_SUCCESS':
      return { ...state, searchLoading: false, searchResults: action.payload };
    case 'SEARCH_ERROR':
      return { ...state, searchLoading: false, searchError: action.payload, searchResults: [] };
    case 'UPDATE_ENTRIES':
      return { ...state, entries: action.payload };
    default:
      return state;
  }
};

export const WorldpediaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(worldpediaReducer, initialState);
  const { currentCampaign } = useCampaign();

  const API_URL = `${API_BASE_URL}/api/worldpedia`;

  const fetchEntries = useCallback(async (campaignId) => {
    if (!campaignId) return;
    dispatch({ type: 'FETCH_START' });
    try {
      const response = await fetch(`${API_URL}?campaignId=${campaignId}`);
      if (!response.ok) throw new Error('Error al cargar las entradas.');
      const data = await response.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  }, [API_URL]);

  const selectEntry = (entryId) => {
    dispatch({ type: 'SELECT_ENTRY', payload: entryId });
  };

  const createEntry = async (title, isFolder, parentId = null) => {
    if (!currentCampaign?.id) return;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title,
          is_folder: isFolder,
          parent_id: parentId,
          campaign_id: currentCampaign.id,
          content: ''
        }),
      });
      if (!response.ok) throw new Error('Error al crear la entrada.');
      await fetchEntries(currentCampaign.id);
    } catch (error) {
      console.error('createEntry error:', error);
    }
  };

  const updateEntry = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Error al actualizar la entrada.');
      const updatedEntries = state.entries.map(e => e.id === id ? { ...e, ...updates } : e);
      dispatch({ type: 'UPDATE_ENTRIES', payload: updatedEntries });
    } catch (error) {
      console.error('updateEntry error:', error);
    }
  };

  const deleteEntry = async (id) => {
    if (!currentCampaign?.id) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar la entrada.');
      await fetchEntries(currentCampaign.id);
    } catch (error) {
      console.error('deleteEntry error:', error);
    }
  };

  const moveEntry = async (entryId, newParentId) => {
    await updateEntry(entryId, { parent_id: newParentId });
  };

  const searchEntries = useCallback(async (query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });

    if (!query || !currentCampaign?.id) {
      dispatch({ type: 'SEARCH_SUCCESS', payload: [] });
      return;
    }

    dispatch({ type: 'SEARCH_START' });
    try {
      const response = await fetch(`${API_URL}/search?campaignId=${currentCampaign.id}&q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Error al buscar.');
      const data = await response.json();
      dispatch({ type: 'SEARCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'SEARCH_ERROR', payload: error.message });
    }
  }, [currentCampaign?.id, API_URL]);

  const value = {
    ...state,
    fetchEntries,
    selectEntry,
    createEntry,
    updateEntry,
    deleteEntry,
    moveEntry,
    searchEntries,
  };

  return (
    <WorldpediaContext.Provider value={value}>
      {children}
    </WorldpediaContext.Provider>
  );
};

export const useWorldpedia = () => {
  const context = useContext(WorldpediaContext);
  if (context === undefined) {
    throw new Error('useWorldpedia must be used within a WorldpediaProvider');
  }
  return context;
};