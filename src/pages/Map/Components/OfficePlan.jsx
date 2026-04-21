import React from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { DESK_MAP, MAP_SETTINGS } from './MapConfig';

dayjs.extend(isBetween);

const OfficePlan = ({ places, onSelectPlace }) => {
  const { colors, viewBox } = MAP_SETTINGS;

  const getStatusColor = (place) => {
    if (place.is_assigned) return colors.wall; // Темный цвет для закрепленных
    
    // Проверяем, есть ли бронь, которая идет прямо сейчас
    const isOccupiedNow = place.activeBookings?.some(b => 
      dayjs().isBetween(dayjs(b.start_datetime), dayjs(b.end_datetime))
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

  const MonsteraPlant = ({ x, y, scale = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle r="12" fill="#1c1c1c" />
      <g fill="#2d4a1e" opacity="0.9">
        {[0, 60, 120, 180, 240, 300].map(deg => (
          <path key={deg} d="M0,0 C5,-10 15,-20 25,-15 C30,-10 25,0 15,5 Z" transform={`rotate(${deg})`} />
        ))}
      </g>
    </g>
  );

  return (
    <svg viewBox={viewBox} style={{ width: '100%', height: '100%', userSelect: 'none' }}>
      <rect x="0" y="0" width="1000" height="750" fill={colors.floor_wood} />
      
      {/* Стены */}
      <rect x="15" y="15" width="970" height="720" fill="none" stroke={colors.wall} strokeWidth="10" />
      
      {/* Разделители зон */}
      <line x1="380" y1="15" x2="380" y2="400" stroke={colors.divider} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="15" y1="400" x2="985" y2="400" stroke={colors.divider} strokeWidth="2" strokeDasharray="5,5" />

      {/* Растительность */}
      <MonsteraPlant x="50" y="50" scale={1.2} />
      <MonsteraPlant x="350" y="370" scale={0.7} />
      <MonsteraPlant x="950" y="430" scale={1.1} />

      {places.map((place) => {
        const config = DESK_MAP[place.id];
        if (!config) return null;

        const isMeeting = config.type === 'meeting';
        const w = isMeeting ? 140 : 70;
        const h = isMeeting ? 70 : 35;
        const statusColor = getStatusColor(place);

        return (
          <g 
            key={place.id} 
            onClick={() => onSelectPlace(place)} 
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
              strokeWidth="0.5"
              style={{ transition: 'fill 0.3s' }}
            />
            
            {/* Метка стола */}
            <text 
              x={config.x + w/2} y={config.y + h/2 + 4} 
              fill={place.is_assigned ? "#8c8c8c" : "#000"} 
              textAnchor="middle" 
              style={{ 
                fontSize: '9px', 
                fontWeight: 'bold', 
                opacity: place.is_assigned ? 0.4 : 0.6, 
                pointerEvents: 'none' 
              }}
            >
              {config.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default OfficePlan;