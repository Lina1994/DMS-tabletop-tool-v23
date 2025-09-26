import React, { useState, useEffect, useCallback } from 'react';
import { useCampaign } from '../../contexts/CampaignContext';
import AddWorldMapModal from './AddWorldMapModal';
import AddMarkerModal from './AddMarkerModal';
import MarkerDetailsModal from './MarkerDetailsModal';
import ZoomPanImage from '../shared/ZoomPanImage';
import ConfirmModal from '../Campaign/ConfirmModal';
import MapMarker from './MapMarker'; // Import the new MapMarker component
import './WorldMap.css';
import API_BASE_URL from '../../apiConfig';

const WorldMap = () => {
    const { currentCampaign } = useCampaign();
    const [worldMaps, setWorldMaps] = useState([]);
    const [selectedMap, setSelectedMap] = useState(null);
    const [markers, setMarkers] = useState(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isMarkerModalOpen, setIsMarkerModalOpen] = useState(false);
    const [newMarkerPosition, setNewMarkerPosition] = useState(null);
    const [addMarkerMode, setAddMarkerMode] = useState(false);
    const [isMarkerDetailsModalOpen, setIsMarkerDetailsModalOpen] = useState(false);
    const [selectedMarkerDetails, setSelectedMarkerDetails] = useState(null);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [markerToDeleteId, setMarkerToDeleteId] = useState(null);
    const [markerToDeleteName, setMarkerToDeleteName] = useState('');

    useEffect(() => {
        if (currentCampaign) {
            fetchWorldMaps();
        }
    }, [currentCampaign]);

    useEffect(() => {
        if (selectedMap) {
            fetchMarkers();
        }
    }, [selectedMap]);

    const fetchWorldMaps = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/campaigns/${currentCampaign.id}/worldmaps`);
            if (response.ok) {
                const data = await response.json();
                setWorldMaps(data);
                if (data.length > 0) {
                    setSelectedMap(data[0]);
                }
            } else {
                console.error('Failed to fetch world maps');
            }
        } catch (error) {
            console.error('Error fetching world maps:', error);
        }
    }, [currentCampaign]);

    const fetchMarkers = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/worldmaps/${selectedMap.id}/markers`);
            if (response.ok) {
                const data = await response.json();
                setMarkers(data);
            } else {
                console.error('Failed to fetch markers');
            }
        } catch (error) {
            console.error('Error fetching markers:', error);
        }
    }, [selectedMap]);

    const handleMapSelect = (e) => {
        const mapId = e.target.value;
        const map = worldMaps.find(m => m.id === mapId);
        setSelectedMap(map);
    };

    const handleAddWorldMap = () => {
        setIsMapModalOpen(true);
    };

    const handleCloseMapModal = () => {
        setIsMapModalOpen(false);
        fetchWorldMaps();
    };

    const handleImageClick = (e) => {
        if (addMarkerMode) {
            const rect = e.target.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            setNewMarkerPosition({ x, y });
            setIsMarkerModalOpen(true);
        }
    };

    const handleCloseMarkerModal = () => {
        setIsMarkerModalOpen(false);
        setAddMarkerMode(false);
        fetchMarkers();
    };

    const toggleAddMarkerMode = () => {
        setAddMarkerMode(!addMarkerMode);
    };

    const handleOpenMarkerDetailsModal = (marker) => {
        setSelectedMarkerDetails(marker);
        setIsMarkerDetailsModalOpen(true);
    };

    const handleCloseMarkerDetailsModal = () => {
        setIsMarkerDetailsModalOpen(false);
        setSelectedMarkerDetails(null);
    };

    const handleDeleteMarker = (markerId, markerName) => {
        setMarkerToDeleteId(markerId);
        setMarkerToDeleteName(markerName);
        setIsConfirmDeleteModalOpen(true);
    };

    const confirmDeleteMarker = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/worldmaps/markers/${markerToDeleteId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete marker');
            }
            fetchMarkers();
            handleCloseMarkerDetailsModal();
            setIsConfirmDeleteModalOpen(false);
            setMarkerToDeleteId(null);
            setMarkerToDeleteName('');
        } catch (error) {
            console.error('Error deleting marker:', error);
        }
    };

    const cancelDeleteMarker = () => {
        setIsConfirmDeleteModalOpen(false);
        setMarkerToDeleteId(null);
        setMarkerToDeleteName('');
    };

    return (
        <div className="world-map-container">
            <div className="world-map-controls">
                <select onChange={handleMapSelect} value={selectedMap ? selectedMap.id : ''}>
                    {worldMaps.map(map => (
                        <option key={map.id} value={map.id}>{map.name}</option>
                    ))}
                </select>
                <button onClick={handleAddWorldMap}>Add World Map</button>
                <button onClick={toggleAddMarkerMode} className={addMarkerMode ? 'active' : ''}>
                    Add Marker
                </button>
                {addMarkerMode && <p className="add-marker-text">Click on the map to add a marker</p>}
            </div>
            <div className="world-map-content">
                {selectedMap && (
                    <ZoomPanImage
                        src={selectedMap.image_data}
                        alt={selectedMap.name}
                        disablePan={addMarkerMode}
                        onClick={handleImageClick}
                    >
                        {markers && markers.map(marker => (
                            <MapMarker 
                                key={marker.id} 
                                marker={marker} 
                                onClick={handleOpenMarkerDetailsModal} 
                            />
                        ))}
                    </ZoomPanImage>
                )}
            </div>
            {isMapModalOpen && <AddWorldMapModal onClose={handleCloseMapModal} />}
            {isMarkerModalOpen && (
                <AddMarkerModal
                    onClose={handleCloseMarkerModal}
                    worldMapId={selectedMap.id}
                    x={newMarkerPosition?.x}
                    y={newMarkerPosition?.y}
                />
            )}
            {isMarkerDetailsModalOpen && selectedMarkerDetails && (
                <MarkerDetailsModal
                    marker={selectedMarkerDetails}
                    onClose={handleCloseMarkerDetailsModal}
                    onUpdateSuccess={fetchMarkers}
                    onDelete={(id, name) => handleDeleteMarker(id, name)}
                />
            )}
            {isConfirmDeleteModalOpen && (
                <ConfirmModal
                    message={`¿Estás seguro de que quieres eliminar el marcador "${markerToDeleteName}"?`}
                    onConfirm={confirmDeleteMarker}
                    onCancel={cancelDeleteMarker}
                />
            )}
        </div>
    );
};

export default WorldMap;