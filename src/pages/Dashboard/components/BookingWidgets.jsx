import React from 'react';
import { Row, Col, Card, Typography, Space, Button, Tag } from 'antd';
import { 
  PushpinFilled, 
  HeartFilled, 
  ClockCircleOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const BookingWidgets = ({ userStats, places, onSelectPlace, onCancelBooking }) => {
  const now = dayjs();
  
  // 1. Ищем бронь, которая идет ПРЯМО СЕЙЧАС
  const currentActive = userStats?.history?.find(b => 
    now.isAfter(dayjs(b.start_datetime)) && now.isBefore(dayjs(b.end_datetime))
  );

  // 2. Ищем ближайшую будущую бронь (например, на завтра)
  const nextBooking = userStats?.history
    ?.filter(b => dayjs(b.start_datetime).isAfter(now))
    ?.sort((a, b) => dayjs(a.start_datetime).diff(dayjs(b.start_datetime)))[0];

  // Определяем, какую бронь показывать в 3-м виджете
  const displayBooking = currentActive || nextBooking;
  const isFuture = !!(!currentActive && nextBooking);

  // Находим полные данные о месте из брони, чтобы передать их в onSelectPlace
  const bookingPlaceData = places?.find(p => p.id === displayBooking?.workspace_id);

  // Данные для любимого места
  const favoriteFullData = places?.find(p => p.id === userStats?.favoritePlace?.id);
  const targetDate = dayjs().add(1, 'day');
  
  const isFavoriteFree = React.useMemo(() => {
    if (!favoriteFullData) return false;
    return !favoriteFullData.activeBookings?.some(b => 
      dayjs(b.start_datetime).isSame(targetDate, 'day')
    );
  }, [favoriteFullData, targetDate]);

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      
      {/* 1. Закрепленное место */}
      <Col xs={24} md={8}>
        <Card bordered={false} style={{ background: '#141414', borderLeft: '4px solid #1677ff', height: '100%', borderRadius: '8px' }}>
          <Space direction="vertical">
            <Text type="secondary"><PushpinFilled /> Закреплено за вами</Text>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              {userStats?.mainPlace?.name || 'Нет закрепленного места'}
            </Title>
          </Space>
        </Card>
      </Col>

      {/* 2. Любимое место */}
      <Col xs={24} md={8}>
        <Card 
          bordered={false} 
          hoverable={!!favoriteFullData && isFavoriteFree}
          style={{ 
            background: '#141414', 
            borderLeft: '4px solid #fadb14', 
            height: '100%', 
            borderRadius: '8px',
            cursor: (favoriteFullData && isFavoriteFree) ? 'pointer' : 'default'
          }}
          onClick={() => {
            if (favoriteFullData && isFavoriteFree) onSelectPlace(favoriteFullData);
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Text type="secondary">
                <HeartFilled style={{ color: '#fadb14' }} /> Любимая локация
              </Text>
              {favoriteFullData && (
                <Tag color={isFavoriteFree ? 'success' : 'error'} style={{ marginRight: 0 }}>
                  {isFavoriteFree ? 'Свободно завтра' : 'Занято завтра'}
                </Tag>
              )}
            </div>
            <Title level={4} style={{ margin: 0, color: userStats?.favoritePlace ? '#fff' : '#555' }}>
              {userStats?.favoritePlace?.name || 'Не выбрано'}
            </Title>
            {favoriteFullData && isFavoriteFree && (
              <Button size="small" style={{ marginTop: 8, background: '#fadb14', border: 'none', color: '#000', fontWeight: 'bold' }}>
                ЗАБРОНИРОВАТЬ
              </Button>
            )}
          </Space>
        </Card>
      </Col>

      {/* 3. Активная или ближайшая бронь (Кликабельный) */}
      <Col xs={24} md={8}>
        <Card 
          bordered={false} 
          hoverable={!!displayBooking}
          style={{ 
            background: displayBooking ? (isFuture ? '#1f1f1f' : '#fadb14') : '#1f1f1f', 
            height: '100%', 
            borderRadius: '8px', 
            transition: 'all 0.3s',
            cursor: displayBooking ? 'pointer' : 'default',
            border: isFuture ? '1px solid #fadb14' : 'none'
          }}
          onClick={() => {
            if (bookingPlaceData) onSelectPlace(bookingPlaceData);
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: displayBooking ? (isFuture ? '#fadb14' : '#000') : '#8c8c8c' }}>
                <ClockCircleOutlined /> {isFuture ? 'Ближайшая бронь' : (displayBooking ? 'Вы сейчас здесь' : 'Нет активных броней')}
              </Text>
              {isFuture && <Tag color="warning">Завтра</Tag>}
            </div>
            
            {displayBooking ? (
              <>
                <Title level={4} style={{ margin: 0, color: isFuture ? '#fff' : '#000' }}>
                  {displayBooking.workspace_name}
                </Title>
                <Space direction="vertical" size={0}>
                  <Text style={{ color: isFuture ? '#8c8c8c' : '#000', fontSize: '12px' }}>
                    {dayjs(displayBooking.start_datetime).format('DD.MM')} | {dayjs(displayBooking.start_datetime).format('HH:mm')} - {dayjs(displayBooking.end_datetime).format('HH:mm')}
                  </Text>
                </Space>
                <Button 
                  danger 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation(); // Чтобы при клике на кнопку не открывалась модалка
                    onCancelBooking(displayBooking.id);
                  }} 
                  style={{ 
                    marginTop: 8, 
                    background: isFuture ? 'transparent' : '#000', 
                    border: isFuture ? '1px solid #ff4d4f' : 'none', 
                    color: isFuture ? '#ff4d4f' : '#fff',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}
                >
                  {isFuture ? 'Отменить' : 'Завершить'}
                </Button>
              </>
            ) : (
              <Title level={4} style={{ margin: 0, color: '#434343' }}>Свободен</Title>
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default BookingWidgets;