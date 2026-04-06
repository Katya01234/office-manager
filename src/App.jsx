import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Sidebar from "./components/Layout/Sidebar";
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard/index.jsx';
import Profile from './pages/Profile.jsx'; 
import Friends from './pages/Friends.jsx';
import { themeConfig, customColors } from './styles/theme';

const { Content } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  // 1. Делаем авторизацию состоянием
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  // 2. Обновляем статус при каждом переходе (важно для корректных редиректов)
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('access_token'));
  }, [location.pathname]);

  const currentTheme = customColors.dark;
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <ConfigProvider theme={{ ...themeConfig, algorithm: theme.darkAlgorithm }}>
      <Layout style={{ minHeight: '100vh', width: '100vw', background: '#000' }}>
        
        {/* Sidebar только для своих */}
        {isAuthenticated && !isAuthPage && (
          <Sidebar 
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        )}

        <Layout style={{ background: '#000' }}>
          <Content style={{ padding: isAuthPage ? 0 : '40px' }}>
            <Routes>
              {/* Если мы авторизованы и заходим на /login — отправляем на /dashboard */}
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
              />
              <Route 
                path="/register" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
              />

              {/* Защищенные роуты */}
              <Route 
                path="/dashboard" 
                element={isAuthenticated ? <Dashboard currentTheme={currentTheme} /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/profile" 
                element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/friends" 
                element={isAuthenticated ? <Friends /> : <Navigate to="/login" replace />} 
              />
              
              <Route path="/map" element={isAuthenticated ? <div style={{ color: '#fff' }}>Карта офиса</div> : <Navigate to="/login" replace />} />

              {/* По умолчанию на дашборд (он сам решит, пустить или нет) */}
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