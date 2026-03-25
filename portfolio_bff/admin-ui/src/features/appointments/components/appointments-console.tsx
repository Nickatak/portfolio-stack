"use client";

import { useEffect, useState } from "react";
import { fetchAppointments } from "@/lib/api";
import type { Appointment } from "../types";
import styles from "./appointments-console.module.css";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function toDateKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function buildDayStrip(): { key: string; weekday: string; day: number }[] {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return {
      key: date.toLocaleDateString("en-CA"),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      day: date.getDate(),
    };
  });
}

export function AppointmentsConsole() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toLocaleDateString("en-CA"),
  );

  useEffect(() => {
    const load = async () => {
      const response = await fetchAppointments();
      setAppointments((response.data?.appointments as Appointment[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const todayKey = new Date().toLocaleDateString("en-CA");
  const days = buildDayStrip();

  const countsByDay = new Map<string, number>();
  for (const appt of appointments) {
    const dk = toDateKey(appt.startTime);
    countsByDay.set(dk, (countsByDay.get(dk) ?? 0) + 1);
  }

  const visible = (
    selectedDate
      ? appointments.filter((a) => toDateKey(a.startTime) === selectedDate)
      : appointments
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleDayClick = (key: string) => {
    setSelectedDate((prev) => (prev === key ? null : key));
  };

  if (loading) {
    return <p className={styles.muted}>Loading appointments…</p>;
  }

  return (
    <>
      <h1 className={styles.title}>Appointments</h1>
      <p className={styles.subtitle}>
        {selectedDate
          ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })
          : "All upcoming"}
      </p>

      {/* Day strip */}
      <div className={styles.strip}>
        {days.map((d) => {
          const count = countsByDay.get(d.key) ?? 0;
          return (
            <button
              key={d.key}
              type="button"
              className={cx(
                styles.dayCell,
                d.key === todayKey && styles.dayCellToday,
                d.key === selectedDate && styles.dayCellSelected,
              )}
              onClick={() => handleDayClick(d.key)}
            >
              <span className={styles.dayWeekday}>{d.weekday}</span>
              <span className={styles.dayNumber}>{d.day}</span>
              {count > 0 && <span className={styles.dayDot} />}
            </button>
          );
        })}
      </div>

      {/* Agenda */}
      <div className={styles.agenda}>
        {visible.length === 0 ? (
          <div className={styles.empty}>
            {selectedDate ? "No appointments on this day." : "No upcoming appointments."}
          </div>
        ) : (
          visible.map((appt) => (
            <div key={appt.id} className={styles.card}>
              <div className={styles.cardTime}>
                <strong>
                  {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                </strong>
                <span className={styles.duration}>{appt.durationMinutes} min</span>
              </div>
              <div className={styles.cardContact}>
                <span>{appt.email || "—"}</span>
                {appt.phoneE164 && <span className={styles.muted}>{appt.phoneE164}</span>}
              </div>
              <div className={styles.cardPills}>
                <span className={cx(styles.pill, appt.notifyEmail && styles.pillActive)}>
                  Email
                </span>
                <span className={cx(styles.pill, appt.notifySms && styles.pillActive)}>SMS</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
