import dayjs from 'dayjs';

export const calculateFreeSlots = (bookings = []) => {
  const startDay = dayjs().hour(9).minute(0).second(0);
  const endDay = dayjs().hour(22).minute(0).second(0);

  const sorted = [...bookings].sort((a, b) => 
    dayjs(a.start_datetime).diff(dayjs(b.start_datetime))
  );

  let freeSlots = [];
  let currentPos = startDay;

  sorted.forEach(booking => {
    const bookStart = dayjs(booking.start_datetime);
    const bookEnd = dayjs(booking.end_datetime);

    if (bookStart.isAfter(currentPos)) {
      freeSlots.push(`${currentPos.format('HH:mm')} - ${bookStart.format('HH:mm')}`);
    }
    currentPos = bookEnd.isAfter(currentPos) ? bookEnd : currentPos;
  });

  if (currentPos.isBefore(endDay)) {
    freeSlots.push(`${currentPos.format('HH:mm')} - ${endDay.format('HH:mm')}`);
  }

  return freeSlots;
};