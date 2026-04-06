import React from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip } from 'antd';
import { HeartFilled, HeartOutlined, LockOutlined, DesktopOutlined, CloudOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PlacesTable = ({ data, onBook, onToggleFavorite, favoritePlace }) => {
  const columns = [
    { 
      title: 'Место', 
      dataIndex: 'name', 
      key: 'name',
      render: (name, record) => (
        <Space>
          {/* Добавляем Tooltip со свободными слотами при наведении на название */}
          <Tooltip 
            color="#1f1f1f"
            title={
              <div>
                <div style={{ marginBottom: '4px', borderBottom: '1px solid #434343', paddingBottom: '4px' }}>
                  <ClockCircleOutlined /> Свободные окна:
                </div>
                {record.freeSlots?.map((slot, i) => (
                  <div key={i} style={{ color: '#fadb14' }}>• {slot}</div>
                ))}
              </div>
            }
          >
            <Text strong style={{ color: '#fadb14', cursor: 'help' }}>{name}</Text>
          </Tooltip>

          <span 
  onClick={(e) => {
    e.stopPropagation();
    onToggleFavorite(record.id);
  }} 
  style={{ cursor: 'pointer', padding: '4px' }}
>
  {favoritePlace === name ? (
    <HeartFilled style={{ color: '#ff4d4f' }} />
  ) : (
    <HeartOutlined style={{ color: '#555' }} />
  )}
</span>
          
          {/* В API статус закрепленного места называется 'assigned' */}
          {record.status === 'assigned' && (
            <Tag icon={<LockOutlined />} color="#434343" style={{ border: 'none', borderRadius: '4px' }}>Постоянное</Tag>
          )}
        </Space>
      ) 
    },
    { 
      title: 'Описание', 
      dataIndex: 'description', 
      key: 'description',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ color: '#d9d9d9' }}>{text || "Без описания"}</Text>
          <Space style={{ fontSize: '12px', marginTop: '4px' }}>
             {/* Проверяем оборудование из массива equipment */}
             {record.equipment?.includes('Монитор') && <Tooltip title="Монитор"><DesktopOutlined style={{ color: '#8c8c8c' }} /></Tooltip>}
             {record.description?.toLowerCase().includes('окно') && <Tooltip title="У окна"><CloudOutlined style={{ color: '#8c8c8c' }} /></Tooltip>}
          </Space>
        </Space>
      )
    },
    { 
      title: 'Статус', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        if (status === 'assigned') return <Tag color="#262626" style={{ color: '#8c8c8c', border: '1px solid #434343' }}>FIXED</Tag>;
        if (status === 'busy') return <Tag color="#410a0a" style={{ color: '#ff4d4f', border: '1px solid #820014' }}>ЗАНЯТО</Tag>;
        return <Tag color="#fff" style={{ color: '#000', background: '#fff', border: 'none' }}>СВОБОДНО</Tag>;
      } 
    },
    { 
      title: 'Действие', 
  key: 'action',
  render: (_, record) => {
    const isAvailable = !record.status || record.status === 'available';
    
    return (
      <Button 
        type="primary" 
        disabled={!isAvailable}
        onClick={() => onBook(record)}
        style={{ 
          background: isAvailable ? '#fadb14' : '#333', 
          color: isAvailable ? '#000' : '#8c8c8c', 
          border: 'none', 
          fontWeight: 'bold' 
        }}
      >
        Забронировать
      </Button>
      // title: 'Действие', 
      // key: 'action',
      // render: (_, record) => (
      //   <Button 
      //     type="primary" 
      //     // Дизейблим, если статус не available
      //     disabled={record.status !== 'available'}
      //     onClick={() => onBook(record)}
      //     style={{ 
      //       background: record.status === 'available' ? '#fadb14' : '', 
      //       color: '#000', 
      //       border: 'none', 
      //       fontWeight: 'bold' 
      //     }}
      //   >
      //     Забронировать
      //   </Button>
      ) 
    }
  }
  ];

  return (
    <Table 
      dataSource={data} 
      columns={columns} 
      pagination={{ pageSize: 6 }} 
      rowKey="id"
      style={{ background: '#141414' }}
      className="dark-table"
    />
  );
};

export default PlacesTable;