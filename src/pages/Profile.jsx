import React, { useState, useEffect } from 'react';
import { Typography, Card, Space, Input, Button, Tag, Avatar, message, Spin } from 'antd';
import { 
  UserOutlined, EditOutlined, SaveOutlined, 
  LogoutOutlined, TeamOutlined, CheckCircleFilled, MessageOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import VKAllowMessages from '../components/vk/VKAllowMessages'; 
import { workspaceApi } from '../api/api'; 

const { Title, Text } = Typography;
const ROLE_LABELS = { 'USER': 'Сотрудник', 'ADMIN': 'Администратор' };

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null); 
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await workspaceApi.getMe(); 
        setUserData({
          name: data?.name || 'Не указано',
          role: data?.role || 'USER',
          team: data?.team || 'Без команды',
          vk_id: data?.vk_id || null
        });
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          message.error("Ошибка при загрузке профиля");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!userData) return null; 

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <Title level={2} style={{ marginBottom: 24, color: '#fff' }}>Мой профиль</Title>
      
      <Card
        style={{ background: '#141414', borderColor: '#333', borderRadius: '16px' }}
        actions={[
          isEditing ? (
            <Button type="primary" icon={<SaveOutlined />} onClick={() => setIsEditing(false)} style={{ background: '#fadb14', color: '#000', border: 'none' }}>
              Сохранить
            </Button>
          ) : (
            <Button ghost icon={<EditOutlined />} onClick={() => setIsEditing(true)} style={{ color: '#fadb14', borderColor: '#fadb14' }}>
              Редактировать
            </Button>
          ),
          <Button danger icon={<LogoutOutlined />} onClick={() => { localStorage.clear(); navigate('/login'); }}>Выйти</Button>
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#fadb14', color: '#000' }} />
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
              <Title level={4} style={{ marginTop: 8, color: '#fff', margin: 0 }}>{userData.name}</Title>
            )}
          </div>

          {userData.vk_id && (
            <div style={{ background: 'rgba(24, 144, 255, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(24, 144, 255, 0.2)' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#fff' }}><MessageOutlined /> Уведомления VK</Text>
                  <Tag color="success" icon={<CheckCircleFilled />}>Привязано</Tag>
                </div>
                <VKAllowMessages />
              </Space>
            </div>
          )}

          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Команда</Text>
            <div style={{ marginTop: 8 }}><Text style={{ color: '#fadb14', fontSize: '16px' }}><TeamOutlined /> {userData.team}</Text></div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Роль</Text>
            <div style={{ marginTop: 8 }}><Tag color="gold">{ROLE_LABELS[userData.role] || userData.role}</Tag></div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Profile;