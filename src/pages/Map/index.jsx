import React from 'react';
import MapContainer from './Components/MapContainer';
import { Space } from 'antd';
import { MAP_SETTINGS } from './Components/MapConfig';

const OfficeMapPage = () => {
  const { colors } = MAP_SETTINGS;

  const mockPlaces = Array.from({ length: 46 }, (_, i) => ({
    id: i + 1,
    workspace_name: `Место ${i + 1}`,
    activeBookings: (i + 1) % 6 === 0 ? [{}] : [] 
  }));

  return (
    <div style={{ padding: '0 20px', maxWidth: '1600px', margin: '0 auto', background: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '300', letterSpacing: '4px', margin: 0 }}>
            ПЛАН ОФИСА
          </h1>
          <div style={{ color: '#D4AF37', fontSize: '10px', marginTop: '4px', letterSpacing: '2px', fontWeight: '500' }}>
            ВСЕГО РАБОЧИХ МЕСТ: {mockPlaces.length}
          </div>
        </div>
        
        <Space size={40}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', background: colors.available, border: '1px solid #111' }} />
            <span style={{ color: '#fff', fontSize: '11px', fontWeight: '400', letterSpacing: '1px' }}>СВОБОДНО</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', background: colors.occupied, border: '1px solid #111' }} />
            <span style={{ color: '#666', fontSize: '11px', fontWeight: '400', letterSpacing: '1px' }}>ЗАНЯТО</span>
          </div>
        </Space>
      </div>

      <MapContainer 
        places={mockPlaces} 
        onSelectPlace={(p) => console.log("Выбрано:", p.workspace_name)} 
      />
    </div>
  );
};

export default OfficeMapPage;