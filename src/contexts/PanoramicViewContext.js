import React, { createContext, useState, useContext } from 'react';

// 1. Crear el Contexto
const PanoramicViewContext = createContext();

// 2. Crear el Proveedor del Contexto
export const PanoramicViewProvider = ({ children }) => {
  const [panoramicCharacter, setPanoramicCharacter] = useState(null);

  // Función para limpiar el personaje de la vista panorámica
  const clearPanoramicCharacter = () => {
    setPanoramicCharacter(null);
  };

  // El valor que será accesible por los componentes consumidores
  const value = {
    panoramicCharacter,
    setPanoramicCharacter,
    clearPanoramicCharacter,
  };

  return (
    <PanoramicViewContext.Provider value={value}>
      {children}
    </PanoramicViewContext.Provider>
  );
};

// 3. Crear un Hook personalizado para usar el contexto fácilmente
export const usePanoramicView = () => {
  const context = useContext(PanoramicViewContext);
  if (context === undefined) {
    throw new Error('usePanoramicView must be used within a PanoramicViewProvider');
  }
  return context;
};
