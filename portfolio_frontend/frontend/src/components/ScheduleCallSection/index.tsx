'use client';

import { useState } from 'react';
import DateTimePickerSection from './DateTimePickerSection';
import ContactFormSection from './ContactFormSection';

// TODO: Reimplement Google OAuth flow (see AuthenticationSection.tsx) once a
// Google client ID is configured. The auth step should gate the contact form
// behind either Google sign-in or manual entry.

interface ScheduleCallSectionProps {
  onBooking?: () => void;
}

export default function ScheduleCallSection({ onBooking }: ScheduleCallSectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedTime, setBookedTime] = useState<string | null>(null);
  const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('');

  const handleBookAnother = () => {
    setSelectedDate(lastSelectedDate);
    setSelectedTime(null);
  };

  const handleBookingSuccess = (date: Date, time: string) => {
    setLastSelectedDate(date);
    setBookedTime(time);
  };

  return (
    <div className="glass-effect rounded-xl p-8 border border-zinc-100/50 dark:border-zinc-800/50 flex flex-col">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Schedule a Call</h2>
      <p className="text-zinc-700 dark:text-zinc-300 mb-6">
        Pick a time that works best for you. I'm available for 30-minute discovery calls to discuss your project or opportunities.
      </p>
      <div className="space-y-6">
        <DateTimePickerSection
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          bookedTime={bookedTime}
        />

        {selectedDate && selectedTime && (
          <ContactFormSection
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            topic={topic}
            setTopic={setTopic}
            onReset={handleBookAnother}
            onBookingSuccess={handleBookingSuccess}
          />
        )}
      </div>
    </div>
  );
}
