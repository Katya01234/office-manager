import React from 'react';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, UserOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed, currentPage, setCurrentPage }) => {
  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={setCollapsed} 
      width={250}
      style={{
        background: '#000',
        borderRight: '2px solid #fadb14',
        boxShadow: '4px 0px 15px rgba(250, 219, 20, 0.3)',
      }}
    >
      <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fadb14', fontWeight: 'bold' }}>
        {collapsed ? 'OM' : 'OFFICE MANAGER'}
      </div>
      <Menu
        theme="dark" // Всегда темная
        selectedKeys={[currentPage]}
        mode="inline"
        onClick={(e) => setCurrentPage(e.key)}
        style={{ background: 'transparent', marginTop: '20px' }}
        items={[
          { key: 'dashboard', icon: <DashboardOutlined />, label: 'Дашборд' },
          { key: 'profile', icon: <UserOutlined />, label: 'Профиль' },
          { key: 'map', icon: <EnvironmentOutlined />, label: 'Карта' },
          { key: 'friends', icon: <TeamOutlined />, label: 'Друзья' },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;