import React, { useState, useMemo, useCallback } from 'react';
import { message, Spin, Typography, Layout } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import { workspaceApi } from '../../api/api';
import MapContainer from './Components/MapContainer';
import BookingModal from '../Dashboard/components/BookingModal';
import PlacesFilters from '../Dashboard/components/PlacesFilters';

dayjs.extend(isBetween);
dayjs.extend(utc);
const { Content } = Layout;

const OfficeMapPage = () => {
  const queryClient = useQueryClient();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Состояние фильтров
  const [filters, setFilters] = useState({ 
    date: dayjs().add(1, 'day').startOf('day'), 
    timeRange: null 
  });

  // 1. Синхронизируем ключ с Дашбордом и добавляем настройки обновления
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardData'], 
    queryFn: async () => {
      const [ws, active] = await Promise.all([
        workspaceApi.getWorkspaces(),
        workspaceApi.getBookings()
      ]);
      return {
        rawPlaces: ws,
        bookings: active
      };
    },
    // Гарантируем свежесть данных при заходе на карту
    refetchOnMount: true,
    staleTime: 0 
  });

  // Логика расчета свободных слотов
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

  // 2. Формируем список мест с защитой от undefined
  const filteredPlaces = useMemo(() => {
    // КРИТИЧНО: Проверяем наличие и мест, и бронирований одновременно
    if (!data?.rawPlaces || !data?.bookings) return [];

    const targetDate = filters.date || dayjs().add(1, 'day');

    return data.rawPlaces.map(place => {
      const placeBookings = data.bookings.filter(b => b.workspace_id === place.id);
      
      let isOccupiedInFilter = false;
      if (filters.timeRange) {
        const [start, end] = filters.timeRange;
        const fullStart = targetDate.clone().hour(start.hour()).minute(start.minute());
        const fullEnd = targetDate.clone().hour(end.hour()).minute(end.minute());

        isOccupiedInFilter = placeBookings.some(b => {
          const bStart = dayjs.utc(b.start_datetime).local();
          const bEnd = dayjs.utc(b.end_datetime).local();
          return fullStart.isBefore(bEnd) && fullEnd.isAfter(bStart);
        });
      }

      return {
        ...place,
        activeBookings: placeBookings,
        isOccupiedInFilter,
        freeSlots: calculateFreeSlots(placeBookings, targetDate)
      };
    });
  }, [data, filters, calculateFreeSlots]);

  const createMutation = useMutation({
    mutationFn: workspaceApi.createBooking,
    onSuccess: () => {
      // Инвалидируем общий ключ, чтобы и карта, и дашборд обновились
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      message.success('Место успешно забронировано!');
      setIsModalOpen(false);
    },
    onError: (err) => {
      message.error(err.response?.status === 409 ? 'Это время уже занято' : 'Ошибка бронирования');
    }
  });

  // Если идет первичная загрузка или данные еще не "смержились", показываем спиннер
  if (isLoading || (data && filteredPlaces.length === 0)) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a' }}>
        <Spin size="large" tip="Загрузка карты офиса..." />
      </div>
    );
  }

  if (isError) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Ошибка загрузки данных. Попробуйте обновить страницу.</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Content style={{ padding: '40px' }}>
        <div style={{ marginBottom: '32px', borderLeft: '4px solid #D4AF37', paddingLeft: '20px' }}>
          <h1 style={{ color: '#fff', letterSpacing: '4px', margin: 0, fontSize: '28px' }}>КАРТА ОФИСА</h1>
          <Typography.Text style={{ color: '#D4AF37', opacity: 0.8 }}>
            Выберите дату и время, чтобы увидеть доступные места
          </Typography.Text>
        </div>

        <PlacesFilters filters={filters} setFilters={setFilters} />

        <div style={{ 
          background: '#141414', borderRadius: '16px', padding: '20px', 
          border: '1px solid #222', height: 'calc(100vh - 300px)', position: 'relative'
        }}>
          <MapContainer 
            places={filteredPlaces} 
            onSelectPlace={(place) => { setSelectedPlace(place); setIsModalOpen(true); }} 
            selectedDate={filters.date}
          />
        </div>

        {selectedPlace && (
          <BookingModal 
            open={isModalOpen} 
            place={selectedPlace}
            initialDate={filters.date}
            initialTimeRange={filters.timeRange}
            onCancel={() => { setIsModalOpen(false); setSelectedPlace(null); }}
            onConfirm={(vals) => {
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

export default OfficeMapPage;