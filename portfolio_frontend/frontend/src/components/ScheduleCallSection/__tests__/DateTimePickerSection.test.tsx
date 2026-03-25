import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateTimePickerSection from '../DateTimePickerSection';
import { convertPSTToLocal } from '../utils';

describe('DateTimePickerSection (stateless)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should not have any date selected on page load', () => {
      render(
        <DateTimePickerSection
          selectedDate={null}
          setSelectedDate={jest.fn()}
          selectedTime={null}
          setSelectedTime={jest.fn()}
          bookedTime={null}
        />
      );

      expect(screen.getByText('Select Date')).toBeInTheDocument();
      expect(screen.queryByText(/Select Time/)).not.toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    it('should display time slot choices after date is selected', async () => {
      const selectedDate = new Date(2026, 1, 1);

      render(
        <DateTimePickerSection
          selectedDate={selectedDate}
          setSelectedDate={jest.fn()}
          selectedTime={null}
          setSelectedTime={jest.fn()}
          bookedTime={null}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Select Time/i)).toBeInTheDocument();
      });
    });

    it('should show all 16 time slots (10am-5:30pm in 30-min intervals)', async () => {
      const selectedDate = new Date(2026, 1, 1);

      render(
        <DateTimePickerSection
          selectedDate={selectedDate}
          setSelectedDate={jest.fn()}
          selectedTime={null}
          setSelectedTime={jest.fn()}
          bookedTime={null}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Select Time/i)).toBeInTheDocument();
      });

      const timeButtons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent?.includes(':')
      );

      expect(timeButtons.length).toBe(16);
    });
  });

  describe('Booked Time', () => {
    it('should mark the just-booked time slot as unavailable', async () => {
      const selectedDate = new Date(2026, 1, 1);
      const bookedTime = convertPSTToLocal(10, 0);

      render(
        <DateTimePickerSection
          selectedDate={selectedDate}
          setSelectedDate={jest.fn()}
          selectedTime={null}
          setSelectedTime={jest.fn()}
          bookedTime={bookedTime}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Select Time/i)).toBeInTheDocument();
      });

      const disabledButtons = screen.getAllByRole('button').filter(
        (btn) => btn.getAttribute('disabled') === ''
      );

      expect(disabledButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Time Selection', () => {
    it('should allow selecting an available time slot', async () => {
      const user = userEvent.setup();
      const setSelectedTime = jest.fn();
      const selectedDate = new Date(2026, 1, 1);

      render(
        <DateTimePickerSection
          selectedDate={selectedDate}
          setSelectedDate={jest.fn()}
          selectedTime={null}
          setSelectedTime={setSelectedTime}
          bookedTime={null}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Select Time/i)).toBeInTheDocument();
      });

      const timeButtons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent?.includes(':')
      );

      if (timeButtons.length > 0) {
        await user.click(timeButtons[0]);
        expect(setSelectedTime).toHaveBeenCalled();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should clear time slots when date is deselected', async () => {
      let selectedDate: Date | null = new Date(2026, 1, 1);

      const { rerender } = render(
        <DateTimePickerSection
          selectedDate={selectedDate}
          setSelectedDate={jest.fn()}
          selectedTime={null}
          setSelectedTime={jest.fn()}
          bookedTime={null}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Select Time/i)).toBeInTheDocument();
      });

      selectedDate = null;
      rerender(
        <DateTimePickerSection
          selectedDate={selectedDate}
          setSelectedDate={jest.fn()}
          selectedTime={null}
          setSelectedTime={jest.fn()}
          bookedTime={null}
        />
      );

      expect(screen.queryByText(/Select Time/i)).not.toBeInTheDocument();
    });
  });
});
