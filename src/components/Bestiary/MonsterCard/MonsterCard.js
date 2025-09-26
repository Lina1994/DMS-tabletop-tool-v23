import React, { useState, useEffect, useRef } from 'react';
import './MonsterCard.css';

function MonsterCard({ monster }) { // Removed onOpenSheet and monsterImage props
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '0px 0px 100px 0px', // Pre-load images 100px before they enter the viewport
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      const currentCardRef = cardRef.current;
      if (currentCardRef) {
        observer.unobserve(currentCardRef);
      }
    };
  }, []);

  const renderImage = () => {
    if (isVisible && monster.image) {
        return <img src={monster.image} alt={monster.name} className="monster-card-image" loading="lazy" />;
    }
    return <div className="monster-card-image-placeholder"></div>;
  };

  const renderToken = () => {
    const tokenType = monster.token_type || 'color';
    const tokenValue = monster.token_value || '#ffcccb'; // Default light red

    if (tokenType === 'image' && tokenValue) {
      return <img src={tokenValue} alt="Ficha" className="monster-card-token" />;
    } else {
      return <div className="monster-card-token" style={{ backgroundColor: tokenValue }}></div>;
    }
  };

  return (
    <div className="monster-card" ref={cardRef}>
        <div className="monster-card-image-container">
            {renderImage()}
            {renderToken()}
        </div>
        <div className="monster-info">
            <h3>{monster.name}</h3>
            <p><strong>VD:</strong> {monster.vd}</p>
            <p><strong>Tipo:</strong> {monster.type}</p>
        </div>
    </div>
  );
}

export default MonsterCard;