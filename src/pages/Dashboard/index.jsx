import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, message, Spin, Layout } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { workspaceApi } from '../../api/api';

// Импорт компонентов
import BookingWidgets from "./components/BookingWidgets.jsx";
import PlacesFilters from "./components/PlacesFilters.jsx";
import PlacesTable from "./components/PlacesTable.jsx";
import BookingModal from "./components/BookingModal";
import HistorySidebar from "./components/HistorySidebar.jsx";
import VKWidget from "./components/VKWidget.jsx";

dayjs.extend(isBetween);
const { Content } = Layout;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  
  const [userStats, setUserStats] = useState({ 
    history: [], 
    favoritePlace: null, 
    mainPlace: null,
    isVkConnected: false 
  });
  
  const [filters, setFilters] = useState({ 
    onlyFree: false,
    date: dayjs().add(1, 'day').startOf('day'), 
    timeRange: null 
  });

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calculateFreeSlots = useCallback((bookings = [], targetDate) => {
    const MIN_DURATION = 120;
    const startDay = targetDate.clone().hour(9).minute(0).second(0);
    const endDay = targetDate.clone().hour(22).minute(0).second(0);
    
    const dayBookings = (bookings || [])
      .filter(b => dayjs(b.start_datetime).isSame(targetDate, 'day'))
      .sort((a, b) => dayjs(a.start_datetime).diff(dayjs(b.start_datetime)));

    let freeSlots = [];
    let currentPos = startDay;

    dayBookings.forEach(booking => {
      const bStart = dayjs(booking.start_datetime);
      const bEnd = dayjs(booking.end_datetime);
      if (bStart.diff(currentPos, 'minute') >= MIN_DURATION) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${bStart.format('HH:mm')}`);
      }
      if (bEnd.isAfter(currentPos)) { currentPos = bEnd; }
    });

    if (endDay.diff(currentPos, 'minute') >= MIN_DURATION) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
    }
    return freeSlots;
  }, []);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [wsRes, bookRes, favRes, histRes, mainRes] = await Promise.allSettled([
        workspaceApi.getWorkspaces(),
        workspaceApi.getBookings(),
        workspaceApi.getFavorite(),
        workspaceApi.getBookingHistory(),
        workspaceApi.getMainWorkspace()
      ]);

      const workspaces = wsRes.status === 'fulfilled' ? wsRes.value : [];
      const allActive = bookRes.status === 'fulfilled' ? bookRes.value : [];
      const historyRes = histRes.status === 'fulfilled' ? histRes.value : [];
      
      const combinedHistory = [...allActive, ...historyRes];
      const uniqueHistory = Array.from(new Map(combinedHistory.map(item => [item.id, item])).values());

      const enrichedPlaces = workspaces.map(ws => ({
        ...ws,
        key: ws.id,
        activeBookings: allActive.filter(b => b.workspace_id === ws.id),
        status: ws.is_assigned ? 'assigned' : 'available'
      }));

      setPlaces(enrichedPlaces);
      setUserStats({
        history: uniqueHistory,
        favoritePlace: favRes.status === 'fulfilled' ? favRes.value : null,
        mainPlace: mainRes.status === 'fulfilled' ? mainRes.value : null,
        isVkConnected: !!localStorage.getItem('vk_connected')
      });
    } catch (err) {
      message.error("Ошибка синхронизации данных");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCancel = async (bookingId) => {
    try {
      await workspaceApi.deleteBooking(bookingId);
      message.success("Бронирование удалено");
      await loadData(true); 
    } catch (e) {
      message.error("Не удалось удалить");
    }
  };

  const filteredPlaces = useMemo(() => {
    const targetDate = filters.date || dayjs().add(1, 'day');
    return places.filter(place => {
      if (filters.onlyFree) {
        const isOccupiedNow = place.activeBookings.some(b => 
          dayjs().isBetween(dayjs(b.start_datetime), dayjs(b.end_datetime))
        );
        if (isOccupiedNow) return false;
      }
      if (filters.timeRange) {
        const [start, end] = filters.timeRange;
        const fullStart = targetDate.clone().hour(start.hour()).minute(start.minute());
        const fullEnd = targetDate.clone().hour(end.hour()).minute(end.minute());
        const isOccupied = place.activeBookings.some(b => {
          const bStart = dayjs(b.start_datetime);
          const bEnd = dayjs(b.end_datetime);
          return fullStart.isBefore(bEnd) && fullEnd.isAfter(bStart);
        });
        if (isOccupied) return false;
      }
      return true;
    }).map(place => ({
      ...place,
      freeSlots: calculateFreeSlots(place.activeBookings, targetDate)
    }));
  }, [places, filters, calculateFreeSlots]);

  return (
    <Layout style={{ minHeight: '100vh', background: '#000' }}>
      <Content style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
        ) : (
          <>
            <BookingWidgets 
              userStats={userStats} 
              places={places} 
              filters={filters}
              onCancelBooking={handleCancel} 
              onSelectPlace={(place) => { setSelectedPlace(place); setIsModalOpen(true); }} 
            />
            
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
                      loadData(true);
                    } catch (e) { message.error("Ошибка избранного"); }
                  }}
                />
              </Col>
              <Col xs={24} lg={8}>
                {!userStats.isVkConnected && (
                  <VKWidget onConnectSuccess={() => {
                    localStorage.setItem('vk_connected', 'true');
                    setUserStats(prev => ({ ...prev, isVkConnected: true }));
                  }} />
                )}
                {/* ПЕРЕДАЕМ ИСТОРИЮ И ФУНКЦИЮ ОТМЕНЫ */}
                <HistorySidebar 
                  history={userStats.history} 
                  onCancelBooking={handleCancel} 
                />
              </Col>
            </Row>
          </>
        )}

        <BookingModal 
          open={isModalOpen} 
          place={selectedPlace}
          initialDate={filters.date}
          initialTimeRange={filters.timeRange}
          onCancel={() => { setIsModalOpen(false); setSelectedPlace(null); }}
          onConfirm={async (vals) => {
            if (vals.end.diff(vals.start, 'minute') < 120) {
              return message.error('Минимальное время — 2 часа');
            }
            try {
              await workspaceApi.createBooking({
                workspace_id: selectedPlace.id,
                start_datetime: vals.start.toISOString(),
                end_datetime: vals.end.toISOString()
              });
              message.success('Забронировано');
              setIsModalOpen(false);
              loadData(true); 
            } catch (e) { message.error('Время уже занято'); }
          }}
        />
      </Content>
    </Layout>
  );
};

export default Dashboard;