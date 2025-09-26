import React from 'react';
import PropTypes from 'prop-types';
import './LinkedItemDisplay.css';

// A default image or icon for items that don't have one
const DefaultMiniature = ({ name }) => (
  <div className="item-miniature default-miniature">
    <span>{name.substring(0, 2)}</span>
  </div>
);

const LinkedItemDisplay = ({ label, items }) => {
  if (!items || items.length === 0) {
    return null; // Don't render the section if there are no items
  }

  return (
    <div className="linked-item-section">
      <p><strong>{label}:</strong></p>
      <div className="miniatures-container">
        {items.map(item => (
          <div key={item.id} className="item-card-miniature">
            {item.image_data || item.image ? (
              <img src={item.image_data || item.image} alt={item.name} className="item-miniature" />
            ) : (
              <DefaultMiniature name={item.name} />
            )}
            <span className="item-name">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

LinkedItemDisplay.propTypes = {
  label: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string, // For monsters
    image_data: PropTypes.string, // For maps, characters, etc.
  })).isRequired,
};

export default LinkedItemDisplay;
