import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import OfficePlan from './OfficePlan';

// 1. Добавляем userStats в деструктуризацию пропсов
const MapContainer = ({ places, onSelectPlace, userStats }) => {
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
        initialScale={1.2} 
        centerOnInit={true}
        minScale={0.4}
        maxScale={4}
        wheel={{ 
          step: 0.02,
          smoothStep: true,
          velocityDisabled: false 
        }}
        zoomAnimation={{
          size: 3,
          animationTime: 300,
          animationType: 'easeOut'
        }}
        doubleClick={{
          step: 0.2
        }}
      >
        <TransformComponent 
          wrapperStyle={{ 
            width: '100%', 
            height: '100%',
            cursor: 'grab'
          }}
          contentStyle={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#0a0a0a'
          }}
        >
          <div style={{ width: '850px', height: '650px' }}>
            {/* 2. Пробрасываем userStats в OfficePlan */}
            <OfficePlan 
              places={places} 
              onSelectPlace={onSelectPlace} 
              userStats={userStats} 
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default MapContainer;