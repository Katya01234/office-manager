import React, { useEffect } from 'react';

const VKAllowMessages = () => {
  const widgetId = "vk_allow_messages_community";

  useEffect(() => {
    const initWidget = () => {
      if (window.VK && window.VK.Widgets) {
        const container = document.getElementById(widgetId);
        if (container) {
          container.innerHTML = ''; 
          window.VK.Widgets.AllowMessagesFromCommunity(
            widgetId, 
            { height: 30 }, 
            237429206
          );
        }
      }
    };
    const timer = setTimeout(initWidget, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      id={widgetId} 
      style={{ 
        marginTop: 10, 
        display: 'flex', 
        justifyContent: 'center',
        minHeight: '30px'
      }} 
    />
  );
};

export default VKAllowMessages;