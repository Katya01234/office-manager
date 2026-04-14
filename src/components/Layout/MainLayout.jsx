import React from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import './LayoutStructure.css'; // Импортируем наш скелет

const { Content } = Layout;

const MainLayout = ({ children, collapsed, setCollapsed }) => {
    return (
        <Layout className="layout-wrapper">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            
            <Layout className="main-container">
                <Content className="content-area">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;