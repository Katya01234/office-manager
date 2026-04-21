export const MAP_SETTINGS = {
  viewBox: "0 0 1000 750",
  colors: {
    floor_wood: "#2a2218",
    floor_grey: "#333",
    wall: "#1a1a1a",
    divider: "#444",
    available: "#D4AF37", // Золото
    occupied: "#752022",  // Винный
    chair: "#111111",
    text: "#8c8c8c"
  }
};

const generateDesks = () => {
  const desks = {};
  
  // 1-30: Основной Open Space (внизу) - оставляем без изменений
  for (let i = 1; i <= 30; i++) {
    const row = Math.floor((i - 1) / 10);
    const col = (i - 1) % 10;
    desks[i] = { 
      x: 85 + col * 88, 
      y: 450 + row * 95, 
      label: `OS-${i}`,
      type: 'standard'
    };
  }

  // 31-40: Админы (слева вверху)
  for (let i = 31; i <= 40; i++) {
    const row = Math.floor((i - 31) / 2);
    const col = (i - 31) % 2;
    desks[i] = { 
      x: 70 + col * 120, 
      y: 80 + row * 60, // Немного уплотним, чтобы ADM-39/40 не наезжали на линию
      label: `ADM-${i}`,
      type: 'standard'
    };
  }

  // 41-50: Переговорки (справа вверху) - ИСПРАВЛЕНО
  for (let i = 41; i <= 50; i++) {
    // Используем сетку 4 колонки, чтобы 10 столов влезло в 3 ряда (4+4+2)
    // Либо сетку 3 колонки, но с меньшим вертикальным шагом.
    
    const row = Math.floor((i - 41) / 4); // Делим на 4 колонки
    const col = (i - 41) % 4;
    
    desks[i] = { 
      x: 410 + col * 140, // Чуть меньше шаг по X
      y: 70 + row * 105,  // Уменьшили шаг по Y (было 110-120), чтобы не наезжать на OS
      label: `MEET-${i}`,
      type: 'meeting'
    };
  }

  return desks;
};

export const DESK_MAP = generateDesks();