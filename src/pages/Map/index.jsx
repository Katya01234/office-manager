import React, { useEffect, useState } from 'react';
import MapContainer from './Components/MapContainer';
import { workspaceApi } from '../../api/api';
import { MAP_SETTINGS } from './Components/MapConfig';
import { message, Spin } from 'antd';

const OfficeMapPage = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      // Параллельно загружаем список мест и текущие бронирования
      const [allWorkspaces, activeBookings] = await Promise.all([
        workspaceApi.getWorkspaces(),
        workspaceApi.getBookings()
      ]);

      // Объединяем данные: добавляем флаг бронирования к каждому месту
      const enriched = allWorkspaces.map(ws => ({
        ...ws,
        activeBookings: activeBookings.filter(b => b.workspace_id === ws.id)
      }));

      setPlaces(enriched);
    } catch (error) {
      message.error("Не удалось загрузить карту");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a' }}><Spin size="large" /></div>;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#fff', letterSpacing: '4px' }}>ОФИС: ГЛАВНЫЙ ШТАБ</h1>
        <p style={{ color: '#D4AF37' }}>Свободных мест: {places.filter(p => !p.activeBookings.length).length} / {places.length}</p>
      </div>

      <MapContainer 
        places={places} 
        onSelectPlace={(p) => {
          message.info(`Выбрано: ${p.workspace_name}`);
          // Здесь можно открывать модалку бронирования
        }} 
      />
    </div>
  );
};

export default OfficeMapPage;