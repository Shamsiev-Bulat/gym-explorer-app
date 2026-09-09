import { logger } from './logger.js';  // <-- ДОБАВЬ ЭТУ СТРОКУ В САМОЕ НАЧАЛО
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
    logger.log('Application initialized');
    setupLanguage();
    setupEventListeners();
    await loadExercises();
}

function setupLanguage() {
    state.currentLang = storage.getLanguage();
    document.getElementById('lang-select').value = state.currentLang;
    logger.log(`Language set to: ${state.currentLang}`);
}

function setupEventListeners() {
    try {
        const searchInput = document.getElementById('search');
        const filterCategory = document.getElementById('filter-category');
        const filterEquipment = document.getElementById('filter-equipment');
        const langSelect = document.getElementById('lang-select');
        const favToggle = document.getElementById('fav-toggle');
        const modalOverlay = document.getElementById('modal-overlay');
        const modalClose = document.getElementById('modal-close');
        const exerciseList = document.getElementById('exercise-list');
        const btnWorkoutMode = document.getElementById('btn-workout-mode');
        
        if (!btnWorkoutMode) {
            throw new Error('Element #btn-workout-mode not found in HTML');
        }
        
        searchInput?.addEventListener('input', applyFilters);
        filterCategory?.addEventListener('change', applyFilters);
        filterEquipment?.addEventListener('change', applyFilters);
        langSelect?.addEventListener('change', handleLanguageChange);
        favToggle?.addEventListener('click', toggleFavoritesFilter);
        
        modalOverlay?.addEventListener('click', modal.close);
        modalClose?.addEventListener('click', modal.close);
        
        exerciseList?.addEventListener('click', handleExerciseListClick);
        
        btnWorkoutMode.addEventListener('click', toggleWorkoutMode);
        
        logger.log('All event listeners attached successfully');
    } catch (error) {
        logger.error('Failed to setup event listeners', error);
    }
}

function toggleWorkoutMode() {
    logger.log('Toggling workout mode');
    state.inWorkoutMode = !state.inWorkoutMode;
    const exerciseList = document.getElementById('exercise-list');
    const workoutContainer = document.getElementById('workout-container');
    const filters = document.querySelector('.filters');
    
    if (state.inWorkoutMode) {
        exerciseList.style.display = 'none';
        filters.style.display = 'none';
        workoutContainer.style.display = 'block';
        workoutUI.showWorkoutMode(workoutContainer, state.exercises);
        logger.log('Workout mode activated');
    } else {
        exerciseList.style.display = 'flex';
        filters.style.display = 'flex';
        workoutContainer.style.display = 'none';
        workoutContainer.innerHTML = '';
        logger.log('Workout mode deactivated');
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
        if (exercise) {
            logger.log(`Opening exercise: ${exercise.name}`);
            modal.open(exercise, state.currentLang);
        }
    }
}

async function loadExercises() {
    const loadingEl = document.getElementById('loading');
    logger.log('Starting to load exercises...');
    
    try {
        state.exercises = await fetchExercises();
        logger.success(`Loaded ${state.exercises.length} exercises`);
        populateFilters();
        updateFavCount();
        applyFilters();
        loadingEl.style.display = 'none';
    } catch (error) {
        logger.error('Failed to load exercises', error);
        loadingEl.innerHTML = `
            <div class="error-container">
                <div class="error-icon">❌</div>
                <h3>Не удалось загрузить упражнения</h3>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="location.reload()">🔄 Попробовать снова</button>
                <button class="btn-secondary" onclick="logger.showErrorContainer()"> Показать лог</button>
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
    
    logger.log(`Filters populated: ${categories.length} categories, ${equipments.length} equipment types`);
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
    logger.log(`Filters applied: ${filtered.length} exercises shown`);
}

function handleLanguageChange(event) {
    state.currentLang = event.target.value;
    storage.setLanguage(state.currentLang);
    applyFilters();
    logger.log(`Language changed to: ${state.currentLang}`);
}

function toggleFavoritesFilter() {
    state.showFavoritesOnly = !state.showFavoritesOnly;
    const btn = document.getElementById('fav-toggle');
    const icon = document.getElementById('fav-icon');
    
    btn.classList.toggle('active', state.showFavoritesOnly);
    icon.textContent = state.showFavoritesOnly ? '❤️' : '🤍';
    applyFilters();
    logger.log(`Favorites filter: ${state.showFavoritesOnly ? 'ON' : 'OFF'}`);
}

function updateFavCount() {
    document.getElementById('fav-count').textContent = favoritesManager.count();
}

// Делаем logger доступным глобально для кнопок
window.logger = logger;
