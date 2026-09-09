import { fetchExercises } from './api.js';
import { storage } from './storage.js';
import { favoritesManager } from './favorites.js';
import { filterExercises, getUniqueValues } from './filters.js';
import { renderExerciseList, populateSelect, updateFavoriteButton } from './ui.js';
import { modal } from './modal.js';

const state = {
    exercises: [],
    currentLang: storage.getLanguage(),
    showFavoritesOnly: false
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
    try {
        state.exercises = await fetchExercises();
        populateFilters();
        updateFavCount();
        applyFilters();
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        document.getElementById('loading').innerHTML = 
            '❌ Ошибка загрузки данных.<br>Проверьте подключение к интернету.';
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
