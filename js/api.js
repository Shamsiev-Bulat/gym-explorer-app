import { CONFIG } from './config.js';

export async function fetchExercises() {
    const response = await fetch(CONFIG.DATA_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch exercises: ${response.status}`);
    }
    return response.json();
}
