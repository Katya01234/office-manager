import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, DatePicker, TimePicker, Typography, message } from 'antd';
import dayjs from 'dayjs';
// Импортируем виджет VK
import VKAllowMessages from '../../../components/vk/VKAllowMessages';
const { Text } = Typography;

const BookingModal = ({ open, onCancel, onConfirm, place, initialDate, initialTimeRange, vkStatus }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeRange, setTimeRange] = useState(null);

  useEffect(() => {
    if (open) {
      const targetDate = initialDate || dayjs().add(1, 'day').startOf('day');
      setSelectedDate(targetDate);
      
      if (initialTimeRange) {
        setTimeRange([dayjs(initialTimeRange[0]), dayjs(initialTimeRange[1])]);
      } else {
        if (targetDate.isSame(dayjs(), 'day')) {
          setTimeRange([dayjs().add(20, 'minute'), dayjs().add(140, 'minute')]);
        } else {
          setTimeRange([targetDate.clone().hour(9).minute(0), targetDate.clone().hour(11).minute(0)]);
        }
      }
    }
  }, [open, initialDate, initialTimeRange]);

  const handleConfirm = () => {
    if (!timeRange || !selectedDate) return message.error('Заполните все поля');
    const start = selectedDate.clone().hour(timeRange[0].hour()).minute(timeRange[0].minute()).second(0);
    const end = selectedDate.clone().hour(timeRange[1].hour()).minute(timeRange[1].minute()).second(0);

    if (start.isBefore(dayjs())) return message.error('Нельзя бронировать время в прошлом');
    if (end.isBefore(start) || end.isSame(start)) return message.error('Время окончания должно быть позже начала');
    if (end.diff(start, 'minute') < 120) return message.error('Минимальное время бронирования — 2 часа');
    
    onConfirm({ start, end });
  };

  const disabledTime = () => {
    if (!selectedDate || !selectedDate.isSame(dayjs(), 'day')) return {};
    const now = dayjs();
    return {
      disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
      disabledMinutes: (selectedHour) => {
        if (selectedHour === now.hour()) return Array.from({ length: now.minute() }, (_, i) => i);
        return [];
      },
    };
  };

  return (
    <Modal
      title={<span style={{ color: '#fff' }}>Забронировать: <span style={{ color: '#D4AF37' }}>{place?.name}</span></span>}
      open={open}
      onCancel={onCancel}
      centered
      styles={{ 
        content: { background: '#141414', border: '1px solid #333' }, 
        header: { background: '#141414', marginBottom: '24px' } 
      }}
      footer={[
        <Button key="back" onClick={onCancel} ghost style={{ color: '#8c8c8c', borderColor: '#333' }}>Отмена</Button>,
        <Button key="submit" type="primary" onClick={handleConfirm} style={{ background: '#D4AF37', color: '#000', border: 'none', fontWeight: 'bold' }}>Подтвердить</Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        {/* БЛОК УВЕДОМЛЕНИЙ VK */}
        {vkStatus && (!vkStatus.is_linked || !vkStatus.message_allowed) && (
          <div style={{ 
            background: 'rgba(0, 119, 255, 0.05)', 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid rgba(0, 119, 255, 0.2)',
            marginBottom: '8px'
          }}>
            <Text style={{ color: '#40a9ff', fontSize: '12px', display: 'block', marginBottom: vkStatus.is_linked ? '8px' : 0 }}>
              {!vkStatus.is_linked 
                ? "✉️ Привяжите VK в профиле, чтобы получать уведомления о бронировании." 
                : "✉️ Разрешите сообщения, чтобы мы могли прислать подтверждение."}
            </Text>
            
            {/* Показываем виджет только если аккаунт привязан, но сообщения запрещены */}
            {vkStatus.is_linked && !vkStatus.message_allowed && (
              <VKAllowMessages />
            )}
          </div>
        )}

        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <Text style={{ color: '#D4AF37', fontSize: '12px' }}>
            ℹ️ Минимальный период бронирования составляет 120 минут (2 часа).
          </Text>
        </div>

        <div>
          <Text style={{ color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>Дата визита</Text>
          <DatePicker 
            value={selectedDate} 
            onChange={(date) => {
              setSelectedDate(date);
              if (date && date.isSame(dayjs(), 'day')) {
                setTimeRange([dayjs().add(20, 'minute'), dayjs().add(140, 'minute')]);
              }
            }} 
            style={{ width: '100%' }} 
            disabledDate={c => c && c < dayjs().startOf('day')} 
            allowClear={false}
          />
        </div>

        <div>
          <Text style={{ color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>Интервал времени</Text>
          <TimePicker.RangePicker 
            value={timeRange} 
            onChange={setTimeRange} 
            format="HH:mm" 
            minuteStep={15} 
            style={{ width: '100%' }} 
            disabledTime={disabledTime}
            allowClear={false}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default BookingModal;