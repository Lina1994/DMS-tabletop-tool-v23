import React from 'react';
import PropTypes from 'prop-types';
import { ICONS } from './markerIcons';
import './MapMarker.css';

const MapMarker = ({ marker, onClick }) => {
  const { x, y, name, icon_type, icon_color } = marker;

  const IconComponent = ICONS[icon_type] || ICONS.circle;
  const color = icon_color || '#ff0000';

  return (
    <div
      className="map-marker-container"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
      }}
      title={name}
      onClick={() => onClick(marker)}
    >
      <svg 
        viewBox="0 0 24 24" 
        className="map-marker-svg"
        style={{ fill: color }}
      >
        <IconComponent />
      </svg>
    </div>
  );
};

MapMarker.propTypes = {
  marker: PropTypes.shape({
    id: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    icon_type: PropTypes.string,
    icon_color: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default MapMarker;
