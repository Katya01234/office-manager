import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Typography, Space, Button, Tag, Tooltip } from 'antd';
import { 
  PushpinFilled, 
  HeartFilled, 
  ClockCircleOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { Title, Text } = Typography;

const BookingWidgets = ({ userStats, places, filters, onSelectPlace, onCancelBooking }) => {
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 30000);
    return () => clearInterval(timer);
  }, []);

  const targetDate = filters?.date || dayjs().add(1, 'day');
  
  // 1. Логика поиска активных/будущих броней пользователя
  const { currentActive, nextBooking } = useMemo(() => {
    const history = userStats?.history || [];
    const active = history.find(b => now.isBetween(dayjs(b.start_datetime), dayjs(b.end_datetime)));
    const future = history
      .filter(b => dayjs(b.start_datetime).isAfter(now))
      .sort((a, b) => dayjs(a.start_datetime).valueOf() - dayjs(b.start_datetime).valueOf())[0];

    return { currentActive: active, nextBooking: future };
  }, [userStats?.history, now]);

  const displayBooking = currentActive || nextBooking;
  const isActiveNow = !!currentActive;

  // 2. Логика для любимого места
  const favoriteFullData = places?.find(p => p.id === userStats?.favoritePlace?.id);

  const favoriteSlots = useMemo(() => {
    if (!favoriteFullData) return [];
    const MIN_DURATION = 120;
    const startDay = targetDate.clone().hour(9).minute(0).second(0);
    const endDay = targetDate.clone().hour(22).minute(0).second(0);
    
    const dayBookings = (favoriteFullData.activeBookings || [])
      .filter(b => dayjs(b.start_datetime).isSame(targetDate, 'day'))
      .sort((a, b) => dayjs(a.start_datetime).diff(dayjs(b.start_datetime)));

    let freeSlots = [];
    let currentPos = startDay;

    dayBookings.forEach(booking => {
      const bStart = dayjs(booking.start_datetime);
      const bEnd = dayjs(booking.end_datetime);
      if (bStart.diff(currentPos, 'minute') >= MIN_DURATION) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${bStart.format('HH:mm')}`);
      }
      if (bEnd.isAfter(currentPos)) { currentPos = bEnd; }
    });

    if (endDay.diff(currentPos, 'minute') >= MIN_DURATION) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
    }
    return freeSlots;
  }, [favoriteFullData, targetDate]);

  const isFavoriteFree = favoriteSlots.length > 0;

  return (
    <div style={{ marginBottom: 32 }}>
      {/* МИНИ-НАПОМИНАНИЕ О ЗАКРЕПЛЕННОМ МЕСТЕ (вместо огромного виджета) */}
      {userStats?.mainPlace && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <Tag 
            icon={<PushpinFilled />} 
            style={{ 
              background: 'rgba(22, 119, 255, 0.1)', 
              color: '#1677ff', 
              border: '1px solid #1677ff',
              borderRadius: '20px',
              padding: '2px 12px',
              fontSize: '12px'
            }}
          >
            Ваше постоянное место: <strong>{userStats.mainPlace.name}</strong>
          </Tag>
        </div>
      )}

      <Row gutter={[16, 16]}>
        {/* 1. Любимое место (теперь занимает половину ширины) */}
        <Col xs={24} md={12}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary"><HeartFilled style={{ color: '#fa1814' }} /> Любимое</Text>
                {favoriteFullData && (
                  <Space size={4}>
                    {isFavoriteFree && (
                      <Tooltip title={
                        <div>
                          <strong>Доступные окна:</strong>
                          {favoriteSlots.map((s, i) => <div key={i}>{s}</div>)}
                        </div>
                      }>
                        <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                      </Tooltip>
                    )}
                    <Tag color={isFavoriteFree ? 'success' : 'error'}>
                      {isFavoriteFree ? 'Свободно' : 'Занято'}
                    </Tag>
                  </Space>
                )}
              </div>
              <Title level={4} style={{ margin: 0, color: '#fff' }}>
                {userStats?.favoritePlace?.name || 'Не выбрано'}
              </Title>
              
              {favoriteFullData && isFavoriteFree ? (
                <Button size="small" type="primary" ghost style={{ marginTop: 8, borderColor: '#fadb14', color: '#fadb14' }}>
                  Забронировать на {targetDate.format('DD.MM')}
                </Button>
              ) : favoriteFullData && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 8 }}>
                  Нет окон более 2-х часов
                </Text>
              )}
            </Space>
          </Card>
        </Col>

        {/* 2. Динамический виджет брони (теперь занимает вторую половину) */}
        <Col xs={24} md={12}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <Title level={4} style={{ margin: 0, color: isActiveNow ? '#000' : '#fff' }}>
                      {displayBooking.workspace_name || `Место #${displayBooking.workspace_id}`}
                    </Title>
                    <Text style={{ color: isActiveNow ? '#000' : '#8c8c8c', fontSize: '13px' }}>
                      {!dayjs(displayBooking.start_datetime).isSame(dayjs(), 'day') && 
                        dayjs(displayBooking.start_datetime).format('DD.MM ')}
                      {dayjs(displayBooking.start_datetime).format('HH:mm')} — {dayjs(displayBooking.end_datetime).format('HH:mm')}
                    </Text>
                  </div>
                  
                  <Button 
                    danger icon={<DeleteOutlined />} size="middle" 
                    onClick={(e) => { e.stopPropagation(); onCancelBooking(displayBooking.id); }} 
                    style={{ 
                      background: isActiveNow ? '#000' : 'rgba(255, 77, 79, 0.1)', 
                      color: isActiveNow ? '#fff' : '#ff4d4f', border: 'none', fontWeight: 'bold'
                    }}
                  >
                    {isActiveNow ? 'ВЫЙТИ' : 'ОТМЕНА'}
                  </Button>
                </div>
              ) : (
                <div style={{ padding: '10px 0' }}>
                  <Text type="secondary">На ближайшее время планов нет</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BookingWidgets;