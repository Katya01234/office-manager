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
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(isBetween);

const { Title, Text } = Typography;

const BookingWidgets = ({ userStats, places, filters, onSelectPlace, onCancelBooking }) => {
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
        // Обновляем стейт только если изменилась минута, чтобы не спамить рендерами
        const newNow = dayjs();
        if (newNow.minute() !== now.minute()) setNow(newNow);
    }, 10000);
    return () => clearInterval(timer);
  }, [now]);

  const targetDate = filters?.date || dayjs().add(1, 'day');
  
  const { currentActive, nextBooking } = useMemo(() => {
    const history = userStats?.history || [];
    
    const active = history.find(b => 
      now.isBetween(dayjs.utc(b.start_datetime).local(), dayjs.utc(b.end_datetime).local())
    );

    const future = history
      .filter(b => dayjs.utc(b.start_datetime).local().isAfter(now))
      .sort((a, b) => dayjs.utc(a.start_datetime).valueOf() - dayjs.utc(b.start_datetime).valueOf())[0];

    return { currentActive: active, nextBooking: future };
  }, [userStats?.history, now]);

  const displayBooking = currentActive || nextBooking;
  const isActiveNow = !!currentActive;

  const favoriteFullData = useMemo(() => 
    places?.find(p => p.id === userStats?.favoritePlace?.id),
    [places, userStats?.favoritePlace?.id]
  );

  const favoriteSlots = useMemo(() => {
    if (!favoriteFullData) return [];
    const MIN_DURATION = 120;
    
    const startDay = targetDate.clone().hour(9).minute(0).second(0);
    const endDay = targetDate.clone().hour(22).minute(0).second(0);
    
    let currentPos = targetDate.isSame(dayjs(), 'day') 
      ? dayjs().add(15, 'minute') 
      : startDay;

    const dayBookings = (favoriteFullData.activeBookings || [])
      .map(b => ({
        start: dayjs.utc(b.start_datetime).local(),
        end: dayjs.utc(b.end_datetime).local()
      }))
      .filter(b => b.start.isSame(targetDate, 'day'))
      .sort((a, b) => a.start.diff(b.start));

    let freeSlots = [];

    dayBookings.forEach(booking => {
      if (booking.start.diff(currentPos, 'minute') >= MIN_DURATION) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${booking.start.format('HH:mm')}`);
      }
      if (booking.end.isAfter(currentPos)) {
        currentPos = booking.end;
      }
    });

    if (endDay.diff(currentPos, 'minute') >= MIN_DURATION) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
    }
    
    return freeSlots;
  }, [favoriteFullData, targetDate]);

  const isFavoriteFree = favoriteSlots.length > 0;

  return (
    <div style={{ marginBottom: 32 }}>
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
              
              {favoriteFullData && isFavoriteFree && (
                <Button size="small" type="primary" ghost style={{ marginTop: 8, borderColor: '#fadb14', color: '#fadb14' }}>
                  Забронировать на {targetDate.format('DD.MM')}
                </Button>
              )}
            </Space>
          </Card>
        </Col>

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
              </div>
              
              {displayBooking ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <Title level={4} style={{ margin: 0, color: isActiveNow ? '#000' : '#fff' }}>
                      {displayBooking.workspace_name || `Место #${displayBooking.workspace_id}`}
                    </Title>
                    <Text style={{ color: isActiveNow ? '#000' : '#8c8c8c', fontSize: '13px' }}>
                      {!dayjs.utc(displayBooking.start_datetime).local().isSame(dayjs(), 'day') && 
                        dayjs.utc(displayBooking.start_datetime).local().format('DD.MM ')}
                      {dayjs.utc(displayBooking.start_datetime).local().format('HH:mm')} — {dayjs.utc(displayBooking.end_datetime).local().format('HH:mm')}
                    </Text>
                  </div>
                  
                  <Button 
                    danger icon={<DeleteOutlined />} size="middle" 
                    onClick={(e) => { 
                        // ОСТАНАВЛИВАЕМ ВСПЛЫТИЕ, чтобы не сработал onClick карточки
                        e.stopPropagation(); 
                        onCancelBooking(displayBooking.id); 
                    }} 
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