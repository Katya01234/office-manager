import React, { useMemo } from 'react';
import { Card, Typography, Tag, Empty, Space } from 'antd';
import { HistoryOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Импортируем русскую локаль

dayjs.locale('ru'); // Устанавливаем её

const { Text } = Typography;

const HistorySidebar = ({ history }) => {
  // Используем useMemo для тяжелых операций фильтрации и сортировки
  const processedHistory = useMemo(() => {
    return (history || [])
      .filter(item => dayjs(item.end_datetime).isBefore(dayjs())) 
      .sort((a, b) => dayjs(b.start_datetime).diff(dayjs(a.start_datetime)));
  }, [history]);

  return (
    <Card 
      title={<span style={{ color: '#fff' }}><HistoryOutlined /> История посещений</span>} 
      style={{ 
        background: '#141414', 
        borderColor: '#333', 
        height: '100%', 
        borderRadius: '8px',
        overflow: 'hidden' // Чтобы ничего не вылетало за границы
      }}
      bodyStyle={{ 
        padding: '16px', 
        maxHeight: '500px', // Опционально: ограничиваем высоту, если история очень длинная
        overflowY: 'auto' 
      }}
    >
      {processedHistory.length > 0 ? (
        processedHistory.map(item => (
          <div 
            key={item.id}
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
              <Tag color="#262626" style={{ fontSize: '10px', color: '#8c8c8c', border: 'none', borderRadius: '2px' }}>
                DONE
              </Tag>
            </div>
            
            <Space direction="vertical" size={0} style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', textTransform: 'capitalize' }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {dayjs(item.start_datetime).format('DD MMMM')}
              </Text>
              <Text style={{ fontSize: '11px', color: '#595959' }}>
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