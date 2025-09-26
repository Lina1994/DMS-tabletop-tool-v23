import React from 'react';
import './WorldMapCard.css';

const WorldMapCard = ({ map }) => {
    return (
        <div className="world-map-card">
            <h3>{map.name}</h3>
        </div>
    );
};

export default WorldMapCard;
