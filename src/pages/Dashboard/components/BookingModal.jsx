import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, DatePicker, TimePicker, Typography, message } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const BookingModal = ({ open, onCancel, onConfirm, place }) => {
  // 1. Устанавливаем завтрашний день как начальное состояние
  const tomorrow = dayjs().add(1, 'day').startOf('day');
  
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [timeRange, setTimeRange] = useState(null);

  useEffect(() => {
    if (open) {
      // При открытии всегда сбрасываем на завтра
      const defaultDate = dayjs().add(1, 'day').startOf('day');
      setSelectedDate(defaultDate);
      // Ставим стандартный рабочий интервал
      setTimeRange([defaultDate.hour(9).minute(0), defaultDate.hour(18).minute(0)]);
    }
  }, [open]);

  // 2. Блокировка дат в календаре (всё что раньше сегодня — недоступно)
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const handleConfirm = () => {
    if (!timeRange || !selectedDate) {
      return message.error('Выберите дату и время');
    }

    const finalStart = selectedDate
      .hour(timeRange[0].hour())
      .minute(timeRange[0].minute())
      .second(0);
    
    const finalEnd = selectedDate
      .hour(timeRange[1].hour())
      .minute(timeRange[1].minute())
      .second(0);

    // 3. Проверка: время начала не может быть раньше текущего момента
    if (finalStart.isBefore(dayjs())) {
      return message.error('Нельзя забронировать время в прошлом');
    }
    
    if (finalEnd.isBefore(finalStart) || finalEnd.isSame(finalStart)) {
      return message.error('Конец брони должен быть позже начала');
    }
    
    onConfirm({ start: finalStart, end: finalEnd });
  };

  return (
    <Modal
      title={`Забронировать ${place?.name || 'место'}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>Отмена</Button>,
        <Button 
          key="ok" 
          type="primary" 
          onClick={handleConfirm}
          style={{ background: '#fadb14', color: '#000', border: 'none', fontWeight: 'bold' }}
        >
          Подтвердить
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text type="secondary" block style={{ marginBottom: 4 }}>Дата бронирования</Text>
          <DatePicker 
            value={selectedDate} 
            onChange={setSelectedDate} 
            disabledDate={disabledDate} 
            style={{ width: '100%' }} 
            allowClear={false} 
          />
        </div>

        <div>
          <Text type="secondary" block style={{ marginBottom: 4 }}>Интервал времени</Text>
          <TimePicker.RangePicker 
            value={timeRange} 
            onChange={setTimeRange} 
            format="HH:mm" 
            style={{ width: '100%' }} 
            placeholder={['Начало', 'Конец']}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default BookingModal;