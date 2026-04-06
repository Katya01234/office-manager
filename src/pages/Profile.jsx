import React, { useState, useEffect } from 'react';
import { Typography, Card, Space, Input, Button, Tag, Avatar, message, Spin } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    role: 'USER',
    email: ''
  });
  
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:8080/api/v1';

  // 1. Загрузка данных профиля при входе
  useEffect(() => {
  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData({
          name: data.full_name,
          role: data.role,
          email: data.email
        });
      } else {
        // Если сервер ответил ошибкой (например, 404), используем заглушку
        throw new Error('Server error');
      }
    } catch (err) {
      // ВМЕСТО handleLogout() ПИШЕМ ЭТО:
      console.warn("Сервер не отвечает, использую тестовые данные профиля");
      setUserData({
        name: 'Тестовый Пользователь',
        role: 'FRONTEND DEV',
        email: 'test@office.com'
      });
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [navigate]);
  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     const token = localStorage.getItem('access_token');
  //     if (!token) {
  //       navigate('/login');
  //       return;
  //     }

  //     try {
  //       const response = await fetch(`${API_BASE}/auth/me`, {
  //         headers: { 'Authorization': `Bearer ${token}` }
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
  //         setUserData({
  //           name: data.full_name || 'Пользователь',
  //           role: data.role || 'USER',
  //           email: data.email
  //         });
  //       } else {
  //         throw new Error('Сессия истекла');
  //       }
  //     } catch (err) {
  //       message.error('Ошибка авторизации');
  //       handleLogout();
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProfile();
  // }, [navigate]);

  // 2. Функция выхода (Очистка данных)
  const handleLogout = () => {
  localStorage.removeItem('access_token'); 
  window.location.href = '/login'; 
};

  const handleSave = async () => {
    setIsEditing(false);
    message.success('Профиль успешно обновлен!');
    console.log('Данные для отправки:', userData);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <Title level={2} style={{ marginBottom: 24, color: '#fff' }}>Мой профиль</Title>
      
      <Card
        style={{ background: '#141414', borderColor: '#333', borderRadius: '16px' }}
        actions={[
          isEditing ? (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} style={{ background: '#fadb14', color: '#000', border: 'none' }}>Сохранить</Button>
          ) : (
            <Button ghost icon={<EditOutlined />} onClick={() => setIsEditing(true)} style={{ color: '#fadb14', borderColor: '#fadb14' }}>Редактировать</Button>
          ),
          <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>Выйти</Button>
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#fadb14', color: '#000' }} />
          
          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Полное имя</Text>
            {isEditing ? (
              <Input 
                value={userData.name} 
                onChange={(e) => setUserData({...userData, name: e.target.value})} 
                style={{ marginTop: 8, background: '#000', color: '#fff', border: '1px solid #434343' }}
              />
            ) : (
              <Title level={4} style={{ marginTop: 8, color: '#fff', margin: 0 }}>{userData.name}</Title>
            )}
          </div>

          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Роль в системе</Text>
            <div style={{ marginTop: 8 }}>
              <Tag color={userData.role === 'ADMIN' ? 'red' : 'gold'}>
                {userData.role.toUpperCase()}
              </Tag>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Email (логин)</Text>
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: '#fff' }}>{userData.email}</Text>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Profile;