import React from 'react';
import { Tooltip } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { DESK_MAP, MAP_SETTINGS } from './MapConfig';

dayjs.extend(isBetween);

const OfficePlan = ({ places, onSelectPlace }) => {
  const { colors, viewBox } = MAP_SETTINGS;

  const getStatusColor = (place) => {
  if (place.is_assigned) return colors.wall; 
  
  // 1. Если выбран фильтр по времени и место занято в этот интервал — красный
  if (place.isOccupiedInFilter) return colors.occupied;

  // 2. НОВОЕ: Если на выбранную дату вообще нет свободных слотов (длиннее 2ч) — красный
  // Это заставит место гореть красным, даже если конкретный интервал времени не выбран
  if (!place.freeSlots || place.freeSlots.length === 0) {
    return colors.occupied;
  }

  // 3. Статус на текущий момент (для визуализации "сейчас")
  const isOccupiedNow = place.activeBookings?.some(b => 
    dayjs().isBetween(dayjs.utc(b.start_datetime).local(), dayjs.utc(b.end_datetime).local())
  );

  return isOccupiedNow ? colors.occupied : colors.available;
};

  // Компоненты отрисовки (Chair, Plant) остаются без изменений...
  const OfficeChair = ({ x, y, angle = 0, isAssigned }) => (
    <g transform={`rotate(${angle} ${x} ${y})`} opacity={isAssigned ? "0.3" : "0.8"}>
      <path d={`M ${x-18} ${y-15} h 36 v 25 q 0 5 -5 5 h -26 q -5 0 -5 -5 z`} fill={colors.chair} stroke="#222" />
      <rect x={x-20} y={y-10} width="5" height="15" rx="1" fill="#151515" />
      <rect x={x+15} y={y-10} width="5" height="15" rx="1" fill="#151515" />
    </g>
  );

  return (
    <svg viewBox={viewBox} style={{ width: '100%', height: '100%', userSelect: 'none' }}>
      <rect x="0" y="0" width="1000" height="750" fill={colors.floor_wood} />
      {/* Стены и декор... */}
      <rect x="15" y="15" width="970" height="720" fill="none" stroke={colors.wall} strokeWidth="10" />

      {places.map((place) => {
        const config = DESK_MAP[place.id];
        if (!config) return null;

        const isMeeting = config.type === 'meeting';
        const w = isMeeting ? 140 : 70;
        const h = isMeeting ? 70 : 35;
        const statusColor = getStatusColor(place);

        // Формируем контент для тултипа
        const tooltipContent = (
          <div style={{ padding: '4px', maxWidth: '200px' }}>
            {/* Название и Тип места */}
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>
              {place.name}
            </div>
            <div style={{ color: '#D4AF37', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {place.name?.startsWith('П') ? 'Переговорная' : 'Рабочее место'}
            </div>

            {/* Описание с бэкенда (если оно есть) */}
            {place.description && (
              <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '8px', fontStyle: 'italic' }}>
                {place.info}
              </div>
            )}

            {/* Статус и Слоты */}
            {place.is_assigned ? (
              <div style={{ color: '#ff4d4f', fontWeight: '500' }}>Закрепленное место</div>
            ) : (
              <>
                <div style={{ fontSize: '12px', color: '#fadb14', marginBottom: '4px', borderTop: '1px solid #333', paddingTop: '4px' }}>
                  Свободные слоты:
                </div>
                {place.freeSlots?.length > 0 ? (
                  place.freeSlots.map((slot, i) => (
                    <div key={i} style={{ fontSize: '11px', color: '#fff' }}>• {slot}</div>
                  ))
                ) : (
                  <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Нет свободных окон меньше 2ч</div>
                )}
              </>
            )}
          </div>
        );

        return (
          <Tooltip 
            key={place.id} 
            title={tooltipContent} 
            color="#1f1f1f" 
            overlayInnerStyle={{ border: '1px solid #333' }}
            mouseEnterDelay={0.2}
          >
            <g 
              onClick={() => !place.is_assigned && onSelectPlace(place)} 
              style={{ cursor: place.is_assigned ? 'not-allowed' : 'pointer' }}
            >
              {/* Стулья */}
              {isMeeting ? (
                <>
                  <OfficeChair x={config.x + w/2} y={config.y - 12} angle={0} isAssigned={place.is_assigned} />
                  <OfficeChair x={config.x + w/2} y={config.y + h + 12} angle={180} isAssigned={place.is_assigned} />
                </>
              ) : (
                <OfficeChair x={config.x + w/2} y={config.y + h + 12} angle={180} isAssigned={place.is_assigned} />
              )}

              {/* Стол */}
              <rect 
                x={config.x} y={config.y} width={w} height={h} 
                fill={statusColor} 
                rx={isMeeting ? "8" : "2"} 
                stroke="#111" 
                strokeWidth={place.isOccupiedInFilter ? "2" : "0.5"} // Выделяем занятые при поиске
                style={{ transition: 'fill 0.3s' }}
              />
              
              <text 
                x={config.x + w/2} y={config.y + h/2 + 4} 
                fill={place.is_assigned ? "#8c8c8c" : "#000"} 
                textAnchor="middle" 
                style={{ fontSize: '9px', fontWeight: 'bold', pointerEvents: 'none', opacity: 0.7 }}
              >
                {place.name}
              </text>
            </g>
          </Tooltip>
        );
      })}
    </svg>
  );
};

export default OfficePlan;