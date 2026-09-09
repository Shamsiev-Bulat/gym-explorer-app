import { storage } from './storage.js';

let favorites = storage.getFavorites();

export const favoritesManager = {
    getAll() {
        return [...favorites];
    },
    
    has(id) {
        return favorites.includes(id);
    },
    
    toggle(id) {
        if (this.has(id)) {
            favorites = favorites.filter(favId => favId !== id);
        } else {
            favorites.push(id);
        }
        storage.setFavorites(favorites);
        return this.has(id);
    },
    
    count() {
        return favorites.length;
    }
};
