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

  // --- ЛОГИКА РАСЧЕТА СЛОТОВ ---
  const calculateFreeSlots = useCallback((bookings = [], targetDate) => {
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
      if (bStart.isAfter(currentPos.add(14, 'minute'))) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${bStart.format('HH:mm')}`);
      }
      if (bEnd.isAfter(currentPos)) { currentPos = bEnd; }
    });

    if (currentPos.isBefore(endDay.subtract(14, 'minute'))) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
    }
    return freeSlots.length > 0 ? freeSlots : ["Нет слотов"];
  }, []);

  // --- ЗАГРУЗКА ДАННЫХ ---
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [wsRes, bookRes, favRes, histRes, mainRes] = await Promise.allSettled([
        workspaceApi.getWorkspaces(),
        workspaceApi.getBookings(), // Активные и будущие брони
        workspaceApi.getFavorite(),
        workspaceApi.getBookingHistory(), // Прошедшие брони
        workspaceApi.getMainWorkspace()
      ]);

      const workspaces = wsRes.status === 'fulfilled' ? wsRes.value : [];
      const allActiveBookings = bookRes.status === 'fulfilled' ? bookRes.value : [];
      const historyBookings = histRes.status === 'fulfilled' ? histRes.value : [];
      
      // Объединяем активные брони и историю в один массив для виджетов и боковой панели
      // Это гарантирует, что BookingWidgets увидит бронирование сразу после создания
      const combinedHistory = [...allActiveBookings, ...historyBookings];

      // Убираем возможные дубликаты по ID (если бэкенд отдает одну и ту же бронь в обоих списках)
      const uniqueHistory = Array.from(
        new Map(combinedHistory.map(item => [item.id, item])).values()
      );

      const enrichedPlaces = workspaces.map(ws => ({
        ...ws,
        key: ws.id,
        activeBookings: allActiveBookings.filter(b => b.workspace_id === ws.id),
        status: ws.is_assigned ? 'assigned' : 'available'
      }));

      setPlaces(enrichedPlaces);
      setUserStats({
        history: uniqueHistory, // Теперь здесь есть и будущие, и прошлые записи
        favoritePlace: favRes.status === 'fulfilled' ? favRes.value : null,
        mainPlace: mainRes.status === 'fulfilled' ? mainRes.value : null,
        isVkConnected: !!localStorage.getItem('vk_connected')
      });
    } catch (err) {
      console.error(err);
      message.error("Ошибка синхронизации данных");
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => { loadData(); }, [loadData]);

  // Важный фикс: handleCancel теперь прокидывается в виджеты
  const handleCancel = async (bookingId) => {
    try {
      await workspaceApi.deleteBooking(bookingId);
      message.success("Бронирование удалено");
      // Сразу вызываем обновление данных, чтобы виджет пересчитал "Ближайшую бронь"
      await loadData(true); 
    } catch (e) {
      message.error("Не удалось удалить бронирование");
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
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <Spin size="large" tip="Загрузка коворкинга..." />
          </div>
        ) : (
          <>
            {/* Виджеты получают актуальные данные и функцию удаления */}
            <BookingWidgets 
              userStats={userStats} 
              places={places} 
              filters={filters}
              onCancelBooking={handleCancel} 
              onSelectPlace={(place) => { 
                setSelectedPlace(place); 
                setIsModalOpen(true); 
              }} 
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
                    message.success("VK подключен");
                  }} />
                )}
                <HistorySidebar history={userStats.history} />
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
            try {
              await workspaceApi.createBooking({
                workspace_id: selectedPlace.id,
                start_datetime: vals.start.toISOString(),
                end_datetime: vals.end.toISOString()
              });
              message.success('Забронировано');
              setIsModalOpen(false);
              setSelectedPlace(null);
              loadData(true); 
            } catch (e) { message.error('Время уже занято'); }
          }}
        />
      </Content>
    </Layout>
  );
};

export default Dashboard;