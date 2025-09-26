import React from 'react';
import './MissionCard.css';

const MissionCard = ({ mission, onClick }) => {
  const getStatusClassName = (status) => {
    switch (status) {
      case 'aceptada':
        return 'status-accepted';
      case 'completada':
        return 'status-completed';
      case 'sin aceptar':
      default:
        return 'status-unaccepted';
    }
  };

  return (
    <div className="mission-card" onClick={() => onClick(mission)}>
      <div className="mission-card-header">
        <h3>{mission.title}</h3>
        <span className={`mission-card-status ${getStatusClassName(mission.status)}`}>
          {mission.status}
        </span>
      </div>
      <div className="mission-card-body">
        <p className="mission-card-type">{mission.type}</p>
        <p className="mission-card-description">{mission.description}</p>
      </div>
    </div>
  );
};

export default MissionCard;
