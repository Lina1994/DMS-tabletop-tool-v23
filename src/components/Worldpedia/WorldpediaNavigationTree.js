import React, { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { useWorldpedia } from '../../contexts/WorldpediaContext';
import TreeItem from './TreeItem'; // Subcomponente para cada elemento
import styles from './WorldpediaNavigationTree.module.css';

const WorldpediaNavigationTree = () => {
  const { entries, moveEntry, createEntry } = useWorldpedia();
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // over.data.current contiene los datos que pasamos al hook useDroppable
      const isDropTargetFolder = over.data.current?.acceptsDrop;
      if (isDropTargetFolder) {
        moveEntry(active.id, over.id);
      }
    }
  };

  // Renderiza el árbol recursivamente
  const renderTree = (parentId = null) => {
    return entries
      .filter(entry => entry.parent_id === parentId)
      .map(entry => (
        <TreeItem 
          key={entry.id}
          entry={entry}
          isExpanded={!!expandedFolders[entry.id]}
          onToggleFolder={toggleFolder}
          renderTree={renderTree} // Pasa la función de renderizado para la recursión
        />
      ));
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className={styles.treeContainer}>
        <div className={styles.rootActions}>
          <span>Enciclopedia</span>
          <div>
            <button onClick={() => createEntry('Nueva Carpeta', true, null)} className={styles.actionButton}>+ Carpeta</button>
            <button onClick={() => createEntry('Nuevo Artículo', false, null)} className={styles.actionButton}>+ Artículo</button>
          </div>
        </div>
        <ul className={styles.treeRoot}>
          {renderTree(null)}
        </ul>
      </div>
    </DndContext>
  );
};

export default WorldpediaNavigationTree;