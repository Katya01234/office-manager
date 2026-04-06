import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, message, Spin, Layout } from 'antd';
import dayjs from 'dayjs';

// Импорт компонентов
import BookingWidgets from "./components/BookingWidgets.jsx";
import PlacesFilters from "./components/PlacesFilters.jsx";
import PlacesTable from "./components/PlacesTable.jsx";
import BookingModal from "./components/BookingModal.jsx";
import HistorySidebar from "./components/HistorySidebar.jsx";

const { Content } = Layout;

const API_BASE = 'http://localhost:8080/api/v1';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [userStats, setUserStats] = useState({ history: [], favoritePlace: null });
  const [filters, setFilters] = useState({ onlyWindow: false, minMonitors: 0, onlyQuiet: false });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- ЛОГИКА РАСЧЕТА СВОБОДНЫХ СЛОТОВ ---
  const calculateFreeSlots = (bookings = []) => {
    const startDay = dayjs().set('hour', 9).set('minute', 0);
    const endDay = dayjs().set('hour', 22).set('minute', 0);
    
    const sorted = [...bookings].sort((a, b) => 
      dayjs(a.start_datetime).diff(dayjs(b.start_datetime))
    );

    let freeSlots = [];
    let currentPos = startDay;

    sorted.forEach(booking => {
      const bStart = dayjs(booking.start_datetime);
      const bEnd = dayjs(booking.end_datetime);

      if (bStart.isAfter(currentPos)) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${bStart.format('HH:mm')}`);
      }
      if (bEnd.isAfter(currentPos)) {
        currentPos = bEnd;
      }
    });

    if (currentPos.isBefore(endDay)) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
    }

    return freeSlots.length > 0 ? freeSlots : ["Нет окон"];
  };

  // --- ОБРАБОТКА ДАННЫХ ---
  const processData = useCallback((workspaces, allBookings, favourite, history) => {
    const enrichedPlaces = workspaces.map(ws => {
      const wsBookings = allBookings.filter(b => b.workspace_id === ws.id);
      return {
        ...ws,
        key: ws.id,
        activeBookings: wsBookings,
        freeSlots: calculateFreeSlots(wsBookings),
        features: {
          window: ws.description?.toLowerCase().includes('окно') || 
                  ws.equipment?.some(e => e.toLowerCase().includes('окно')),
          monitors: ws.equipment?.filter(e => e.toLowerCase().includes('монитор')).length || 0,
          quietZone: ws.description?.toLowerCase().includes('тихая')
        }
      };
    });

    setPlaces(enrichedPlaces);
    setUserStats({
      history: history || [],
      favoritePlace: favourite?.name || null
    });
  }, []);

  // --- ЗАГРУЗКА ДАННЫХ ---
  const loadData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [wsRes, bookRes, favRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/workspaces`, { headers }),
        fetch(`${API_BASE}/bookings`, { headers }),
        fetch(`${API_BASE}/workspaces/favourite`, { headers }),
        fetch(`${API_BASE}/bookings/history`, { headers })
      ]);

      if (!wsRes.ok) throw new Error('Бэкенд не доступен');

      const workspaces = await wsRes.json();
      const allBookings = await bookRes.json();
      const favourite = await favRes.json();
      const history = await histRes.json();

      processData(workspaces, allBookings, favourite, history);

    } catch (err) {
      console.warn("Использую тестовые данные для Дашборда");
      
      const mockWorkspaces = [
        { id: 1, name: 'A-101', description: 'Тихая зона у окна', equipment: ['Монитор', 'Монитор', 'Окно'], status: 'available' },
        { id: 2, name: 'B-202', description: 'Open Space', equipment: ['Монитор'], status: 'available' },
        { id: 3, name: 'C-303', description: 'Место в центре зала', equipment: ['Монитор'], status: 'available' },
        { id: 4, name: 'D-404', description: 'Тихая зона', equipment: ['Монитор', 'Лампа'], status: 'available' },
      ];

      const mockBookings = [
        { id: 10, workspace_id: 1, start_datetime: dayjs().set('hour', 10).toISOString(), end_datetime: dayjs().set('hour', 12).toISOString() },
      ];

      processData(mockWorkspaces, mockBookings, { name: 'A-101' }, []);
    } finally {
      setLoading(false);
    }
  }, [processData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- ОБРАБОТКА БРОНИРОВАНИЯ ---
  const handleConfirmBooking = async (bookingValues) => {
    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          workspace_id: selectedPlace.id,
          start_datetime: bookingValues.start.toISOString(),
          end_datetime: bookingValues.end.toISOString()
        })
      });

      if (response.ok) {
        message.success(`Место ${selectedPlace?.name} забронировано!`);
        setIsModalOpen(false);
        loadData(); 
        return;
      }
      throw new Error();
    } catch (e) {
    setTimeout(() => {
      const newBooking = {
        id: Math.random(),
        workspace_name: selectedPlace.name,
        start_datetime: bookingValues.start.toISOString(),
        end_datetime: bookingValues.end.toISOString(),
        status: 'confirmed'
      };

      setUserStats(prev => ({
        ...prev,
        history: [newBooking, ...prev.history]
      }));

      message.success(`[TEST] ${selectedPlace.name} забронировано!`);
      setIsModalOpen(false);
      setLoading(false);
    }, 300); 
  }
};

  // --- ОТМЕНА БРОНИ ---
  const handleCancelBooking = (id) => {
    setUserStats(prev => ({
      ...prev,
      history: prev.history.filter(booking => booking.id !== id)
    }));
    message.info('Бронирование завершено');
  };

  // --- ИЗБРАННОЕ ---
  const handleToggleFavorite = (id) => {
    const clickedPlace = places.find(p => p.id === id);
    if (!clickedPlace) return;

    setUserStats(prev => {
      const isAlreadyFavorite = prev.favoritePlace === clickedPlace.name;
      const newFavorite = isAlreadyFavorite ? null : clickedPlace.name;
      
      if (newFavorite) {
        message.success(`Место ${clickedPlace.name} теперь любимое!`);
      } else {
        message.info(`Место ${clickedPlace.name} удалено из избранного`);
      }

      return { ...prev, favoritePlace: newFavorite };
    });
  };

  // --- ФИЛЬТРАЦИЯ ---
  const filteredPlaces = places.filter(place => {
    const equipment = (place.equipment || []).map(item => item.toLowerCase());
    const description = (place.description || "").toLowerCase();

    if (filters.onlyWindow && !equipment.includes('окно') && !description.includes('окно')) return false;
    if (filters.onlyQuiet && !description.includes('тихая') && !description.includes('quiet')) return false;
    if (filters.minMonitors > 0) {
      const monitorsCount = equipment.filter(item => item.includes('монитор')).length;
      if (monitorsCount < filters.minMonitors) return false;
    }
    return true;
  });

  return (
    <Layout style={{ minHeight: '100vh', background: '#000' }}>
      <Content style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
        ) : (
          <>
            <BookingWidgets userStats={userStats} onCancelBooking={handleCancelBooking} />
            <PlacesFilters filters={filters} setFilters={setFilters} />
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <PlacesTable 
                  data={filteredPlaces} 
                  onBook={(place) => { setSelectedPlace(place); setIsModalOpen(true); }}
                  favoritePlace={userStats.favoritePlace}
                  onToggleFavorite={handleToggleFavorite}
                />
              </Col>
              <Col xs={24} lg={8}>
                <HistorySidebar history={userStats.history} />
              </Col>
            </Row>
          </>
        )}

        <BookingModal 
          open={isModalOpen} 
          place={selectedPlace}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={handleConfirmBooking}
        />
      </Content>
    </Layout>
  );
};

export default Dashboard;