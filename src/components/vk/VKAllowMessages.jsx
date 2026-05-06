import React, { useEffect, useRef } from 'react';

const VKAllowMessages = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Проверяем наличие глобального объекта VK и ссылки на контейнер
    if (window.VK && window.VK.Widgets && containerRef.current) {
      // Очищаем содержимое контейнера перед инициализацией
      containerRef.current.innerHTML = ''; 
      // Передаем сам DOM-элемент вместо строкового ID
      window.VK.Widgets.AllowMessagesFromCommunity(
        containerRef.current, 
        { height: 30 }, 
        237429206
      );
    }
  }, []);

  return <div ref={containerRef} style={{ marginTop: 10 }} />;
};

export default VKAllowMessages;