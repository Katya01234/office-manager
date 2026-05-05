import React from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip, Spin } from 'antd';
import { 
  HeartFilled, HeartOutlined, LockOutlined, 
  DesktopOutlined, CloudOutlined, ClockCircleOutlined,
  InfoCircleOutlined, PushpinFilled
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '../../../api/api';

const { Text } = Typography;

// Микро-компонент для ленивой загрузки реальных данных об оснащении
const EquipmentTooltip = ({ workspaceId }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['workspaceDetails', workspaceId],
    queryFn: () => workspaceApi.getWorkspaceDetails(workspaceId),
    enabled: false, // Не грузим сразу, чтобы не спамить запросами
    staleTime: 1000 * 60 * 10,
  });

  const content = isLoading ? (
    <Spin size="small" />
  ) : (
    <div style={{ maxWidth: '200px' }}>
      {data?.location && (
        <div style={{ borderBottom: '1px solid #434343', marginBottom: '8px', paddingBottom: '4px', color: '#8c8c8c' }}>
          Локация: {data.location}
        </div>
      )}
      <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Оснащение:</div>
      {data?.equipment?.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {data.equipment.map((item, i) => (
            <Tag key={i} color="gold" style={{ fontSize: '10px', margin: 0 }}>
              {item}
            </Tag>
          ))}
        </div>
      ) : (
        <div style={{ color: '#595959' }}>{data?.description || 'Нет описания'}</div>
      )}
    </div>
  );

  return (
    <Tooltip 
      title={content} 
      color="#1f1f1f"
      onOpenChange={(open) => { if (open && !data) refetch(); }}
    >
      <InfoCircleOutlined style={{ color: '#52c41a', cursor: 'help' }} />
    </Tooltip>
  );
};

const PlacesTable = ({ data, onBook, onToggleFavorite, favoritePlaceId, mainPlaceId }) => {
  const columns = [
    { 
      title: 'Место', 
      dataIndex: 'name', 
      key: 'name',
      width: '30%',
      render: (name, record) => {
        const isMain = mainPlaceId === record.id;
        const isFav = favoritePlaceId === record.id;

        return (
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
              <Text strong style={{ color: isMain ? '#1677ff' : '#fadb14', cursor: 'help', borderBottom: '1px dashed' }}>
                {name || `Место #${record.id}`}
              </Text>
            </Tooltip>
            
            <div 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(record.id); }} 
              style={{ cursor: 'pointer', padding: '0 4px' }}
            >
              {isFav ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined style={{ color: '#555' }} />}
            </div>
            
            {isMain && (
              <Tooltip title="Ваше постоянное место">
                <PushpinFilled style={{ color: '#1677ff' }} />
              </Tooltip>
            )}

            {record.is_assigned && !isMain && (
              <Tag color="#262626" style={{ border: 'none' }}><LockOutlined /></Tag>
            )}
          </Space>
        );
      }
    },
    { 
      title: 'Тип и Оснащение', 
      dataIndex: 'description', 
      key: 'description',
      render: (text, record) => {
        const isMeeting = record.name?.startsWith('П');
        // Проверяем оборудование на наличие монитора
        const hasMonitor = record.equipment?.some(e => e.toLowerCase().includes('монитор'));
        // Проверяем описание на наличие окна
        const hasWindow = record.description?.toLowerCase().includes('окно');

        return (
          <Space direction="vertical" size={0}>
            <Text style={{ 
              color: isMeeting ? '#D4AF37' : '#d9d9d9', 
              fontSize: '12px', 
              fontWeight: isMeeting ? 'bold' : 'normal',
              textTransform: 'uppercase'
            }}>
              {isMeeting ? 'Переговорная' : 'Рабочее место'}
            </Text>
            
            {/* Выводим реальный текст из API */}
            {text && <Text style={{ color: '#595959', fontSize: '11px' }}>{text}</Text>}
            
            <Space style={{ fontSize: '16px', marginTop: '4px' }}>
               {hasMonitor && <DesktopOutlined style={{ color: '#1677ff' }} />}
               {hasWindow && <CloudOutlined style={{ color: '#8c8c8c' }} />}
               
               {/* ЗАМЕНА: Реальные данные вместо мока "Розетки" */}
               <EquipmentTooltip workspaceId={record.id} />
            </Space>
          </Space>
        );
      }
    },
    { 
      title: 'Действие', 
      key: 'action',
      render: (_, record) => {
        const isMain = mainPlaceId === record.id;
        const noSlots = !record.freeSlots || record.freeSlots.length === 0;
        const canBook = !record.is_assigned && !noSlots;
        
        if (isMain) return <Tag color="blue">ВАШЕ МЕСТО</Tag>;

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
      <Table 
        dataSource={data} 
        columns={columns} 
        pagination={{ pageSize: 6, size: 'small' }} 
        rowKey="id" 
      />
      <style jsx="true">{`
        .custom-dark-table .ant-table { background: #141414 !important; color: #fff !important; }
        .custom-dark-table .ant-table-thead > tr > th { background: #1d1d1d !important; color: #8c8c8c !important; border-bottom: 1px solid #333 !important; }
        .custom-dark-table .ant-table-tbody > tr > td { border-bottom: 1px solid #262626 !important; }
        .custom-dark-table .ant-table-tbody > tr:hover > td { background: #1f1f1f !important; }
        .custom-dark-table .ant-pagination-item-active { border-color: #fadb14 !important; background: transparent !important; }
        .custom-dark-table .ant-pagination-item-active a { color: #fadb14 !important; }
      `}</style>
    </div>
  );
};

export default PlacesTable;