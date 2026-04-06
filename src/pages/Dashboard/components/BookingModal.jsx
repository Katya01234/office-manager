import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, DatePicker, TimePicker, Divider, Typography, message } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const BookingModal = ({ open, onCancel, onConfirm, place }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeRange, setTimeRange] = useState(null);
  useEffect(() => {
    if (open) {
      setSelectedDate(dayjs());
      setTimeRange([dayjs().add(30, 'minute'), dayjs().add(2, 'hour')]);
    }
  }, [open]);

const isTimeSlotOccupied = (start, end) => {
  if (!place?.activeBookings) return false;

  return place.activeBookings.some(booking => {
    const bStart = dayjs(booking.start_datetime);
    const bEnd = dayjs(booking.end_datetime);
    return start.isBefore(bEnd) && end.isAfter(bStart);
  });
};

const handleConfirm = () => {
  if (!timeRange || !selectedDate) {
    return message.error('Выберите дату и время');
  }

  const finalStart = selectedDate.hour(timeRange[0].hour()).minute(timeRange[0].minute()).second(0);
  const finalEnd = selectedDate.hour(timeRange[1].hour()).minute(timeRange[1].minute()).second(0);

  if (finalEnd.isBefore(finalStart) || finalEnd.isSame(finalStart)) {
    return message.error('Конец брони должен быть позже начала');
  }
  if (isTimeSlotOccupied(finalStart, finalEnd)) {
    return message.error('Это время уже занято! Посмотри свободные окна в подсказке.');
  }
  onConfirm({ start: finalStart, end: finalEnd });
};

const handleQuickSelect = (type) => {
  const base = selectedDate ? selectedDate.startOf('day') : dayjs().startOf('day');
  if (type === 'morning') setTimeRange([base.hour(9), base.hour(13)]);
  if (type === 'afternoon') setTimeRange([base.hour(14), base.hour(18)]);
  if (type === 'allDay') setTimeRange([base.hour(9), base.hour(20)]);
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
        <Space wrap>
          <Button size="small" onClick={() => handleQuickSelect('morning')}>Утро</Button>
          <Button size="small" onClick={() => handleQuickSelect('afternoon')}>День</Button>
          <Button size="small" onClick={() => handleQuickSelect('allDay')}>Весь день</Button>
        </Space>
        
        <div>
          <Text type="secondary" block>Дата</Text>
          <DatePicker 
            value={selectedDate} 
            onChange={setSelectedDate} 
            style={{ width: '100%' }} 
            allowClear={false} 
          />
        </div>

        <div>
          <Text type="secondary" block>Интервал</Text>
          <TimePicker.RangePicker 
            value={timeRange} 
            onChange={setTimeRange} 
            format="HH:mm" 
            style={{ width: '100%' }} 
          />
        </div>

        {place?.description && <Text type="secondary">{place.description}</Text>}
      </Space>
    </Modal>
  );
};

export default BookingModal;