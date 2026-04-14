import React, { useEffect, useRef } from 'react';
import { Card, Typography, Space, Tag, message } from 'antd';

const { Title, Text } = Typography;

const VKWidget = () => {
  const authContainerRef = useRef(null);

  useEffect(() => {
    // Очищаем контейнер перед рендером, чтобы кнопка не дублировалась
    if (authContainerRef.current) {
      authContainerRef.current.innerHTML = '';
    }

    // Инициализация VK ID OneTap
    if (window.VKIDSDK && authContainerRef.current) {
      const VKID = window.VKIDSDK;
      VKID.Config.init({
        app: 54541728, // Твой App ID
        redirectUrl: 'https://rikkiter.github.io',
        responseMode: VKID.ConfigResponseMode.Callback,
        source: VKID.ConfigSource.LOWCODE,
      });

      const oneTap = new VKID.OneTap();
      oneTap.render({
        container: authContainerRef.current,
        scheme: 'dark',
        styles: { height: 38 }
      })
      .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, (payload) => {
        // Логика обмена кода на токен
        VKID.Auth.exchangeCode(payload.code, payload.device_id)
          .then(() => message.success("ВК успешно привязан!"))
          .catch(() => message.error("Ошибка авторизации ВК"));
      });
    }
  }, []);

  return (
    <Card 
      bordered={false} 
      style={{ 
        background: '#141414', 
        borderRadius: '12px', 
        marginBottom: '24px',
        border: '1px solid #303030' 
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={5} style={{ color: '#fff', margin: 0, fontSize: '16px' }}>Уведомления</Title>
          <Tag color="blue" style={{ borderRadius: '10px', fontSize: '10px', margin: 0 }}>VK ID</Tag>
        </div>
        
        <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
          Привяжите аккаунт для синхронизации профиля и получения уведомлений.
        </Text>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          padding: '16px 12px', 
          borderRadius: '8px',
          marginTop: '8px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {/* Оставляем только одну чистую кнопку входа */}
          <div ref={authContainerRef} style={{ width: '100%', minHeight: '38px' }} />
        </div>
      </Space>
    </Card>
  );
};

export default VKWidget;