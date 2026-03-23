// Имитация данных пользователя (придет после /api/user/profile)
export const mockUserStats = {
  hasFixedPlace: false,
  mainPlace: null, 
  favoritePlace: "Б-202",
  activeBooking: { 
    place: "С-301", 
    time: "23.03.2026, 14:00 - 18:00",
    canCancel: true 
  },
  history: [
    { key: 'h1', place: 'А-105', date: '20.03.2026', status: 'Завершено' },
    { key: 'h2', place: 'Б-102', date: '18.03.2026', status: 'Отменено' },
  ]
};

// Имитация списка мест (придет после /api/places)
export const mockPlaces = [
  { 
    key: '1', 
    name: 'Место А-101', 
    status: 'Занято', 
    isPermanent: true,
    ownerName: 'Иван Иванов',
    features: { 
      monitors: 2,
      window: true,
      ac: false,
      quietZone: true,
      peripherals: 'Logitech Set' },  
  },
  { 
    key: '2', 
    name: 'Место А-102', 
    status: 'Занято', 
    features: {
      monitors: 1,
      window: false,
      ac: false,
      quietZone: true,
      peripherals: 'Logitech Set'
    }, 
  },
  { 
    key: '3', 
    name: 'Место Б-202', 
    status: 'Свободно', 
    isFavorite: true,
    features: {
      monitors: 2,
      window: true,
      ac: true,
      quietZone: false,
      peripherals: 'Logitech Set'
    }, 
  },
];