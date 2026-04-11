import dayjs from 'dayjs';

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
    is_assigned: true, 
    description: 'Тихая зона у окна',
    equipment: ["монитор", "Wi-Fi"] 
  },
  { id: 2, name: 'Б-202', is_assigned: false, description: 'Open Space' }
];