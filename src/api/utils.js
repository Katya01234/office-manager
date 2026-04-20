import dayjs from 'dayjs';

export const calculateFreeSlots = (bookings = [], targetDate = dayjs()) => {
  // Устанавливаем границы рабочего дня для КОНКРЕТНОЙ даты
  const startDay = targetDate.clone().hour(9).minute(0).second(0);
  const endDay = targetDate.clone().hour(22).minute(0).second(0);

  const sorted = [...bookings].sort((a, b) => 
    dayjs(a.start_datetime).diff(dayjs(b.start_datetime))
  );

  let freeSlots = [];
  let currentPos = startDay;

  sorted.forEach(booking => {
    const bookStart = dayjs(booking.start_datetime);
    const bookEnd = dayjs(booking.end_datetime);

    // Если между текущей позицией и началом брони есть зазор
    if (bookStart.isAfter(currentPos)) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${bookStart.format('HH:mm')}`);
    }
    // Двигаем указатель на конец брони, если он дальше текущего
    if (bookEnd.isAfter(currentPos)) {
      currentPos = bookEnd;
    }
  });

  // Добавляем хвост до конца рабочего дня
  if (currentPos.isBefore(endDay)) {
    freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
  }

  return freeSlots.length > 0 ? freeSlots : ["Нет свободных слотов"];
};