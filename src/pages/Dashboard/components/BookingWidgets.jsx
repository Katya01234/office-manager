import React from 'react';
import { Row, Col, Card, Typography, Space, Button, Tag } from 'antd';
import { PushpinFilled, HeartFilled, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const BookingWidgets = ({ userStats, onCancelBooking }) => {
  const now = dayjs();
  const active = userStats?.history?.find(b => 
    now.isAfter(dayjs(b.start_datetime)) && now.isBefore(dayjs(b.end_datetime))
  );

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      {/* 1. Основное место (Fixed) */}
      <Col xs={24} md={8}>
        <Card bordered={false} style={{ background: '#141414', borderLeft: '4px solid #1677ff', height: '100%', borderRadius: '8px' }}>
          <Space direction="vertical">
            <Text type="secondary"><PushpinFilled /> Закреплено за вами</Text>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              {/* Если у пользователя есть место со статусом assigned в API */}
              {userStats?.mainPlace || 'Закрепленного за Вами места нет'}
            </Title>
          </Space>
        </Card>
      </Col>

      {/* 2. Любимое место */}
      <Col xs={24} md={8}>
        <Card bordered={false} style={{ background: '#141414', borderLeft: '4px solid #ff4d4f', height: '100%', borderRadius: '8px' }}>
          <Space direction="vertical">
            <Text type="secondary"><HeartFilled style={{ color: '#ff4d4f' }} /> Любимая локация</Text>
            <Title level={4} style={{ margin: 0, color: userStats?.favoritePlace ? '#fff' : '#555' }}>
              {userStats?.favoritePlace || 'Не выбрано'}
            </Title>
          </Space>
        </Card>
      </Col>

      {/* 3. Активная бронь (Динамическая) */}
      <Col xs={24} md={8}>
        <Card bordered={false} style={{ background: active ? '#fadb14' : '#1f1f1f', height: '100%', borderRadius: '8px', transition: 'all 0.3s' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text style={{ color: active ? '#000' : '#8c8c8c' }}>
              <ClockCircleOutlined /> {active ? 'Вы сейчас здесь' : 'Нет активных броней'}
            </Text>
            
            {active ? (
              <>
                <Title level={4} style={{ margin: 0, color: '#000' }}>
                  {active.workspace_name}
                </Title>
                <Space size={4}>
                  <CalendarOutlined style={{ color: '#000' }} />
                  <Text style={{ color: '#000', fontSize: '12px' }}>
                    до {dayjs(active.end_datetime).format('HH:mm')}
                  </Text>
                </Space>
                <Button 
                  danger 
                  size="small" 
                  onClick={() => onCancelBooking(active.id)} 
                  style={{ 
                    marginTop: 8, 
                    background: '#000', 
                    border: 'none', 
                    color: '#fff',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}
                >
                  Завершить
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