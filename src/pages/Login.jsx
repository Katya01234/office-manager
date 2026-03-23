import React from 'react';
import { Card, Input, Button, Typography, Space } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Login = ({ onLogin, currentTheme }) => {
  const colors = currentTheme?.colors || { bg: '#141414', card: '#1f1f1f', border: '#333' };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '100vw', 
      height: '100vh', 
      background: colors.bg 
    }}>
      <Card 
        title={<Title level={3} style={{ margin: 0, color: '#fadb14', textAlign: 'center' }}>Вход в OfficeManager</Title>} 
        style={{ 
          width: 400, 
          borderRadius: 24, 
          background: colors.card,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Input 
            prefix={<MailOutlined style={{color: '#fadb14'}}/>} 
            placeholder="Логин (Email)" 
            size="large" 
          />
          <Input.Password 
            prefix={<LockOutlined style={{color: '#fadb14'}}/>} 
            placeholder="Пароль" 
            size="large" 
          />
          <Button type="primary" size="large" block onClick={onLogin}>
            Войти
          </Button>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Нет аккаунта? <a href="#" style={{color: '#fadb14'}}>Зарегистрироваться</a></Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};  

export default Login;