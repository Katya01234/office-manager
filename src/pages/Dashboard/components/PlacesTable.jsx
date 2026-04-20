import React from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip } from 'antd';
import { 
  HeartFilled, HeartOutlined, LockOutlined, 
  DesktopOutlined, CloudOutlined, ClockCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const PlacesTable = ({ data, onBook, onToggleFavorite, favoritePlaceId }) => {
  const columns = [
    { 
      title: 'Место', 
      dataIndex: 'name', 
      key: 'name',
      width: '30%',
      render: (name, record) => (
        <Space>
          <Tooltip 
            color="#1f1f1f"
            placement="right"
            title={
              <div>
                <div style={{ marginBottom: '4px', borderBottom: '1px solid #434343', paddingBottom: '4px' }}>
                  <ClockCircleOutlined /> Окна (от 2-х часов):
                </div>
                {record.freeSlots && record.freeSlots.length > 0 ? (
                  record.freeSlots.map((slot, i) => (
                    <div key={i} style={{ color: '#fadb14' }}>• {slot}</div>
                  ))
                ) : (
                  <div style={{ color: '#ff4d4f' }}>Нет свободных окон</div>
                )}
              </div>
            }
          >
            <Text strong style={{ color: '#fadb14', cursor: 'help', borderBottom: '1px dashed #fadb14' }}>
              {name || `Место #${record.id}`}
            </Text>
          </Tooltip>
          
          <div 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(record.id); }} 
            style={{ cursor: 'pointer', padding: '0 8px' }}
          >
            {favoritePlaceId === record.id ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined style={{ color: '#555' }} />}
          </div>
          
          {record.is_assigned && (
            <Tag color="#262626" style={{ border: 'none' }}><LockOutlined /></Tag>
          )}
        </Space>
      )
    },
    { 
      title: 'Характеристики', 
      dataIndex: 'description', 
      key: 'description',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ color: '#d9d9d9', fontSize: '13px' }}>{text || "Стандарт"}</Text>
          <Space style={{ fontSize: '16px', marginTop: '6px' }}>
             {record.equipment?.some(e => e.toLowerCase().includes('монитор')) && <DesktopOutlined style={{ color: '#1677ff' }} />}
             {record.description?.toLowerCase().includes('окно') && <CloudOutlined style={{ color: '#8c8c8c' }} />}
             <Tooltip title="Розетки 220V"><InfoCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} /></Tooltip>
          </Space>
        </Space>
      )
    },
    { 
      title: 'Действие', 
      key: 'action',
      align: 'right',
      render: (_, record) => {
        const noSlots = !record.freeSlots || record.freeSlots.length === 0;
        const canBook = !record.is_assigned && !noSlots;
        
        return (
          <Button 
            type="primary" 
            disabled={!canBook}
            onClick={() => onBook(record)}
            style={{ 
              background: canBook ? '#fadb14' : '#262626', 
              color: canBook ? '#000' : '#595959', 
              border: 'none', fontWeight: 'bold', minWidth: '130px'
            }}
          >
            {record.is_assigned ? 'Закреплено' : (noSlots ? 'Занято' : 'Забронировать')}
          </Button>
        );
      } 
    }
  ];

  return (
    <div className="custom-dark-table">
      <Table dataSource={data} columns={columns} pagination={{ pageSize: 6 }} rowKey="id" />
      <style jsx="true">{`
        .custom-dark-table .ant-table { background: #141414 !important; color: #fff !important; }
        .custom-dark-table .ant-table-thead > tr > th { background: #1d1d1d !important; color: #8c8c8c !important; border-bottom: 1px solid #333 !important; }
        .custom-dark-table .ant-table-tbody > tr > td { border-bottom: 1px solid #262626 !important; }
        .custom-dark-table .ant-table-tbody > tr:hover > td { background: #1f1f1f !important; }
      `}</style>
    </div>
  );
};

export default PlacesTable;