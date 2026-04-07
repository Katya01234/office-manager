import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, message, Spin, Layout } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { workspaceApi } from '../../api';

// Импорт компонентов
import BookingWidgets from "./components/BookingWidgets.jsx";
import PlacesFilters from "./components/PlacesFilters.jsx";
import PlacesTable from "./components/PlacesTable.jsx";
import BookingModal from "./components/BookingModal";
import HistorySidebar from "./components/HistorySidebar.jsx";

dayjs.extend(isBetween);
const { Content } = Layout;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [userStats, setUserStats] = useState({ history: [], favoritePlace: null, mainPlace: null });
  
  const [filters, setFilters] = useState({ 
    onlyFree: false,
    date: null,
    timeRange: null 
  });

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- УЛУЧШЕННЫЙ РАСЧЕТ СВОБОДНЫХ СЛОТОВ ---
  const calculateFreeSlots = (bookings = [], targetDate = dayjs()) => {
    const startDay = targetDate.set('hour', 9).set('minute', 0).set('second', 0);
    const endDay = targetDate.set('hour', 22).set('minute', 0).set('second', 0);
    const now = dayjs();
    
    const dayBookings = (bookings || [])
      .filter(b => dayjs(b.start_datetime).isSame(targetDate, 'day'))
      .sort((a, b) => dayjs(a.start_datetime).diff(dayjs(b.start_datetime)));

    let freeSlots = [];
    
    // Если смотрим на сегодня — начинаем от текущего момента, иначе с начала рабочего дня
    let currentPos = now.isAfter(startDay) && now.isSame(targetDate, 'day') ? now : startDay;

    // 1. Добавляем маркер "Занято сейчас", если место в данный момент используется
    const isBusyNow = dayBookings.some(b => 
      now.isBetween(dayjs(b.start_datetime), dayjs(b.end_datetime), null, '[)')
    );
    if (isBusyNow && now.isSame(targetDate, 'day')) {
      freeSlots.push("Занято сейчас");
    }

    // 2. Расчет интервалов
    dayBookings.forEach(booking => {
      const bStart = dayjs(booking.start_datetime);
      const bEnd = dayjs(booking.end_datetime);

      // Если между текущей позицией и началом брони есть хотя бы 15 минут
      if (bStart.isAfter(currentPos.add(14, 'minute'))) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${bStart.format('HH:mm')}`);
      }
      
      // Сдвигаем указатель на конец брони, если он позже текущего
      if (bEnd.isAfter(currentPos)) { 
        currentPos = bEnd; 
      }
    });

    // 3. Добавляем финальный интервал до конца дня
    if (currentPos.isBefore(endDay.subtract(14, 'minute'))) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
    }

    // 4. Если свободных окон нет совсем — возвращаем маркер для блокировки кнопки
    if (freeSlots.length === 0 || (freeSlots.length === 1 && freeSlots[0] === "Занято сейчас")) {
      return ["Нет слотов"];
    }

    return freeSlots;
  };

  const processData = useCallback((workspaces, allBookings, favourite, history, mainPlace) => {
    const enrichedPlaces = (workspaces || []).map(ws => {
      const wsBookings = (allBookings || []).filter(b => b.workspace_id === ws.id);
      
      const now = dayjs();
      const currentBooking = wsBookings.find(b => 
        now.isBetween(dayjs(b.start_datetime), dayjs(b.end_datetime), null, '[)')
      );

      return {
        ...ws,
        key: ws.id,
        activeBookings: wsBookings,
        // Передаем статус для корректного отображения тегов FIXED/BUSY в таблице
        status: ws.status === 'assigned' ? 'assigned' : (currentBooking ? 'busy' : 'available'),
      };
    });

    setPlaces(enrichedPlaces);
    setUserStats({ history: history || [], favoritePlace: favourite, mainPlace });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        workspaceApi.getWorkspaces(),
        workspaceApi.getBookings(),
        workspaceApi.getFavorite(),
        workspaceApi.getBookingHistory(),
        workspaceApi.getMainWorkspace()
      ]);

      const workspaces = results[0].status === 'fulfilled' ? results[0].value : [];
      const allBookings = results[1].status === 'fulfilled' ? results[1].value : [];
      const favourite = results[2].status === 'fulfilled' ? results[2].value : null;
      const history = results[3].status === 'fulfilled' ? results[3].value : [];
      const mainPlace = results[4]?.status === 'fulfilled' ? results[4].value : null;

      processData(workspaces, allBookings, favourite, history, mainPlace);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      message.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }, [processData]);

  useEffect(() => { loadData(); }, [loadData]);

  // --- ЛОГИКА ФИЛЬТРАЦИИ ---
  const filteredPlaces = useMemo(() => {
  return places.filter(place => {
    // Если выбрано время в фильтрах, проверяем занятость
    if (filters.date || filters.timeRange) {
      const targetDate = filters.date || dayjs();
      
      if (filters.timeRange) {
        const [start, end] = filters.timeRange;
        const fullStart = targetDate.hour(start.hour()).minute(start.minute()).second(0);
        const fullEnd = targetDate.hour(end.hour()).minute(end.minute()).second(0);

        const isOccupied = place.activeBookings.some(b => {
          const bStart = dayjs(b.start_datetime);
          const bEnd = dayjs(b.end_datetime);
          return fullStart.isBefore(bEnd) && fullEnd.isAfter(bStart);
        });
        
        if (isOccupied) return false;
      }
    }
    return true;
  }).map(place => ({
    ...place,
    freeSlots: calculateFreeSlots(place.activeBookings, filters.date || dayjs())
  }));
}, [places, filters]);

  return (
    <Layout style={{ minHeight: '100vh', background: '#000' }}>
      <Content style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
        ) : (
          <>
            <BookingWidgets userStats={userStats} />
            
            <div style={{ marginBottom: 24 }}>
               <PlacesFilters filters={filters} setFilters={setFilters} />
            </div>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <PlacesTable 
                  data={filteredPlaces} 
                  onBook={(place) => { setSelectedPlace(place); setIsModalOpen(true); }}
                  favoritePlaceId={userStats.favoritePlace?.id} 
                  onToggleFavorite={async (id) => {
                    try {
                      await workspaceApi.toggleFavorite(id);
                      loadData();
                    } catch (e) {
                      message.error("Ошибка при обновлении избранного");
                    }
                  }}
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
          onConfirm={async (vals) => {
            try {
              await workspaceApi.createBooking({
                workspace_id: selectedPlace.id,
                start_datetime: vals.start.toISOString(),
                end_datetime: vals.end.toISOString()
              });
              message.success('Забронировано');
              setIsModalOpen(false);
              setTimeout(() => loadData(), 500); 
            } catch (e) {
              message.error('Ошибка бронирования: место уже занято');
            }
          }}
        />
      </Content>
    </Layout>
  );
};

export default Dashboard;