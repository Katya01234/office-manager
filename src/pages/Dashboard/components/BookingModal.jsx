import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, DatePicker, TimePicker, Typography, message } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const BookingModal = ({ open, onCancel, onConfirm, place, initialDate, initialTimeRange }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeRange, setTimeRange] = useState(null);

  useEffect(() => {
    if (open) {
      const targetDate = initialDate || dayjs().add(1, 'day').startOf('day');
      setSelectedDate(targetDate);
      
      if (initialTimeRange) {
        setTimeRange([initialTimeRange[0], initialTimeRange[1]]);
      } else {
        setTimeRange([targetDate.clone().hour(9), targetDate.clone().hour(11)]); // Дефолт 2 часа
      }
    }
  }, [open, initialDate, initialTimeRange]);

  const handleConfirm = () => {
    if (!timeRange || !selectedDate) return message.error('Заполните все поля');

    const start = selectedDate.clone().hour(timeRange[0].hour()).minute(timeRange[0].minute()).second(0);
    const end = selectedDate.clone().hour(timeRange[1].hour()).minute(timeRange[1].minute()).second(0);

    if (start.isBefore(dayjs())) return message.error('Нельзя бронировать в прошлом');
    if (end.isBefore(start) || end.isSame(start)) return message.error('Неверный интервал');
    
    // ПРОВЕРКА НА 2 ЧАСА
    if (end.diff(start, 'minute') < 120) {
      return message.error('Минимальное время бронирования — 2 часа');
    }
    
    onConfirm({ start, end });
  };

  return (
    <Modal
      title={<span style={{ color: '#fff' }}>Забронировать: <span style={{ color: '#fadb14' }}>{place?.name}</span></span>}
      open={open}
      onCancel={onCancel}
      centered
      styles={{ content: { background: '#141414', border: '1px solid #333' }, header: { background: '#141414' }}}
      footer={[
        <Button key="back" onClick={onCancel} ghost>Отмена</Button>,
        <Button key="submit" type="primary" onClick={handleConfirm} style={{ background: '#fadb14', color: '#000', border: 'none' }}>
          Подтвердить
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }} size="large">
        <Text style={{ color: '#fadb14' }}>* Минимальное время бронирования — 2 часа</Text>
        <div>
          <Text style={{ color: '#8c8c8c' }}>Дата</Text>
          <DatePicker value={selectedDate} onChange={setSelectedDate} style={{ width: '100%' }} disabledDate={c => c < dayjs().startOf('day')} />
        </div>
        <div>
          <Text style={{ color: '#8c8c8c' }}>Время</Text>
          <TimePicker.RangePicker value={timeRange} onChange={setTimeRange} format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
        </div>
      </Space>
    </Modal>
  );
};

export default BookingModal;