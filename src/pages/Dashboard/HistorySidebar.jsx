import React from 'react';
import { Card, Typography, Tag, Empty } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';

const { Text } = Typography;

const HistorySidebar = ({ history }) => {
  return (
    <Card 
      title={<span style={{ color: '#fff' }}><HistoryOutlined /> История</span>} 
      style={{ background: '#141414', borderColor: '#333', height: '100%' }}
    >
      {history?.length > 0 ? (
        history.map(item => (
          <div key={item.key} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong style={{ color: '#fff' }}>{item.place}</Text>
              <Tag color="default" style={{ fontSize: '10px' }}>{item.status.toUpperCase()}</Tag>
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>{item.date}</Text>
          </div>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ color: '#555' }}>История пуста</span>} />
      )}
    </Card>
  );
};

export default HistorySidebar;