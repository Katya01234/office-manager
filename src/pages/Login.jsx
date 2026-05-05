import React, { useState } from 'react';
import { Card, Input, Button, Typography, message, Form, Modal, Space } from 'antd'; // Добавили Modal и Space
import { LockOutlined, UserOutlined, PhoneOutlined, MailOutlined, SendOutlined} from '@ant-design/icons'; 
import { useNavigate } from 'react-router-dom';
import { workspaceApi } from "../api/api";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false); // Состояние для модалки
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await workspaceApi.login(values.login, values.password);
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_login', values.login); 
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

  // Функции для открытия/закрытия модалки
  const showModal = (e) => {
    e.preventDefault(); // Предотвращаем переход по ссылке
    setIsContactModalVisible(true);
  };

  const handleCancel = () => {
    setIsContactModalVisible(false);
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
              Нет аккаунта? <a href="#" onClick={showModal} style={{color: '#fadb14'}}>Связаться с админом</a>
            </Text>
          </div>
        </Form>
      </Card>

      {/* Модальное окно контактов */}
      <Modal
        title={<span style={{ color: '#fff' }}>Контакты IT-отдела</span>}
        open={isContactModalVisible}
        onCancel={handleCancel}
        footer={null} 
        centered
        styles={{
          mask: { backdropFilter: 'blur(4px)' },
          content: { background: '#141414', border: '1px solid #303030' }
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%', padding: '20px 0' }}>
          <div>
            <Text style={{ color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Внутренний номер:</Text>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              <PhoneOutlined style={{ color: '#fadb14', marginRight: 8 }} /> 
               +7 (900) 000-00-00
            </Title>
          </div>

          <div>
            <Text style={{ color: '#8c8c8c', display: 'block', marginBottom: 8 }}>Корпоративные каналы:</Text>
            <Space>
              <Button 
                icon={<SendOutlined />} 
                href="https://t.me/your_company_it" 
                target="_blank"
                style={{ background: '#0088cc', color: '#fff', border: 'none' }}
              >
                Telegram
              </Button>
              <Button
              icon={
                <span role="img" className="anticon">
                  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.072 2H8.93C3.58 2 2 3.58 2 8.93v6.14C2 20.42 3.58 22 8.93 22h6.14c5.35 0 6.93-1.58 6.93-6.93V8.93C22 3.58 20.42 2 15.072 2zm3.1 13.56c0 .17-.06.33-.17.46-.11.13-.26.2-.43.2h-1.12c-.37 0-.7-.15-.97-.44-.27-.29-.62-.75-1.04-1.39-.36-.53-.66-.82-.9-.87-.24-.05-.44 0-.61.16-.17.16-.25.4-.25.7v.93c0 .17-.06.33-.18.45-.12.12-.27.18-.45.18h-.57c-.77 0-1.51-.31-2.22-.92-.7-.61-1.35-1.51-1.95-2.7a13.34 13.34 0 01-1.28-3.32c0-.18.06-.33.18-.45.12-.12.27-.18.45-.18h1.12c.17 0 .32.06.44.17.12.11.2.26.24.44.25.77.54 1.46.88 2.06.34.6.66 1.05.95 1.35.29.3.52.45.69.45.1 0 .19-.04.26-.13.07-.09.11-.25.11-.47v-1.94c0-.46-.11-.79-.32-.98-.21-.19-.55-.29-1.02-.3-.07 0-.11-.04-.11-.11v-.38c0-.07.03-.12.1-.15.28-.11.75-.17 1.43-.17 1.04 0 1.56.33 1.56.98v2.17c0 .18.04.31.11.4.07.09.17.13.29.13.19 0 .43-.15.7-.45.27-.3.56-.75.88-1.35.32-.6.55-1.23.69-1.89.04-.18.11-.33.23-.44.12-.11.27-.17.44-.17h1.13c.18 0 .33.06.45.18.12.12.18.27.18.45 0 .1-.02.21-.05.34a10.8 10.8 0 01-.81 2.04c-.31.62-.63 1.13-.97 1.52-.34.39-.51.64-.51.76 0 .09.04.18.12.27.08.09.22.24.42.45.4.42.74.85 1.02 1.28.28.43.42.84.42 1.23z"/>
                  </svg>
                </span>
              }
              href="https://vk.com/your_community" 
              target="_blank"
              style={{ 
                background: '#0077FF', 
                color: '#fff', 
                border: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              VK
            </Button>
            </Space>
          </div>

          <div style={{ marginTop: 10 }}>
            <Button 
              type="primary" 
              icon={<MailOutlined />} 
              block 
              size="large"
              href="mailto:support@company.com?subject=Проблема со входом в Office App"
              style={{ background: '#fadb14', color: '#000', border: 'none', fontWeight: 'bold' }}
            >
              Написать в поддержку
            </Button>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default Login;