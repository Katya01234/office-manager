import React, { useEffect, useRef } from 'react';
import { Card, Typography, Space, Tag, message } from 'antd';
import { workspaceApi } from '../../../api/api';

const { Title, Text } = Typography;

const VKWidget = ({ onConnectSuccess }) => {
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
          styles: { height: 38, borderRadius: 8 }
        })
        .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, async (payload) => {
          try {
            const result = await VKID.Auth.exchangeCode(payload.code, payload.device_id);
            const vkUserId = result.user?.id || result.user_id;

            if (!vkUserId) {
              throw new Error("Не удалось получить VK ID из ответа SDK");
            }
            await workspaceApi.connectVk(String(vkUserId));
            message.success("ВК успешно привязан к аккаунту!");
            if (onConnectSuccess) {
              onConnectSuccess();
            }
          } catch (err) {
            console.error("VK Link Error:", err);
            message.error("Ошибка привязки аккаунта ВК");
          }
        });
      }
    };

    if (!window.VKIDSDK) {
      const timer = setTimeout(() => initVKID(), 500);
      return () => clearTimeout(timer);
    } else {
      initVKID();
    }
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
          <Title level={5} style={{ color: '#fff', margin: 0, fontSize: '15px' }}>Уведомления</Title>
          <Tag color="blue" style={{ borderRadius: '4px', fontSize: '10px', margin: 0 }}>VK ID</Tag>
        </div>
        <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
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
