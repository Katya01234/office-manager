import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Input, List, Avatar, Typography, Badge, Button, Select, Space, Empty, message, Spin, Radio } from 'antd';
import { SearchOutlined, UserAddOutlined, UserDeleteOutlined, TeamOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
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
  
  // --- НОВОЕ: Тип поиска (users или teams) ---
  const [searchType, setSearchType] = useState('users');

  const token = localStorage.getItem('access_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/subscriptions`, { headers });
      if (response.ok) {
        const data = await response.json();
        setMySubscriptions(data);
      } else { throw new Error(); }
    } catch (err) {
      setMySubscriptions([
        { id: 1, user_id: 101, full_name: 'Алексей Петров', role: 'Backend', department: 'IT', is_online: true, current_place: 'А-101' },
        { id: 2, user_id: 102, full_name: 'Мария Сидорова', role: 'Designer', department: 'Design', is_online: false, current_place: null },
      ]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  // --- ОБНОВЛЕННАЯ ЛОГИКА ПОИСКА ---
  const handleSearch = useCallback(
    debounce(async (name, dept, type) => {
      if (name.length < 2) { // Для команд можно снизить порог до 2 символов
        setSearchResult([]);
        return;
      }
      setSearching(true);
      try {
        // Эндпоинт меняется в зависимости от type (users или teams)
        const endpoint = type === 'users' ? '/users/search' : '/teams/search';
        const query = new URLSearchParams({ q: name });
        if (type === 'users' && dept !== 'All') query.append('dept', dept);

        const response = await fetch(`${API_BASE}${endpoint}?${query}`, { headers });
        if (response.ok) {
          const data = await response.json();
          setSearchResult(data);
        } else { throw new Error(); }
      } catch (err) {
        // ТЕСТОВЫЕ ДАННЫЕ ДЛЯ КОМАНД
        if (type === 'teams' && name.toLowerCase().includes('frontend')) {
          setSearchResult([{ id: 't1', name: 'Frontend Core', members_count: 12, department: 'IT' }]);
        } else if (type === 'users' && name.toLowerCase().includes('дмит')) {
          setSearchResult([{ id: 99, full_name: 'Дмитрий Волков', department: 'Management' }]);
        } else {
          setSearchResult([]);
        }
      } finally { setSearching(false); }
    }, 500),
    []
  );

  useEffect(() => {
    handleSearch(searchName, selectedDept, searchType);
  }, [searchName, selectedDept, searchType, handleSearch]);

  const handleFollow = async (item) => {
    try {
      // Если подписываемся на команду, логика может отличаться (например, другой body)
      const body = searchType === 'users' ? { user_id: item.id } : { team_id: item.id };
      const response = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      if (response.ok) {
        message.success(`Вы подписались на ${item.full_name || item.name}`);
        fetchSubscriptions();
      } else { throw new Error(); }
    } catch (err) {
      message.success(`[TEST] Подписка оформлена`);
      if (searchType === 'users') {
        setMySubscriptions(prev => [...prev, { ...item, user_id: item.id, is_online: false }]);
      }
    }
  };

  const handleUnfollow = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/subscriptions/${id}`, { method: 'DELETE', headers });
      if (response.ok) {
        message.info(`Подписка удалена`);
        setMySubscriptions(prev => prev.filter(s => s.id !== id));
      } else { throw new Error(); }
    } catch (err) {
      setMySubscriptions(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={2} style={{ color: '#fadb14', marginBottom: 30 }}>Коллеги и Команды</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ color: '#fadb14' }}><TeamOutlined /> Мои подписки</span>}
            style={{ background: '#141414', borderColor: '#333', minHeight: '550px' }}
          >
            {loading ? <div style={{textAlign: 'center', padding: '50px'}}><Spin size="large" /></div> : (
              <List
                dataSource={mySubscriptions}
                locale={{ emptyText: <Empty description="Вы еще ни на кого не подписаны" /> }}
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
                          <Avatar style={{ backgroundColor: item.name ? '#1890ff' : '#fadb14', color: '#000' }}>
                            {item.full_name ? item.full_name[0] : (item.name ? item.name[0] : '?')}
                          </Avatar>
                        </Badge>
                      }
                      title={<Text strong style={{ color: '#fff' }}>{item.full_name || item.name}</Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {item.role || 'Команда'} • {item.department}
                          </Text>
                          {item.current_place && (
                            <Text style={{ color: '#fadb14', fontSize: '12px' }}>На месте: {item.current_place}</Text>
                          )}
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
            title={<span style={{ color: '#fff' }}><SearchOutlined /> Поиск</span>}
            style={{ background: '#141414', borderColor: '#333', minHeight: '550px' }}
          >
            <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }} size="middle">
              {/* ПЕРЕКЛЮЧАТЕЛЬ ТИПА ПОИСКА */}
              <Radio.Group 
                block 
                optionType="button" 
                buttonStyle="solid" 
                value={searchType} 
                onChange={(e) => {
                    setSearchType(e.target.value);
                    setSearchResult([]);
                }}
              >
                <Radio.Button value="users" style={{ width: '50%', textAlign: 'center' }}>По людям</Radio.Button>
                <Radio.Button value="teams" style={{ width: '50%', textAlign: 'center' }}>По командам</Radio.Button>
              </Radio.Group>

              <Row gutter={8}>
                <Col span={searchType === 'users' ? 14 : 24}>
                  <Input 
                    placeholder={searchType === 'users' ? "Имя коллеги..." : "Название команды..."} 
                    prefix={<SearchOutlined />} 
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </Col>
                {searchType === 'users' && (
                  <Col span={10}>
                    <Select defaultValue="All" style={{ width: '100%' }} onChange={setSelectedDept}>
                      <Option value="All">Все отделы</Option>
                      <Option value="IT">IT</Option>
                      <Option value="Design">Design</Option>
                    </Select>
                  </Col>
                )}
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
                      disabled={mySubscriptions.some(s => (s.user_id === item.id || s.team_id === item.id))}
                      onClick={() => handleFollow(item)}
                      style={{ background: '#fadb14', color: '#000', border: 'none' }}
                    >
                      Следить
                    </Button>
                  ]}
                  style={{ borderBottom: '1px solid #262626' }}
                >
                  <List.Item.Meta
                    avatar={
                        <Avatar icon={searchType === 'teams' ? <DeploymentUnitOutlined /> : null}>
                            {item.full_name ? item.full_name[0] : (item.name ? item.name[0] : '?')}
                        </Avatar>
                    }
                    title={<Text style={{ color: '#fff' }}>{item.full_name || item.name}</Text>}
                    description={
                        <Text type="secondary">
                            {item.department} {item.members_count ? `(${item.members_count} чел.)` : ''}
                        </Text>
                    }
                  />
                </List.Item>
              )}
            />
            {!searching && searchName.length < 2 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Начните вводить название" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Friends;