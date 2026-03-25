'use client';

import { useState, useEffect } from 'react';
import { formatDateDisplay, convertPSTToLocal } from './utils';

interface TimeSlot {
  time: string;
  pstTime: string;
  available: boolean;
}

interface DateTimePickerSectionProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string) => void;
  bookedTime?: string | null;
}

export default function DateTimePickerSection({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  bookedTime,
}: DateTimePickerSectionProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Generate initial time slots (without availability data)
  const generateInitialTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 10; hour < 18; hour++) {
      for (let minute of [0, 30]) {
        const pstTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const localTime = convertPSTToLocal(hour, minute);
        slots.push({
          time: localTime,
          pstTime,
          available: true,
        });
      }
    }
    return slots;
  };

  // Update availability based on the current in-session booking
  const updateSlotAvailability = (slots: TimeSlot[], justBookedTime: string | null) => {
    return slots.map((slot) => {
      const isJustBooked = justBookedTime === slot.time;
      return {
        ...slot,
        available: !isJustBooked,
      };
    });
  };

  // Initialize available slots when a date is selected (stateless API)
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    const initialSlots = generateInitialTimeSlots();
    setTimeSlots(updateSlotAvailability(initialSlots, bookedTime ?? null));
  }, [selectedDate]);

  // Update availability when bookedTime changes
  useEffect(() => {
    setTimeSlots((prevSlots) => updateSlotAvailability(prevSlots, bookedTime ?? null));
  }, [bookedTime]);
  const today = new Date();
  const nextDays = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Group dates by month for visual organization
  const datesByMonth = nextDays.reduce((acc, date) => {
    const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(date);
    return acc;
  }, {} as Record<string, Date[]>);

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-3">
          Select Date
        </label>
        {Object.entries(datesByMonth).map(([month, dates]) => (
          <div key={month} className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-3">
              {month}
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {dates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`py-3 px-2 rounded-lg font-medium transition-all duration-200 text-center shadow-sm border ${
                    selectedDate?.toDateString() === date.toDateString()
                      ? 'bg-accent-600 text-white shadow-md border-accent-700'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:shadow-md'
                  }`}
                >
                  <div className="text-xs opacity-75">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-sm">{date.getDate()}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Time Picker */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-3">
            Select Time ({formatDateDisplay(selectedDate)}) - Times below are shown in your timezone
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {timeSlots.map((slot) => (
              <button
                key={slot.pstTime}
                onClick={() => setSelectedTime(slot.time)}
                disabled={!slot.available}
                className={`py-2 px-3 rounded-lg font-medium transition-all duration-200 shadow-sm border ${
                  !slot.available
                    ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-600 cursor-not-allowed shadow-none'
                    : selectedTime === slot.time
                    ? 'bg-accent-600 text-white shadow-md border-accent-700'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:shadow-md'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
