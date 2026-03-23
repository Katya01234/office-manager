import { theme } from 'antd';

export const themeConfig = {
  token: {
    colorPrimary: '#fadb14',    // Твой --primary-yellow
    colorError: '#ff1212',      // Твой --danger-red
    borderRadius: 12,           // Скругление углов
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  // Настройки конкретных компонентов
  components: {
    Layout: {
      siderBg: '#000000',       // Цвет бокового меню
      headerBg: '#141414',
    },
    Menu: {
      darkItemBg: 'transparent',
    },
  },
};

// Вспомогательные объекты для состояний (если понадобятся в коде)
export const customColors = {
  dark: {
    bg: '#000000',
    card: '#141414',
    text: '#ffffff',
    border: '#333333',
  },
  light: {
    bg: '#f8f9fa',
    card: '#ffffff',
    text: '#1a1a1a',
    border: '#e8e8e8',
  }
};