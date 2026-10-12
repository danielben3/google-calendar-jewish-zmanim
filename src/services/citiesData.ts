import { CityInfo, LocationSettings } from '../types';

export const CITIES_DATA: CityInfo[] = [
  { name: 'ירושלים', lat: 31.7683, lon: 35.2137, tzid: 'Asia/Jerusalem', candleLightingMinutes: 40, geonameid: 281184 },
  { name: 'תל אביב - יפו', lat: 32.0853, lon: 34.7818, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 293397 },
  { name: 'בני ברק', lat: 32.0833, lon: 34.8333, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 295350 },
  { name: 'חיפה', lat: 32.7940, lon: 34.9896, tzid: 'Asia/Jerusalem', candleLightingMinutes: 30, geonameid: 294801 },
  { name: 'פתח תקווה', lat: 32.0871, lon: 34.8875, tzid: 'Asia/Jerusalem', candleLightingMinutes: 40, geonameid: 293918 },
  { name: 'אשדוד', lat: 31.8014, lon: 34.6435, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 295620 },
  { name: 'באר שבע', lat: 31.2530, lon: 34.7915, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 295530 },
  { name: 'נתניה', lat: 32.3215, lon: 34.8532, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 294071 },
  { name: 'חולון', lat: 32.0158, lon: 34.7874, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 294833 },
  { name: 'ראשון לציון', lat: 31.9730, lon: 34.7925, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 293703 },
  { name: 'בית שמש', lat: 31.7470, lon: 34.9881, tzid: 'Asia/Jerusalem', candleLightingMinutes: 40, geonameid: 295393 },
  { name: 'מודיעין עילית', lat: 31.9317, lon: 35.0442, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 8303866 },
  { name: 'מודיעין-מכבים-רעות', lat: 31.8903, lon: 35.0104, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 8303866 },
  { name: 'רחובות', lat: 31.8928, lon: 34.8113, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 293670 },
  { name: 'הרצליה', lat: 32.1663, lon: 34.8432, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 294895 },
  { name: 'כפר סבא', lat: 32.1750, lon: 34.9069, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 294520 },
  { name: 'רעננה', lat: 32.1848, lon: 34.8713, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 293722 },
  { name: 'אשקלון', lat: 31.6688, lon: 34.5743, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 295610 },
  { name: 'צפת', lat: 32.9646, lon: 35.4960, tzid: 'Asia/Jerusalem', candleLightingMinutes: 30, geonameid: 293481 },
  { name: 'טבריה', lat: 32.7959, lon: 35.5312, tzid: 'Asia/Jerusalem', candleLightingMinutes: 30, geonameid: 293322 },
  { name: 'אילת', lat: 29.5577, lon: 34.9519, tzid: 'Asia/Jerusalem', candleLightingMinutes: 20, geonameid: 295277 },
  { name: 'ניו יורק (ארה״ב)', lat: 40.7128, lon: -74.0060, tzid: 'America/New_York', candleLightingMinutes: 18, geonameid: 5128581 },
  { name: 'לונדון (בריטניה)', lat: 51.5074, lon: -0.1278, tzid: 'Europe/London', candleLightingMinutes: 18, geonameid: 2643743 },
  { name: 'פריז (צרפת)', lat: 48.8566, lon: 2.3522, tzid: 'Europe/Paris', candleLightingMinutes: 18, geonameid: 2988507 }
];

export const DEFAULT_LOCATION: LocationSettings = {
  cityName: 'ירושלים',
  lat: 31.7683,
  lon: 35.2137,
  tzid: 'Asia/Jerusalem',
  candleLightingMinutes: 40,
  autoLocation: true,
  geonameid: 281184
};

export const DEFAULT_DISPLAY_SETTINGS = {
  showSunrise: true,
  showSunset: true,
  showShabbat: true,
  showParasha: true,
  showZmanimBar: true,
  showDayBadges: true,
  allDayEventFormat: true,
  exportMonthsAhead: 6
};

// Find the closest city based on coordinates
export function findClosestCity(lat: number, lon: number): CityInfo {
  let closest = CITIES_DATA[0];
  let minDistance = Infinity;

  for (const city of CITIES_DATA) {
    const dLat = city.lat - lat;
    const dLon = city.lon - lon;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return closest;
}

/**
 * Returns direct perpetual WebCal feed URLs for Google Calendar subscription on Mobile & Desktop
 */
export function getSubscriptionFeedUrls(location: LocationSettings) {
  const geonameid = location.geonameid || 281184;
  const candleOffset = location.candleLightingMinutes || 20;

  // Shabbat + Parashat Hashavua feed
  const shabbatFeedUrl = `https://download.hebcal.com/shabbat.ics?geonameid=${geonameid}&m=${candleOffset}&s=on&c=on&b=${candleOffset}&lg=he`;

  // Daily Sunrise & Sunset feed
  const sunFeedUrl = `https://download.hebcal.com/sunrs.ics?geonameid=${geonameid}`;

  // One-click Google Calendar web subscription intent link
  const gcalSubscribeShabbatLink = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(shabbatFeedUrl)}`;
  const gcalSubscribeSunLink = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(sunFeedUrl)}`;

  return {
    shabbatFeedUrl,
    sunFeedUrl,
    gcalSubscribeShabbatLink,
    gcalSubscribeSunLink
  };
}
