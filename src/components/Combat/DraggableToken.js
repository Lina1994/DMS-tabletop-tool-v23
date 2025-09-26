import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import './DraggableToken.css';

const DraggableToken = ({ token, onUpdatePosition, onInitiateTokenPlacement, mapRotation, mapZoom, gridSize, isCurrentTurn, isManuallySelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: token.x, y: token.y });
  const tokenRef = useRef(null);
  
  const initialDragState = useRef({
    // Store the initial mouse position in screen coordinates
    startClientX: 0,
    startClientY: 0,
    // Store the initial token position in its local coordinates
    initialTokenX: 0,
    initialTokenY: 0,
  });

  // Sync local position with parent prop changes, but only when not dragging
  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: token.x, y: token.y });
    }
  }, [token.x, token.y, isDragging]);

  const handleMouseMove = useCallback((moveEvent) => {
    moveEvent.preventDefault();
    moveEvent.stopPropagation();

    // Calculate mouse movement in screen coordinates
    const deltaX = moveEvent.clientX - initialDragState.current.startClientX;
    const deltaY = moveEvent.clientY - initialDragState.current.startClientY;

    // To make the token move correctly on a rotated and zoomed map,
    // we need to transform the screen-space delta into the map's coordinate space.
    const rotationInRadians = -mapRotation * Math.PI / 180; // Inverse rotation

    // 1. Un-rotate the delta vector
    const unrotatedDeltaX = deltaX * Math.cos(rotationInRadians) - deltaY * Math.sin(rotationInRadians);
    const unrotatedDeltaY = deltaX * Math.sin(rotationInRadians) + deltaY * Math.cos(rotationInRadians);

    // 2. Un-zoom the delta vector
    const unzoomedDeltaX = unrotatedDeltaX / mapZoom;
    const unzoomedDeltaY = unrotatedDeltaY / mapZoom;

    // 3. Add the transformed delta to the initial token position
    const newX = initialDragState.current.initialTokenX + unzoomedDeltaX;
    const newY = initialDragState.current.initialTokenY + unzoomedDeltaY;

    setPosition({ x: newX, y: newY });

  }, [mapRotation, mapZoom]);

  const handleMouseUp = useCallback(() => {
    const { x, y } = position; // Use the final local position
    
    // Snap to grid on release
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    // Center the token in the grid cell
    const centeredX = snappedX + (gridSize * 0.05);
    const centeredY = snappedY + (gridSize * 0.05);

    onUpdatePosition(token.id, { x: centeredX, y: centeredY });
    setIsDragging(false);
  }, [position, gridSize, onUpdatePosition, token.id]);

  // Effect to add/remove global event listeners for smooth dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token.isOnMap) {
      // If token is in the sidebar, initiate placement mode
      if (onInitiateTokenPlacement) {
        onInitiateTokenPlacement(token.id);
      }
      return;
    }

    // If token is on the map, start dragging
    initialDragState.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialTokenX: token.x,
      initialTokenY: token.y,
    };

    setIsDragging(true);
  };

  const renderTokenContent = () => {
    const tokenType = token.token_type || 'color';
    const tokenValue = token.token_value;

    if (tokenType === 'image' && tokenValue) {
      return <img src={tokenValue} alt={token.name} className="token-image" draggable="false" />;
    } else {
      const defaultColor = token.type === 'character' ? '#add8e6' : '#ffcccb';
      return <div className="token-color-fill" style={{ backgroundColor: tokenValue || defaultColor }}></div>;
    }
  };

  const dynamicTokenStyle = token.isOnMap && gridSize ? {
    width: `${gridSize * 0.9}px`,
    height: `${gridSize * 0.9}px`,
  } : {};

  const style = token.isOnMap
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'absolute',
        transform: `rotate(${mapRotation}deg)`,
        ...dynamicTokenStyle
      }
    : {};

  return (
    <div
      ref={tokenRef}
      className={`draggable-token ${token.type} ${isDragging ? 'dragging' : ''} ${isCurrentTurn ? 'current-turn' : ''} ${isManuallySelected ? 'manually-selected' : ''}`}
      style={style}
      onMouseDown={handleMouseDown}
    >
      <div className="token-visual-container">
        <span className="token-name-top">{token.name}</span>
        {renderTokenContent()}
        <span className="token-name-bottom">{token.name}</span>
      </div>
    </div>
  );
};

DraggableToken.propTypes = {
  token: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['character', 'monster']).isRequired,
    token_type: PropTypes.string,
    token_value: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    isOnMap: PropTypes.bool.isRequired,
  }).isRequired,
  onUpdatePosition: PropTypes.func.isRequired,
  isManuallySelected: PropTypes.bool,
};

DraggableToken.defaultProps = {
  mapRotation: 0,
  mapZoom: 1,
  gridSize: 50,
  onInitiateTokenPlacement: () => {},
  token: {
    x: 0,
    y: 0,
  },
  isCurrentTurn: false,
  isManuallySelected: false,
};

export default DraggableToken;
