import React, { useState, useMemo } from 'react';
import { message, Spin, Typography, Layout } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { workspaceApi } from '../../api/api';
import MapContainer from './Components/MapContainer';
import BookingModal from '../Dashboard/components/BookingModal';

dayjs.extend(isBetween);
const { Content } = Layout;

const OfficeMapPage = () => {
  const queryClient = useQueryClient();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardData'], 
    queryFn: async () => {
      const [ws, active] = await Promise.all([
        workspaceApi.getWorkspaces(),
        workspaceApi.getBookings()
      ]);
      return {
        places: ws.map(place => ({
          ...place,
          activeBookings: active.filter(b => b.workspace_id === place.id)
        }))
      };
    }
  });

  // Логика подсчета свободных мест
  const freePlacesCount = useMemo(() => {
    if (!data?.places) return 0;
    const now = dayjs();
    
    return data.places.filter(place => {
      // Исключаем закрепленные места
      if (place.is_assigned) return false;
      
      // Проверяем, нет ли бронирования в данную секунду
      const isOccupiedNow = place.activeBookings?.some(b => 
        now.isBetween(dayjs(b.start_datetime), dayjs(b.end_datetime))
      );
      
      return !isOccupiedNow;
    }).length;
  }, [data]);

  const createMutation = useMutation({
    mutationFn: workspaceApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      message.success('Место успешно забронировано!');
      setIsModalOpen(false);
      setSelectedPlace(null);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.message || 'Это время уже занято';
      message.error(errorMsg);
    }
  });

  const handleSelectPlace = (place) => {
    if (place.is_assigned) {
      message.warning('Это персональное рабочее место, оно недоступно для бронирования');
      return;
    }
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  if (isLoading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
      <Spin size="large" tip="Загрузка планировки..." />
    </div>
  );

  if (isError) return (
    <div style={{ padding: '50px', textAlign: 'center', color: '#fff' }}>
      <h2>Ошибка загрузки данных</h2>
      <p>Пожалуйста, проверьте подключение к серверу</p>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Content style={{ padding: '40px' }}>
        <div style={{ marginBottom: '32px', borderLeft: '4px solid #D4AF37', paddingLeft: '20px' }}>
          <h1 style={{ color: '#fff', letterSpacing: '4px', margin: 0, fontSize: '28px' }}>
            КАРТА ОФИСА
          </h1>
          {/* Замененный текст со счетчиком */}
          <Typography.Text style={{ color: '#D4AF37', opacity: 0.8, fontSize: '16px' }}>
            Доступно <span style={{ fontWeight: 'bold', color: '#fff' }}>{freePlacesCount}</span> из <span style={{ fontWeight: 'bold', color: '#fff' }}>50</span> мест прямо сейчас
          </Typography.Text>
        </div>

        <div style={{ 
          background: '#141414', 
          borderRadius: '16px', 
          padding: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '1px solid #222',
          height: 'calc(100vh - 200px)',
          position: 'relative'
        }}>
          <MapContainer 
            places={data?.places || []} 
            onSelectPlace={handleSelectPlace} 
          />
        </div>

        <BookingModal 
          open={isModalOpen} 
          place={selectedPlace}
          initialDate={dayjs().add(1, 'day')}
          onCancel={() => { setIsModalOpen(false); setSelectedPlace(null); }}
          onConfirm={(vals) => {
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

export default OfficeMapPage;