import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Space, DatePicker, Typography, message } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const WORK_START = 9;
const WORK_END = 22;
const RADIUS = 110; // Радиус расположения цифр

const BookingDiskPhoneModal = ({ open, onCancel, onConfirm, place, initialDate, loading }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [startHour, setStartHour] = useState(null);
  const [endHour, setEndHour] = useState(null);
  
  const [rotation, setRotation] = useState(0); 
  const [activeHour, setActiveHour] = useState(null);
  const startAngleRef = useRef(0);
  const dialRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSelectedDate(initialDate || dayjs().add(1, 'day').startOf('day'));
      setStartHour(null);
      setEndHour(null);
      setRotation(0);
    }
  }, [open, initialDate]);

  const getAngle = (clientX, clientY) => {
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };

  const handleStart = (e, hour) => {
    if (hour < WORK_START || hour > WORK_END) return;
    
    // Запрещаем "конец" раньше "начала"
    if (startHour !== null && endHour === null && hour <= startHour) {
      return message.warning('Время конца должно быть позже начала');
    }

    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;
    
    setActiveHour(hour);
    startAngleRef.current = getAngle(clientX, clientY);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (activeHour === null) return;

      const clientX = e.clientX || e.touches?.[0].clientX;
      const clientY = e.clientY || e.touches?.[0].clientY;
      
      const currentAngle = getAngle(clientX, clientY);
      let diff = currentAngle - startAngleRef.current;
      
      // Диск телефона крутится только по часовой стрелке
      if (diff < 0) diff += 360; 
      setRotation(diff);

      // Ограничитель (упор) находится примерно на +80 градусах от старта цифры
      // Если докрутили достаточно далеко (имитация набора)
      if (diff > 250) { 
        if (startHour === null) {
          setStartHour(activeHour);
        } else if (endHour === null) {
          setEndHour(activeHour);
        }
        handleEnd();
      }
    };

    const handleEnd = () => {
      setActiveHour(null);
      setRotation(0);
    };

    if (activeHour !== null) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [activeHour, startHour, endHour]);

  return (
    <Modal
      title={<span style={{ color: '#fff' }}>Наберите время: <span style={{ color: '#D4AF37' }}>{place?.name}</span></span>}
      open={open}
      onCancel={onCancel}
      centered
      styles={{ content: { background: '#111', border: '1px solid #333', borderRadius: '30px' } }}
      footer={[
        <Button key="reset" onClick={() => {setStartHour(null); setEndHour(null)}} ghost danger>Сброс</Button>,
        <Button 
          key="ok" 
          type="primary" 
          onClick={() => onConfirm({
            start: selectedDate.hour(startHour).minute(0),
            end: selectedDate.hour(endHour).minute(0)
          })} 
          disabled={startHour === null || endHour === null}
          style={{ background: '#D4AF37', color: '#000', border: 'none', fontWeight: 'bold' }}
        >
          Забронировать
        </Button>
      ]}
    >
      <Space direction="vertical" align="center" style={{ width: '100%' }} size="large">
        <DatePicker value={selectedDate} onChange={setSelectedDate} style={{ width: '100%' }} allowClear={false} />

        {/* Табло */}
        <div style={{ 
          textAlign: 'center', background: '#000', padding: '15px', borderRadius: '15px', 
          border: '1px solid #222', width: '200px', boxShadow: 'inset 0 0 10px #000'
        }}>
          <div style={{ color: '#555', fontSize: '10px' }}>ВЫБРАННЫЙ ИНТЕРВАЛ</div>
          <Text style={{ color: '#D4AF37', fontSize: '24px', fontWeight: 'bold' }}>
            {startHour !== null ? `${startHour}:00` : '--:--'}
          </Text>
          <div style={{ color: '#fff', fontSize: '20px' }}>
            {endHour !== null ? `${endHour}:00` : '--:--'}
          </div>
        </div>

        {/* Диск */}
        <div style={{ position: 'relative', width: '280px', height: '280px' }}>
          {/* Статичная подложка с упором */}
          <div style={{
            position: 'absolute', top: '15px', right: '35px', width: '8px', height: '40px',
            background: '#D4AF37', borderRadius: '4px', zIndex: 10, boxShadow: '0 0 10px rgba(212,175,55,0.5)'
          }} />

          {/* Вращающаяся часть */}
          <div 
            ref={dialRef}
            style={{
              width: '100%', height: '100%', borderRadius: '50%', background: '#1a1a1a',
              border: '8px solid #222', position: 'relative',
              transform: `rotate(${rotation}deg)`,
              transition: activeHour === null ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
              touchAction: 'none'
            }}
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * 360 - 90;
              const x = Math.cos(angle * Math.PI / 180) * RADIUS;
              const y = Math.sin(angle * Math.PI / 180) * RADIUS;
              const isLocked = i < WORK_START || i > WORK_END;

              return (
                <div
                  key={i}
                  onMouseDown={(e) => handleStart(e, i)}
                  onTouchStart={(e) => handleStart(e, i)}
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${x}px - 18px)`,
                    top: `calc(50% + ${y}px - 18px)`,
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: isLocked ? '#0a0a0a' : '#333',
                    border: '2px solid #444',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    color: isLocked ? '#222' : '#fff', fontSize: '12px',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    userSelect: 'none', zIndex: 5,
                    transform: `rotate(${-rotation}deg)` // Чтобы цифры не переворачивались
                  }}
                >
                  {i}
                </div>
              );
            })}
            
            {/* Декоративные дырки как в телефоне */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '160px', height: '160px', borderRadius: '50%', background: '#111', border: '4px solid #222'
            }} />
          </div>
        </div>

        <Text style={{ color: '#444', fontSize: '11px', textAlign: 'center' }}>
          Тяните цифру по часовой стрелке до золотого ограничителя
        </Text>
      </Space>
    </Modal>
  );
};

export default BookingDiskPhoneModal;