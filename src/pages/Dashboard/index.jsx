import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  
  // Состояние фильтров (добавили type: 'all')
  const [filters, setFilters] = useState({ 
    onlyFree: false,
    date: dayjs().add(1, 'day').startOf('day'), 
    timeRange: null,
    type: 'all' 
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
      message.error(err.response?.status === 409 ? 'Это время уже занято' : 'Ошибка бронирования');
    }
  });

  const calculateFreeSlots = useCallback((bookings = [], targetDate) => {
    const MIN_DURATION = 120; 
    const now = dayjs();
    
    let startPos;
    if (targetDate.isSame(now, 'day')) {
      const startOfWorkingDay = targetDate.clone().hour(9).minute(0);
      startPos = now.isBefore(startOfWorkingDay) ? startOfWorkingDay : now.add(15, 'minute');
    } else {
      startPos = targetDate.clone().hour(9).minute(0);
    }

    const endDay = targetDate.clone().hour(22).minute(0);
    if (startPos.isAfter(endDay) || startPos.isSame(endDay)) return [];

    let freeSlots = [];
    let currentPos = startPos;

    const dayBookings = bookings
      .filter(b => dayjs.utc(b.start_datetime).local().isSame(targetDate, 'day'))
      .sort((a, b) => dayjs.utc(a.start_datetime).diff(dayjs.utc(b.start_datetime)));

    dayBookings.forEach(booking => {
      const bStart = dayjs.utc(booking.start_datetime).local();
      const bEnd = dayjs.utc(booking.end_datetime).local();

      if (bStart.isAfter(currentPos) && bStart.diff(currentPos, 'minute') >= MIN_DURATION) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${bStart.format('HH:mm')}`);
      }
      if (bEnd.isAfter(currentPos)) currentPos = bEnd;
    });

    if (endDay.diff(currentPos, 'minute') >= MIN_DURATION) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
    }
    return freeSlots;
  }, []);

  // ОБНОВЛЕННАЯ ФИЛЬТРАЦИЯ (с учетом типа места)
  const filteredPlaces = useMemo(() => {
    if (!data?.places) return [];
    const targetDate = filters.date || dayjs().add(1, 'day');
    
    return data.places.filter(place => {
      // 1. Фильтр по типу (desk / meeting)
      if (filters.type && filters.type !== 'all') {
        const isMeeting = place.name?.startsWith('П');
        if (filters.type === 'meeting' && !isMeeting) return false;
        if (filters.type === 'desk' && isMeeting) return false;
      }

      // 2. Фильтр "Только свободные сейчас"
      if (filters.onlyFree) {
        const now = dayjs();
        const isOccupiedNow = place.activeBookings.some(b => 
          now.isBetween(dayjs.utc(b.start_datetime).local(), dayjs.utc(b.end_datetime).local())
        );
        if (isOccupiedNow) return false;
      }

      // 3. Фильтр по выбранному диапазону времени
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

  if (isLoading) return <div style={{ textAlign: 'center', padding: '100px', background: '#000', minHeight: '100vh' }}><Spin size="large" /></div>;
  if (isError) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Ошибка загрузки данных</div>;

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

        {selectedPlace && (
          <BookingModal 
            open={isModalOpen} 
            place={selectedPlace}
            initialDate={filters.date}
            initialTimeRange={
              filters.timeRange 
                ? filters.timeRange 
                : (filters.date.isSame(dayjs(), 'day') 
                    ? [dayjs().add(20, 'minute'), dayjs().add(140, 'minute')] 
                    : [dayjs().hour(9).minute(0), dayjs().hour(11).minute(0)])
            }
            onCancel={() => { setIsModalOpen(false); setSelectedPlace(null); }}
            onConfirm={(vals) => {
              // 1. Проверка на 2 часа
              if (vals.end.diff(vals.start, 'minute') < 120) {
                return message.error('Минимальное время — 2 часа');
              }

              // 2. ЗАПРЕТ НА ВТОРОЕ РАБОЧЕЕ МЕСТО
              const isMeetingRoom = selectedPlace?.name?.startsWith('П');
              if (!isMeetingRoom) {
                // Ищем среди активных броней пользователя (в data.userStats.history или активных)
                // Проверяем только те, что на выбранную дату и не являются переговорками
                const hasExistingDesk = data.userStats.history.some(b => {
                  const isSameDay = dayjs.utc(b.start_datetime).local().isSame(vals.start, 'day');
                  // Находим инфо о месте из этой брони, чтобы проверить его имя
                  const bookedPlace = data.places.find(p => p.id === b.workspace_id);
                  const isDesk = bookedPlace && !bookedPlace.name?.startsWith('П');
                  
                  return isSameDay && isDesk;
                });

                if (hasExistingDesk) {
                  return message.error('Вы уже забронировали рабочее место на этот день. Можно забронировать только переговорную.');
                }
              }

              createMutation.mutate({
                workspace_id: selectedPlace.id,
                start_datetime: vals.start.toISOString(),
                end_datetime: vals.end.toISOString()
              });
            }}
          />
        )}
      </Content>
    </Layout>
  );
};

export default Dashboard;