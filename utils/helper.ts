import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

// Create initials from name for avatar fallback
export const getNameFallback = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export function formatToVietnamTime(isoString: string): string {
  const date = parseISO(isoString);
  return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: vi });
}
