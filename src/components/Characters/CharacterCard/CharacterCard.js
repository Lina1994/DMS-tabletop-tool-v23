import React from 'react';
import './CharacterCard.css';

function CharacterCard({ character, onOpenSheet, onEdit, onDelete, canLevelUp }) {
  const renderImage = () => {
    if (character.image) {
      if (character.image.startsWith('data:image')) {
        return <img src={character.image} alt={character.name} className="character-card-image" />;
      } else {
        return <img src={character.image} alt={character.name} className="character-card-image" />;
      }
    }
    return <div className="character-card-image-placeholder"></div>;
  };

  const renderToken = () => {
    const tokenType = character.token_type || 'color';
    const tokenValue = character.token_value || '#add8e6';

    if (tokenType === 'image' && tokenValue) {
      return <img src={tokenValue} alt="Ficha" className="character-card-token" />;
    } else {
      return <div className="character-card-token" style={{ backgroundColor: tokenValue }}></div>;
    }
  };

  return (
    <li className="character-card">
      <div className="character-card-image-container">
        {renderImage()}
        {renderToken()}
      </div>
      <div className="character-card-info">
        <h3>
          {character.name}
          {character.is_player_character ? (
            <span className="character-type-tag pc-tag">PC</span>
          ) : (
            <span className="character-type-tag npc-tag">NPC</span>
          )}
          {canLevelUp && <span className="levelup-indicator">lvUP</span>}
        </h3>
        <p><strong>Clase:</strong> {character.class || 'N/A'}</p>
        <p><strong>Nivel:</strong> {character.level || 'N/A'}</p>
        <p><strong>Campaña:</strong> {character.campaign_name || 'N/A'}</p>
      </div>
      <div className="character-card-actions">
        <button onClick={() => onOpenSheet(character)} className="view-btn">Ver Ficha</button>
        <button onClick={() => onEdit(character)} className="edit-btn">Editar</button>
        <button onClick={() => onDelete(character.id)} className="delete-btn">Eliminar</button>
      </div>
    </li>
  );
}

export default CharacterCard;
