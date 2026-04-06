import React from 'react';
import { Card, Space, Button, Select, Typography } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

const PlacesFilters = ({ filters, setFilters }) => {
  return (
    <Card 
      style={{ background: '#141414', borderColor: '#333', marginBottom: 16 }} 
      bodyStyle={{ padding: '12px 24px' }}
    >
      <Space size="large" wrap>
        <Text strong style={{ color: '#8c8c8c' }}>Фильтры:</Text>
        
        <Button 
          style={filters.onlyWindow ? { background: '#fadb14', color: '#000', border: 'none' } : {}}
          onClick={() => setFilters(prev => ({ ...prev, onlyWindow: !prev.onlyWindow }))}
        >
          У окна
        </Button>

        <Select 
          value={filters.minMonitors} 
          style={{ width: 160 }}
          dropdownStyle={{ background: '#1f1f1f' }}
          onChange={(val) => setFilters(prev => ({ ...prev, minMonitors: val }))}
        >
          <Option value={0}>Мониторы: Любое</Option>
          <Option value={1}>1 монитор</Option>
          <Option value={2}>2+ монитора</Option>
        </Select>

        <Button 
          style={filters.onlyQuiet ? { background: '#fadb14', color: '#000', border: 'none' } : {}}
          onClick={() => setFilters(prev => ({ ...prev, onlyQuiet: !prev.onlyQuiet }))}
        >
          Тихая зона
        </Button>

        {/* Кнопка сброса */}
        {(filters.onlyWindow || filters.minMonitors > 0 || filters.onlyQuiet) && (
          <Button 
            type="link" 
            danger 
            icon={<CloseCircleOutlined />}
            onClick={() => setFilters({ onlyWindow: false, minMonitors: 0, onlyQuiet: false })}
          >
            Сбросить
          </Button>
        )}
      </Space>
    </Card>
  );
};

export default PlacesFilters;