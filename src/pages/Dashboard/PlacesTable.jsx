import React from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip } from 'antd';
import { HeartFilled, HeartOutlined, LockOutlined, DesktopOutlined, CloudOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PlacesTable = ({ data, onBook, onToggleFavorite, favoritePlace }) => {
  const columns = [
    { 
      title: 'Место', 
      dataIndex: 'name', 
      key: 'name',
      render: (name, record) => (
        <Space>
          <Text strong style={{ color: '#fadb14' }}>{name}</Text>
          <span onClick={() => onToggleFavorite(name)} style={{ cursor: 'pointer' }}>
            {favoritePlace === name ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined style={{ color: '#555' }} />}
          </span>
          {record.isPermanent && (
            <Tag icon={<LockOutlined />} color="#434343" style={{ border: 'none', borderRadius: '4px' }}>Постоянное</Tag>
          )}
        </Space>
      ) 
    },
    { 
      title: 'Описание', 
      dataIndex: 'desc', 
      key: 'desc',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ color: '#d9d9d9' }}>{text}</Text>
          <Space style={{ fontSize: '12px', marginTop: '4px' }}>
             {record.features?.monitors > 0 && <Tooltip title="Мониторы"><DesktopOutlined style={{ color: '#8c8c8c' }} /></Tooltip>}
             {record.features?.window && <Tooltip title="У окна"><CloudOutlined style={{ color: '#8c8c8c' }} /></Tooltip>}
          </Space>
        </Space>
      )
    },
    { 
      title: 'Статус', 
      dataIndex: 'status', 
      key: 'status',
      render: (status, record) => {
        if (record.isPermanent) return <Tag color="#262626" style={{ color: '#8c8c8c', border: '1px solid #434343' }}>ЗАНЯТО (FIX)</Tag>;
        if (status === 'Занято') return <Tag color="#410a0a" style={{ color: '#ff4d4f', border: '1px solid #820014' }}>ЗАНЯТО</Tag>;
        return <Tag color="#fff" style={{ color: '#000', background: '#fff', border: 'none' }}>СВОБОДНО</Tag>;
      } 
    },
    { 
      title: 'Действие', 
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          disabled={record.status === 'Занято' || record.isPermanent}
          onClick={() => onBook(record)}
          style={{ background: record.status === 'Свободно' ? '#fadb14' : '', color: '#000', border: 'none', fontWeight: 'bold' }}
        >
          Забронировать
        </Button>
      ) 
    }
  ];

  return (
    <Table 
      dataSource={data} 
      columns={columns} 
      pagination={{ pageSize: 6 }} 
      rowKey="key"
      style={{ background: '#141414' }}
    />
  );
};

export default PlacesTable;