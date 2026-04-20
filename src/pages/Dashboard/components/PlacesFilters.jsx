import React, { useMemo } from 'react';
import { Card, Space, Button, DatePicker, TimePicker, Typography } from 'antd';
import { CloseCircleOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const PlacesFilters = ({ filters, setFilters }) => {
  // Используем useMemo, чтобы объект tomorrow не пересоздавался при каждом рендере
  // Это предотвратит лишние срабатывания useEffect в Dashboard
  const tomorrow = useMemo(() => dayjs().add(1, 'day').startOf('day'), []);

  // Проверка изменений
  const hasChanges = useMemo(() => {
    const isNotTomorrow = filters.date ? !filters.date.isSame(tomorrow, 'day') : false;
    const hasTimeSelected = filters.timeRange !== null;
    return isNotTomorrow || hasTimeSelected;
  }, [filters.date, filters.timeRange, tomorrow]);

  const handleReset = () => {
    setFilters(prev => ({
      ...prev,
      date: tomorrow,
      timeRange: null
    }));
  };

  return (
    <Card 
      style={{ 
        background: '#141414', 
        borderColor: '#333', 
        borderRadius: '8px',
        marginBottom: '16px' // Добавим небольшой отступ снизу
      }} 
      bodyStyle={{ padding: '12px 24px' }}
    >
      <Space size="middle" wrap>
        <Text strong style={{ color: '#8c8c8c' }}>Поиск по времени:</Text>
        
        <DatePicker 
          placeholder="Выбрать дату"
          value={filters.date}
          allowClear={false}
          inputReadOnly // Защита от вызова клавиатуры
          onChange={(date) => setFilters(prev => ({ ...prev, date: date.startOf('day') }))}
          disabledDate={(current) => current && current < dayjs().startOf('day')}
          style={{ width: 160 }}
          suffixIcon={<CalendarOutlined />}
        />

        <TimePicker.RangePicker 
          placeholder={['Начало', 'Конец']}
          value={filters.timeRange}
          format="HH:mm"
          minuteStep={15}
          onChange={(range) => setFilters(prev => ({ ...prev, timeRange: range }))}
          style={{ width: 210 }}
          suffixIcon={<ClockCircleOutlined />}
        />

        {hasChanges && (
          <Button 
            type="link" 
            danger 
            icon={<CloseCircleOutlined />}
            onClick={handleReset}
            style={{ 
              paddingLeft: '8px', 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: '500' 
            }}
          >
            Вернуть на завтра
          </Button>
        )}
      </Space>
    </Card>
  );
};

export default PlacesFilters;