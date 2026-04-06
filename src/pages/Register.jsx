import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, DatePicker, TimePicker, Divider, Typography, message } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; 

dayjs.locale('ru');

const { Text } = Typography;

const BookingModal = ({ open, onCancel, onConfirm, place }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeRange, setTimeRange] = useState(null);

  useEffect(() => {
    if (open) {
      setSelectedDate(dayjs());
      setTimeRange([dayjs().add(30, 'minute'), dayjs().add(150, 'minute')]);
    }
  }, [open]);

  const handleQuickSelect = (type) => {
    const base = selectedDate.startOf('day'); 
    
    let start, end;

    switch (type) {
      case 'morning':
        start = base.hour(9).minute(0);
        end = base.hour(13).minute(0);
        break;
      case 'afternoon':
        start = base.hour(14).minute(0);
        end = base.hour(18).minute(0);
        break;
      case 'allDay':
        start = base.hour(9).minute(0);
        end = base.hour(20).minute(0);
        break;
      case 'twoHours':
        const isToday = selectedDate.isSame(dayjs(), 'day');
        start = isToday ? dayjs() : base.hour(9).minute(0);
        end = start.add(2, 'hour');
        break;
      default:
        return;
    }
    setTimeRange([start, end]);
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

    if (finalEnd.isBefore(finalStart) || finalEnd.isSame(finalStart)) {
      return message.error('Время окончания должно быть позже начала');
    }

    onConfirm({ start: finalStart, end: finalEnd });
  };

  return (
    <Modal
      title={`Забронировать место ${place?.name}`}
      open={open}
      onCancel={onCancel}
      centered
      footer={[
        <Button key="back" onClick={onCancel}>Отмена</Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleConfirm}
          style={{ background: '#fadb14', color: '#000', border: 'none', fontWeight: 'bold' }}
        >
          Подтвердить бронь
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        {/* БЫСТРЫЙ ВЫБОР */}
        <div>
          <Text type="secondary" block style={{ marginBottom: 8 }}>Быстрые интервалы:</Text>
          <Space wrap>
            <Button size="small" onClick={() => handleQuickSelect('morning')}>Утро (9-13)</Button>
            <Button size="small" onClick={() => handleQuickSelect('afternoon')}>День (14-18)</Button>
            <Button size="small" onClick={() => handleQuickSelect('allDay')}>Весь день</Button>
            <Button size="small" onClick={() => handleQuickSelect('twoHours')}>+2 часа</Button>
          </Space>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* ДАТА */}
        <div>
          <Text strong block style={{ marginBottom: 8 }}>1. Выберите дату:</Text>
          <DatePicker 
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            format="DD.MM.YYYY" // Тот самый формат 24.03.2026
            style={{ width: '100%' }} 
            allowClear={false}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </div>

        {/* ВРЕМЯ */}
        <div>
          <Text strong block style={{ marginBottom: 8 }}>2. Уточните время:</Text>
          <TimePicker.RangePicker 
            value={timeRange}
            onChange={(range) => setTimeRange(range)}
            format="HH:mm"
            minuteStep={15}
            placeholder={['Начало', 'Конец']}
            style={{ width: '100%' }} 
          />
        </div>

        {place?.equipment && (
          <div style={{ background: '#1f1f1f', padding: '12px', borderRadius: '8px' }}>
            <Text type="secondary">Оборудование: </Text>
            <Text style={{ color: '#fff' }}>{place.equipment.join(', ')}</Text>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default BookingModal;