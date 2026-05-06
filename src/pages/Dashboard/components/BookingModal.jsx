import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, DatePicker, TimePicker, Typography, message, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import VKAllowMessages from '../../../components/vk/VKAllowMessages';
import { workspaceApi } from '../../../api/api';

dayjs.extend(utc);
const { Text } = Typography;

const BookingModal = ({ open, onCancel, onConfirm, place, initialDate, initialTimeRange, vkStatus }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeRange, setTimeRange] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (open) {
      const targetDate = initialDate || dayjs().add(1, 'day').startOf('day');
      setSelectedDate(targetDate);
      
      if (initialTimeRange) {
        setTimeRange([dayjs(initialTimeRange[0]), dayjs(initialTimeRange[1])]);
      } else {
        const start = targetDate.isSame(dayjs(), 'day') 
          ? dayjs().add(20, 'minute').second(0).millisecond(0) 
          : targetDate.clone().hour(9).minute(0).second(0).millisecond(0);
        setTimeRange([start, start.clone().add(2, 'hour')]);
      }
    }
  }, [open, initialDate, initialTimeRange]);

  const handleConfirm = async () => {
    if (!timeRange || !selectedDate) return message.error('Заполните все поля');
    
    const start = selectedDate.clone().hour(timeRange[0].hour()).minute(timeRange[0].minute()).second(0).millisecond(0);
    const end = selectedDate.clone().hour(timeRange[1].hour()).minute(timeRange[1].minute()).second(0).millisecond(0);

    if (start.isBefore(dayjs())) return message.error('Нельзя бронировать время в прошлом');
    if (end.diff(start, 'minute') < 120) return message.error('Минимальное время бронирования — 2 часа');

    setIsValidating(true);
    try {
      const check = await workspaceApi.checkAvailability(
        place.id, 
        start.utc().format(), 
        end.utc().format()
      );

      if (check.available) {
        onConfirm({ start, end });
      } else {
        message.error('Это время уже занято');
      }
    } catch (err) {
      message.error('Ошибка проверки доступности');
    } finally {
      setIsValidating(false);
    }
  };

  const disabledTime = () => {
    if (!selectedDate || !selectedDate.isSame(dayjs(), 'day')) return {};
    const now = dayjs();
    return {
      disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
      disabledMinutes: (h) => h === now.hour() ? Array.from({ length: now.minute() }, (_, i) => i) : [],
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
        <Button 
          key="submit" 
          type="primary" 
          loading={isValidating}
          onClick={handleConfirm} 
          style={{ background: '#D4AF37', color: '#000', border: 'none', fontWeight: 'bold' }}
        >
          Подтвердить
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {vkStatus && (
        // 1. Если не привязан аккаунт
        (!vkStatus.is_linked) ? (
          <div style={{ background: 'rgba(0, 119, 255, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0, 119, 255, 0.2)' }}>
            <Text style={{ color: '#40a9ff', fontSize: '12px', display: 'block' }}>
              ✉️ Привяжите VK в профиле для уведомлений.
            </Text>
          </div>
        ) :   
        // 2. Если привязан, но сообщения НЕ разрешены
        // (!vkStatus.message_allowed) ? (
        //   <div style={{ background: 'rgba(0, 119, 255, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0, 119, 255, 0.2)' }}>
        //     <Text style={{ color: '#40a9ff', fontSize: '12px', display: 'block' }}>
        //       ✉️ Разрешите сообщения для подтверждения бронирования.
        //     </Text>
        //     <VKAllowMessages key={open ? 'active' : 'hidden'} />
        //   </div>
        // ) : 
        // 3. Если всё привязано и разрешено — возвращаем null (ничего не рендерим)
        null
      )}

        <div>
          <Text style={{ color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>Дата визита</Text>
          <DatePicker 
            value={selectedDate} 
            onChange={(val) => setSelectedDate(val)}
            style={{ width: '100%' }} 
            disabledDate={c => c && c < dayjs().startOf('day')} 
            allowClear={false}
          />
        </div>

        <div>
          <Text style={{ color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>
            Интервал времени
          </Text>
          <TimePicker.RangePicker 
            value={timeRange} 
            onChange={(val) => setTimeRange(val)} 
            format="HH:mm" 
            minuteStep={15} 
            style={{ width: '100%' }} 
            disabledTime={disabledTime}
            allowClear={false}
          />
          {/* Компактное напоминание вместо тяжелого блока */}
          <Text style={{ color: '#595959', fontSize: '11px', marginTop: '6px', display: 'block' }}>
            * минимальный период бронирования — 2 часа
          </Text>
        </div>
      </Space>
    </Modal>
  );
};

export default BookingModal;