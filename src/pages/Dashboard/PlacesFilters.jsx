import React from 'react';
import { Card, Space, Button, Select, Typography } from 'antd';

const { Text } = Typography;
const { Option } = Select;

const PlacesFilters = ({ filters, setFilters }) => {
  return (
    <Card style={{ background: '#141414', borderColor: '#333', marginBottom: 16 }} bodyStyle={{ padding: '12px 24px' }}>
      <Space size="large" wrap>
        <Text strong style={{ color: '#8c8c8c' }}>Фильтры:</Text>
        
        <Button 
          type={filters.onlyWindow ? 'primary' : 'default'}
          onClick={() => setFilters(prev => ({ ...prev, onlyWindow: !prev.onlyWindow }))}
        >
          У окна
        </Button>

        <Select 
          value={filters.minMonitors} 
          style={{ width: 160 }}
          onChange={(val) => setFilters(prev => ({ ...prev, minMonitors: val }))}
        >
          <Option value={0}>Мониторы: Любое</Option>
          <Option value={1}>1 монитор</Option>
          <Option value={2}>2+ монитора</Option>
        </Select>

        <Button 
          type={filters.onlyQuiet ? 'primary' : 'default'}
          onClick={() => setFilters(prev => ({ ...prev, onlyQuiet: !prev.onlyQuiet }))}
        >
          Тихая зона
        </Button>

        {(filters.onlyWindow || filters.minMonitors > 0 || filters.onlyQuiet) && (
          <Button type="link" danger onClick={() => setFilters({ onlyWindow: false, minMonitors: 0, onlyQuiet: false })}>
            Сбросить
          </Button>
        )}
      </Space>
    </Card>
  );
};

export default PlacesFilters;