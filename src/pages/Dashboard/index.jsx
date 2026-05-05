import React, { useState, useCallback, useMemo } from 'react';
import { Row, Col, message, Spin, Layout, Card, Typography, Space, Badge } from 'antd'; // Добавили компоненты для AI Card
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; 
import { workspaceApi } from '../../api/api';

import BookingWidgets from "./components/BookingWidgets.jsx";
import PlacesFilters from "./components/PlacesFilters.jsx";
import PlacesTable from "./components/PlacesTable.jsx";
import BookingModal from "./components/BookingModal";
import HistorySidebar from "./components/HistorySidebar.jsx";
import VKWidget from "./components/VKWidget"; // Импорт виджета VK

dayjs.extend(utc);

const { Content } = Layout;
const { Text, Title } = Typography;

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

  const { data, isLoading } = useQuery({
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
    }
  });

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
      if (b.end.isAfter(currentPos)) {
        currentPos = b.end;
      }
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
              onToggleFavorite={async (id) => { 
                await workspaceApi.toggleFavorite(id); 
                queryClient.invalidateQueries({ queryKey: ['dashboardData'] }); 
              }}
            />
          </Col>
          
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              
              {/* 1. Виджет привязки VK (отображается, если не привязан) */}
              {data.userStats.vkStatus && !data.userStats.vkStatus.is_linked && (
                <VKWidget 
                  onConnectSuccess={() => queryClient.invalidateQueries({ queryKey: ['dashboardData'] })} 
                />
              )}

              {/* 3. История бронирований */}
              <HistorySidebar 
                history={data.userStats.history} 
                onCancelBooking={(id) => workspaceApi.deleteBooking(id).then(() => queryClient.invalidateQueries(['dashboardData']))} 
              />
            </Space>
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
              createMutation.mutate({
                workspace_id: selectedPlace.id,
                start_datetime: dayjs(vals.start).utc().format(),
                end_datetime: dayjs(vals.end).utc().format()
              });
            }}
          />
        )}
      </Content>
    </Layout>
  );
};

export default Dashboard;