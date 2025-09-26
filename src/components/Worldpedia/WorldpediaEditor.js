import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';

import styles from './WorldpediaEditor.module.css';
import { useWorldpedia } from '../../contexts/WorldpediaContext';
import InternalLinkModal from './InternalLinkModal';
import ExternalLinkModal from './ExternalLinkModal';

// Registrar módulos de Quill
Quill.register('modules/imageResize', ImageResize);
const Link = Quill.import('formats/link');

class CustomLink extends Link {
  static create(value) {
    const node = super.create(value);
    if (typeof value === 'object' && value !== null) {
      if (value['data-slug']) {
        node.setAttribute('data-slug', value['data-slug']);
        node.setAttribute('data-link-type', 'worldpedia');
      }
      if (value['data-link-type'] && value['data-link-type'] !== 'worldpedia') {
        node.setAttribute('data-link-type', value['data-link-type']);
      }
      if (value['data-link-id']) {
        node.setAttribute('data-link-id', value['data-link-id']);
      }
      if (value.href) {
        node.setAttribute('href', value.href);
      }
    }
    return node;
  }

  static formats(node) {
    let format = super.formats(node);
    if (typeof format === 'string') {
      format = { href: format };
    }
    if (node.hasAttribute('data-slug')) {
      format['data-slug'] = node.getAttribute('data-slug');
    }
    if (node.hasAttribute('data-link-type')) {
      format['data-link-type'] = node.getAttribute('data-link-type');
    }
    if (node.hasAttribute('data-link-id')) {
      format['data-link-id'] = node.getAttribute('data-link-id');
    }
    return format;
  }
}

Quill.register('formats/link', CustomLink, true);

const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

const WorldpediaEditor = ({ selectedEntry, onNavigate, onOpenCharacterSheet, onOpenMonsterSheet, onOpenMapSheet, onOpenMissionSheet, onOpenSpellSheet }) => {
  const { updateEntry } = useWorldpedia();
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const quillRef = useRef(null);

  const [showInternalLinkModal, setShowInternalLinkModal] = useState(false);
  const [showExternalLinkModal, setShowExternalLinkModal] = useState(false);
  const savedRange = useRef(null);

  useEffect(() => {
    if (selectedEntry) {
      setContent(selectedEntry.content || '');
      setIsDirty(false);
    } else {
      setContent('');
    }
  }, [selectedEntry]);

  const handleContentChange = (value) => {
    setContent(value);
    if (!isDirty) {
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    if (!selectedEntry || !isDirty) return;
    try {
      await updateEntry(selectedEntry.id, { content });
      setIsDirty(false);
      console.log('Entrada guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar la entrada:', error);
    }
  };

  const imageHandler = () => {
    if (ipcRenderer) {
      ipcRenderer.send('worldpedia:open-image-dialog');
    }
  };

  const internalLinkHandler = () => {
    const quill = quillRef.current.getEditor();
    savedRange.current = quill.getSelection(true);
    setShowInternalLinkModal(true);
  };

  const externalLinkHandler = () => {
    const quill = quillRef.current.getEditor();
    savedRange.current = quill.getSelection(true);
    setShowExternalLinkModal(true);
  };

  const handleInternalLinkInsert = (slug, title) => {
    const quill = quillRef.current.getEditor();
    const range = savedRange.current;
    if (!range) return;

    quill.setSelection(range.index, range.length);
    const selectedText = quill.getText(range.index, range.length) || title;

    if (range.length > 0) {
      quill.deleteText(range.index, range.length);
    }
    
    quill.insertText(range.index, selectedText, 'link', {
      href: '#',
      'data-slug': slug,
      'data-link-type': 'worldpedia'
    });
    quill.setSelection(range.index + selectedText.length);
    savedRange.current = null;
  };

  const handleExternalLinkInsert = (type, id, name) => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    const selectedText = quill.getText(range.index, range.length) || name;

    if (range && range.length > 0) {
      quill.deleteText(range.index, range.length);
    }

    quill.insertText(range.index, selectedText, 'link', {
      href: 'javascript:void(0);',
      'data-link-type': type,
      'data-link-id': id,
    });
    quill.setSelection(range.index + selectedText.length);
  };

  useEffect(() => {
    if (!ipcRenderer) return;
    const handleImageSelected = async (event, { success, fileData, error }) => {
      if (!success) {
        console.error('Error al seleccionar imagen:', error);
        return;
      }
      try {
        const response = await fetch('http://localhost:3001/api/worldpedia/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: fileData }),
        });
        if (!response.ok) throw new Error('Error al subir la imagen al servidor.');
        const result = await response.json();
        if (result.success && result.url) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', result.url);
        }
      } catch (uploadError) {
        console.error('Error en el proceso de subida de imagen:', uploadError);
      }
    };
    ipcRenderer.on('worldpedia:image-selected', handleImageSelected);
    return () => {
      ipcRenderer.removeListener('worldpedia:image-selected', handleImageSelected);
    };
  }, []);

  useEffect(() => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const editorElement = quill.root;

    const handleClick = (event) => {
      const target = event.target.closest('a');
      if (!target) return;

      const linkType = target.getAttribute('data-link-type');
      if (!linkType) return;

      event.preventDefault();
      event.stopPropagation();

      const id = target.getAttribute('data-link-id');
      const slug = target.getAttribute('data-slug');

      console.log(`Editor Click: type=${linkType}, id=${id}, slug=${slug}`);

      switch (linkType) {
        case 'worldpedia':
          if (slug) onNavigate(slug);
          break;
        case 'character':
          if (id) onOpenCharacterSheet(id);
          break;
        case 'monster':
          if (id) onOpenMonsterSheet(id);
          break;
        case 'map':
          if (id) onOpenMapSheet(id);
          break;
        case 'mission':
          if (id) onOpenMissionSheet(id);
          break;
        case 'spell':
          if (id) onOpenSpellSheet(id);
          break;
        default:
          console.warn('Unknown link type:', linkType);
      }
    };

    editorElement.addEventListener('click', handleClick);
    return () => {
      editorElement.removeEventListener('click', handleClick);
    };
  }, [quillRef, onNavigate, onOpenCharacterSheet, onOpenMonsterSheet, onOpenMapSheet, onOpenMissionSheet, onOpenSpellSheet]);

  const modules = useMemo(() => ({
    toolbar: {
      container: '#toolbar',
      handlers: {
        image: imageHandler,
        internalLink: internalLinkHandler,
        externalLink: externalLinkHandler,
      },
    },
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize']
    }
  }), []);

  if (!selectedEntry) {
    return <div className={styles.placeholder}>Selecciona un artículo o crea uno nuevo.</div>;
  }

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorHeader}>
        <h1>{selectedEntry.title}</h1>
        <button onClick={handleSave} disabled={!isDirty} className={styles.saveButton}>
          {isDirty ? 'Guardar Cambios' : 'Guardado'}
        </button>
      </div>

      <CustomToolbar />
      <ReactQuill 
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleContentChange}
        modules={modules}
        className={styles.quillEditor}
      />

      <InternalLinkModal 
        show={showInternalLinkModal}
        onClose={() => setShowInternalLinkModal(false)}
        onLinkInsert={handleInternalLinkInsert}
      />

      <ExternalLinkModal
        show={showExternalLinkModal}
        onClose={() => setShowExternalLinkModal(false)}
        onLinkInsert={handleExternalLinkInsert}
      />
    </div>
  );
};

const CustomToolbar = () => (
  <div id="toolbar">
    <span className="ql-formats">
      <select className="ql-header" defaultValue="">
        <option value="1">Título 1</option>
        <option value="2">Título 2</option>
        <option value="3">Título 3</option>
        <option value="">Normal</option>
      </select>
    </span>
    <span className="ql-formats">
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <button className="ql-underline"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-list" value="ordered"></button>
      <button className="ql-list" value="bullet"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-link"></button>
      <button className="ql-image"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-internalLink">Enlace Interno</button>
      <button className="ql-externalLink">Enlace Externo</button>
    </span>
  </div>
);

export default WorldpediaEditor;