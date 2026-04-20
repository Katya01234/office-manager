import React from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip } from 'antd';
import { 
  HeartFilled, 
  HeartOutlined, 
  LockOutlined, 
  DesktopOutlined, 
  CloudOutlined, 
  ClockCircleOutlined,
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
      render: (name, record) => {
        const realTimeSlots = record.freeSlots?.filter(slot => slot !== "Нет слотов") || [];

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
            
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(record.id);
              }} 
              style={{ cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center' }}
            >
              {favoritePlaceId === record.id ? (
                <HeartFilled style={{ color: '#ff4d4f' }} />
              ) : (
                <HeartOutlined style={{ color: '#555' }} />
              )}
            </div>
            
            {record.is_assigned && (
              <Tooltip title="Это место закреплено">
                <Tag color="#262626" style={{ border: 'none', borderRadius: '4px', margin: 0 }}>
                  <LockOutlined style={{ color: '#8c8c8c' }} />
                </Tag>
              </Tooltip>
            )}
          </Space>
        );
      } 
    },
    { 
      title: 'Характеристики', 
      dataIndex: 'description', 
      key: 'description',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ color: '#d9d9d9', fontSize: '13px' }}>{text || "Стандартное рабочее место"}</Text>
          <Space style={{ fontSize: '16px', marginTop: '6px' }} size="middle">
             {record.equipment?.some(e => e.toLowerCase().includes('монитор')) && (
               <Tooltip title="Второй монитор доступен"><DesktopOutlined style={{ color: '#1677ff' }} /></Tooltip>
             )}
             {record.description?.toLowerCase().includes('окно') && (
               <Tooltip title="Рядом с окном"><CloudOutlined style={{ color: '#8c8c8c' }} /></Tooltip>
             )}
             {/* Пример новой иконки, если есть информация о розетках */}
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
        const hasNoSlots = record.freeSlots?.includes("Нет слотов");
        // Место можно бронировать, если оно не закреплено и есть свободные часы
        const isBookable = !record.is_assigned && !hasNoSlots;
        
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
              minWidth: '130px',
              borderRadius: '4px'
            }}
          >
            {record.is_assigned ? 'Закреплено' : (hasNoSlots ? 'Занято' : 'Забронировать')}
          </Button>
        );
      } 
    }
  ];

  return (
    <div className="custom-dark-table">
      <Table 
        dataSource={data} 
        columns={columns} 
        pagination={{ 
          pageSize: 6, 
          showSizeChanger: false,
          position: ['bottomCenter'] 
        }} 
        rowKey="id"
        locale={{ emptyText: <Text type="secondary">Мест не найдено</Text> }}
      />
      
      {/* Внутренние стили, чтобы таблица была черной без внешних CSS файлов */}
      <style jsx="true">{`
        .custom-dark-table .ant-table {
          background: #141414 !important;
          color: #fff !important;
        }
        .custom-dark-table .ant-table-thead > tr > th {
          background: #1d1d1d !important;
          color: #8c8c8c !important;
          border-bottom: 1px solid #333 !important;
        }
        .custom-dark-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #262626 !important;
        }
        .custom-dark-table .ant-table-tbody > tr:hover > td {
          background: #1f1f1f !important;
        }
        .custom-dark-table .ant-pagination-item {
          background: transparent !important;
          border-color: #333 !important;
        }
        .custom-dark-table .ant-pagination-item-active {
          border-color: #fadb14 !important;
        }
        .custom-dark-table .ant-pagination-item-active a {
          color: #fadb14 !important;
        }
      `}</style>
    </div>
  );
};

export default PlacesTable;