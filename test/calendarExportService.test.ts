import { describe, it, expect } from 'vitest';
import { CalendarExportService } from '../src/services/calendarExportService';
import { ZmanimService } from '../src/services/zmanimService';
import { DEFAULT_LOCATION, DEFAULT_DISPLAY_SETTINGS } from '../src/services/citiesData';

describe('CalendarExportService', () => {
  it('generates a valid RFC 5545 VCALENDAR with All-Day events', () => {
    const startDate = new Date('2026-10-12T10:00:00Z');
    const days = ZmanimService.getZmanimRange(startDate, 7, DEFAULT_LOCATION);
    const ics = CalendarExportService.generateIcsContent(days, DEFAULT_LOCATION, DEFAULT_DISPLAY_SETTINGS);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Jewish Halachic Times & Parasha//Google Calendar Extension//HE');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261012');
    expect(ics).toContain('TRANSP:TRANSPARENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('includes candle lighting and Parasha in Friday and Saturday events', () => {
    // Range including Friday Oct 16 and Saturday Oct 17
    const startDate = new Date('2026-10-16T10:00:00Z');
    const days = ZmanimService.getZmanimRange(startDate, 2, DEFAULT_LOCATION);
    const ics = CalendarExportService.generateIcsContent(days, DEFAULT_LOCATION, DEFAULT_DISPLAY_SETTINGS);

    expect(ics).toContain('כניסת שבת');
    expect(ics).toContain('פרשת נח');
    expect(ics).toContain('צאת שבת');
  });
});
