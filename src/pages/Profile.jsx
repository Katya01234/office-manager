import React, { useState } from 'react';
import { Typography, Card, Space, Input, Button, Tag, Avatar } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, LogoutOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Profile = ({ setIsLoggedIn }) => {
  // В будущем эти данные придут из бэкенда через fetch или axios
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Иван Иванов',
    role: 'Frontend Developer',
    email: 'ivan@office.com'
  });

  const handleSave = () => {
    setIsEditing(false);
    // Здесь будет запрос к бэкенду: api.updateProfile(userData)
    console.log('Данные сохранены:', userData);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>Мой профиль</Title>
      
      <Card
        actions={[
          isEditing ? (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Сохранить</Button>
          ) : (
            <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>Редактировать</Button>
          ),
          <Button danger icon={<LogoutOutlined />} onClick={() => setIsLoggedIn(false)}>Выйти</Button>
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          {/* Аватарка */}
          <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#fadb14' }} />
          
          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Имя пользователя</Text>
            {isEditing ? (
              <Input 
                value={userData.name} 
                onChange={(e) => setUserData({...userData, name: e.target.value})} 
                style={{ marginTop: 8 }}
              />
            ) : (
              <Title level={4} style={{ marginTop: 8 }}>{userData.name}</Title>
            )}
          </div>

          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Роль в системе</Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="gold">{userData.role.toUpperCase()}</Tag>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <Text type="secondary">Email</Text>
            <div style={{ marginTop: 8 }}>
              <Text strong>{userData.email}</Text>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Profile;