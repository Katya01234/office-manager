import React from 'react';
import { Layout, Menu, ConfigProvider } from 'antd';
import { DashboardOutlined, UserOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom'; 

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  // Умное определение активного ключа
  const currentPath = location.pathname.split('/')[1] || 'dashboard';

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">Дашборд</Link> },
    { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">Профиль</Link> },
    { key: 'map', icon: <EnvironmentOutlined />, label: <Link to="/map">Карта</Link> },
    { key: 'friends', icon: <TeamOutlined />, label: <Link to="/friends">Коллеги</Link> },
  ];

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={(value) => setCollapsed(value)} 
      width={250}
      style={{
        background: '#000',
        borderRight: '1px solid #333', // Сделал чуть тоньше и спокойнее
        zIndex: 10,
      }}
    >
      <div style={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#fadb14', 
        fontWeight: 800,
        letterSpacing: '1px',
        fontSize: collapsed ? '14px' : '16px',
        transition: 'all 0.3s',
        borderBottom: '1px solid #1f1f1f'
      }}>
        {collapsed ? 'WM' : 'WORKPLACE MANAGER'}
      </div>
      
      <Menu
        theme="dark" 
        selectedKeys={[currentPath]}
        mode="inline"
        style={{ background: 'transparent', marginTop: '16px', border: 'none' }}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;