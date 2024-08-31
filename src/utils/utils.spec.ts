import {
  isDateInTheFuture,
  isSessionActive,
  adjustSessionDate,
  parseTimeSlot,
} from './date';
import { generateUUID } from './gen-id';
import { TimeSlot } from '../sessions/enum/time-slot';

describe('Utils', () => {
  describe('generateUUID', () => {
    it('should generate a unique UUID', () => {
      const uuid = generateUUID();
      expect(uuid).toHaveLength(24);
      expect(uuid).toMatch(/^[a-f0-9]{24}$/);
    });
  });

  describe('parseTimeSlot', () => {
    it('should correctly parse a time slot', () => {
      const timeSlot = '10:00-12:00';
      const result = parseTimeSlot(timeSlot as TimeSlot);
      expect(result).toEqual({ start: 10, end: 12 });
    });

    it('should handle invalid time slots gracefully', () => {
      const timeSlot = 'invalid-time-slot';
      const result = parseTimeSlot(timeSlot as TimeSlot);
      expect(result).toEqual({ start: NaN, end: NaN });
    });
  });

  describe('date-checks', () => {
    const mockDate = new Date('2024-08-31T12:10:00Z');

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });
    it('should return true if the date is in the future or now', () => {
      const futureDate = new Date(Date.now() + 10000);
      const now = new Date();
      expect(isDateInTheFuture(futureDate)).toBe(true);
      expect(isDateInTheFuture(now)).toBe(true);
    });

    it('should return false if the date is in the past', () => {
      const pastDate = new Date(Date.now() - 10000);
      expect(isDateInTheFuture(pastDate)).toBe(false);
    });

    it('should return true if current time is within session', () => {
      const currentDate = new Date();
      const timeSlot = TimeSlot['12:00-14:00'];

      const result = isSessionActive(currentDate, timeSlot);
      expect(result).toBe(true);
    });

    it('should return false if current time is before session starts', () => {
      const currentDate = new Date();
      const timeSlot = TimeSlot['10:00-12:00'];

      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(10);

      const result = isSessionActive(currentDate, timeSlot);
      expect(result).toBe(false);
    });

    it('should return false if current time is after session ends', () => {
      const currentDate = new Date();
      const timeSlot = TimeSlot['16:00-18:00'];

      const result = isSessionActive(currentDate, timeSlot);
      expect(result).toBe(false);
    });

    it('should adjust date to session start', () => {
      const date = new Date('2024-08-31T12:00:00Z');
      const timeSlot = TimeSlot['18:00-20:00'];
      const adjustedDate = adjustSessionDate(date, timeSlot, 'start');

      expect(adjustedDate.getUTCHours()).toBe(18);
    });

    it('should adjust date to session end', () => {
      const date = new Date('2024-08-31T12:00:00Z');
      const timeSlot = TimeSlot['20:00-22:00'];
      const adjustedDate = adjustSessionDate(date, timeSlot, 'end');

      expect(adjustedDate.getUTCHours()).toBe(22);
    });

    it('should default to start phase if phase is not provided', () => {
      const date = new Date('2024-08-31T12:00:00Z');
      const timeSlot = TimeSlot['16:00-18:00'];
      const adjustedDate = adjustSessionDate(date, timeSlot);

      expect(adjustedDate.getUTCHours()).toBe(16);
    });
  });
});
