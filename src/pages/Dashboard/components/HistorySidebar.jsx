import React, { useMemo } from 'react';
import { Card, Typography, Tag, Empty, Space, Button } from 'antd';
import { 
  HistoryOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  DeleteOutlined,
  RocketOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.locale('ru');

const { Text } = Typography;

const HistorySidebar = ({ history, onCancelBooking }) => {
  const { activeBookings, pastHistory } = useMemo(() => {
    const all = history || [];
    const now = dayjs();
    
    return {
      activeBookings: all
        .filter(item => dayjs.utc(item.end_datetime).local().isAfter(now))
        .sort((a, b) => dayjs.utc(a.start_datetime).diff(dayjs.utc(b.start_datetime))),
      pastHistory: all
        .filter(item => dayjs.utc(item.end_datetime).local().isBefore(now))
        .sort((a, b) => dayjs.utc(b.start_datetime).diff(dayjs.utc(a.start_datetime)))
    };
  }, [history]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <Card 
        title={<span style={{ color: '#fadb14' }}><RocketOutlined /> Предстоящие сессии</span>}
        style={{ background: '#141414', borderColor: '#333', borderRadius: '12px' }}
        bodyStyle={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}
      >
        {activeBookings.length > 0 ? (
          activeBookings.map(item => (
            <div key={item.id} style={{ padding: '12px', marginBottom: 12, background: '#1f1f1f', borderRadius: '8px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ color: '#fff' }}>{item.workspace_name || `Место #${item.workspace_id}`}</Text>
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => onCancelBooking(item.id)}
                  style={{ height: 'auto', padding: '4px' }}
                />
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {/* ИСПРАВЛЕНО: Форматирование интервала */}
                  <CalendarOutlined /> {dayjs.utc(item.start_datetime).local().format('DD.MM')} | {dayjs.utc(item.start_datetime).local().format('HH:mm')} - {dayjs.utc(item.end_datetime).local().format('HH:mm')}
                </Text>
              </div>
            </div>
          ))
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ color: '#555' }}>Нет активных планов</span>} />
        )}
      </Card>

      <Card 
        title={<span style={{ color: '#fff' }}><HistoryOutlined /> История посещений</span>} 
        style={{ background: '#141414', borderColor: '#333', borderRadius: '12px' }}
        bodyStyle={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}
      >
        {pastHistory.length > 0 ? (
          pastHistory.map(item => (
            <div key={item.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #262626' }}>
              <Text strong style={{ color: '#8c8c8c', display: 'block' }}>
                {item.workspace_name}
              </Text>
              
              <Space direction="vertical" size={0} style={{ marginTop: 4 }}>
                <Text style={{ fontSize: '11px', color: '#595959' }}>
                  <CalendarOutlined /> {dayjs.utc(item.start_datetime).local().format('D MMMM YYYY')}
                </Text>
                <Text style={{ fontSize: '11px', color: '#595959' }}>
                  {/* ИСПРАВЛЕНО: Конец интервала b.end_datetime */}
                  <ClockCircleOutlined style={{ fontSize: '10px' }} /> {dayjs.utc(item.start_datetime).local().format('HH:mm')} — {dayjs.utc(item.end_datetime).local().format('HH:mm')}
                </Text>
              </Space>
            </div>
          ))
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ color: '#555' }}>История пуста</span>} />
        )}
      </Card>
    </div>
  );
};

export default HistorySidebar;