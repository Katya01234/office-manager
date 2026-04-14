import React from 'react';
import { Card, Space, Button, DatePicker, TimePicker, Typography } from 'antd';
import { CloseCircleOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const PlacesFilters = ({ filters, setFilters }) => {
  // Дата по умолчанию — завтра
  const tomorrow = dayjs().add(1, 'day').startOf('day');

  // Проверка: изменены ли фильтры относительно состояния "по умолчанию"
  // Показываем кнопку сброса, если дата не завтра ИЛИ выбран интервал времени
  const hasChanges = 
    (filters.date && !filters.date.isSame(tomorrow, 'day')) || 
    filters.timeRange !== null;

  // Сброс фильтров к состоянию "Завтра, весь день"
  const handleReset = () => {
    setFilters(prev => ({
      ...prev,
      date: tomorrow,
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
          allowClear={false} // Убираем крестик внутри, чтобы не сбросить в null
          onChange={(date) => setFilters(prev => ({ ...prev, date }))}
          // Запрещаем выбор прошедших дат (сегодня выбирать можно, если нужно, 
          // но по умолчанию стоит завтра)
          disabledDate={(current) => current && current < dayjs().startOf('day')}
          style={{ width: 160 }}
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

        {/* Кнопка возврата к завтрашнему дню */}
        {hasChanges && (
          <Button 
            type="link" 
            danger 
            icon={<CloseCircleOutlined />}
            onClick={handleReset}
            style={{ paddingLeft: '8px', display: 'flex', alignItems: 'center' }}
          >
            Вернуть на завтра
          </Button>
        )}
      </Space>
    </Card>
  );
};

export default PlacesFilters;