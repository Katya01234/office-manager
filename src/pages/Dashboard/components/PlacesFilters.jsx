import React from 'react';
import { Card, Space, Button, DatePicker, TimePicker, Typography } from 'antd';
import { CloseCircleOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const PlacesFilters = ({ filters, setFilters }) => {
  // Проверка: применен ли хотя бы один фильтр
  const hasActiveFilters = filters.date || filters.timeRange;

  // Сброс фильтров даты и времени
  const handleReset = () => {
    setFilters(prev => ({
      ...prev,
      date: null,
      timeRange: null
    }));
  };

  return (
    <Card 
      style={{ background: '#141414', borderColor: '#333', borderRadius: '8px' }} 
      bodyStyle={{ padding: '12px 24px' }}
    >
      <Space size="middle" wrap>
        <Text strong style={{ color: '#8c8c8c' }}>Поиск по времени:</Text>
        
        {/* Выбор даты */}
        <DatePicker 
          placeholder="Выбрать дату"
          value={filters.date}
          onChange={(date) => setFilters(prev => ({ ...prev, date }))}
          // Запрещаем выбор прошедших дат
          disabledDate={(current) => current && current < dayjs().startOf('day')}
          style={{ width: 150 }}
          suffixIcon={<CalendarOutlined />}
        />

        {/* Выбор временного интервала */}
        <TimePicker.RangePicker 
          placeholder={['Начало', 'Конец']}
          value={filters.timeRange}
          format="HH:mm"
          minuteStep={15}
          onChange={(range) => setFilters(prev => ({ ...prev, timeRange: range }))}
          style={{ width: 210 }}
          suffixIcon={<ClockCircleOutlined />}
        />

        {/* Кнопка сброса */}
        {hasActiveFilters && (
          <Button 
            type="link" 
            danger 
            icon={<CloseCircleOutlined />}
            onClick={handleReset}
            style={{ paddingLeft: '8px' }}
          >
            Сбросить время
          </Button>
        )}
      </Space>
    </Card>
  );
};

export default PlacesFilters;