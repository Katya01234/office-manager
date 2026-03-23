import React from 'react';
import { Table, Typography, Tag, Button, Space } from 'antd';

const { Title, Text } = Typography;

const Dashboard = ({ currentTheme }) => {
  // Безопасные цвета
  const textColor = currentTheme?.colors?.text || '#ffffff';

  const dataSource = [
    { key: '1', name: 'Место А-101', perks: ['2 монитора'], status: 'Свободно', desc: 'У окна' },
    { key: '2', name: 'Место А-102', perks: ['Лампа'], status: 'Занято', desc: 'Тихая зона' },
    { key: '3', name: 'Место Б-201', perks: ['Розетка'], status: 'Свободно', desc: 'Рядом с кофе' },
    { key: '4', name: 'Место Б-202', perks: ['Принтер'], status: 'Занято', desc: 'Рядом с кондиционером' },
    { key: '5', name: 'Место С-301', perks: ['Кондиционер'], status: 'Свободно', desc: 'Рядом с принтером' },
  ];

  const columns = [
    { 
      title: 'Локация', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text) => <Text strong style={{ color: '#fadb14' }}>{text}</Text> 
    },
    { 
      title: 'Описание', 
      dataIndex: 'desc', 
      render: (text) => <Text style={{ color: textColor }}>{text}</Text>
    },
    { 
      title: 'Особенности', 
      dataIndex: 'perks', 
      render: (perks) => (
        <Space size="small">
          {perks.map(perk => (
            <Tag key={perk} color="blue">{perk}</Tag>
          ))}
        </Space>
      )
    },
    { 
      title: 'Статус', 
      dataIndex: 'status', 
      render: (status) => {
        const isFree = status.toLowerCase() === 'свободно';
        return (
          <Tag color={isFree ? '#fadb14' : '#ff1212'} style={{ color: '#000', fontWeight: 'bold' }}>
            {status.toUpperCase()}
          </Tag>
        );
      }
    },
    { 
      title: 'Действие', 
      render: (_, record) => (
        <Button type="primary" disabled={record.status === 'Занято'}>
          Забронировать
        </Button>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <Title level={2} style={{ color: textColor, marginBottom: 24 }}>
        Рабочие места
      </Title>
      
      <Table 
        dataSource={dataSource} 
        columns={columns} 
        pagination={false} 
        rowKey="key"
      />
    </div>
  );
};

export default Dashboard;