import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Input, List, Avatar, Typography, Badge, Button, Select, Space, Empty, message, Spin } from 'antd';
import { SearchOutlined, UserAddOutlined, UserDeleteOutlined, TeamOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE = 'http://localhost:8080/api/v1';

const Friends = () => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const token = localStorage.getItem('access_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // --- ЛОГИКА: Получение моих подписок ---
  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/subscriptions`, { headers });
      if (response.ok) {
        const data = await response.json();
        setMySubscriptions(data);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn("Бэкенд недоступен, загружаю тестовых друзей");
      // ТЕСТОВЫЕ ДАННЫЕ
      setMySubscriptions([
        { id: 1, user_id: 101, full_name: 'Алексей Петров', role: 'Backend', department: 'IT', is_online: true, current_place: 'А-101' },
        { id: 2, user_id: 102, full_name: 'Мария Сидорова', role: 'Designer', department: 'Design', is_online: false, current_place: null },
        { id: 3, user_id: 103, full_name: 'Екатерина Любимова', role: 'Lead', department: 'IT', is_online: true, current_place: 'B-202' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  // --- ЛОГИКА: Поиск коллег ---
  const handleSearch = useCallback(
    debounce(async (name, dept) => {
      if (name.length < 3) {
        setSearchResult([]);
        return;
      }
      setSearching(true);
      try {
        const query = new URLSearchParams({ q: name, dept: dept !== 'All' ? dept : '' });
        const response = await fetch(`${API_BASE}/users/search?${query}`, { headers });
        if (response.ok) {
          const data = await response.json();
          setSearchResult(data);
        } else {
          throw new Error();
        }
      } catch (err) {
        // ТЕСТОВЫЙ ПОИСК: Если введено "Дмит", покажем Диму
        if (name.toLowerCase().includes('дмит')) {
          setSearchResult([{ id: 99, full_name: 'Дмитрий Волков', department: 'Management' }]);
        } else {
          setSearchResult([]);
        }
      } finally {
        setSearching(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    handleSearch(searchName, selectedDept);
  }, [searchName, selectedDept, handleSearch]);

  // --- ЛОГИКА: Подписаться ---
  const handleFollow = async (person) => {
    try {
      const response = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_id: person.id })
      });
      if (response.ok) {
        message.success(`Вы подписались на ${person.full_name}`);
        fetchSubscriptions();
      } else {
        throw new Error();
      }
    } catch (err) {
      // Имитация успеха для тестов
      message.success(`[TEST] Вы подписались на ${person.full_name}`);
      setMySubscriptions(prev => [...prev, { ...person, user_id: person.id, is_online: false }]);
    }
  };

  // --- ЛОГИКА: Отписаться ---
  const handleUnfollow = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/subscriptions/${id}`, {
        method: 'DELETE',
        headers
      });
      if (response.ok) {
        message.info(`Подписка удалена`);
        setMySubscriptions(prev => prev.filter(s => s.id !== id));
      } else {
        throw new Error();
      }
    } catch (err) {
      message.info(`[TEST] Подписка удалена`);
      setMySubscriptions(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={2} style={{ color: '#fadb14', marginBottom: 30 }}>Коллеги</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ color: '#fadb14' }}><TeamOutlined /> Мои подписки</span>}
            style={{ background: '#141414', borderColor: '#333', minHeight: '500px' }}
          >
            {loading ? <div style={{textAlign: 'center', padding: '50px'}}><Spin size="large" /></div> : (
              <List
                dataSource={mySubscriptions}
                locale={{ emptyText: <Empty description="Список пуст" /> }}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button type="text" danger icon={<UserDeleteOutlined />} onClick={() => handleUnfollow(item.id)}>
                        Удалить
                      </Button>
                    ]}
                    style={{ borderBottom: '1px solid #262626' }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot color={item.is_online ? '#52c41a' : '#bfbfbf'} offset={[-5, 32]}>
                          <Avatar style={{ backgroundColor: '#fadb14', color: '#000' }}>{item.full_name ? item.full_name[0] : '?'}</Avatar>
                        </Badge>
                      }
                      title={<Text strong style={{ color: '#fff' }}>{item.full_name}</Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>{item.role} • {item.department}</Text>
                          <Text style={{ color: '#fadb14', fontSize: '12px' }}>
                            {item.current_place ? `Сейчас на: ${item.current_place}` : 'Не в офисе'}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ color: '#fff' }}><SearchOutlined /> Найти коллегу</span>}
            style={{ background: '#141414', borderColor: '#333', minHeight: '500px' }}
          >
            <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
              <Row gutter={8}>
                <Col span={14}>
                  <Input 
                    placeholder="Введите 'Дмит' для теста" 
                    prefix={<SearchOutlined />} 
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </Col>
                <Col span={10}>
                  <Select defaultValue="All" style={{ width: '100%' }} onChange={setSelectedDept}>
                    <Option value="All">Все отделы</Option>
                    <Option value="IT">IT</Option>
                    <Option value="Design">Design</Option>
                  </Select>
                </Col>
              </Row>
            </Space>

            <List
              loading={searching}
              dataSource={searchResult}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button 
                      type="primary" 
                      icon={<UserAddOutlined />} 
                      disabled={mySubscriptions.some(s => s.user_id === item.id)}
                      onClick={() => handleFollow(item)}
                      style={{ background: '#fadb14', color: '#000', border: 'none' }}
                    >
                      Следить
                    </Button>
                  ]}
                  style={{ borderBottom: '1px solid #262626' }}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{item.full_name ? item.full_name[0] : '?'}</Avatar>}
                    title={<Text style={{ color: '#fff' }}>{item.full_name}</Text>}
                    description={<Text type="secondary">{item.department}</Text>}
                  />
                </List.Item>
              )}
            />
            {!searching && searchName.length < 3 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Введите минимум 3 буквы" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Friends;