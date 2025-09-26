import React, { useState, useEffect } from 'react';
import './PanoramicView.css';
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

function PanoramicView() {
  const [panoramicImage, setPanoramicImage] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(null); // Nuevo estado para el color de fondo
  const { panoramicCharacter, setPanoramicCharacter, clearPanoramicCharacter } = usePanoramicView(); // Usar el contexto

  useEffect(() => {
    if (ipcRenderer) {
      // Handler for the background image
      const handlePanoramicData = (event, data) => {
        setPanoramicImage(data.panoramicDataUrl);
        setBackgroundColor(null); // Limpiar color de fondo si hay imagen
      };

      // Handler for the character overlay
      const handleCharacterChange = (event, char) => {
        setPanoramicCharacter(char); // Actualizar el estado del contexto
      };

      // Handler to clear the panoramic character
      const handleClearPanoramicCharacter = () => {
        clearPanoramicCharacter(); // Llamar a la función del contexto para limpiar
      };

      // Handler to clear the panoramic image
      const handleClearPanoramicView = () => {
        setPanoramicImage(null); // Limpiar la imagen panorámica
      };

      // Handler to set background color
      const handleSetBackgroundColor = (event, color) => {
        setPanoramicImage(null); // Asegurarse de que no haya imagen si se establece color
        setBackgroundColor(color);
      };

      // Register listeners
      ipcRenderer.on('update-panoramic-view', handlePanoramicData);
      ipcRenderer.on('panoramic-character-changed', handleCharacterChange);
      ipcRenderer.on('clear-panoramic-character', handleClearPanoramicCharacter);
      ipcRenderer.on('clear-panoramic-view', handleClearPanoramicView);
      ipcRenderer.on('set-panoramic-background-color', handleSetBackgroundColor); // Nuevo listener

      // Request initial data
      ipcRenderer.send('request-panoramic-data');

      // Cleanup
      return () => {
        ipcRenderer.removeListener('update-panoramic-view', handlePanoramicData);
        ipcRenderer.removeListener('panoramic-character-changed', handleCharacterChange);
        ipcRenderer.removeListener('clear-panoramic-character', handleClearPanoramicCharacter);
        ipcRenderer.removeListener('clear-panoramic-view', handleClearPanoramicView);
        ipcRenderer.removeListener('set-panoramic-background-color', handleSetBackgroundColor); // Limpiar nuevo listener
      };
    }
  }, [setPanoramicCharacter, clearPanoramicCharacter]); // Dependencias del useEffect

  const containerStyle = backgroundColor ? { backgroundColor: backgroundColor } : {};

  if (!panoramicImage && !backgroundColor) { // Modificado para considerar el color de fondo
    return <div className="panoramic-container">Cargando vista panorámica...</div>;
  }

  return (
    <div className="panoramic-container" style={containerStyle}>
      {panoramicImage && (
        <img src={panoramicImage} alt="Vista Panorámica" className="panoramic-image" />
      )}
      {panoramicCharacter && panoramicCharacter.image && (
        <img src={panoramicCharacter.image} alt={panoramicCharacter.name} className="overlay-image" />
      )}
    </div>
  );
}

export default PanoramicView;