'use client';

import * as React from 'react';
import { ChevronDownIcon, CalendarIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Calendar24Props {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onTimeChange?: (time: string) => void;
  className?: string;
  error?: boolean;
  placeholder?: string;
  timeValue?: string;
  timeError?: string;
}

export function Calendar24({
  value,
  onChange,
  onTimeChange,
  className = '',
  error = false,
  placeholder = 'Chọn ngày',
  timeValue = '09:00',
  timeError,
}: Calendar24Props) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [time, setTime] = React.useState<string>(timeValue);
  const [internalTimeError, setInternalTimeError] = React.useState<string>('');

  // Business hours: 7:00 AM to 7:00 PM
  const MIN_TIME = '07:00';
  const MAX_TIME = '19:00';

  // Calculate minimum time based on current time if date is today
  // Enforce minimum 1-hour 30-minute advance booking
  const getMinTime = (): string => {
    if (!date) return MIN_TIME;

    const selectedDate = new Date(date);
    const currentDate = new Date();
    const isToday = selectedDate.toDateString() === currentDate.toDateString();

    if (isToday) {
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();

      // Calculate minimum booking time (current time + 1 hour 30 minutes)
      let minHour = currentHour + 1;
      let minMinute = currentMinute + 30;

      // Handle minute overflow
      if (minMinute >= 60) {
        minHour += 1;
        minMinute = minMinute - 60;
      }

      // Ensure minimum booking time is within business hours
      if (minHour < 7) {
        minHour = 7;
        minMinute = 0;
      }

      // If minimum time is after business hours, return invalid time
      if (minHour >= 19) {
        return '20:00'; // This will trigger validation error
      }

      return `${minHour.toString().padStart(2, '0')}:${minMinute.toString().padStart(2, '0')}`;
    }

    return MIN_TIME;
  };

  // Check if today booking is still possible
  const isTodayBookingPossible = (): boolean => {
    if (!date) return true;

    const selectedDate = new Date(date);
    const currentDate = new Date();
    const isToday = selectedDate.toDateString() === currentDate.toDateString();

    if (isToday) {
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();

      // Calculate minimum booking time (current time + 1 hour 30 minutes)
      let minHour = currentHour + 1;
      let minMinute = currentMinute + 30;

      // Handle minute overflow
      if (minMinute >= 60) {
        minHour += 1;
        minMinute = minMinute - 60;
      }

      // Check if minimum booking time is within business hours
      return minHour < 19;
    }

    return true;
  };

  React.useEffect(() => {
    setDate(value);
    // Re-validate time when date changes (min time might change)
    if (time) {
      validateTime(time);
    }
  }, [value, time]);

  React.useEffect(() => {
    setTime(timeValue);
    validateTime(timeValue);
  }, [timeValue]);

  const validateTime = (timeStr: string): boolean => {
    if (!timeStr) {
      setInternalTimeError('Vui lòng chọn giờ');
      return false;
    }

    const [hours, minutes] = timeStr.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const minTimeInMinutes = 7 * 60; // 7:00 AM
    const maxTimeInMinutes = 19 * 60; // 7:00 PM

    // Check business hours first
    if (timeInMinutes < minTimeInMinutes) {
      setInternalTimeError('Giờ phải từ 7:00 sáng trở về sau');
      return false;
    }

    if (timeInMinutes > maxTimeInMinutes) {
      setInternalTimeError('Giờ phải trước 19:00 tối');
      return false;
    }

    // Check if selected date is today and time is in the past or too soon
    if (date) {
      const selectedDate = new Date(date);
      const currentDate = new Date();

      // Check if selected date is today
      const isToday = selectedDate.toDateString() === currentDate.toDateString();

      if (isToday) {
        const currentTimeInMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

        // Calculate minimum booking time (current time + 1 hour 30 minutes)
        const minBookingTimeInMinutes = currentTimeInMinutes + 90;

        if (timeInMinutes < minBookingTimeInMinutes) {
          const nextAvailableHour = Math.max(currentDate.getHours() + 1, 7);
          const nextAvailableMinute = currentDate.getMinutes() + 30;

          // Handle minute overflow for display
          let displayHour = nextAvailableHour;
          let displayMinute = nextAvailableMinute;
          if (displayMinute >= 60) {
            displayHour += 1;
            displayMinute = displayMinute - 60;
          }

          if (displayHour >= 19) {
            setInternalTimeError('Không thể đặt lịch hôm nay. Vui lòng chọn ngày mai');
          } else {
            const formattedNextHour = displayHour.toString().padStart(2, '0');
            const formattedNextMinute = displayMinute.toString().padStart(2, '0');
            setInternalTimeError(
              `Vui lòng đặt lịch ít nhất 1 tiếng 30 phút trước. Giờ sớm nhất: ${formattedNextHour}:${formattedNextMinute}`
            );
          }
          return false;
        }
      }
    }

    setInternalTimeError('');
    return true;
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setOpen(false);
    onChange?.(selectedDate);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    const isValid = validateTime(newTime);
    if (isValid) {
      onTimeChange?.(newTime);
    }
  };

  const currentTimeError = timeError || internalTimeError;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="date-picker" className="text-sm font-medium text-gray-700">
            Chọn ngày <span className="text-xs text-gray-500">(từ hôm nay)</span>
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className={`w-full h-12 justify-between font-normal text-left px-4 ${
                  !date && 'text-muted-foreground'
                } ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'}
                transition-colors duration-200`}
              >
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span>
                    {date ? format(date, 'EEEE, dd/MM/yyyy', { locale: vi }) : placeholder}
                  </span>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <div className="p-3 border-b border-gray-100">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      handleDateSelect(today);
                      setOpen(false);
                    }}
                    className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      handleDateSelect(tomorrow);
                      setOpen(false);
                    }}
                    className="px-3 py-1 text-xs bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Ngày mai
                  </button>
                </div>
              </div>
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={handleDateSelect}
                disabled={date => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Reset time to start of day
                  const checkDate = new Date(date);
                  checkDate.setHours(0, 0, 0, 0); // Reset time to start of day
                  return checkDate < today || date < new Date('1900-01-01');
                }}
                locale={vi}
                initialFocus
                className="rounded-md border-0"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label htmlFor="time-picker" className="text-sm font-medium text-gray-700">
            Chọn giờ{' '}
            <span className="text-xs text-gray-500">
              ({getMinTime()} - {MAX_TIME})
            </span>
          </Label>
          <div className="relative">
            <ClockIcon
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                currentTimeError ? 'text-red-500' : 'text-gray-500'
              }`}
            />
            <Input
              type="time"
              id="time-picker"
              value={time}
              min={getMinTime()}
              max={MAX_TIME}
              onChange={e => handleTimeChange(e.target.value)}
              className={`h-12 pl-10 pr-4 transition-colors duration-200
                bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none
                ${currentTimeError ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'}
              `}
            />
          </div>
          {currentTimeError && (
            <p className="text-sm text-red-500 flex items-center space-x-2 bg-red-50 p-2 rounded-lg border border-red-200">
              <span>{currentTimeError}</span>
            </p>
          )}
        </div>
      </div>

      {/* Business Hours Info */}
      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center space-x-2 text-amber-800">
          <ClockIcon className="h-4 w-4" />
          <span className="font-medium text-sm">Giờ làm việc:</span>
        </div>
        <p className="text-amber-700 text-sm mt-1">
          {date && new Date(date).toDateString() === new Date().toDateString()
            ? isTodayBookingPossible()
              ? `Hôm nay: ${getMinTime()} - ${MAX_TIME} (đặt trước ít nhất 1 tiếng 30 phút)`
              : `Hôm nay: Đã quá giờ làm việc`
            : `Thứ 2 - Chủ nhật: ${MIN_TIME} - ${MAX_TIME}`}
        </p>
      </div>

      {/* Today booking warning */}
      {date &&
        new Date(date).toDateString() === new Date().toDateString() &&
        !isTodayBookingPossible() && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <ClockIcon className="h-4 w-4" />
              <span className="font-medium text-sm">Không thể đặt lịch hôm nay</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Đã quá giờ để đặt lịch hôm nay. Vui lòng chọn ngày mai hoặc các ngày tiếp theo.
            </p>
          </div>
        )}

      {/* Selected Date & Time Display */}
      {date && !currentTimeError && time && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <CalendarIcon className="h-4 w-4" />
            <span className="font-medium">Thời gian đã chọn:</span>
          </div>
          <p className="text-green-700 mt-1 font-medium">
            {format(date, 'EEEE, dd MMMM yyyy', { locale: vi })} lúc {time}
          </p>
          {new Date(date).toDateString() === new Date().toDateString() && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Đặt lịch hôm nay - Đã đảm bảo thời gian phù hợp (trước ít nhất 1 tiếng 30 phút)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
