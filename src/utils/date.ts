import { TimeSlot } from 'src/sessions/enum/time-slot';

export type HourSlot = {
  start: number;
  end: number;
};

export type SessionPhase = 'start' | 'end';

function parseTimeSlot(timeSlot: TimeSlot): HourSlot {
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
  const currentTime = new Date();
  const sessionStarts = adjustSessionDate(date, timeSlot, 'start');
  const sessionEnds = adjustSessionDate(date, timeSlot, 'end');
  return currentTime >= sessionStarts && currentTime <= sessionEnds;
}

export function adjustSessionDate(
  date: Date,
  timeSlot: TimeSlot,
  phase: SessionPhase = 'start',
): Date {
  const sessionDate = date;
  const parsedSessionHours = parseTimeSlot(timeSlot);
  if (phase === 'start') {
    sessionDate.setHours(parsedSessionHours.start);
  } else {
    sessionDate.setHours(parsedSessionHours.end);
  }

  return sessionDate;
}
