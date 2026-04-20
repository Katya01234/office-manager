import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Typography, Space, Button, Tag } from 'antd';
import { 
  PushpinFilled, 
  HeartFilled, 
  ClockCircleOutlined,
  DeleteOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

// Подключаем плагин для корректной работы сравнения "между"
dayjs.extend(isBetween);

const { Title, Text } = Typography;

const BookingWidgets = ({ userStats, places, filters, onSelectPlace, onCancelBooking }) => {
  // 1. Внутренний таймер для обновления "текущего момента"
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    // Обновляем состояние 'now' каждые 30 секунд для точности виджета
    const timer = setInterval(() => setNow(dayjs()), 30000);
    return () => clearInterval(timer);
  }, []);

  const targetDate = filters?.date || dayjs().add(1, 'day');
  
  // 2. Логика поиска бронирований
  const { currentActive, nextBooking } = useMemo(() => {
    // Важно: здесь должны быть данные И из /bookings, И из /bookings/history 
    // (это мы исправили в Dashboard.jsx)
    const history = userStats?.history || [];
    
    // Ищем то, что идет прямо сейчас
    const active = history.find(b => {
      const start = dayjs(b.start_datetime);
      const end = dayjs(b.end_datetime);
      return now.isBetween(start, end);
    });

    // Ищем ближайшее в будущем (которое еще не началось)
    const future = history
      .filter(b => dayjs(b.start_datetime).isAfter(now))
      .sort((a, b) => dayjs(a.start_datetime).valueOf() - dayjs(b.start_datetime).valueOf())[0];

    return { currentActive: active, nextBooking: future };
  }, [userStats?.history, now]);

  // Приоритет: сначала показываем текущее место, если его нет — ближайшее запланированное
  const displayBooking = currentActive || nextBooking;
  const isActiveNow = !!currentActive;

  // Данные для любимого места
  const favoriteFullData = places?.find(p => p.id === userStats?.favoritePlace?.id);
  const isFavoriteFree = useMemo(() => {
    if (!favoriteFullData) return false;
    // Проверяем, нет ли броней на это место на выбранную в фильтрах дату
    return !favoriteFullData.activeBookings?.some(b => 
      dayjs(b.start_datetime).isSame(targetDate, 'day')
    );
  }, [favoriteFullData, targetDate]);

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      
      {/* 1. Закрепленное место (Main Workspace) */}
      <Col xs={24} md={8}>
        <Card bordered={false} style={{ background: '#141414', borderLeft: '4px solid #1677ff', height: '100%', borderRadius: '12px' }}>
          <Space direction="vertical">
            <Text type="secondary"><PushpinFilled /> Закреплено за вами</Text>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              {userStats?.mainPlace?.name || 'Место не назначено'}
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
            borderLeft: '4px solid #fa1814', 
            height: '100%', 
            borderRadius: '12px'
          }}
          onClick={() => favoriteFullData && isFavoriteFree && onSelectPlace(favoriteFullData)}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary"><HeartFilled style={{ color: '#fa1814' }} /> Любимое</Text>
              {favoriteFullData && (
                <Tag color={isFavoriteFree ? 'success' : 'error'}>
                  {isFavoriteFree ? 'Свободно' : 'Занято'}
                </Tag>
              )}
            </div>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              {userStats?.favoritePlace?.name || 'Не выбрано'}
            </Title>
            {favoriteFullData && isFavoriteFree && (
              <Button size="small" type="primary" ghost style={{ marginTop: 8, borderColor: '#fadb14', color: '#fadb14' }}>
                Забронировать на {targetDate.format('DD.MM')}
              </Button>
            )}
          </Space>
        </Card>
      </Col>

      {/* 3. ДИНАМИЧЕСКИЙ ВИДЖЕТ БРОНИ (Текущая или Ближайшая) */}
      <Col xs={24} md={8}>
        <Card 
          bordered={false} 
          style={{ 
            background: isActiveNow ? '#fadb14' : '#1f1f1f', 
            height: '100%', 
            borderRadius: '12px',
            border: !isActiveNow && displayBooking ? '1px solid #fadb14' : 'none',
            transition: 'all 0.5s ease'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: isActiveNow ? '#000' : '#fadb14', fontWeight: '500' }}>
                {isActiveNow ? <CheckCircleOutlined /> : <ClockCircleOutlined />} 
                {isActiveNow ? ' ТЕКУЩЕЕ МЕСТО' : (displayBooking ? ' СКОРО' : ' НЕТ БРОНЕЙ')}
              </Text>
              {displayBooking && !isActiveNow && <Tag color="gold">План</Tag>}
            </div>
            
            {displayBooking ? (
              <>
                <Title level={4} style={{ margin: 0, color: isActiveNow ? '#000' : '#fff' }}>
                  {displayBooking.workspace_name || `Место #${displayBooking.workspace_id}`}
                </Title>
                <Text style={{ color: isActiveNow ? '#000' : '#8c8c8c', fontSize: '13px' }}>
                  {/* Если бронь не сегодня, показываем дату */}
                  {!dayjs(displayBooking.start_datetime).isSame(dayjs(), 'day') && 
                    dayjs(displayBooking.start_datetime).format('DD.MM ')}
                  
                  {dayjs(displayBooking.start_datetime).format('HH:mm')} — {dayjs(displayBooking.end_datetime).format('HH:mm')}
                </Text>
                
                <Button 
                  danger 
                  block
                  icon={<DeleteOutlined />}
                  size="middle" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelBooking(displayBooking.id);
                  }} 
                  style={{ 
                    marginTop: 12, 
                    background: isActiveNow ? '#000' : 'rgba(255, 77, 79, 0.1)', 
                    color: isActiveNow ? '#fff' : '#ff4d4f',
                    border: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  {isActiveNow ? 'ЗАВЕРШИТЬ' : 'ОТМЕНИТЬ БРОНЬ'}
                </Button>
              </>
            ) : (
              <div style={{ padding: '10px 0' }}>
                <Text type="secondary">На ближайшее время планов нет</Text>
              </div>
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default BookingWidgets;