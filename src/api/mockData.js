// src/api/mockData.js
import dayjs from 'dayjs';

// Теперь поля называются как в Swagger: start_datetime, workspace_name и т.д. 
export const mockUserStats = {
  favoritePlace: "А-101",
  history: [
    { 
      id: 1, 
      workspace_name: 'А-101', 
      start_datetime: dayjs().subtract(1, 'day').toISOString(), 
      end_datetime: dayjs().subtract(1, 'day').add(2, 'hour').toISOString() 
    }
  ]
};

export const mockPlaces = [
  { 
    id: 1, 
    name: 'А-101', 
    is_assigned: true, // Поле из Swagger 
    description: 'Тихая зона у окна',
    equipment: ["монитор", "Wi-Fi"] // Из Swagger 
  },
  { id: 2, name: 'Б-202', is_assigned: false, description: 'Open Space' }
];