import dayjs from 'dayjs';

export const calculateFreeSlots = (bookings = [], targetDate = dayjs()) => {
  const MIN_DURATION_MINUTES = 120; // 2 часа
  const now = dayjs();
  
  // 1. Устанавливаем начало поиска. 
  // Если смотрим на "сегодня", ищем с текущего часа. Если на будущее — с 09:00.
  let startDay = targetDate.clone().hour(9).minute(0).second(0);
  if (targetDate.isSame(now, 'day') && now.isAfter(startDay)) {
    startDay = now.clone().add(5, 'minute'); // небольшой запас, чтобы не предлагать секунду в секунду
  }

  const endDay = targetDate.clone().hour(22).minute(0).second(0);

  // 2. Сортируем и фильтруем брони только за выбранный день
  const dayBookings = (bookings || [])
    .filter(b => dayjs(b.start_datetime).isSame(targetDate, 'day'))
    .sort((a, b) => dayjs(a.start_datetime).diff(dayjs(b.start_datetime)));

  let freeSlots = [];
  let currentPos = startDay;

  dayBookings.forEach(booking => {
    const bookStart = dayjs(booking.start_datetime);
    const bookEnd = dayjs(booking.end_datetime);

    // Если между текущей позицией и началом следующей брони есть окно
    if (bookStart.isAfter(currentPos)) {
      const diffMinutes = bookStart.diff(currentPos, 'minute');
      
      // Проверяем, влезет ли туда минимальная бронь (2 часа)
      if (diffMinutes >= MIN_DURATION_MINUTES) {
        freeSlots.push(`${currentPos.format('HH:mm')} - ${bookStart.format('HH:mm')}`);
      }
    }

    // Двигаем указатель, если текущая бронь заканчивается позже, чем мы сейчас находимся
    if (bookEnd.isAfter(currentPos)) {
      currentPos = bookEnd;
    }
  });

  // 3. Проверяем "хвост" после последней брони до конца рабочего дня
  if (endDay.diff(currentPos, 'minute') >= MIN_DURATION_MINUTES) {
    freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
  }

  return freeSlots.length > 0 ? freeSlots : ["Нет свободных слотов на 2ч+"];
};