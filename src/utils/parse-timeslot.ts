import { TimeSlot } from 'src/sessions/enum/time-slot';

export type HourSlot = {
  start: number;
  end: number;
};

export function parseTimeSlot(timeSlot: TimeSlot): HourSlot {
  const [startsAt, endsAt] = timeSlot.split('-');
  const [startsAtHour] = startsAt.split(':').map(Number);
  const [endsAtHour] = endsAt.split(':').map(Number);
  return { start: startsAtHour, end: endsAtHour };
}
