import { StorageService } from '../services/storageService';
import { DEFAULT_LOCATION, DEFAULT_DISPLAY_SETTINGS } from '../services/citiesData';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default storage settings on initial install
    const existingLoc = await StorageService.getLocation();
    if (!existingLoc || !existingLoc.cityName) {
      await StorageService.saveLocation(DEFAULT_LOCATION);
    }
    const existingDisp = await StorageService.getDisplaySettings();
    if (!existingDisp) {
      await StorageService.saveDisplaySettings(DEFAULT_DISPLAY_SETTINGS);
    }
    console.log('Jewish Halachic Times extension installed successfully.');
  }
});
