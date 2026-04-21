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
        // Увеличиваем начальный масштаб, чтобы карта не была маленькой при загрузке
        initialScale={1.2} 
        centerOnInit={true}
        minScale={0.4}
        maxScale={4}
        // Настройки для максимально плавного и медленного зума
        wheel={{ 
          step: 0.02,          // Еще сильнее уменьшили шаг (был 0.05)
          smoothStep: true,    // Плавный переход между шагами
          velocityDisabled: false 
        }}
        // Настройка инерции и анимации
        zoomAnimation={{
          size: 3,             // Количество кадров анимации (больше — плавнее)
          animationTime: 300,  // Длительность анимации в мс
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
          {/* Убедитесь, что размеры здесь совпадают с viewBox в OfficePlan */}
          <div style={{ width: '850px', height: '650px' }}>
            <OfficePlan places={places} onSelectPlace={onSelectPlace} />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default MapContainer;