export type Appointment = {
  id: number;
  eventId: string;
  appointmentId: string;
  eventType: string;
  occurredAt: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  email: string;
  phoneE164: string;
  notifyEmail: boolean;
  notifySms: boolean;
  receivedAt: string;
};
