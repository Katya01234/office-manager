import React, { useState } from 'react';
import { Modal, Button, Space, DatePicker, TimePicker, Divider, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const BookingModal = ({ open, onCancel, onConfirm, place }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeRange, setTimeRange] = useState([dayjs(), dayjs().add(2, 'hour')]);

  const handleQuickSelect = (type) => {
    const today = dayjs();
    switch (type) {
      case 'allDay':
        setTimeRange([today.set('hour', 9).set('minute', 0), today.set('hour', 18).set('minute', 0)]);
        break;
      case 'morning':
        setTimeRange([today.set('hour', 9).set('minute', 0), today.set('hour', 13).set('minute', 0)]);
        break;
      case 'afternoon':
        setTimeRange([today.set('hour', 14).set('minute', 0), today.set('hour', 18).set('minute', 0)]);
        break;
      case 'twoHours':
        setTimeRange([dayjs(), dayjs().add(2, 'hour')]);
        break;
      default:
        break;
    }
  };

  return (
    <Modal
      title={`Бронирование места ${place?.name}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>Отмена</Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={() => onConfirm({ place, date: selectedDate, time: timeRange })}
          style={{ background: '#fadb14', color: '#000', border: 'none', fontWeight: 'bold' }}
        >
          Забронировать
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">Быстрый выбор на сегодня:</Text>
        <Space wrap style={{ marginTop: 8 }}>
          <Button size="small" onClick={() => handleQuickSelect('allDay')}>Весь день</Button>
          <Button size="small" onClick={() => handleQuickSelect('morning')}>До обеда</Button>
          <Button size="small" onClick={() => handleQuickSelect('afternoon')}>После обеда</Button>
          <Button size="small" onClick={() => handleQuickSelect('twoHours')}>+ 2 часа</Button>
        </Space>
      </div>

      <Divider />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text type="secondary" block style={{ marginBottom: 4 }}>Дата:</Text>
          <DatePicker 
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            style={{ width: '100%' }} 
            disabledDate={(current) => 
              current && (current < dayjs().startOf('day') || current > dayjs().add(7, 'day'))
            }
          />
        </div>
        <div>
          <Text type="secondary" block style={{ marginBottom: 4 }}>Время:</Text>
          <TimePicker.RangePicker 
            value={timeRange}
            onChange={(range) => setTimeRange(range)}
            format="HH:mm" 
            style={{ width: '100%' }} 
          />
        </div>
      </Space>
    </Modal>
  );
};

export default BookingModal;