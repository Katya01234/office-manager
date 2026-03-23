import React, { useState } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/index.jsx';
import Profile from './pages/Profile'; 
import Friends from './pages/Friends';
import { themeConfig, customColors } from './styles/theme';

const { Content } = Layout;

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [currentPage, setCurrentPage] = useState('dashboard'); 
  const [collapsed, setCollapsed] = useState(false);

  const currentTheme = customColors.dark;

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentTheme={currentTheme} />;
      case 'profile':
        return <Profile setIsLoggedIn={setIsLoggedIn} />;
      case 'friends':
        return <Friends />;
      case 'map':
        return <div style={{ color: '#fff' }}>Карта офиса (в разработке)</div>;
      default:
        return <Dashboard currentTheme={currentTheme} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <ConfigProvider theme={{ ...themeConfig, algorithm: theme.darkAlgorithm }}>
        <Login onLogin={() => setIsLoggedIn(true)} currentTheme={currentTheme} />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={{ ...themeConfig, algorithm: theme.darkAlgorithm }}>
      <Layout style={{ minHeight: '100vh', width: '100vw', background: '#000' }}>
        <Sidebar 
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <Layout style={{ background: '#000' }}>
          <Content style={{ padding: '40px' }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;