import { describe, it, expect } from 'vitest';
import { ZmanimService, stripNiqqud, formatTimeHHMM, formatDateYYYYMMDD } from '../src/services/zmanimService';
import { DEFAULT_LOCATION, CITIES_DATA, findClosestCity } from '../src/services/citiesData';

describe('ZmanimService', () => {
  it('calculates sunrise, sunset, and Hebrew date for Jerusalem', () => {
    const testDate = new Date('2026-10-12T12:00:00Z');
    const zmanim = ZmanimService.getDayZmanim(testDate, DEFAULT_LOCATION);

    expect(zmanim.hebrewDate).toBeDefined();
    expect(zmanim.hebrewDate).toContain('תשפ״ז');
    expect(zmanim.sunrise).toMatch(/^\d{2}:\d{2}$/);
    expect(zmanim.sunset).toMatch(/^\d{2}:\d{2}$/);
    expect(zmanim.parasha).toMatch(/^פרשת /);
  });

  it('calculates Friday candle lighting and Saturday havdalah correctly', () => {
    // 2026-10-16 is Friday, 2026-10-17 is Saturday
    const friday = new Date('2026-10-16T10:00:00Z');
    const saturday = new Date('2026-10-17T10:00:00Z');

    const fridayZmanim = ZmanimService.getDayZmanim(friday, DEFAULT_LOCATION);
    expect(fridayZmanim.isErevShabbat).toBe(true);
    expect(fridayZmanim.candleLighting).toBeDefined();
    expect(fridayZmanim.candleLighting).toMatch(/^\d{2}:\d{2}$/);

    const saturdayZmanim = ZmanimService.getDayZmanim(saturday, DEFAULT_LOCATION);
    expect(saturdayZmanim.isShabbat).toBe(true);
    expect(saturdayZmanim.havdalah).toBeDefined();
    expect(saturdayZmanim.havdalah).toMatch(/^\d{2}:\d{2}$/);
    expect(saturdayZmanim.parasha).toBeDefined();
  });

  it('finds closest city accurately', () => {
    // Coordinates close to Tel Aviv (32.08, 34.78)
    const city = findClosestCity(32.08, 34.78);
    expect(city.name).toContain('תל אביב');
  });

  it('generates a range of days without errors', () => {
    const startDate = new Date('2026-10-12T10:00:00Z');
    const range = ZmanimService.getZmanimRange(startDate, 7, DEFAULT_LOCATION);

    expect(range.length).toBe(7);
    expect(range[0].dateStr).toBe(formatDateYYYYMMDD(startDate));
    expect(range.some(d => d.isErevShabbat)).toBe(true);
    expect(range.some(d => d.isShabbat)).toBe(true);
  });

  it('strips niqqud properly', () => {
    expect(stripNiqqud('בְּרֵאשִׁית')).toBe('בראשית');
    expect(stripNiqqud('נֹחַ')).toBe('נח');
  });
});
