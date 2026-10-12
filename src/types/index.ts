export interface LocationSettings {
  cityName: string;
  lat: number;
  lon: number;
  tzid: string;
  candleLightingMinutes: number;
  autoLocation: boolean;
  geonameid?: number;
}

export interface DisplaySettings {
  showSunrise: boolean;
  showSunset: boolean;
  showShabbat: boolean;
  showParasha: boolean;
  showZmanimBar: boolean;
  showDayBadges: boolean;
  allDayEventFormat: boolean;
  exportMonthsAhead: number;
}

export interface DayZmanim {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  hebrewDate: string;
  parasha?: string;
  sunrise: string; // HH:mm
  sunset: string; // HH:mm
  candleLighting?: string; // HH:mm
  havdalah?: string; // HH:mm
  sofZmanShmaGra: string;
  sofZmanTfillaGra: string;
  chatzot: string;
  minchaGedola: string;
  tzeitHakochavim: string;
  isErevShabbat: boolean;
  isShabbat: boolean;
  holidayName?: string;
  fastName?: string;
}

export interface CityInfo {
  name: string;
  lat: number;
  lon: number;
  tzid: string;
  candleLightingMinutes: number;
  geonameid?: number;
}
