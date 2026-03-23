import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, List, Avatar, Tag, Typography, Badge, Button, Select, Space, Empty } from 'antd';
import { SearchOutlined, UserAddOutlined, UserDeleteOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Friends = () => {
  const [loading, setLoading] = useState(false);
  
  // 1. Состояние для "Мои подписки"
  const [mySubscriptions, setMySubscriptions] = useState([
    { id: 1, name: 'Алексей Петров', role: 'Backend', dept: 'IT', status: 'online', place: 'А-101' },
    { id: 2, name: 'Мария Сидорова', role: 'Designer', dept: 'Design', status: 'offline', place: '-' },
  ]);

  // 2. Состояние для поиска коллег
  const [searchResult, setSearchResult] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Имитация списка отделов (для фильтра)
  const departments = ['All', 'IT', 'Design', 'Management', 'HR', 'Finance'];

  // --- ЛОГИКА: Подписаться ---
  const handleFollow = (person) => {
    // API CONNECT: POST /api/subscribe { targetId: person.id }
    setMySubscriptions([...mySubscriptions, { ...person, status: 'offline', place: 'Неизвестно' }]);
    message.success(`Вы подписались на ${person.name}`);
  };

  // --- ЛОГИКА: Отписаться ---
  const handleUnfollow = (id) => {
    // API CONNECT: DELETE /api/subscribe/{id}
    setMySubscriptions(mySubscriptions.filter(s => s.id !== id));
  };

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={2} style={{ color: '#fadb14', marginBottom: 30 }}>Друзья</Title>

      <Row gutter={[24, 24]}>
        {/* СЕКЦИЯ 1: МОИ ПОДПИСКИ */}
        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ color: '#fadb14' }}><TeamOutlined /> Мои подписки</span>}
            style={{ background: '#141414', borderColor: '#333', minHeight: '400px' }}
          >
            <List
              dataSource={mySubscriptions}
              locale={{ emptyText: <Empty description="Вы еще ни на кого не подписаны" /> }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button 
                      type="text" 
                      danger 
                      icon={<UserDeleteOutlined />} 
                      onClick={() => handleUnfollow(item.id)}
                    >
                      Удалить
                    </Button>
                  ]}
                  style={{ borderBottom: '1px solid #333' }}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot color={item.status === 'online' ? '#52c41a' : '#bfbfbf'} offset={[-5, 32]}>
                        <Avatar style={{ backgroundColor: '#fadb14', color: '#000' }}>{item.name[0]}</Avatar>
                      </Badge>
                    }
                    title={<Text strong style={{ color: '#fff' }}>{item.name}</Text>}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{item.role} • {item.dept}</Text>
                        <Text style={{ color: '#fadb14', fontSize: '12px' }}>Место: {item.place}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* СЕКЦИЯ 2: НАЙТИ КОЛЛЕГУ */}
        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ color: '#fff' }}><SearchOutlined /> Найти коллегу</span>}
            style={{ background: '#141414', borderColor: '#333', minHeight: '400px' }}
          >
            <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
              <Row gutter={8}>
                <Col span={14}>
                  <Input 
                    placeholder="Имя или фамилия" 
                    prefix={<SearchOutlined />} 
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </Col>
                <Col span={10}>
                  <Select 
                    defaultValue="All" 
                    style={{ width: '100%' }} 
                    onChange={setSelectedDept}
                  >
                    {departments.map(d => <Option key={d} value={d}>{d === 'All' ? 'Все отделы' : d}</Option>)}
                  </Select>
                </Col>
              </Row>
            </Space>

            {/* Тут будет результат поиска (пока для примера один юзер) */}
            <List
              itemLayout="horizontal"
              dataSource={searchName.length > 2 ? [{ id: 99, name: 'Дмитрий Волков', role: 'PM', dept: 'Management' }] : []}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button 
                      type="primary" 
                      icon={<UserAddOutlined />} 
                      disabled={mySubscriptions.some(s => s.id === item.id)}
                      onClick={() => handleFollow(item)}
                    >
                      Следить
                    </Button>
                  ]}
                  style={{ borderBottom: '1px solid #333' }}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{item.name[0]}</Avatar>}
                    title={<Text style={{ color: '#fff' }}>{item.name}</Text>}
                    description={<Text type="secondary">{item.dept}</Text>}
                  />
                </List.Item>
              )}
            />
            {searchName.length <= 2 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Введите минимум 3 буквы для поиска" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Friends;