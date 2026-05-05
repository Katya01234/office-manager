import React from 'react';
import { Layout, Typography, Card, Timeline, Tag, Space, Row, Col } from 'antd';
import { RobotOutlined, CalendarOutlined, RocketOutlined, NotificationOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

const Roadmap = () => {
  const steps = [
    {
      title: 'Интеграция с VK ID & Уведомления',
      status: 'Done',
      color: 'green',
      icon: <NotificationOutlined />,
      description: 'Привязка аккаунта и получение подтверждений бронирования в личные сообщения.',
    },
    {
      title: 'AI Ассистент (LLM)',
      status: 'In Progress',
      color: 'blue',
      icon: <RobotOutlined />,
      description: 'Управление офисом через естественный язык. Команды "Продли", "Найди место" прямо в чате бота.',
    },
    {
      title: 'Система Автобронирования',
      status: 'Planned',
      color: 'purple',
      icon: <CalendarOutlined />,
      description: 'Автоматическое резервирование любимых мест на основе твоего расписания и привычек.',
    },
    {
      title: 'Интерактивная карта офиса',
      status: 'Planned',
      color: 'gray',
      icon: <RocketOutlined />,
      description: 'Визуальный выбор места на 3D-схеме этажа с отображением коллег в реальном времени.',
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#000', padding: '40px 20px' }}>
      <Content style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2} style={{ color: '#fff', marginBottom: '8px' }}>Roadmap</Title>
            <Text style={{ color: '#8c8c8c' }}>Будущее развития экосистемы OfficeManager</Text>
          </div>

          <Timeline mode="alternate" style={{ marginTop: '40px' }}>
            {steps.map((step, index) => (
              <Timeline.Item 
                key={index} 
                dot={<div style={{ padding: '8px', background: '#141414', borderRadius: '50%', border: `1px solid ${step.color}` }}>{step.icon}</div>}
                color={step.color}
              >
                <Card 
                  bordered={false}
                  style={{ 
                    background: '#141414', 
                    border: '1px solid #303030', 
                    borderRadius: '12px',
                    textAlign: 'left'
                  }}
                >
                  <Space direction="vertical" size="small">
                    <Tag color={step.color}>{step.status}</Tag>
                    <Title level={5} style={{ color: '#fff', margin: 0 }}>{step.title}</Title>
                    <Text style={{ color: '#8c8c8c', fontSize: '13px' }}>{step.description}</Text>
                  </Space>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        </Space>
      </Content>
    </Layout>
  );
};

export default Roadmap;