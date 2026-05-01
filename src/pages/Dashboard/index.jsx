import React, { useState, useCallback, useMemo } from 'react';
import { Row, Col, message, Spin, Layout } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { workspaceApi } from '../../api/api';

import BookingWidgets from "./components/BookingWidgets.jsx";
import PlacesFilters from "./components/PlacesFilters.jsx";
import PlacesTable from "./components/PlacesTable.jsx";
import BookingModal from "./components/BookingModal";
import HistorySidebar from "./components/HistorySidebar.jsx";
import VKWidget from "./components/VKWidget.jsx";

const { Content } = Layout;

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({ 
    onlyFree: false,
    date: dayjs().add(1, 'day').startOf('day'), 
    timeRange: null,
    type: 'all' 
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const [ws, active, fav, hist, main, vkStatus] = await Promise.all([
        workspaceApi.getWorkspaces(),
        workspaceApi.getBookings(),
        workspaceApi.getFavorite(),
        workspaceApi.getBookingHistory(),
        workspaceApi.getMainWorkspace(),
        workspaceApi.getVkStatus()
      ]);

      const combinedHistory = [...(active || []), ...(hist || [])];
      return {
        places: (ws || []).map(p => ({ ...p, key: p.id, activeBookings: (active || []).filter(b => b.workspace_id === p.id) })),
        userStats: {
          history: Array.from(new Map(combinedHistory.map(item => [item.id, item])).values()),
          favoritePlace: fav,
          mainPlace: main,
          vkStatus: vkStatus
        }
      };
    }
  });

  const createMutation = useMutation({
    mutationFn: workspaceApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      message.success('Забронировано');
      setIsModalOpen(false);
    }
  });

  const calculateFreeSlots = useCallback((bookings = [], targetDate) => {
    const MIN_DURATION = 120;
    const now = dayjs();
    let startPos = targetDate.isSame(now, 'day') ? now.add(15, 'm') : targetDate.hour(9).minute(0);
    const endDay = targetDate.hour(22).minute(0);

    let freeSlots = [];
    let currentPos = startPos;

    const dayBookings = bookings
      .filter(b => dayjs.utc(b.start_datetime).local().isSame(targetDate, 'day'))
      .sort((a, b) => dayjs.utc(a.start_datetime).diff(dayjs.utc(b.start_datetime)));

    dayBookings.forEach(b => {
      const bStart = dayjs.utc(b.start_datetime).local();
      if (bStart.diff(currentPos, 'm') >= MIN_DURATION) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${bStart.format('HH:mm')}`);
      }
      currentPos = dayjs.utc(b.end_datetime).local();
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
    }).map(p => ({ ...p, freeSlots: calculateFreeSlots(p.activeBookings, filters.date) }));
  }, [data, filters, calculateFreeSlots]);

  if (isLoading) return <div style={{ background: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;

  return (
    <Layout style={{ minHeight: '100vh', background: '#000' }}>
      <Content style={{ padding: '24px' }}>
        <BookingWidgets 
          userStats={data.userStats} 
          places={data.places} 
          filters={filters}
          onCancelBooking={(id) => workspaceApi.deleteBooking(id).then(() => queryClient.invalidateQueries(['dashboardData']))} 
          onSelectPlace={(p) => { setSelectedPlace(p); setIsModalOpen(true); }} 
        />
        <PlacesFilters filters={filters} setFilters={setFilters} />
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            <PlacesTable 
              data={filteredPlaces} 
              onBook={(p) => { setSelectedPlace(p); setIsModalOpen(true); }}
              favoritePlaceId={data.userStats.favoritePlace?.id} 
              mainPlaceId={data.userStats.mainPlace?.id}
              onToggleFavorite={async (id) => { await workspaceApi.toggleFavorite(id); queryClient.invalidateQueries({ queryKey: ['dashboardData'] }); queryClient.invalidateQueries({ queryKey: ['mapData'] }); }}
            />
          </Col>
          <Col xs={24} lg={8}>
            <HistorySidebar history={data.userStats.history} onCancelBooking={(id) => workspaceApi.deleteBooking(id).then(() => queryClient.invalidateQueries(['dashboardData']))} />
          </Col>
        </Row>

        {selectedPlace && (
          <BookingModal 
            open={isModalOpen} 
            place={selectedPlace}
            vkStatus={data.userStats.vkStatus}
            initialDate={filters.date}
            onCancel={() => setIsModalOpen(false)}
            onConfirm={(vals) => {
              if (vals.end.diff(vals.start, 'm') < 120) return message.error('Минимум 2 часа');
              
              const isMeeting = selectedPlace.name?.startsWith('П');
              if (!isMeeting) {
                const hasDesk = data.userStats.history.some(b => 
                  dayjs.utc(b.start_datetime).local().isSame(vals.start, 'day') && 
                  !data.places.find(p => p.id === b.workspace_id)?.name?.startsWith('П')
                );
                if (hasDesk) return message.error('Рабочее место на этот день уже забронировано');
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