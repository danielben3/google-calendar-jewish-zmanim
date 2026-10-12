import { LocationSettings, DisplaySettings } from '../types';
import { DEFAULT_LOCATION, DEFAULT_DISPLAY_SETTINGS } from './citiesData';

const LOCATION_KEY = 'jewish_calendar_location';
const DISPLAY_KEY = 'jewish_calendar_display';

export class StorageService {
  public static async getLocation(): Promise<LocationSettings> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return new Promise((resolve) => {
        chrome.storage.sync.get([LOCATION_KEY], (result) => {
          if (result && result[LOCATION_KEY]) {
            resolve(result[LOCATION_KEY]);
          } else {
            resolve(DEFAULT_LOCATION);
          }
        });
      });
    }

    try {
      const saved = localStorage.getItem(LOCATION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // LocalStorage access fallback
    }
    return DEFAULT_LOCATION;
  }

  public static async saveLocation(loc: LocationSettings): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ [LOCATION_KEY]: loc }, () => resolve());
      });
    }

    try {
      localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
    } catch {
      // LocalStorage access fallback
    }
  }

  public static async getDisplaySettings(): Promise<DisplaySettings> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return new Promise((resolve) => {
        chrome.storage.sync.get([DISPLAY_KEY], (result) => {
          if (result && result[DISPLAY_KEY]) {
            resolve({ ...DEFAULT_DISPLAY_SETTINGS, ...result[DISPLAY_KEY] });
          } else {
            resolve(DEFAULT_DISPLAY_SETTINGS);
          }
        });
      });
    }

    try {
      const saved = localStorage.getItem(DISPLAY_KEY);
      if (saved) return { ...DEFAULT_DISPLAY_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // LocalStorage access fallback
    }
    return DEFAULT_DISPLAY_SETTINGS;
  }

  public static async saveDisplaySettings(settings: DisplaySettings): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ [DISPLAY_KEY]: settings }, () => resolve());
      });
    }

    try {
      localStorage.setItem(DISPLAY_KEY, JSON.stringify(settings));
    } catch {
      // LocalStorage access fallback
    }
  }
}
