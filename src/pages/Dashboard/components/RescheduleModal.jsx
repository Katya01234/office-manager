import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, DatePicker, TimePicker, Typography, message } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const RescheduleModal = ({ open, onCancel, onConfirm, booking, isValidating }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeRange, setTimeRange] = useState(null);

  useEffect(() => {
    if (open && booking) {
      const start = dayjs.utc(booking.start_datetime).local();
      const end = dayjs.utc(booking.end_datetime).local();
      setSelectedDate(start.startOf('day'));
      setTimeRange([start, end]);
    }
  }, [open, booking]);

  const handleConfirm = () => {
    if (!timeRange || !selectedDate) return message.error('Заполните все поля');
    
    const start = selectedDate.clone().hour(timeRange[0].hour()).minute(timeRange[0].minute()).second(0).millisecond(0);
    const end = selectedDate.clone().hour(timeRange[1].hour()).minute(timeRange[1].minute()).second(0).millisecond(0);

    if (start.isBefore(dayjs())) return message.error('Нельзя перенести на время в прошлом');
    if (end.diff(start, 'minute') < 120) return message.error('Минимальное время — 2 часа');

    onConfirm(booking.id, start.utc().format(), end.utc().format());
  };

  return (
    <Modal
      title={<span style={{ color: '#fff' }}>Перенести бронь: <span style={{ color: '#D4AF37' }}>{booking?.workspace_name}</span></span>}
      open={open}
      onCancel={onCancel}
      centered
      styles={{ content: { background: '#141414', border: '1px solid #333' }, header: { background: '#141414', marginBottom: '24px' } }}
      footer={[
        <Button key="back" onClick={onCancel} ghost style={{ color: '#8c8c8c', borderColor: '#333' }}>Отмена</Button>,
        <Button key="submit" type="primary" loading={isValidating} onClick={handleConfirm} style={{ background: '#D4AF37', color: '#000', border: 'none', fontWeight: 'bold' }}>
          Сохранить изменения
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text style={{ color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>Новая дата</Text>
          <DatePicker 
            value={selectedDate} 
            onChange={setSelectedDate}
            style={{ width: '100%' }} 
            disabledDate={c => c && c < dayjs().startOf('day')} 
            allowClear={false}
          />
        </div>
        <div>
          <Text style={{ color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>Новое время</Text>
          <TimePicker.RangePicker 
            value={timeRange} 
            onChange={setTimeRange} 
            format="HH:mm" 
            minuteStep={15} 
            style={{ width: '100%' }} 
            allowClear={false}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default RescheduleModal;