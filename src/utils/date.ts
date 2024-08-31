import { TimeSlot } from '../sessions/enum/time-slot';

export type HourSlot = {
  start: number;
  end: number;
};

export type SessionPhase = 'start' | 'end';

export function parseTimeSlot(timeSlot: TimeSlot): HourSlot {
  const [startsAt, endsAt] = timeSlot.split('-');
  const [startsAtHour] = startsAt.split(':').map(Number);
  const [endsAtHour] = endsAt.split(':').map(Number);
  return { start: startsAtHour, end: endsAtHour };
}

export function isDateInTheFuture(date: Date): boolean {
  const currentDate = new Date();
  if (currentDate > date) {
    return false;
  }
  return true;
}

export function isSessionActive(date: Date, timeSlot: TimeSlot): boolean {
  const currentTimeUTC = new Date(new Date().toISOString());
  const sessionStarts = adjustSessionDate(date, timeSlot, 'start');
  const sessionEnds = adjustSessionDate(date, timeSlot, 'end');
  return currentTimeUTC >= sessionStarts && currentTimeUTC < sessionEnds;
}

export function adjustSessionDate(
  date: Date,
  timeSlot: TimeSlot,
  phase: SessionPhase = 'start',
): Date {
  const sessionDateUTC = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const parsedSessionHours = parseTimeSlot(timeSlot);
  if (phase === 'start') {
    sessionDateUTC.setUTCHours(parsedSessionHours.start);
  } else {
    sessionDateUTC.setUTCHours(parsedSessionHours.end);
  }

  return sessionDateUTC;
}
