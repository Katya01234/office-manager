import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Sidebar from "./components/Layout/Sidebar";
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard/index.jsx';
import Profile from './pages/Profile.jsx'; 
import Friends from './pages/Friends.jsx';
// ИМПОРТИРУЕМ НОВУЮ СТРАНИЦУ
import OfficeMapPage from './pages/Map/index.jsx'; 

import { themeConfig, customColors } from './styles/theme';

const { Content } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  // Храним статус авторизации
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  // Синхронизируем статус при изменении пути (на случай логаута через интерцепторы)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, [location.pathname]);

  const currentTheme = customColors.dark;
  const isAuthPage = location.pathname === '/login';

  return (
    <ConfigProvider theme={{ ...themeConfig, algorithm: theme.darkAlgorithm }}>
      <Layout style={{ minHeight: '100vh', width: '100vw', background: '#000' }}>
        
        {/* Отображаем сайдбар только если авторизован и не на странице логина */}
        {isAuthenticated && !isAuthPage && (
          <Sidebar 
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        )}

        <Layout style={{ background: '#000' }}>
          <Content style={{ 
            padding: isAuthPage ? 0 : '40px',
            // Добавим плавный переход для контента при схлопывании сайдбара
            transition: 'all 0.2s' 
          }}>
            <Routes>
              {/* Публичные роуты */}
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
              />

              {/* Защищенные роуты */}
              <Route 
                path="/dashboard" 
                element={isAuthenticated ? <Dashboard currentTheme={currentTheme} /> : <Navigate to="/login" replace />} 
              />
              
              {/* ТЕПЕРЬ ТУТ ТВОЯ КАРТА */}
              <Route 
                path="/map" 
                element={isAuthenticated ? <OfficeMapPage /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/profile" 
                element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/friends" 
                element={isAuthenticated ? <Friends /> : <Navigate to="/login" replace />} 
              />
              
              {/* Редиректы */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;