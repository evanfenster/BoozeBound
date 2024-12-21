import dayjs from 'dayjs';

export const todayISO = () => {
  return dayjs().format('YYYY-MM-DDTHH:mm:ss');
};
