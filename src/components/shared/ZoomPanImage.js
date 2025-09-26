import React, { useState, useRef, useEffect } from 'react';
import './ZoomPanImage.css';

const ZoomPanImage = ({ src, alt, disablePan, children, onTransformChange, onClick }) => {
  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const isPanning = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (onTransformChange) {
      onTransformChange(transform);
    }
  }, [transform, onTransformChange]);

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAmount = 0.1;
    const newScale = transform.scale - e.deltaY * scaleAmount * 0.01;
    const clampedScale = Math.min(Math.max(0.5, newScale), 4);

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; // Mouse X relative to container
    const mouseY = e.clientY - rect.top;  // Mouse Y relative to container

    // Calculate new translation to keep the point under the mouse stationary
    const scaleRatio = clampedScale / transform.scale;

    const newTranslateX = mouseX - (mouseX - transform.translateX) * scaleRatio;
    const newTranslateY = mouseY - (mouseY - transform.translateY) * scaleRatio;

    setTransform({
      scale: clampedScale,
      translateX: newTranslateX,
      translateY: newTranslateY,
    });
  };

  const handleMouseDown = (e) => {
    if (disablePan) return;
    e.preventDefault();
    isPanning.current = true;
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
    containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    if (disablePan) return;
    isPanning.current = false;
    containerRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e) => {
    if (!isPanning.current || disablePan) return;
    const deltaX = e.clientX - lastMousePosition.current.x;
    const deltaY = e.clientY - lastMousePosition.current.y;

    setTransform((prevTransform) => ({
      ...prevTransform,
      translateX: prevTransform.translateX + deltaX,
      translateY: prevTransform.translateY + deltaY,
    }));

    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseLeave = () => {
    if (disablePan) return;
    isPanning.current = false;
     containerRef.current.style.cursor = 'grab';
  };

  const handleImageClick = (e) => {
    if (onClick) {
        onClick(e);
    }
  };


  return (
    <div
      className="zoom-pan-container"
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleImageClick}
    >
      <div
        style={{
          transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
        {children}
      </div>
    </div>
  );
};

export default ZoomPanImage;