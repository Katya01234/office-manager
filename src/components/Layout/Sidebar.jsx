import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  EnvironmentOutlined, 
  TeamOutlined 
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom'; 

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  const selectedKey = location.pathname.substring(1) || 'dashboard';

  const menuItems = [
    { 
      key: 'dashboard', 
      icon: <DashboardOutlined />, 
      label: <Link to="/dashboard">Дашборд</Link> 
    },
    { 
      key: 'profile', 
      icon: <UserOutlined />, 
      label: <Link to="/profile">Профиль</Link> 
    },
    { 
      key: 'map', 
      icon: <EnvironmentOutlined />, 
      label: <Link to="/map">Карта</Link> 
    },
    { 
      key: 'friends', 
      icon: <TeamOutlined />, 
      label: <Link to="/friends">Коллеги</Link> 
    },
  ];

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={(value) => setCollapsed(value)} 
      width={250}
      style={{
        background: '#000',
        borderRight: '2px solid #fadb14',
        boxShadow: '4px 0px 15px rgba(250, 219, 20, 0.3)',
      }}
    >
      <div style={{ 
        height: 60, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#fadb14', 
        fontWeight: 'bold',
        fontSize: collapsed ? '14px' : '18px',
        transition: 'all 0.2s'
      }}>
        {collapsed ? 'OM' : 'WORKPLACE MANAGER'}
      </div>
      
      <Menu
        theme="dark" 
        selectedKeys={[selectedKey]}
        mode="inline"
        style={{ background: 'transparent', marginTop: '20px' }}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;