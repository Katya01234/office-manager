import React from 'react';
import { Tooltip } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { DESK_MAP, MAP_SETTINGS } from './MapConfig';
import { HeartFilled, PushpinFilled } from '@ant-design/icons';

dayjs.extend(isBetween);

const OfficePlan = ({ places, onSelectPlace, userStats }) => {
  const { colors, viewBox } = MAP_SETTINGS;

  const getStatusColor = (place) => {
    // Безопасная проверка основного места
    const isMain = userStats?.mainPlace && String(userStats.mainPlace.id) === String(place.id);
    if (isMain) return '#1677ff'; 
    
    if (place.is_assigned) return colors.wall; 
    
    if (place.isOccupiedInFilter) return colors.occupied;

    if (!place.freeSlots || place.freeSlots.length === 0) {
      return colors.occupied;
    }

    const isOccupiedNow = place.activeBookings?.some(b => 
      dayjs().isBetween(dayjs.utc(b.start_datetime).local(), dayjs.utc(b.end_datetime).local())
    );

    return isOccupiedNow ? colors.occupied : colors.available;
  };

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
      <rect x="15" y="15" width="970" height="720" fill="none" stroke={colors.wall} strokeWidth="10" />

      {places.map((place) => {
        const config = DESK_MAP[place.id];
        if (!config) return null;

        // Синхронизированная логика избранного и основного места
        const isFavorite = userStats?.favoritePlace && String(userStats.favoritePlace.id) === String(place.id);
        const isMain = userStats?.mainPlace && String(userStats.mainPlace.id) === String(place.id);
        
        const isMeeting = config.type === 'meeting';
        const w = isMeeting ? 140 : 70;
        const h = isMeeting ? 70 : 35;
        const statusColor = getStatusColor(place);

        const tooltipContent = (
          <div style={{ padding: '4px', maxWidth: '200px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>
              {isFavorite && <HeartFilled style={{ color: '#ff4d4f', marginRight: 4 }} />}
              {isMain && <PushpinFilled style={{ color: '#1677ff', marginRight: 4 }} />}
              {place.name}
            </div>
            <div style={{ color: '#D4AF37', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {place.name?.startsWith('П') ? 'Переговорная' : 'Рабочее место'}
            </div>

            {isMain ? (
                <div style={{ color: '#1677ff', fontWeight: 'bold' }}>Ваше постоянное место</div>
            ) : place.is_assigned ? (
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
                  <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Нет доступных окон</div>
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
              style={{ cursor: (place.is_assigned && !isMain) ? 'not-allowed' : 'pointer' }}
            >
              {isMeeting ? (
                <>
                  <OfficeChair x={config.x + w/2} y={config.y - 12} angle={0} isAssigned={place.is_assigned} />
                  <OfficeChair x={config.x + w/2} y={config.y + h + 12} angle={180} isAssigned={place.is_assigned} />
                </>
              ) : (
                <OfficeChair x={config.x + w/2} y={config.y + h + 12} angle={180} isAssigned={place.is_assigned} />
              )}

              <rect 
                x={config.x} y={config.y} width={w} height={h} 
                fill={statusColor} 
                rx={isMeeting ? "8" : "2"} 
                stroke={isFavorite ? "#ff4d4f" : "#111"} 
                strokeWidth={isFavorite ? "2" : "0.5"}
                style={{ transition: 'fill 0.3s' }}
              />
              
              <text 
                x={config.x + w/2} y={config.y + h/2 + 4} 
                fill={statusColor === colors.available || isMain ? "#000" : "#8c8c8c"} 
                textAnchor="middle" 
                style={{ fontSize: '9px', fontWeight: 'bold', pointerEvents: 'none' }}
              >
                {place.name}
              </text>

              {isFavorite && (
                <path 
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#ff4d4f"
                  transform={`translate(${config.x + w - 12}, ${config.y + 2}) scale(0.4)`}
                />
              )}
            </g>
          </Tooltip>
        );
      })}
    </svg>
  );
};

export default OfficePlan;