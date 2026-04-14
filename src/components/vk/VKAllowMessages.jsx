import React, { useEffect } from 'react';

const VKAllowMessages = () => {
  useEffect(() => {
    // Используем window.VK, который подтянулся из OpenAPI в index.html
    if (window.VK && window.VK.Widgets) {
      window.VK.Widgets.AllowMessagesFromCommunity("vk_allow_messages", {}, 237429206);
    }
  }, []);

  return <div id="vk_allow_messages" style={{ marginTop: 10 }} />;
};

export default VKAllowMessages;