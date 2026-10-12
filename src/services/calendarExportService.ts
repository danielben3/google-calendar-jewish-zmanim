import { DayZmanim, LocationSettings, DisplaySettings } from '../types';

function formatDateToICS(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function escapeICS(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export class CalendarExportService {
  /**
   * Generates standard RFC 5545 iCalendar (.ics) string with All-Day events
   */
  public static generateIcsContent(
    days: DayZmanim[],
    location: LocationSettings,
    settings: DisplaySettings
  ): string {
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Jewish Halachic Times & Parasha//Google Calendar Extension//HE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:זמני היום ופרשת שבוע (${location.cityName})`,
      'X-WR-TIMEZONE:' + (location.tzid || 'Asia/Jerusalem'),
      'X-WR-CALDESC:זמני זריחה, שקיעה, כניסת שבת ופרשת שבוע מותאמים אישית'
    ];

    const nowStr = formatDateToICS(new Date()) + 'T000000Z';

    for (const day of days) {
      const dtStart = formatDateToICS(day.date);
      // For all-day event, DTEND is exclusive (day + 1)
      const nextDay = new Date(day.date.getTime() + 24 * 60 * 60 * 1000);
      const dtEnd = formatDateToICS(nextDay);

      // Construct Summary & Description based on day type
      let summaryParts: string[] = [];
      let descLines: string[] = [];

      descLines.push(`תאריך עברי: ${day.hebrewDate}`);
      descLines.push(`מיקום: ${location.cityName}`);

      if (day.holidayName) {
        summaryParts.push(`🌿 ${day.holidayName}`);
        descLines.push(`מועד: ${day.holidayName}`);
      }

      if (day.isErevShabbat) {
        // Friday
        if (settings.showShabbat && day.candleLighting) {
          summaryParts.push(`🕯️ כניסת שבת: ${day.candleLighting}`);
          descLines.push(`הדלקת נרות (${location.candleLightingMinutes} דק'): ${day.candleLighting}`);
        }
        if (settings.showParasha && day.parasha) {
          summaryParts.push(day.parasha);
          descLines.push(`פרשת השבוע: ${day.parasha}`);
        }
        if (settings.showSunset) {
          summaryParts.push(`🌅 שקיעה: ${day.sunset}`);
          descLines.push(`שקיעה: ${day.sunset}`);
        }
        if (settings.showSunrise) {
          descLines.push(`זריחה: ${day.sunrise}`);
        }
      } else if (day.isShabbat) {
        // Saturday
        if (settings.showParasha && day.parasha) {
          summaryParts.push(`✨ ${day.parasha}`);
          descLines.push(`פרשת השבוע: ${day.parasha}`);
        }
        if (settings.showShabbat && day.havdalah) {
          summaryParts.push(`🍷 צאת שבת: ${day.havdalah}`);
          descLines.push(`הבדלה וצאת שבת: ${day.havdalah}`);
        }
        if (settings.showSunset) {
          descLines.push(`שקיעה: ${day.sunset}`);
        }
        if (settings.showSunrise) {
          descLines.push(`זריחה: ${day.sunrise}`);
        }
      } else {
        // Regular Weekday
        if (settings.showSunrise) {
          summaryParts.push(`☀️ ${day.sunrise}`);
          descLines.push(`זריחה: ${day.sunrise}`);
        }
        if (settings.showSunset) {
          summaryParts.push(`🌅 ${day.sunset}`);
          descLines.push(`שקיעה: ${day.sunset}`);
        }
        summaryParts.push(day.hebrewDate);
      }

      // Add additional zmanim in description
      descLines.push(`סוף זמן ק"ש (גר"א): ${day.sofZmanShmaGra}`);
      descLines.push(`סוף זמן תפילה: ${day.sofZmanTfillaGra}`);
      descLines.push(`חצות היום: ${day.chatzot}`);
      descLines.push(`צאת הכוכבים: ${day.tzeitHakochavim}`);

      const summary = summaryParts.join(' | ');
      const description = descLines.join('\n');
      const uid = `jewish-zmanim-${day.dateStr}-${location.cityName.replace(/\s+/g, '')}@gcal`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${nowStr}`);
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
      lines.push(`SUMMARY:${escapeICS(summary)}`);
      lines.push(`DESCRIPTION:${escapeICS(description)}`);
      lines.push('STATUS:CONFIRMED');
      lines.push('TRANSP:TRANSPARENT'); // Mark as free time so it doesn't block calendar availability
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /**
   * Helper to trigger download of ICS file in browser
   */
  public static downloadIcsFile(filename: string, icsContent: string): void {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
