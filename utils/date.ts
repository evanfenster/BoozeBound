import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configure dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Get the local timezone
const localTimezone = dayjs.tz.guess();

export const todayISO = () => {
  return dayjs().format('YYYY-MM-DDTHH:mm:ss');
};

export const toLocalTime = (date: dayjs.Dayjs) => {
  return date.tz(localTimezone);
};

export const fromLocalTime = (date: dayjs.Dayjs) => {
  return date.tz(localTimezone, true);
};
