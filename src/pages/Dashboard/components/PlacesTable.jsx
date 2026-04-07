import React from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip } from 'antd';
import { HeartFilled, HeartOutlined, LockOutlined, DesktopOutlined, CloudOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PlacesTable = ({ data, onBook, onToggleFavorite, favoritePlaceId }) => {
  const columns = [
    { 
      title: 'Место', 
      dataIndex: 'name', 
      key: 'name',
      render: (name, record) => {
        // Фильтруем только реальные временные интервалы для Tooltip
        const realTimeSlots = record.freeSlots?.filter(
          slot => slot !== "Занято сейчас" && slot !== "Нет слотов"
        ) || [];

        return (
          <Space>
            <Tooltip 
              color="#1f1f1f"
              title={
                <div>
                  <div style={{ marginBottom: '4px', borderBottom: '1px solid #434343', paddingBottom: '4px' }}>
                    <ClockCircleOutlined /> Доступные окна:
                  </div>
                  {realTimeSlots.length > 0 ? (
                    realTimeSlots.map((slot, i) => (
                      <div key={i} style={{ color: '#fadb14' }}>• {slot}</div>
                    ))
                  ) : (
                    <div style={{ color: '#ff4d4f' }}>Нет свободных окон</div>
                  )}
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
              style={{ cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              {favoritePlaceId === record.id ? (
                <HeartFilled style={{ color: '#ff4d4f' }} />
              ) : (
                <HeartOutlined style={{ color: '#555' }} />
              )}
            </span>
            
            {record.status === 'assigned' && (
              <Tag icon={<LockOutlined />} color="#434343" style={{ border: 'none', borderRadius: '4px' }}>
                Постоянное
              </Tag>
            )}
          </Space>
        );
      } 
    },
    { 
      title: 'Описание', 
      dataIndex: 'description', 
      key: 'description',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ color: '#d9d9d9' }}>{text || "Без описания"}</Text>
          <Space style={{ fontSize: '14px', marginTop: '4px' }}>
             {record.equipment?.some(e => e.toLowerCase().includes('монитор')) && (
               <Tooltip title="Монитор"><DesktopOutlined style={{ color: '#8c8c8c' }} /></Tooltip>
             )}
             {(record.description?.toLowerCase().includes('окно') || record.equipment?.some(e => e.toLowerCase().includes('окно'))) && (
               <Tooltip title="У окна"><CloudOutlined style={{ color: '#8c8c8c' }} /></Tooltip>
             )}
          </Space>
        </Space>
      )
    },
    { 
      title: 'Статус', 
      dataIndex: 'freeSlots', 
      key: 'status',
      render: (freeSlots, record) => {
        const isCurrentlyBusy = freeSlots?.includes("Занято сейчас");
        
        if (record.status === 'assigned') {
          return <Tag color="#262626" style={{ color: '#8c8c8c', border: '1px solid #434343' }}>FIXED</Tag>;
        }
        
        if (isCurrentlyBusy) {
          return <Tag color="#410a0a" style={{ color: '#ff4d4f', border: '1px solid #820014' }}>ЗАНЯТО</Tag>;
        }
        
        return <Tag color="#fff" style={{ color: '#000', background: '#fff', border: 'none' }}>СВОБОДНО</Tag>;
      } 
    },
    { 
      title: 'Действие', 
      key: 'action',
      render: (_, record) => {
        // Кнопка активна, если место не FIXED и есть хотя бы один слот (не равно "Нет слотов")
        const hasNoSlots = record.freeSlots?.includes("Нет слотов");
        const isBookable = record.status !== 'assigned' && !hasNoSlots;
        
        return (
          <Button 
            type="primary" 
            disabled={!isBookable}
            onClick={() => onBook(record)}
            style={{ 
              background: isBookable ? '#fadb14' : '#262626', 
              color: isBookable ? '#000' : '#595959', 
              border: 'none', 
              fontWeight: 'bold',
              minWidth: '120px'
            }}
          >
            {record.status === 'assigned' ? 'Закреплено' : 'Забронировать'}
          </Button>
        );
      } 
    }
  ];

  return (
    <Table 
      dataSource={data} 
      columns={columns} 
      pagination={{ pageSize: 6, showSizeChanger: false }} 
      rowKey="id"
      className="dark-table"
      locale={{ emptyText: <Text type="secondary">Мест по заданным фильтрам не найдено</Text> }}
    />
  );
};

export default PlacesTable;