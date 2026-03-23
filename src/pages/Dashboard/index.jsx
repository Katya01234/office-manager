import React, { useState, useEffect } from 'react';
import { Row, Col, message } from 'antd';
import BookingWidgets from './BookingWidgets';
import PlacesFilters from './PlacesFilters';
import PlacesTable from './PlacesTable';
import BookingModal from './BookingModal';
import HistorySidebar from './HistorySidebar';
import { mockUserStats, mockPlaces } from '../../api/mockData';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [filters, setFilters] = useState({ onlyWindow: false, minMonitors: 0, onlyQuiet: false });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPlaces(mockPlaces || []);
      setUserStats(mockUserStats || { history: [], favoritePlace: null });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  const filteredPlaces = (places || []).filter(place => {
    const feat = place.features || {};
    if (filters.onlyWindow && !feat.window) return false;
    if (filters.onlyQuiet && !feat.quietZone) return false;
    if (filters.minMonitors > 0 && (feat.monitors || 0) < filters.minMonitors) return false;
    return true;
  });

  const handleToggleFavorite = (name) => {
    if (!userStats) return;
    const isAlready = userStats.favoritePlace === name;
    setUserStats(prev => ({ ...prev, favoritePlace: isAlready ? null : name }));
    message.success(isAlready ? 'Удалено из избранного' : 'Добавлено в избранное');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000', color: '#fadb14' }}>
        <h2>Загрузка...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#000', minHeight: '100vh' }}>
      <BookingWidgets 
        userStats={userStats} 
        onCancelBooking={() => message.info('Функция отмены в разработке')} 
      />
      
      <PlacesFilters filters={filters} setFilters={setFilters} />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <PlacesTable 
            data={filteredPlaces} 
            onBook={(place) => { setSelectedPlace(place); setIsModalOpen(true); }}
            onToggleFavorite={handleToggleFavorite}
            favoritePlace={userStats?.favoritePlace}
          />
        </Col>
        <Col xs={24} lg={8}>
          <HistorySidebar history={userStats?.history || []} />
        </Col>
      </Row>

      <BookingModal 
        open={isModalOpen} 
        place={selectedPlace}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={(data) => {
          console.log('Booking data:', data);
          message.success(`Место ${selectedPlace?.name} забронировано!`);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard;