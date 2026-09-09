import { timer } from './timer.js';
import { workoutManager } from './workout.js';
import { favoritesManager } from './favorites.js';

export const workoutUI = {
    showWorkoutMode(container, exercises) {
        container.innerHTML = `
            <div class="workout-setup">
                <h2>🏋️ Создание тренировки</h2>
                <p>Тренировка будет состоять из упражнений, добавленных в избранное.</p>
                <div class="selected-exercises" id="selected-exercises"></div>
                <div class="rest-time-setup">
                    <label>Время отдыха между подходами (секунды):</label>
                    <input type="number" id="rest-time" value="60" min="10" max="300" step="10">
                </div>
                <button class="btn-primary" id="start-workout">Начать тренировку</button>
                <button class="btn-secondary" id="cancel-workout">Отмена</button>
            </div>
        `;
        
        this.updateSelectedExercises();
        
        document.getElementById('start-workout').addEventListener('click', () => {
            const restTime = parseInt(document.getElementById('rest-time').value) || 60;
            this.startWorkout(container, exercises, restTime);
        });
        
        document.getElementById('cancel-workout').addEventListener('click', () => {
            container.innerHTML = '';
        });
    },
    
    updateSelectedExercises() {
        const container = document.getElementById('selected-exercises');
        const selected = favoritesManager.getAll();
        
        if (selected.length === 0) {
            container.innerHTML = '<p class="no-selection">⚠️ Добавь упражнения в избранное, чтобы создать тренировку</p>';
        } else {
            container.innerHTML = `
                <p>Выбрано упражнений: <strong>${selected.length}</strong></p>
                <ul class="exercise-list-preview">
                    ${selected.map(id => {
                        const ex = window.allExercises?.find(e => e.id === id);
                        return ex ? `<li>${ex.name}</li>` : '';
                    }).filter(Boolean).join('')}
                </ul>
            `;
        }
    },
    
    startWorkout(container, exercises, restTime) {
        const selectedIds = favoritesManager.getAll();
        const selected = exercises.filter(ex => selectedIds.includes(ex.id));
        
        if (selected.length === 0) {
            alert('Добавь упражнения в избранное!');
            return;
        }
        
        workoutManager.create(selected, restTime);
        window.allExercises = exercises;
        this.renderExerciseScreen(container);
    },
    
    renderExerciseScreen(container) {
        const workout = workoutManager.currentWorkout;
        if (!workout) return;
        
        const exercise = workout.exercises[workout.currentIndex];
        const sets = exercise.sets;
        const BASE_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';
        
        container.innerHTML = `
            <div class="workout-active">
                <div class="workout-header">
                    <button class="btn-small" id="prev-exercise" ${workout.currentIndex === 0 ? 'disabled' : ''}>← Назад</button>
                    <span class="exercise-counter">${workout.currentIndex + 1} / ${workout.exercises.length}</span>
                    <button class="btn-small" id="next-exercise" ${workout.currentIndex === workout.exercises.length - 1 ? 'disabled' : ''}>Вперёд →</button>
                </div>
                
                <div class="exercise-display">
                    <h2>${exercise.name}</h2>
                    <img src="${BASE_URL}${exercise.image}" alt="${exercise.name}" class="exercise-preview">
                    <div class="exercise-meta">
                        <span class="badge">${exercise.category}</span>
                        <span class="badge">${exercise.target}</span>
                    </div>
                </div>
                
                <div class="sets-tracker">
                    <h3>Подходы:</h3>
                    <div id="sets-list" class="sets-list">
                        ${sets.length === 0 ? '<p class="no-sets">Пока нет подходов</p>' : 
                            sets.map((set, idx) => `
                                <div class="set-item">
                                    <span>Подход ${idx + 1}</span>
                                    <span>${set.weight} кг × ${set.reps} раз</span>
                                    <button class="btn-remove" data-set="${idx}">×</button>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
                
                <div class="add-set-form">
                    <input type="number" id="set-weight" placeholder="Вес (кг)" class="input-small">
                    <input type="number" id="set-reps" placeholder="Раз" class="input-small">
                    <button class="btn-primary" id="add-set">Добавить подход</button>
                </div>
                
                <div class="rest-timer" id="rest-timer">
                    <button class="btn-rest" id="start-rest">⏱️ Отдых (${workout.restTime}с)</button>
                    <div class="timer-display" id="timer-display" style="display: none;">
                        <span class="time">00:00</span>
                        <button class="btn-small" id="cancel-rest">Отмена</button>
                    </div>
                </div>
                
                <div class="workout-controls">
                    <button class="btn-secondary" id="finish-workout">✅ Завершить тренировку</button>
                </div>
            </div>
        `;
        
        this.setupWorkoutEventListeners(container, exercises);
    },
    
    setupWorkoutEventListeners(container, exercises) {
        document.getElementById('prev-exercise')?.addEventListener('click', () => {
            if (workoutManager.prevExercise()) {
                this.renderExerciseScreen(container);
            }
        });
        
        document.getElementById('next-exercise')?.addEventListener('click', () => {
            if (workoutManager.nextExercise()) {
                this.renderExerciseScreen(container);
            }
        });
        
        document.getElementById('add-set')?.addEventListener('click', () => {
            const weight = parseFloat(document.getElementById('set-weight').value);
            const reps = parseInt(document.getElementById('set-reps').value);
            
            if (weight && reps) {
                workoutManager.addSet(weight, reps);
                document.getElementById('set-weight').value = '';
                document.getElementById('set-reps').value = '';
                this.renderExerciseScreen(container);
            }
        });
        
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const setIndex = parseInt(e.target.dataset.set);
                workoutManager.removeSet(setIndex);
                this.renderExerciseScreen(container);
            });
        });
        
        document.getElementById('start-rest')?.addEventListener('click', () => {
            this.startRestTimer(container);
        });
        
        document.getElementById('cancel-rest')?.addEventListener('click', () => {
            timer.stop();
            this.renderExerciseScreen(container);
        });
        
        document.getElementById('finish-workout')?.addEventListener('click', () => {
            if (confirm('Завершить тренировку?')) {
                workoutManager.finish();
                this.showWorkoutSummary(container);
            }
        });
    },
    
    startRestTimer(container) {
        const restTime = workoutManager.currentWorkout.restTime;
        
        document.getElementById('start-rest').style.display = 'none';
        document.getElementById('timer-display').style.display = 'flex';
        
        timer.start(restTime, 
            (seconds) => {
                const timeEl = document.querySelector('.time');
                if (timeEl) {
                    timeEl.textContent = timer.formatTime(seconds);
                    if (seconds <= 10 && seconds > 0) {
                        timeEl.classList.add('timer-urgent');
                    } else {
                        timeEl.classList.remove('timer-urgent');
                    }
                }
            },
            () => {
                if (navigator.vibrate) {
                    navigator.vibrate([200, 100, 200, 100, 200]);
                }
                alert('⏰ Отдых окончен! Время тренироваться 💪');
                this.renderExerciseScreen(container);
            }
        );
    },
    
    showWorkoutSummary(container) {
        const history = workoutManager.getHistory();
        const workout = history[0];
        
        if (!workout) {
            container.innerHTML = '<div class="workout-summary"><h2>Тренировка не сохранена</h2></div>';
            return;
        }
        
        const duration = Math.floor((new Date(workout.endTime) - new Date(workout.date)) / 1000 / 60);
        const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        
        container.innerHTML = `
            <div class="workout-summary">
                <h2>✅ Тренировка завершена!</h2>
                <div class="summary-stats">
                    <div class="stat">
                        <span class="stat-value">${workout.exercises.length}</span>
                        <span class="stat-label">Упражнений</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${totalSets}</span>
                        <span class="stat-label">Подходов</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${duration || 1}</span>
                        <span class="stat-label">Минут</span>
                    </div>
                </div>
                <div class="summary-exercises">
                    <h3>Выполненные упражнения:</h3>
                    ${workout.exercises.map(ex => `
                        <div class="summary-exercise">
                            <strong>${ex.name}</strong>
                            <span>${ex.sets.length} подх.</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-primary" id="new-workout">Новая тренировка</button>
                <button class="btn-secondary" id="close-summary">Закрыть</button>
            </div>
        `;
        
        document.getElementById('new-workout')?.addEventListener('click', () => {
            container.innerHTML = '';
            document.getElementById('exercise-list').style.display = 'flex';
            document.querySelector('.filters').style.display = 'flex';
        });
        
        document.getElementById('close-summary')?.addEventListener('click', () => {
            container.innerHTML = '';
            document.getElementById('exercise-list').style.display = 'flex';
            document.querySelector('.filters').style.display = 'flex';
        });
    }
};
