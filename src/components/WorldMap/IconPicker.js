import React from 'react';
import PropTypes from 'prop-types';
import { ICONS } from './markerIcons';
import './IconPicker.css';

const IconPicker = ({ value, onChange, color }) => {
  return (
    <div className="icon-picker-container">
      <label>Icono</label>
      <div className="icon-picker-grid">
        {Object.keys(ICONS).map(iconName => {
          const IconComponent = ICONS[iconName];
          const isActive = value === iconName;
          return (
            <button
              type="button"
              key={iconName}
              className={`icon-picker-button ${isActive ? 'active' : ''}`}
              onClick={() => onChange(iconName)}
              title={iconName}
            >
              <svg 
                viewBox="0 0 24 24" 
                className="icon-picker-svg"
                style={{ fill: color }}
              >
                <IconComponent />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};

IconPicker.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
};

export default IconPicker;
