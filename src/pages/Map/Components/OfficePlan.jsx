import React from 'react';
import { DESK_MAP, MAP_SETTINGS } from './MapConfig';

const OfficePlan = ({ places, onSelectPlace }) => {
  const { colors, viewBox } = MAP_SETTINGS;

  const getStatusColor = (place) => {
    if (place.activeBookings?.length > 0) return colors.occupied;
    return colors.available;
  };

  const OfficeChair = ({ x, y, angle = 0 }) => (
    <g transform={`rotate(${angle} ${x} ${y})`} opacity="0.8">
      <path d={`M ${x-18} ${y-15} h 36 v 25 q 0 5 -5 5 h -26 q -5 0 -5 -5 z`} fill={colors.chair} stroke="#222" />
      <path d={`M ${x-16} ${y-18} q 16 -4 32 0 v 5 q -16 -3 -32 0 z`} fill="#1a1a1a" stroke="#222" />
      <rect x={x-22} y={y-10} width="6" height="18" rx="2" fill="#151515" />
      <rect x={x+16} y={y-10} width="6" height="18" rx="2" fill="#151515" />
    </g>
  );

  // --- Новое реалистичное растение (Монстера) ---
  const MonsteraPlant = ({ x, y, scale = 1 }) => {
    // Путь для одного листа монстеры с прорезями
    const leafPath = "M0,0 C5,-10 15,-20 25,-15 C30,-10 25,0 15,5 C10,8 5,5 0,0 Z M12,-8 L18,-12 M15,-4 L22,-7";
    
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <circle r="10" fill="#1c1c1c" stroke="#2a2218" />
        <g fill="#2d4a1e" stroke="#1b2e12" strokeWidth="0.5">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <path key={deg} d={leafPath} transform={`rotate(${deg}) translate(2, 0)`} />
          ))}
        </g>
      </g>
    );
  };

  return (
    <svg viewBox={viewBox} style={{ width: '100%', height: '100%' }}>
      <defs>
        <pattern id="woodPattern" x="0" y="0" width="100" height="25" patternUnits="userSpaceOnUse">
          <rect width="100" height="25" fill={colors.floor_wood} />
          <line x1="0" y1="24" x2="100" y2="24" stroke="#3a2e22" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="1000" height="700" fill="url(#woodPattern)" rx="4" />
      
      {/* Стены и Зоны */}
      <rect x="15" y="15" width="970" height="670" fill="none" stroke={colors.wall} strokeWidth="8" />
      <path d="M 650 15 V 350 M 650 450 V 685" stroke={colors.divider} strokeWidth="1.5" />
      <path d="M 15 400 H 250 V 685" stroke={colors.divider} strokeWidth="1.5" fill="none" />
      
      <text x="350" y="60" fill="#666" style={{ fontSize: '12px', letterSpacing: '4px' }}>ПЕРЕГОВОРНАЯ</text>
      <text x="750" y="60" fill="#666" style={{ fontSize: '12px', letterSpacing: '4px' }}>ДИРЕКЦИЯ</text>
      <text x="50" y="440" fill="#666" style={{ fontSize: '10px' }}>АДМИНИСТРАЦИЯ</text>

      {/* Растения вместо "вентиляторов" */}
      <MonsteraPlant x="50" y="50" scale={1.5} />
      <MonsteraPlant x="950" y="50" scale={1.5} />
      <MonsteraPlant x="620" y="400" scale={1.1} />
      <MonsteraPlant x="280" y="650" scale={1.3} />

      {places.map((place) => {
        const config = DESK_MAP[place.id];
        if (!config) return null;
        const { x, y } = config;
        const isCEO = config.label === 'CEO';
        const isM = config.groupId === 'MEETING';
        const w = isCEO ? 150 : (isM ? 45 : 100);
        const h = isCEO ? 75 : (isM ? 75 : 45);

        return (
          <g key={place.id} onClick={() => onSelectPlace(place)} style={{ cursor: 'pointer' }}>
            {!isCEO && !isM && <OfficeChair x={x + w/2} y={y + h + 25} />}
            {isCEO && (
              <>
                <OfficeChair x={x + w/2} y={y - 25} />
                <OfficeChair x={x + 35} y={y + h + 25} angle={180} />
                <OfficeChair x={x + 115} y={y + h + 25} angle={180} />
              </>
            )}
            <rect x={x} y={y} width={w} height={h} rx="1" fill={getStatusColor(place)} stroke="#111" strokeWidth="0.5" />
            <rect x={x + w/2 - 15} y={y + h - 12} width="30" height="8" fill="#000" opacity="0.3" rx="1" />
          </g>
        );
      })}
    </svg>
  );
};

export default OfficePlan;