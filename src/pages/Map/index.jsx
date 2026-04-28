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

  const [filters, setFilters] = useState({ 
    date: dayjs().add(1, 'day').startOf('day'), 
    timeRange: null,
    type: 'all' 
  });

  const { data, isLoading } = useQuery({
    queryKey: ['mapData', filters.date.format('YYYY-MM-DD')], 
    queryFn: async () => {
      // Используем ту же логику запросов, что и в Dashboard
      const [ws, active, fav, main] = await Promise.all([
        workspaceApi.getWorkspaces(),
        workspaceApi.getBookings(),
        workspaceApi.getFavorite(),    
        workspaceApi.getMainWorkspace() 
      ]);
      
      return { 
        rawPlaces: ws, 
        bookings: active, 
        userStats: {
          favoritePlace: fav,
          mainPlace: main
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

  const filteredPlaces = useMemo(() => {
    if (!data?.rawPlaces || !data?.bookings) return [];
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
          <Typography.Text style={{ color: '#D4AF37', opacity: 0.8 }}>Выберите дату и время.</Typography.Text>
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
              if (vals.end.diff(vals.start, 'minute') < 120) {
                return message.error('Минимальное время — 2 часа');
              }

              const isMeetingRoom = selectedPlace?.name?.startsWith('П');
              if (!isMeetingRoom) {
                const hasExistingDesk = data?.bookings?.some(b => {
                  const isSameDay = dayjs.utc(b.start_datetime).local().isSame(vals.start, 'day');
                  const placeDetails = data?.rawPlaces?.find(p => p.id === b.workspace_id);
                  const isDesk = placeDetails && !placeDetails.name?.startsWith('П');
                  return isSameDay && isDesk;
                });

                if (hasExistingDesk) {
                  return message.error('Вы уже забронировали рабочее место на этот день.');
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

export default OfficeMapPage;