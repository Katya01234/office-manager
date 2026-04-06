import React from 'react';
import { Card, Typography, Tag, Empty, Space } from 'antd';
import { HistoryOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const HistorySidebar = ({ history }) => {
  return (
    <Card 
      title={<span style={{ color: '#fff' }}><HistoryOutlined /> История посещений</span>} 
      style={{ 
        background: '#141414', 
        borderColor: '#333', 
        height: '100%', 
        borderRadius: '8px' 
      }}
      bodyStyle={{ padding: '16px' }}
    >
      {history?.length > 0 ? (
        // Сортируем историю: самые свежие сверху
        [...history].reverse().map(item => (
          <div 
            key={item.id} // У Славы это id
            style={{ 
              paddingBottom: 12, 
              marginBottom: 12, 
              borderBottom: '1px solid #262626' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text strong style={{ color: '#fadb14' }}>
                {item.workspace_name}
              </Text>
              {/* Статус в истории обычно завершен, можно вывести время */}
              <Tag color="#262626" style={{ fontSize: '10px', color: '#8c8c8c', border: 'none' }}>
                DONE
              </Tag>
            </div>
            
            <Space direction="vertical" size={0} style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {dayjs(item.start_datetime).format('DD MMMM')}
              </Text>
              <Text style={{ fontSize: '11px', color: '#555' }}>
                {dayjs(item.start_datetime).format('HH:mm')} — {dayjs(item.end_datetime).format('HH:mm')}
              </Text>
            </Space>
          </div>
        ))
      ) : (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description={<span style={{ color: '#555' }}>История пуста</span>} 
        />
      )}
    </Card>
  );
};

export default HistorySidebar;