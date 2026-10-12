import fs from 'node:fs';
import { HDate, Zmanim, GeoLocation, Sedra, Locale, HebrewCalendar } from '@hebcal/core';

function stripNiqqud(str) {
  return str.replace(/[\u0591-\u05C7]/g, '');
}

function formatTimeHHMM(d) {
  if (!d || isNaN(d.getTime())) return '--:--';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDateToICS(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function escapeICS(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

const cityName = 'ירושלים';
const lat = 31.7683;
const lon = 35.2137;
const tzid = 'Asia/Jerusalem';
const candleMinutes = 40;

const gloc = new GeoLocation(cityName, lat, lon, 800, tzid);
const lines = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Jewish Halachic Times & Parasha//Google Calendar Extension//HE',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  `X-WR-CALNAME:זמני היום ופרשת שבוע (${cityName})`,
  `X-WR-TIMEZONE:${tzid}`,
  'X-WR-CALDESC:זמני זריחה, שקיעה, כניסת שבת ופרשת שבוע כאירועי יום שלם'
];

const now = new Date();
const nowStr = formatDateToICS(now) + 'T000000Z';
const daysCount = 180; // 6 months

for (let i = 0; i < daysCount; i++) {
  const current = new Date(now.getTime() + i * 86400000);
  const zman = new Zmanim(gloc, current, false);
  const hd = new HDate(current);
  const dayOfWeek = current.getDay();
  const isErevShabbat = dayOfWeek === 5;
  const isShabbat = dayOfWeek === 6;

  const sunrise = formatTimeHHMM(zman.sunrise());
  const sunset = formatTimeHHMM(zman.sunset());
  const dtStart = formatDateToICS(current);
  const nextDay = new Date(current.getTime() + 86400000);
  const dtEnd = formatDateToICS(nextDay);

  let parasha;
  try {
    const sedra = new Sedra(hd.getFullYear(), true);
    const pLookup = isShabbat ? sedra.lookup(hd) : (sedra.lookupWeekday(hd) || sedra.lookup(hd));
    if (pLookup && pLookup.parsha && pLookup.parsha.length > 0) {
      const pName = pLookup.parsha.map(p => stripNiqqud(Locale.gettext(p, 'he') || p)).join('-');
      parasha = `פרשת ${pName}`;
    }
  } catch {}

  let holidayName;
  try {
    const hols = HebrewCalendar.getHolidaysOnDate(hd, true);
    if (hols && hols.length > 0) {
      holidayName = hols.map(h => stripNiqqud(h.render('he'))).join(', ');
    }
  } catch {}

  let candleLighting;
  if (isErevShabbat && zman.sunset()) {
    candleLighting = formatTimeHHMM(new Date(zman.sunset().getTime() - candleMinutes * 60000));
  }

  let havdalah;
  if (isShabbat) {
    havdalah = formatTimeHHMM(zman.tzeit());
  }

  let summaryParts = [];
  let descLines = [];

  descLines.push(`תאריך עברי: ${hd.renderGematriya()}`);
  descLines.push(`מיקום: ${cityName}`);

  if (holidayName) {
    summaryParts.push(`🌿 ${holidayName}`);
    descLines.push(`מועד: ${holidayName}`);
  }

  if (isErevShabbat) {
    if (candleLighting) {
      summaryParts.push(`🕯️ כניסת שבת: ${candleLighting}`);
      descLines.push(`הדלקת נרות (${candleMinutes} דק'): ${candleLighting}`);
    }
    if (parasha) {
      summaryParts.push(parasha);
      descLines.push(`פרשת השבוע: ${parasha}`);
    }
    summaryParts.push(`🌅 שקיעה: ${sunset}`);
    descLines.push(`שקיעה: ${sunset}`);
    descLines.push(`זריחה: ${sunrise}`);
  } else if (isShabbat) {
    if (parasha) {
      summaryParts.push(`✨ ${parasha}`);
      descLines.push(`פרשת השבוע: ${parasha}`);
    }
    if (havdalah) {
      summaryParts.push(`🍷 צאת שבת: ${havdalah}`);
      descLines.push(`הבדלה: ${havdalah}`);
    }
    descLines.push(`שקיעה: ${sunset}`);
    descLines.push(`זריחה: ${sunrise}`);
  } else {
    summaryParts.push(`☀️ ${sunrise}`);
    summaryParts.push(`🌅 ${sunset}`);
    summaryParts.push(hd.renderGematriya());
    descLines.push(`זריחה: ${sunrise}`);
    descLines.push(`שקיעה: ${sunset}`);
  }

  descLines.push(`סוף זמן ק"ש (גר"א): ${formatTimeHHMM(zman.sofZmanShma())}`);
  descLines.push(`סוף זמן תפילה (גר"א): ${formatTimeHHMM(zman.sofZmanTfilla())}`);
  descLines.push(`חצות היום: ${formatTimeHHMM(zman.chatzot())}`);
  descLines.push(`צאת הכוכבים: ${formatTimeHHMM(zman.tzeit())}`);

  const uid = `zmanim-${dtStart}-jerusalem@gcal`;
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${uid}`);
  lines.push(`DTSTAMP:${nowStr}`);
  lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
  lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
  lines.push(`SUMMARY:${escapeICS(summaryParts.join(' | '))}`);
  lines.push(`DESCRIPTION:${escapeICS(descLines.join('\n'))}`);
  lines.push('STATUS:CONFIRMED');
  lines.push('TRANSP:TRANSPARENT');
  lines.push('END:VEVENT');
}

lines.push('END:VCALENDAR');

const icsOutput = lines.join('\r\n');
fs.writeFileSync('sample_zmanim_jerusalem.ics', icsOutput, 'utf-8');
console.log(`Generated sample_zmanim_jerusalem.ics (${daysCount} days, ${icsOutput.length} bytes)`);
