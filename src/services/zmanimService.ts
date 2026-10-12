import { HDate, Zmanim, GeoLocation, Sedra, Locale, HebrewCalendar } from '@hebcal/core';
import { DayZmanim, LocationSettings } from '../types';

export function stripNiqqud(str: string): string {
  return str.replace(/[\u0591-\u05C7]/g, '');
}

export function formatTimeHHMM(d: Date | null | undefined): string {
  if (!d || isNaN(d.getTime())) return '--:--';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export class ZmanimService {
  private static getGeoLocation(loc: LocationSettings): GeoLocation {
    return new GeoLocation(loc.cityName, loc.lat, loc.lon, 100, loc.tzid || 'Asia/Jerusalem');
  }

  public static getDayZmanim(date: Date, loc: LocationSettings): DayZmanim {
    const gloc = this.getGeoLocation(loc);
    const zman = new Zmanim(gloc, date, false);
    const hd = new HDate(date);
    const dayOfWeek = date.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const isErevShabbat = dayOfWeek === 5;
    const isShabbat = dayOfWeek === 6;

    // Sunrise & Sunset
    const sunriseDate = zman.sunrise();
    const sunsetDate = zman.sunset();

    const sunriseStr = formatTimeHHMM(sunriseDate);
    const sunsetStr = formatTimeHHMM(sunsetDate);

    // Candle lighting for Friday / Erev Shabbat
    let candleLightingStr: string | undefined;
    if (isErevShabbat && sunsetDate) {
      const offsetMs = (loc.candleLightingMinutes || 20) * 60 * 1000;
      const candleDate = new Date(sunsetDate.getTime() - offsetMs);
      candleLightingStr = formatTimeHHMM(candleDate);
    }

    // Havdalah for Saturday / Motzei Shabbat
    let havdalahStr: string | undefined;
    if (isShabbat) {
      // 8.5 degrees / ~35-42 minutes after sunset
      const tzeitDate = zman.tzeit();
      havdalahStr = formatTimeHHMM(tzeitDate);
    }

    // Parashat HaShavua
    let parasha: string | undefined;
    try {
      const sedra = new Sedra(hd.getFullYear(), true); // true = Israel
      // On Saturday itself use sedra.lookup(hd), on weekdays use lookupWeekday(hd)
      const parshaLookup = isShabbat ? sedra.lookup(hd) : (sedra.lookupWeekday(hd) || sedra.lookup(hd));
      if (parshaLookup && parshaLookup.parsha && parshaLookup.parsha.length > 0) {
        const parshaHeb = parshaLookup.parsha
          .map(p => stripNiqqud(Locale.gettext(p, 'he') || p))
          .join('-');
        parasha = `פרשת ${parshaHeb}`;
      }
    } catch {
      // Parasha calculation fallback
    }

    // Holidays and Rosh Chodesh
    let holidayName: string | undefined;
    try {
      const holidays = HebrewCalendar.getHolidaysOnDate(hd, true);
      if (holidays && holidays.length > 0) {
        holidayName = holidays.map(h => stripNiqqud(h.render('he'))).join(', ');
      }
    } catch {
      // Holiday lookup fallback
    }

    // Additional halachic times
    const sofZmanShmaGra = formatTimeHHMM(zman.sofZmanShma());
    const sofZmanTfillaGra = formatTimeHHMM(zman.sofZmanTfilla());
    const chatzot = formatTimeHHMM(zman.chatzot());
    const minchaGedola = formatTimeHHMM(zman.minchaGedola());
    const tzeitHakochavim = formatTimeHHMM(zman.tzeit());

    return {
      date,
      dateStr: formatDateYYYYMMDD(date),
      hebrewDate: hd.renderGematriya(),
      parasha,
      sunrise: sunriseStr,
      sunset: sunsetStr,
      candleLighting: candleLightingStr,
      havdalah: havdalahStr,
      sofZmanShmaGra,
      sofZmanTfillaGra,
      chatzot,
      minchaGedola,
      tzeitHakochavim,
      isErevShabbat,
      isShabbat,
      holidayName
    };
  }

  public static getZmanimRange(
    startDate: Date,
    daysCount: number,
    loc: LocationSettings
  ): DayZmanim[] {
    const results: DayZmanim[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(current.getTime() + i * 24 * 60 * 60 * 1000);
      results.push(this.getDayZmanim(d, loc));
    }

    return results;
  }
}
