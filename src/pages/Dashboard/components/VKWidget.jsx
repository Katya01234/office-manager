import React, { useEffect, useRef } from 'react';
import { Card, Typography, Space, Tag, message } from 'antd';

const { Title, Text } = Typography;

const VKWidget = ({ onConnectSuccess }) => { // Принимаем callback
  const authContainerRef = useRef(null);

  useEffect(() => {
    const initVKID = () => {
      if (window.VKIDSDK && authContainerRef.current) {
        const VKID = window.VKIDSDK;

        authContainerRef.current.innerHTML = '';

        VKID.Config.init({
          app: 54541728,
          redirectUrl: 'https://rikkiter.github.io',
          responseMode: VKID.ConfigResponseMode.Callback,
          source: VKID.ConfigSource.LOWCODE,
        });

        const oneTap = new VKID.OneTap();
        
        oneTap.render({
          container: authContainerRef.current,
          scheme: 'dark',
          lang: VKID.Languages.RUS,
          styles: { 
            height: 38,
            borderRadius: 8
          }
        })
        .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, (payload) => {
          VKID.Auth.exchangeCode(payload.code, payload.device_id)
            .then(() => {
              message.success("ВК успешно привязан!");
              // Обязательно вызываем этот callback! 
              // Он скажет Dashboard.jsx, что пора скрыть этот виджет.
              if (onConnectSuccess) {
                onConnectSuccess();
              }
            })
            .catch((err) => {
              console.error(err);
              message.error("Ошибка авторизации ВК");
            });
        });
      }
    };

    if (!window.VKIDSDK) {
      const timer = setTimeout(() => initVKID(), 500);
      return () => clearTimeout(timer);
    } else {
      initVKID();
    }
    // Добавляем onConnectSuccess в зависимости, чтобы useEffect видел актуальную функцию
  }, [onConnectSuccess]);

  return (
    <Card 
      bordered={false} 
      style={{ 
        background: '#141414', 
        borderRadius: '12px', 
        marginBottom: '24px',
        border: '1px solid #303030',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Title level={5} style={{ color: '#fff', margin: 0, fontSize: '15px' }}>Уведомления</Title>
          </Space>
          <Tag color="blue" style={{ borderRadius: '4px', fontSize: '10px', margin: 0, opacity: 0.8 }}>VK ID</Tag>
        </div>
        
        <Text style={{ color: '#8c8c8c', fontSize: '12px', lineHeight: '1.4' }}>
          Привяжите аккаунт, чтобы получать уведомления о бронированиях через VK.
        </Text>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          padding: '12px', 
          borderRadius: '8px',
          marginTop: '8px',
          display: 'flex',
          justifyContent: 'center',
          border: '1px dashed #262626'
        }}>
          <div ref={authContainerRef} style={{ width: '100%', minHeight: '38px' }} />
        </div>
      </Space>
    </Card>
  );
};

export default VKWidget;