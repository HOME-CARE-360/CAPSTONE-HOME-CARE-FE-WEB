import { vi } from 'date-fns/locale';
import { format } from 'date-fns';

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  } catch {
    return dateString;
  }
};
