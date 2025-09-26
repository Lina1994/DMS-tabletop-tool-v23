import React, { useState, useEffect } from 'react';
import DraggableToken from '../Combat/DraggableToken'; // Import the DraggableToken component
import './PlayerView.css';
import '../Combat/DraggableToken.css'; // Import the token styles

const ipcRenderer = window.require && window.require('electron') ? window.require('electron').ipcRenderer : null;

function PlayerView() {
  const [currentMap, setCurrentMap] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(50);
  const [gridOffsetX, setGridOffsetX] = useState(0);
  const [gridOffsetY, setGridOffsetY] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [currentCombatantId, setCurrentCombatantId] = useState(null);
  const [manuallySelectedCombatantId, setManuallySelectedCombatantId] = useState(null);

  useEffect(() => {
    if (ipcRenderer) {
      const handleUpdateMap = (event, mapData) => {
        setCurrentMap(mapData);
        setShowGrid(mapData.showGrid || false);
        setGridSize(mapData.gridSize || 50);
        setGridOffsetX(mapData.gridOffsetX || 0);
        setGridOffsetY(mapData.gridOffsetY || 0);
        setTokens(mapData.combatTokens || []);
        setCurrentCombatantId(mapData.currentCombatantId || null);
        setManuallySelectedCombatantId(mapData.manuallySelectedCombatantId || null);
      };

      const handleTokensUpdated = (event, receivedTokens) => {
        setTokens(receivedTokens);
      };

      ipcRenderer.on('update-player-map', handleUpdateMap);
      ipcRenderer.on('tokens-updated', handleTokensUpdated);

      return () => {
        ipcRenderer.removeListener('update-player-map', handleUpdateMap);
        ipcRenderer.removeListener('tokens-updated', handleTokensUpdated);
      };
    }
  }, []);

  useEffect(() => {
    const sendDimensions = () => {
      if (ipcRenderer) {
        ipcRenderer.send('player-window-resize', { 
          width: window.innerWidth, 
          height: window.innerHeight 
        });
      }
    };

    const interval = setInterval(sendDimensions, 1000);
    window.addEventListener('resize', sendDimensions);
    sendDimensions();

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', sendDimensions);
    };
  }, []);

  const imageSource = currentMap ? (currentMap.image_data || currentMap.imageDataUrl || currentMap.imagePath || currentMap.url) : '';

  const getGridOverlayStyle = () => {
    return {
      backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
      backgroundImage: `
        linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`,
    };
  };

  // A dummy function since players can't move tokens
  const handleDummyUpdate = () => {};

  return (
    <div className="player-view-container">
      {currentMap ? (
        <div className="map-display">
          {imageSource ? (
            <div
              className="map-and-tokens-wrapper"
              style={{
                transform: `translate(${currentMap.panX}px, ${currentMap.panY}px) scale(${currentMap.zoom}) rotate(${currentMap.rotation}deg)`,
                transformOrigin: 'center',
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}
            >
              <img
                src={imageSource}
                alt={currentMap.name}
                className="player-map-image"
              />
              {showGrid && (
                <div className="grid-overlay" style={getGridOverlayStyle()}></div>
              )}
              {/* Use DraggableToken for rendering */}
              {tokens.filter(t => t.isOnMap).map(token => (
                <DraggableToken
                  key={token.id}
                  token={token}
                  onUpdatePosition={handleDummyUpdate} // Players can't move tokens
                  mapRotation={currentMap.rotation}
                  mapZoom={currentMap.zoom}
                  gridSize={gridSize}
                  isCurrentTurn={token.id === currentCombatantId}
                  isManuallySelected={token.id === manuallySelectedCombatantId}
                />
              ))}
            </div>
          ) : (
            <p>No hay imagen para mostrar.</p>
          )}
        </div>
      ) : (
        <p>Esperando que el Master seleccione un mapa...</p>
      )}
    </div>
  );
}

export default PlayerView;