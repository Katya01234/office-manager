import React, { useState, useCallback, useMemo } from 'react';
import { Row, Col, message, Spin, Layout } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { workspaceApi } from '../../api/api';

import BookingWidgets from "./components/BookingWidgets.jsx";
import PlacesFilters from "./components/PlacesFilters.jsx";
import PlacesTable from "./components/PlacesTable.jsx";
import BookingModal from "./components/BookingModal";
import HistorySidebar from "./components/HistorySidebar.jsx";
import VKWidget from "./components/VKWidget.jsx";

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Content } = Layout;

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({ 
    onlyFree: false,
    date: dayjs().add(1, 'day').startOf('day'), 
    timeRange: null 
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const [ws, active, fav, hist, main] = await Promise.all([
        workspaceApi.getWorkspaces(),
        workspaceApi.getBookings(),
        workspaceApi.getFavorite(),
        workspaceApi.getBookingHistory(),
        workspaceApi.getMainWorkspace()
      ]);

      const combinedHistory = [...(active || []), ...(hist || [])];
      const uniqueHistory = Array.from(new Map(combinedHistory.map(item => [item.id, item])).values());

      return {
        places: (ws || []).map(place => ({
          ...place,
          key: place.id,
          activeBookings: (active || []).filter(b => b.workspace_id === place.id),
          status: place.is_assigned ? 'assigned' : 'available'
        })),
        userStats: {
          history: uniqueHistory,
          favoritePlace: fav,
          mainPlace: main,
          isVkConnected: !!localStorage.getItem('vk_connected')
        }
      };
    }
  });

  const cancelMutation = useMutation({
    mutationFn: workspaceApi.deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      message.success("Бронирование удалено");
    },
    onError: () => message.error("Не удалось удалить")
  });

  const createMutation = useMutation({
    mutationFn: workspaceApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      message.success('Забронировано');
      setIsModalOpen(false);
    },
    onError: (err) => {
      // Выводим конкретную ошибку из сваггера, если она есть
      message.error(err.response?.status === 409 ? 'Это время уже занято' : 'Ошибка бронирования');
    }
  });

  const calculateFreeSlots = useCallback((bookings = [], targetDate) => {
    const MIN_DURATION = 120;
    const startDay = targetDate.clone().hour(9).minute(0).second(0);
    const endDay = targetDate.clone().hour(22).minute(0).second(0);
    
    let freeSlots = [];
    let currentPos = startDay;

    const dayBookings = bookings
      .filter(b => dayjs.utc(b.start_datetime).local().isSame(targetDate, 'day'))
      .sort((a, b) => dayjs.utc(a.start_datetime).diff(dayjs.utc(b.start_datetime)));

    dayBookings.forEach(booking => {
      const bStart = dayjs.utc(booking.start_datetime).local();
      if (bStart.diff(currentPos, 'minute') >= MIN_DURATION) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${bStart.format('HH:mm')}`);
      }
      const bEnd = dayjs.utc(booking.end_datetime).local();
      if (bEnd.isAfter(currentPos)) currentPos = bEnd;
    });

    if (endDay.diff(currentPos, 'minute') >= MIN_DURATION) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
    }
    return freeSlots;
  }, []);

  const filteredPlaces = useMemo(() => {
    if (!data?.places) return [];
    const targetDate = filters.date || dayjs().add(1, 'day');
    
    return data.places.filter(place => {
      // Проверка "Свободно сейчас"
      if (filters.onlyFree) {
        const now = dayjs();
        const isOccupiedNow = place.activeBookings.some(b => 
          now.isBetween(dayjs.utc(b.start_datetime).local(), dayjs.utc(b.end_datetime).local())
        );
        if (isOccupiedNow) return false;
      }

      // Проверка пересечения с выбранным фильтром времени
      if (filters.timeRange) {
        const [start, end] = filters.timeRange;
        const fullStart = targetDate.clone().hour(start.hour()).minute(start.minute());
        const fullEnd = targetDate.clone().hour(end.hour()).minute(end.minute());

        const isOccupied = place.activeBookings.some(b => {
          const bStart = dayjs.utc(b.start_datetime).local();
          const bEnd = dayjs.utc(b.end_datetime).local();
          return fullStart.isBefore(bEnd) && fullEnd.isAfter(bStart);
        });
        if (isOccupied) return false;
      }
      return true;
    }).map(place => ({
      ...place,
      freeSlots: calculateFreeSlots(place.activeBookings, targetDate)
    }));
  }, [data?.places, filters, calculateFreeSlots]);

  if (isLoading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  if (isError) return <div style={{ color: '#fff', textAlign: 'center' }}>Ошибка загрузки данных</div>;

  return (
    <Layout style={{ minHeight: '100vh', background: '#000' }}>
      <Content style={{ padding: '24px' }}>
        <BookingWidgets 
          userStats={data.userStats} 
          places={data.places} 
          filters={filters}
          onCancelBooking={(id) => cancelMutation.mutate(id)} 
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
              favoritePlaceId={data.userStats.favoritePlace?.id} 
              onToggleFavorite={async (id) => {
                await workspaceApi.toggleFavorite(id);
                queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
              }}
            />
          </Col>
          <Col xs={24} lg={8}>
            {!data.userStats.isVkConnected && (
              <VKWidget onConnectSuccess={() => {
                localStorage.setItem('vk_connected', 'true');
                queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
              }} />
            )}
            <HistorySidebar 
              history={data.userStats.history} 
              onCancelBooking={(id) => cancelMutation.mutate(id)} 
            />
          </Col>
        </Row>

        <BookingModal 
          open={isModalOpen} 
          place={selectedPlace}
          initialDate={filters.date}
          initialTimeRange={filters.timeRange}
          onCancel={() => { setIsModalOpen(false); setSelectedPlace(null); }}
          onConfirm={(vals) => {
            if (vals.end.diff(vals.start, 'minute') < 120) {
              return message.error('Минимальное время — 2 часа');
            }
            // ИСПРАВЛЕНО: Приведение к ISO UTC для Swagger
            createMutation.mutate({
              workspace_id: selectedPlace.id,
              start_datetime: vals.start.toISOString(),
              end_datetime: vals.end.toISOString()
            });
          }}
        />
      </Content>
    </Layout>
  );
};

export default Dashboard;