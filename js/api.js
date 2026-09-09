import { CONFIG } from './config.js';

const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest='
];

export async function fetchExercises() {
    // Сначала пробуем напрямую
    try {
        console.log('🔄 Попытка загрузки напрямую...');
        const response = await fetch(CONFIG.DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        console.log('✅ Данные загружены напрямую');
        return data;
    } catch (error) {
        console.warn('❌ Прямая загрузка не удалась:', error.message);
    }
    
    // Пробуем через CORS прокси
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        const proxy = CORS_PROXIES[i];
        const proxyUrl = proxy + encodeURIComponent(CONFIG.DATA_URL);
        
        try {
            console.log(`🔄 Попытка через прокси ${i + 1}/${CORS_PROXIES.length}...`);
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            console.log('✅ Данные загружены через прокси');
            return data;
        } catch (error) {
            console.warn(`❌ Прокси ${i + 1} не сработал:`, error.message);
        }
    }
    
    // Если всё не удалось
    throw new Error('Не удалось загрузить данные ни одним из способов. Проверьте подключение к интернету.');
}
