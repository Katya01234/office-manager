import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, DatePicker, TimePicker, Typography, message } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const BookingModal = ({ open, onCancel, onConfirm, place, initialDate }) => {
  // Состояние для даты и времени
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeRange, setTimeRange] = useState(null);

  useEffect(() => {
    if (open) {
      // 1. Берем дату из фильтров дашборда или завтрашний день по умолчанию
      const defaultDate = initialDate || dayjs().add(1, 'day').startOf('day');
      setSelectedDate(defaultDate);
      
      // 2. Устанавливаем стандартный рабочий интервал (9:00 - 18:00)
      // Используем defaultDate как базу для объектов dayjs в TimePicker
      setTimeRange([
        defaultDate.clone().hour(9).minute(0),
        defaultDate.clone().hour(18).minute(0)
      ]);
    }
  }, [open, initialDate]);

  // Запрет выбора прошлых дат
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const handleConfirm = () => {
    if (!timeRange || !selectedDate) {
      return message.error('Укажите дату и временной интервал');
    }

    // Собираем финальные объекты даты и времени
    const finalStart = selectedDate.clone()
      .hour(timeRange[0].hour())
      .minute(timeRange[0].minute())
      .second(0);
    
    const finalEnd = selectedDate.clone()
      .hour(timeRange[1].hour())
      .minute(timeRange[1].minute())
      .second(0);

    // Валидация
    if (finalStart.isBefore(dayjs())) {
      return message.error('Нельзя забронировать время в прошлом');
    }
    
    if (finalEnd.diff(finalStart, 'minute') < 15) {
      return message.error('Минимальное время бронирования — 15 минут');
    }
    
    onConfirm({ start: finalStart, end: finalEnd });
  };

  return (
    <Modal
      title={
        <span style={{ color: '#fff' }}>
          Забронировать: <span style={{ color: '#fadb14' }}>{place?.name}</span>
        </span>
      }
      open={open}
      onCancel={onCancel}
      centered
      // Стилизация под темную тему
      styles={{
        content: { background: '#141414', border: '1px solid #333' },
        header: { background: '#141414', borderBottom: '1px solid #333', paddingBottom: '12px' }
      }}
      footer={[
        <Button key="cancel" onClick={onCancel} style={{ background: 'transparent', color: '#8c8c8c', borderColor: '#434343' }}>
          Отмена
        </Button>,
        <Button 
          key="ok" 
          type="primary" 
          onClick={handleConfirm}
          style={{ background: '#fadb14', color: '#000', border: 'none', fontWeight: 'bold' }}
        >
          Подтвердить бронь
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }} size="large">
        <div>
          <Text style={{ color: '#8c8c8c', marginBottom: 8, display: 'block' }}>Дата</Text>
          <DatePicker 
            value={selectedDate} 
            onChange={setSelectedDate} 
            disabledDate={disabledDate} 
            style={{ width: '100%' }} 
            allowClear={false}
          />
        </div>

        <div>
          <Text style={{ color: '#8c8c8c', marginBottom: 8, display: 'block' }}>Время (с — по)</Text>
          <TimePicker.RangePicker 
            value={timeRange} 
            onChange={setTimeRange} 
            format="HH:mm" 
            minuteStep={15}
            style={{ width: '100%' }} 
            placeholder={['Начало', 'Конец']}
          />
          {place?.is_assigned && (
             <Text type="warning" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
               Внимание: это место закреплено за другим пользователем.
             </Text>
          )}
        </div>
      </Space>
    </Modal>
  );
};

export default BookingModal;