import { fetchExercises } from './api.js';
import { storage } from './storage.js';
import { favoritesManager } from './favorites.js';
import { filterExercises, getUniqueValues } from './filters.js';
import { renderExerciseList, populateSelect, updateFavoriteButton } from './ui.js';
import { modal } from './modal.js';
import { workoutUI } from './workout-ui.js';

const state = {
    exercises: [],
    currentLang: storage.getLanguage(),
    showFavoritesOnly: false,
    inWorkoutMode: false
};

document.addEventListener('DOMContentLoaded', init);

async function init() {
    setupLanguage();
    setupEventListeners();
    await loadExercises();
}

function setupLanguage() {
    state.currentLang = storage.getLanguage();
    document.getElementById('lang-select').value = state.currentLang;
}

function setupEventListeners() {
    document.getElementById('search').addEventListener('input', applyFilters);
    document.getElementById('filter-category').addEventListener('change', applyFilters);
    document.getElementById('filter-equipment').addEventListener('change', applyFilters);
    document.getElementById('lang-select').addEventListener('change', handleLanguageChange);
    document.getElementById('fav-toggle').addEventListener('click', toggleFavoritesFilter);
    
    document.getElementById('modal-overlay').addEventListener('click', modal.close);
    document.getElementById('modal-close').addEventListener('click', modal.close);
    
    document.getElementById('exercise-list').addEventListener('click', handleExerciseListClick);
    
    document.getElementById('btn-workout-mode').addEventListener('click', toggleWorkoutMode);
}

function toggleWorkoutMode() {
    state.inWorkoutMode = !state.inWorkoutMode;
    const exerciseList = document.getElementById('exercise-list');
    const workoutContainer = document.getElementById('workout-container');
    const filters = document.querySelector('.filters');
    
    if (state.inWorkoutMode) {
        exerciseList.style.display = 'none';
        filters.style.display = 'none';
        workoutContainer.style.display = 'block';
        workoutUI.showWorkoutMode(workoutContainer, state.exercises);
    } else {
        exerciseList.style.display = 'flex';
        filters.style.display = 'flex';
        workoutContainer.style.display = 'none';
        workoutContainer.innerHTML = '';
    }
}

function handleExerciseListClick(event) {
    const favBtn = event.target.closest('[data-action="toggle-fav"]');
    if (favBtn) {
        event.stopPropagation();
        const id = favBtn.dataset.id;
        favoritesManager.toggle(id);
        updateFavCount();
        const card = favBtn.closest('.exercise-card');
        updateFavoriteButton(card, id);
        if (state.showFavoritesOnly) applyFilters();
        return;
    }
    
    const card = event.target.closest('.exercise-card');
    if (card) {
        const id = card.dataset.id;
        const exercise = state.exercises.find(ex => ex.id === id);
        if (exercise) modal.open(exercise, state.currentLang);
    }
}

async function loadExercises() {
    const loadingEl = document.getElementById('loading');
    
    try {
        state.exercises = await fetchExercises();
        populateFilters();
        updateFavCount();
        applyFilters();
        loadingEl.style.display = 'none';
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        loadingEl.innerHTML = `
            <div class="error-container">
                <div class="error-icon">❌</div>
                <h3>Не удалось загрузить упражнения</h3>
                <p>${error.message}</p>
                <div class="error-solutions">
                    <h4>Что можно сделать:</h4>
                    <ol>
                        <li>Проверьте подключение к интернету</li>
                        <li>Обновите страницу (F5 или Ctrl+R)</li>
                        <li>Попробуйте открыть через HTTPS (не file://)</li>
                        <li>Если используете Live Server - перезапустите его</li>
                    </ol>
                </div>
                <button class="btn-primary" onclick="location.reload()">🔄 Попробовать снова</button>
            </div>
        `;
        loadingEl.style.display = 'block';
    }
}

function populateFilters() {
    const categories = getUniqueValues(state.exercises, 'category');
    const equipments = getUniqueValues(state.exercises, 'equipment');
    
    populateSelect(document.getElementById('filter-category'), categories);
    populateSelect(document.getElementById('filter-equipment'), equipments);
}

function applyFilters() {
    const params = {
        search: document.getElementById('search').value,
        category: document.getElementById('filter-category').value,
        equipment: document.getElementById('filter-equipment').value,
        lang: state.currentLang,
        favoritesOnly: state.showFavoritesOnly,
        favorites: favoritesManager.getAll()
    };
    
    const filtered = filterExercises(state.exercises, params);
    renderExerciseList(document.getElementById('exercise-list'), filtered);
}

function handleLanguageChange(event) {
    state.currentLang = event.target.value;
    storage.setLanguage(state.currentLang);
    applyFilters();
}

function toggleFavoritesFilter() {
    state.showFavoritesOnly = !state.showFavoritesOnly;
    const btn = document.getElementById('fav-toggle');
    const icon = document.getElementById('fav-icon');
    
    btn.classList.toggle('active', state.showFavoritesOnly);
    icon.textContent = state.showFavoritesOnly ? '❤️' : '🤍';
    applyFilters();
}

function updateFavCount() {
    document.getElementById('fav-count').textContent = favoritesManager.count();
}
