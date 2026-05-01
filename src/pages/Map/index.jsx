import React, { useState, useMemo, useCallback } from 'react';
import { message, Spin, Typography, Layout } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc'; // Добавлено для синхронизации с Dashboard
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

  const [filters, setFilters] = useState({ 
    date: dayjs().add(1, 'day').startOf('day'), 
    timeRange: null,
    type: 'all' 
  });

  const { data, isLoading } = useQuery({
    queryKey: ['mapData', filters.date.format('YYYY-MM-DD')], 
    queryFn: async () => {
      const [ws, active, fav, main, vkStatus] = await Promise.all([
        workspaceApi.getWorkspaces(),
        workspaceApi.getBookings(),
        workspaceApi.getFavorite(),    
        workspaceApi.getMainWorkspace(),
        workspaceApi.getVkStatus()
      ]);
      
      return { 
        rawPlaces: ws || [], 
        bookings: active || [], 
        userStats: {
          favoritePlace: fav,
          mainPlace: main,
          vkStatus: vkStatus
        } 
      };
    },
    refetchOnMount: true,
    staleTime: 0 
  });

  const calculateFreeSlots = useCallback((bookings = [], targetDate) => {
    const MIN_DURATION = 120;
    const now = dayjs();
    let startPos;
    
    // Исправленная логика начальной точки отсчета
    if (targetDate.isSame(now, 'day')) {
      const startOfWorkingDay = targetDate.clone().hour(9).minute(0).second(0);
      startPos = now.isBefore(startOfWorkingDay) ? startOfWorkingDay : now.add(15, 'minute');
    } else {
      startPos = targetDate.clone().hour(9).minute(0).second(0);
    }

    const endDay = targetDate.clone().hour(22).minute(0).second(0);
    if (startPos.isAfter(endDay) || startPos.isSame(endDay)) return [];

    let freeSlots = [];
    let currentPos = startPos;

    const dayBookings = bookings
      .map(b => ({
        start: dayjs.utc(b.start_datetime).local(),
        end: dayjs.utc(b.end_datetime).local()
      }))
      .filter(b => b.start.isSame(targetDate, 'day'))
      .sort((a, b) => a.start.diff(b.start));

    dayBookings.forEach(b => {
      if (b.start.isAfter(currentPos) && b.start.diff(currentPos, 'minute') >= MIN_DURATION) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${b.start.format('HH:mm')}`);
      }
      if (b.end.isAfter(currentPos)) currentPos = b.end;
    });

    if (endDay.diff(currentPos, 'minute') >= MIN_DURATION) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
    }
    return freeSlots;
  }, []);

  const filteredPlaces = useMemo(() => {
    if (!data?.rawPlaces) return [];
    const targetDate = filters.date || dayjs().add(1, 'day');

    return data.rawPlaces.filter(place => {
      if (filters.type && filters.type !== 'all') {
        const isMeeting = place.name?.startsWith('П');
        if (filters.type === 'meeting' && !isMeeting) return false;
        if (filters.type === 'desk' && isMeeting) return false;
      }
      return true;
    }).map(place => {
      const placeBookings = data.bookings.filter(b => b.workspace_id === place.id);
      let isOccupiedInFilter = false;

      if (filters.timeRange) {
        const [start, end] = filters.timeRange;
        const fullStart = targetDate.clone().hour(start.hour()).minute(start.minute()).second(0);
        const fullEnd = targetDate.clone().hour(end.hour()).minute(end.minute()).second(0);
        
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
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      queryClient.invalidateQueries({ queryKey: ['mapData'] });
      message.success('Место успешно забронировано!');
      setIsModalOpen(false);
    },
    onError: (err) => {
      message.error(err.response?.status === 409 ? 'Это время уже занято' : 'Ошибка бронирования');
    }
  });

  if (isLoading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Content style={{ padding: '40px' }}>
        <div style={{ marginBottom: '32px', borderLeft: '4px solid #D4AF37', paddingLeft: '20px' }}>
          <h1 style={{ color: '#fff', letterSpacing: '4px', margin: 0, fontSize: '28px' }}>КАРТА ОФИСА</h1>
          <Typography.Text style={{ color: '#D4AF37', opacity: 0.8 }}>Выберите дату и время для бронирования карте.</Typography.Text>
        </div>

        <PlacesFilters filters={filters} setFilters={setFilters} />

        <div style={{ background: '#141414', borderRadius: '16px', padding: '20px', border: '1px solid #222', height: 'calc(100vh - 300px)', position: 'relative' }}>
          <MapContainer 
            places={filteredPlaces} 
            onSelectPlace={(place) => { setSelectedPlace(place); setIsModalOpen(true); }} 
            selectedDate={filters.date}
            userStats={data?.userStats} 
          />
        </div>

        {selectedPlace && (
          <BookingModal 
            open={isModalOpen} 
            place={selectedPlace}
            vkStatus={data?.userStats?.vkStatus}
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
              // Валидация
              if (vals.end.diff(vals.start, 'minute') < 120) {
                return message.error('Минимальное время — 2 часа');
              }

              // Проверка на существующее бронирование стола (не переговорки)
              const isMeetingRoom = selectedPlace?.name?.startsWith('П');
              if (!isMeetingRoom) {
                const hasExistingDesk = data?.bookings?.some(b => {
                  const bStart = dayjs.utc(b.start_datetime).local();
                  const isSameDay = bStart.isSame(vals.start, 'day');
                  const placeDetails = data?.rawPlaces?.find(p => p.id === b.workspace_id);
                  const isDesk = placeDetails && !placeDetails.name?.startsWith('П');
                  return isSameDay && isDesk;
                });

                if (hasExistingDesk) {
                  return message.error('Вы уже забронировали рабочее место на этот день.');
                }
              }

              // ИСПОЛЬЗУЕМ UTC ПРИ ОТПРАВКЕ
              createMutation.mutate({
                workspace_id: selectedPlace.id,
                start_datetime: vals.start.utc().format(),
                end_datetime: vals.end.utc().format()
              });
            }}
          />
        )}
      </Content>
    </Layout>
  );
};

export default OfficeMapPage;