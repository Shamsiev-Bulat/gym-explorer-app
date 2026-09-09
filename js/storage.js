import { CONFIG } from './config.js';

export const storage = {
    getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES) || '[]');
        } catch {
            return [];
        }
    },
    
    setFavorites(favorites) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    },
    
    getLanguage() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.LANGUAGE) || CONFIG.DEFAULT_LANG;
    },
    
    setLanguage(lang) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, lang);
    }
};
