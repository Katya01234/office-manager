import React from 'react';
import { Row, Col, Card, Typography, Space, Button } from 'antd';
import { PushpinFilled, HeartFilled, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const BookingWidgets = ({ userStats, onCancelBooking }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      <Col xs={24} md={8}>
        <Card bordered={false} style={{ background: '#141414', borderLeft: '4px solid #1677ff', height: '100%' }}>
          <Space direction="vertical">
            <Text type="secondary"><PushpinFilled /> Основное место</Text>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              {userStats?.mainPlace || 'Не назначено'}
            </Title>
          </Space>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card bordered={false} style={{ background: '#141414', borderLeft: '4px solid #ff4d4f', height: '100%' }}>
          <Space direction="vertical">
            <Text type="secondary"><HeartFilled style={{ color: '#ff4d4f' }} /> Любимое место</Text>
            <Title level={4} style={{ margin: 0, color: userStats?.favoritePlace ? '#fff' : '#555' }}>
              {userStats?.favoritePlace || 'Не выбрано'}
            </Title>
          </Space>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card bordered={false} style={{ background: '#fadb14', height: '100%' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text style={{ color: '#000' }}><ClockCircleOutlined /> Активная бронь</Text>
            {userStats?.activeBooking ? (
              <>
                <Title level={4} style={{ margin: 0, color: '#000' }}>{userStats.activeBooking.place}</Title>
                <Button 
                  danger size="small" 
                  onClick={onCancelBooking}
                  style={{ marginTop: 10, background: '#000', border: 'none', color: '#fff' }}
                >
                  Отменить бронь
                </Button>
              </>
            ) : (
              <Title level={4} style={{ margin: 0, color: 'rgba(0,0,0,0.45)' }}>Нет брони</Title>
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default BookingWidgets;