import React, { useState } from 'react';
import { Card, Input, Button, Typography, message, Form } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { workspaceApi } from "../api/api";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false); // Нужно объявить внутри компонента
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Вызываем метод из api
      const data = await workspaceApi.login(values.login, values.password);
      
      // 1. Сохраняем токены
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      // 2. Сохраняем логин для отображения в Профиле
      localStorage.setItem('user_login', values.login); 
      
      // Имя и роль (заглушки)
      localStorage.setItem('user_name', data.name || 'Сотрудник'); 
      localStorage.setItem('user_role', data.role || 'USER');

      message.success('Вход выполнен успешно!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error.message);
      message.error('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '100vw', 
      height: '100vh', 
      background: '#000' 
    }}>
      <Card 
        style={{ 
          width: 400, 
          borderRadius: 16, 
          background: '#141414',
          border: '1px solid #303030',
          boxShadow: '0 8px 30px rgba(0,0,0,0.7)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: '#fadb14', letterSpacing: '1px' }}>
            OFFICE APP
          </Title>
          <Text style={{ color: '#8c8c8c' }}>Введите свои данные для входа</Text>
        </div>

        <Form
          name="login_form"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="login"
            rules={[{ required: true, message: 'Введите логин!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{color: '#fadb14'}}/>} 
              placeholder="Логин" 
              size="large" 
              style={{ background: '#000', border: '1px solid #303030', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{color: '#fadb14'}}/>} 
              placeholder="Пароль" 
              size="large" 
              style={{ background: '#000', border: '1px solid #303030', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button 
              type="primary" 
              size="large" 
              block 
              htmlType="submit" 
              loading={loading}
              style={{ 
                background: '#fadb14', 
                color: '#000', 
                border: 'none', 
                fontWeight: 'bold',
                height: '50px',
                borderRadius: '8px'
              }}
            >
              ВОЙТИ
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#8c8c8c' }}>
              Нет аккаунта? <a href="/register" style={{color: '#fadb14'}}>Связаться с админом</a>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;