import React, { useEffect, useRef } from 'react';

const VKAuth = ({ onSuccess }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Проверяем, загрузился ли SDK из index.html
    if (window.VKIDSDK && containerRef.current) {
      const VKID = window.VKIDSDK;

      VKID.Config.init({
        app: 54541728, // Твой ID приложения
        redirectUrl: 'https://rikkiter.github.io',
        responseMode: VKID.ConfigResponseMode.Callback,
        source: VKID.ConfigSource.LOWCODE,
      });

      const oneTap = new VKID.OneTap();

      oneTap.render({
        container: containerRef.current,
        scheme: 'dark', // Темная тема под твой дизайн
        styles: { height: 38 }
      })
      .on(VKID.WidgetEvents.ERROR, (err) => console.error("VK ID Error:", err))
      .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, (payload) => {
        // Обмен кода на токен
        VKID.Auth.exchangeCode(payload.code, payload.device_id)
          .then(onSuccess)
          .catch(err => console.error("VK Auth Exchange Error:", err));
      });
    }
  }, [onSuccess]);

  return <div ref={containerRef} style={{ marginBottom: 16 }} />;
};

export default VKAuth;