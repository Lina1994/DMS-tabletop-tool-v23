import React, { useState, useRef, useEffect } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useWorldpedia } from '../../contexts/WorldpediaContext';
import styles from './WorldpediaNavigationTree.module.css';

const FolderIcon = () => <span className={styles.icon}>&#128193;</span>;
const DocumentIcon = () => <span className={styles.icon}>&#128441;</span>;
const DragHandleIcon = () => <span className={styles.dragHandle}>&#x2630;</span>;

const TreeItem = ({ entry, isExpanded, onToggleFolder, renderTree }) => {
  const { selectEntry, createEntry, updateEntry, deleteEntry, selectedEntryId } = useWorldpedia();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const inputRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: entry.id });
  const { setNodeRef: dropRef, isOver } = useDroppable({
    id: entry.id,
    disabled: !entry.is_folder,
    data: { acceptsDrop: entry.is_folder },
  });

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleTitleClick = (event) => {
    // Añadir console.log aquí para depuración de clics en elementos del árbol
    console.log('Clic en elemento del árbol:', { id: entry.id, title: entry.title, isFolder: entry.is_folder });

    if (entry.is_folder) {
      onToggleFolder(entry.id);
    }
    selectEntry(entry.id);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleSaveTitle = () => {
    if (title.trim() && title !== entry.title) {
      updateEntry(entry.id, { title: title.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setTitle(entry.title); // Revert changes
      setIsEditing(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Evita que el click se propague al item
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${entry.title}"?`)) {
      deleteEntry(entry.id);
    }
  };

  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 };
  const isSelected = selectedEntryId === entry.id;

  return (
    <li ref={setNodeRef} style={style} className={styles.treeItemContainer}>
      <div ref={dropRef} className={`${styles.treeItem} ${isSelected ? styles.selected : ''} ${isOver ? styles.dropOver : ''}`}>
        <div className={styles.titleContainer}>
          <span {...listeners} {...attributes} className={styles.dragHandle}>&#x2630;</span>
          {entry.is_folder ? <FolderIcon /> : <DocumentIcon />}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              className={styles.titleInput}
            />
          ) : (
            <a
              href="#"
              data-slug={entry.slug}
              data-link-type="worldpedia"
              data-link-id={entry.id}
              onDoubleClick={handleDoubleClick}
              onClick={handleTitleClick}
              className={styles.titleText}
            >
              {entry.title}
            </a>
          )}
        </div>
        <div className={styles.itemActions}>
          {entry.is_folder && (
            <>
              <button onClick={() => createEntry('Subcarpeta', true, entry.id)} className={styles.actionButton}>+C</button>
              <button onClick={() => createEntry('Artículo', false, entry.id)} className={styles.actionButton}>+A</button>
            </>
          )}
          <button onClick={handleDelete} className={`${styles.actionButton} ${styles.deleteButton}`}>🗑️</button>
        </div>
      </div>
      {entry.is_folder && isExpanded && (
        <ul className={styles.nestedTree}>
          {renderTree(entry.id)}
        </ul>
      )}
    </li>
  );
};

export default TreeItem;