'use client';

import { useState } from 'react';
import { formatDateDisplay } from './utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002';

interface ContactFormSectionProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  topic: string;
  setTopic: (value: string) => void;
  onReset?: () => void;
  onBack?: () => void;
  onBookingSuccess?: (selectedDate: Date, selectedTime: string) => void;
}

export default function ContactFormSection({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  topic,
  setTopic,
  onReset,
  onBack,
  onBookingSuccess,
}: ContactFormSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errorField, setErrorField] = useState<'email' | 'phone' | null>(null);
  const friendlyErrorMessage = (errors: string[]): string => {
    const normalized = errors.map((value) => value.trim().toLowerCase());

    if (normalized.some((value) => value.includes('contact.phone must be a valid phone number'))) {
      return 'Please enter a valid 10-digit phone number.';
    }

    if (normalized.some((value) => value.includes('contact.email is required'))) {
      return 'Please enter an email address so we can confirm your appointment.';
    }

    if (normalized.some((value) => value.includes('contact.email or contact.phone is required'))) {
      return 'Please enter either an email address or a phone number.';
    }

    if (normalized.some((value) => value.includes('appointment.end_time must be after appointment.start_time'))) {
      return 'Please pick a time slot that ends after it starts.';
    }

    return errors.join(' ');
  };

  // Simple email validation
  const isValidEmail = (emailAddress: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailAddress);
  };

  // Accept any 10 digits (strips non-digit characters first)
  const isValidPhone = (phoneNumber: string): boolean => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    return digitsOnly.length === 10;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !firstName || (!email && !phone)) {
      return;
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      setErrorField('email');
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      setErrorField('phone');
      setMessage({ type: 'error', text: 'Please enter a valid phone number.' });
      return;
    }

    setErrorField(null);

    setIsSubmitting(true);

    try {
      const [hourString, minuteString] = selectedTime.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(Number(hourString), Number(minuteString), 0, 0);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

      // Get user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const bookingData = {
        contact: {
          firstName,
          lastName,
          email,
          phone,
          timezone,
        },
        appointment: {
          topic,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        },
      };

      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        let errorMessage = 'We could not book your meeting. Please try again.';
        try {
          const errorBody = await response.json();
          if (Array.isArray(errorBody?.errors) && errorBody.errors.length > 0) {
            errorMessage = friendlyErrorMessage(errorBody.errors);
          }
        } catch {
          // ignore JSON parse failures and use the default error message
        }
        setMessage({ type: 'error', text: errorMessage });
        return;
      }

      const data = await response.json();
      console.log('Booking successful:', data);
      if (selectedDate && selectedTime) {
        onBookingSuccess?.(selectedDate, selectedTime);
      }
      setMessage({ type: 'success', text: 'Meeting booked successfully!' });
    } catch (error) {
      console.error('Error booking timeslot:', error);
      setMessage({ type: 'error', text: 'Failed to book the meeting. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
      {/* Success Confirmation */}
      {message?.type === 'success' ? (
        <div className="py-12 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Meeting Confirmed!</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">{message.text}</p>
          <button
            onClick={() => {
              setMessage(null);
              onReset?.();
            }}
            className="inline-block px-6 py-2 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            Book Another Appointment
          </button>
        </div>
      ) : (
        <>
          {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent-600 transition-all"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
            Last Name <span className="text-xs text-zinc-500 dark:text-zinc-400">(Optional)</span>
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent-600 transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrorField(null);
          }}
          placeholder="your@email.com"
          className={`w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${
            errorField === 'email'
              ? 'border-red-500 dark:border-red-500 focus:ring-red-600'
              : 'border-zinc-200 dark:border-zinc-700 focus:ring-accent-600'
          }`}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setErrorField(null);
          }}
          placeholder="555-123-4567"
          className={`w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${
            errorField === 'phone'
              ? 'border-red-500 dark:border-red-500 focus:ring-red-600'
              : 'border-zinc-200 dark:border-zinc-700 focus:ring-accent-600'
          }`}
        />
      </div>

      <div>
        <label htmlFor="topic" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
          Topic or Inquiry <span className="text-xs text-zinc-500 dark:text-zinc-400">(Optional)</span>
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Tell me about your project or what you'd like to discuss..."
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent-600 transition-all resize-none"
        />
      </div>

      {/* Booking Button */}
      <button
        onClick={handleBooking}
        disabled={!selectedDate || !selectedTime || !firstName || (!email && !phone) || isSubmitting}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
          selectedDate && selectedTime && firstName && (email || phone) && !isSubmitting
            ? 'bg-accent-600 hover:bg-accent-700 text-white hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
            : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
        }`}
      >
        {isSubmitting
          ? 'Booking...'
          : selectedDate && selectedTime
          ? `Book Meeting for ${formatDateDisplay(selectedDate)} at ${selectedTime}`
          : 'Select Date & Time to Book'}
      </button>

      {/* Confirmation Message */}
      {message?.type === 'error' && (
        <div className="p-4 rounded-lg text-center font-medium transition-all duration-300 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700">
          {message.text}
        </div>
      )}
        </>
      )}
    </div>
  );
}
