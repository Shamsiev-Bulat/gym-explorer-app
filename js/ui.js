import { CONFIG } from './config.js';
import { favoritesManager } from './favorites.js';

export function renderExerciseList(container, exercises) {
    container.innerHTML = '';
    
    if (exercises.length === 0) {
        container.innerHTML = '<div class="no-results">Упражнения не найдены</div>';
        return;
    }
    
    const displayList = exercises.slice(0, CONFIG.MAX_RENDER_ITEMS);
    const fragment = document.createDocumentFragment();
    
    displayList.forEach(ex => {
        fragment.appendChild(createExerciseCard(ex));
    });
    
    container.appendChild(fragment);
    
    if (exercises.length > CONFIG.MAX_RENDER_ITEMS) {
        const more = document.createElement('div');
        more.className = 'no-results';
        more.textContent = `Показано ${CONFIG.MAX_RENDER_ITEMS} из ${exercises.length}. Уточните поиск.`;
        container.appendChild(more);
    }
}

function createExerciseCard(ex) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.dataset.id = ex.id;
    
    const isFav = favoritesManager.has(ex.id);
    
    card.innerHTML = `
        <img src="${CONFIG.BASE_URL}${ex.image}" alt="${ex.name}" class="card-image" loading="lazy">
        <div class="card-content">
            <h3>${ex.name}</h3>
            <div class="card-meta">
                <span class="badge">${ex.category}</span>
                <span class="badge">${ex.equipment}</span>
            </div>
            <p class="target">Цель: ${ex.target}</p>
        </div>
        <button class="fav-btn" data-action="toggle-fav" data-id="${ex.id}" aria-label="Добавить в избранное">
            ${isFav ? '❤️' : '🤍'}
        </button>
    `;
    
    return card;
}

export function updateFavoriteButton(card, id) {
    const btn = card.querySelector('.fav-btn');
    if (btn) {
        btn.textContent = favoritesManager.has(id) ? '❤️' : '🤍';
    }
}

export function populateSelect(selectElement, values) {
    values.forEach(value => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value.charAt(0).toUpperCase() + value.slice(1);
        selectElement.appendChild(opt);
    });
}
