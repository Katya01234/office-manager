import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import OfficePlan from './OfficePlan';

const MapContainer = ({ places, onSelectPlace }) => {
  return (
    <div style={{ 
      background: '#0a0a0a', 
      width: '100%', 
      height: 'calc(100vh - 180px)', 
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #222'
    }}>
      <TransformWrapper
        initialScale={0.8}
        centerOnInit={true}
        minScale={0.5}
        maxScale={2}
      >
        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
          <div style={{ width: '1200px', height: '1000px' }}>
            <OfficePlan places={places} onSelectPlace={onSelectPlace} />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default MapContainer;