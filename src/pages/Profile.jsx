import React, { useState, useEffect } from 'react';
import { Typography, Card, Space, Input, Button, Tag, Avatar, message, Spin } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, LogoutOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ROLE_LABELS = {
  'USER': 'Сотрудник',
  'ADMIN': 'Администратор'
};

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    role: 'USER',
    login: '',
    team: '' // Новое поле для команды
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://45.86.183.29:8080/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData({
            name: data.name || data.full_name || localStorage.getItem('user_name') || 'Не указано',
            role: data.role || 'USER',
            login: data.login || localStorage.getItem('user_login') || 'Не указан',
            team: data.team || localStorage.getItem('user_team') || 'Без команды' // Загружаем команду
          });
        } else {
          throw new Error('Ошибка сервера');
        }
      } catch (err) {
        setUserData({
          name: localStorage.getItem('user_name') || 'Не указано',
          role: localStorage.getItem('user_role') || 'USER',
          login: localStorage.getItem('user_login') || 'Не указан',
          team: localStorage.getItem('user_team') || 'Без команды'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSave = async () => {
    setIsEditing(false);
    localStorage.setItem('user_name', userData.name);
    localStorage.setItem('user_team', userData.team); // Сохраняем команду локально
    message.success('Профиль успешно обновлен!');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <Spin size="large" tip="Загрузка профиля..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <Title level={2} style={{ marginBottom: 24, color: '#fff' }}>Мой профиль</Title>
      
      <Card
        style={{ background: '#141414', borderColor: '#333', borderRadius: '16px' }}
        actions={[
          isEditing ? (
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSave} 
              style={{ background: '#fadb14', color: '#000', border: 'none' }}
            >
              Сохранить
            </Button>
          ) : (
            <Button 
              ghost 
              icon={<EditOutlined />} 
              onClick={() => setIsEditing(true)} 
              style={{ color: '#fadb14', borderColor: '#fadb14' }}
            >
              Редактировать
            </Button>
          ),
          <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>Выйти</Button>
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#fadb14', color: '#000' }} 
            />
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Полное имя</Text>
            {isEditing ? (
              <Input 
                value={userData.name} 
                onChange={(e) => setUserData({...userData, name: e.target.value})} 
                style={{ marginTop: 8, background: '#000', color: '#fff', border: '1px solid #434343' }}
              />
            ) : (
              <Title level={4} style={{ marginTop: 8, color: '#fff', margin: 0 }}>
                {userData.name}
              </Title>
            )}
          </div>

          {/* НОВОЕ ПОЛЕ: Команда */}
          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Команда / Отдел</Text>
            {isEditing ? (
              <Input 
                value={userData.team} 
                prefix={<TeamOutlined />}
                onChange={(e) => setUserData({...userData, team: e.target.value})} 
                style={{ marginTop: 8, background: '#000', color: '#fff', border: '1px solid #434343' }}
              />
            ) : (
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: '#fadb14', fontSize: '16px', fontWeight: '500' }}>
                   {userData.team}
                </Text>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Роль в системе</Text>
            <div style={{ marginTop: 8 }}>
              <Tag color={userData.role === 'ADMIN' ? 'red' : 'gold'}>
                {ROLE_LABELS[userData.role] || userData.role}
              </Tag>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Логин</Text>
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: '#fff', fontSize: '16px' }}>
                {userData.login}
              </Text>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Profile;