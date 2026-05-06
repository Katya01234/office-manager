import React, { useState, useCallback, useMemo } from 'react';
import { Row, Col, message, Spin, Layout, Typography, Space } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; 
import { workspaceApi } from '../../api/api';

// Импорт дочерних компонентов
import BookingWidgets from "./components/BookingWidgets.jsx";
import PlacesFilters from "./components/PlacesFilters.jsx";
import PlacesTable from "./components/PlacesTable.jsx";
import BookingModal from "./components/BookingModal";
import HistorySidebar from "./components/HistorySidebar.jsx";
import VKWidget from "./components/VKWidget";
import RescheduleModal from "./components/RescheduleModal";

dayjs.extend(utc);

const { Content } = Layout;

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  
  const [filters, setFilters] = useState({ 
    onlyFree: false,
    date: dayjs().add(1, 'day').startOf('day'), 
    timeRange: null,
    type: 'all' 
  });

  // --- МУТАЦИИ ---

  // Создание брони
  const createMutation = useMutation({
    mutationFn: workspaceApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      message.success('Забронировано');
      setIsModalOpen(false);
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Ошибка бронирования');
    }
  });

  // Перенос брони (PATCH)
  const rescheduleMutation = useMutation({
    mutationFn: ({ id, start, end }) => workspaceApi.rescheduleBooking(id, start, end),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      message.success('Время бронирования изменено');
      setRescheduleBooking(null);
    },
    onError: (err) => {
      // 1. Выводим полную ошибку в консоль для дебага
      console.error('Reschedule Error Details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      // 2. Вытаскиваем конкретное сообщение от бэкенда
      // Предполагаем, что бэкенд присылает { message: "Текст ошибки" } или { detail: "Текст" }
      const backendMessage = err.response?.data?.message 
        || err.response?.data?.detail 
        || 'Ошибка при переносе';

      message.error(backendMessage);
    }
  });

  // Универсальная функция удаления (используется в виджетах и сайдбаре)
  const handleCancelBooking = async (id) => {
    try {
      await workspaceApi.deleteBooking(id);
      await queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      message.success('Бронирование отменено');
    } catch (err) {
      message.error('Не удалось отменить бронирование');
    }
  };

  // --- ЗАГРУЗКА ДАННЫХ ---

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['dashboardData', filters.date.format('YYYY-MM-DD'), filters.timeRange],
    queryFn: async () => {
      let workspacesPromise;

      // Если выбрано время — берем только доступные, иначе все
      if (filters.timeRange && filters.timeRange[0] && filters.timeRange[1]) {
        const [startTime, endTime] = filters.timeRange;
        const startIso = filters.date.hour(startTime.hour()).minute(startTime.minute()).second(0).utc().format();
        const endIso = filters.date.hour(endTime.hour()).minute(endTime.minute()).second(0).utc().format();
        workspacesPromise = workspaceApi.getAvailableWorkspaces(startIso, endIso);
      } else {
        workspacesPromise = workspaceApi.getWorkspaces();
      }

      const [ws, active, fav, hist, main, vkStatus] = await Promise.all([
        workspacesPromise,
        workspaceApi.getBookings(),
        workspaceApi.getFavorite(),
        workspaceApi.getBookingHistory(),
        workspaceApi.getMainWorkspace(),
        workspaceApi.getVkStatus()
      ]);

      // Мапим историю для уникальности
      const rawHistory = [...(active || []), ...(hist || [])];
      const uniqueHistory = Array.from(new Map(rawHistory.map(item => [item.id, item])).values());

      return {
        places: (ws || []).map(p => ({ 
          ...p, 
          key: p.id,
          activeBookings: (active || []).filter(b => b.workspace_id === p.id) 
        })),
        userStats: {
          history: uniqueHistory,
          favoritePlace: fav,
          mainPlace: main,
          vkStatus: vkStatus
        }
      };
    },
    placeholderData: (previousData) => previousData,
  });

  // --- ЛОГИКА ФИЛЬТРАЦИИ И СЛОТОВ ---

  const calculateFreeSlots = useCallback((bookings = [], targetDate) => {
    const MIN_DURATION = 120;
    const isToday = targetDate.isSame(dayjs(), 'day');
    
    let currentPos = isToday 
      ? dayjs().add(15, 'm') 
      : targetDate.clone().hour(9).minute(0).second(0);
      
    const endDay = targetDate.clone().hour(22).minute(0).second(0);
    let freeSlots = [];

    const dayBookings = bookings
      .map(b => ({
        start: dayjs.utc(b.start_datetime).local(),
        end: dayjs.utc(b.end_datetime).local()
      }))
      .filter(b => b.start.isSame(targetDate, 'day'))
      .sort((a, b) => a.start.diff(b.start));

    dayBookings.forEach(b => {
      if (b.start.diff(currentPos, 'm') >= MIN_DURATION) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${b.start.format('HH:mm')}`);
      }
      if (b.end.isAfter(currentPos)) currentPos = b.end;
    });

    if (endDay.diff(currentPos, 'm') >= MIN_DURATION) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
    }
    return freeSlots;
  }, []);

  const filteredPlaces = useMemo(() => {
    if (!data?.places) return [];
    return data.places.filter(place => {
      if (filters.type !== 'all') {
        const isMeeting = place.name?.startsWith('П');
        if (filters.type === 'meeting' && !isMeeting) return false;
        if (filters.type === 'desk' && isMeeting) return false;
      }
      return true;
    }).map(p => ({ 
      ...p, 
      freeSlots: calculateFreeSlots(p.activeBookings, filters.date) 
    }));
  }, [data, filters, calculateFreeSlots]);

  if (isLoading) return (
    <div style={{ background: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#000' }}>
      <Content style={{ padding: '24px' }}>
        {/* Верхние виджеты */}
        <BookingWidgets 
          userStats={data.userStats} 
          places={data.places} 
          filters={filters}
          onCancelBooking={handleCancelBooking} 
          onSelectPlace={(p) => { setSelectedPlace(p); setIsModalOpen(true); }} 
        />
        
        {/* Фильтры */}
        <PlacesFilters filters={filters} setFilters={setFilters} />
        
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {/* Левая колонка: Таблица мест */}
          <Col xs={24} lg={16}>
            <Spin spinning={isFetching && !isLoading}> 
              <PlacesTable 
                data={filteredPlaces} 
                onBook={(p) => { setSelectedPlace(p); setIsModalOpen(true); }}
                favoritePlaceId={data.userStats.favoritePlace?.id} 
                mainPlaceId={data.userStats.mainPlace?.id}
                onToggleFavorite={async (id) => { 
                  await workspaceApi.toggleFavorite(id); 
                  queryClient.invalidateQueries({ queryKey: ['dashboardData'] }); 
                }}
              />
            </Spin>
          </Col>
          
          {/* Правая колонка: VK и История */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {data.userStats.vkStatus && !data.userStats.vkStatus.is_linked && (
                <VKWidget 
                  onConnectSuccess={() => queryClient.invalidateQueries({ queryKey: ['dashboardData'] })} 
                />
              )}

              <HistorySidebar 
                history={data.userStats.history} 
                onCancelBooking={handleCancelBooking} 
                onReschedule={(booking) => setRescheduleBooking(booking)} 
              />
            </Space>
          </Col>
        </Row>

        {/* Модалка создания брони */}
        {selectedPlace && (
          <BookingModal 
            open={isModalOpen} 
            place={selectedPlace}
            vkStatus={data.userStats.vkStatus}
            initialDate={filters.date}
            onCancel={() => setIsModalOpen(false)}
            onConfirm={(vals) => {
              createMutation.mutate({
                workspace_id: selectedPlace.id,
                start_datetime: dayjs(vals.start).utc().format(),
                end_datetime: dayjs(vals.end).utc().format()
              });
            }}
          />
        )}

        {/* Модалка переноса брони */}
        <RescheduleModal 
          open={!!rescheduleBooking}
          booking={rescheduleBooking}
          isValidating={rescheduleMutation.isPending}
          onCancel={() => setRescheduleBooking(null)}
          onConfirm={(id, start, end) => rescheduleMutation.mutate({ id, start, end })}
        />
      </Content>
    </Layout>
  );
};

export default Dashboard;