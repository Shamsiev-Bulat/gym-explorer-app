import { storage } from './storage.js';

const STORAGE_KEY = 'workoutHistory';

export const workoutManager = {
    currentWorkout: null,
    restTime: 60,
    
    create(exercises, restTime = 60) {
        this.currentWorkout = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            exercises: exercises.map(ex => ({
                ...ex,
                sets: [],
                completed: false
            })),
            currentIndex: 0,
            restTime
        };
        this.restTime = restTime;
        return this.currentWorkout;
    },
    
    addSet(weight, reps) {
        if (!this.currentWorkout) return;
        
        const currentExercise = this.currentWorkout.exercises[this.currentWorkout.currentIndex];
        currentExercise.sets.push({
            weight,
            reps,
            timestamp: new Date().toISOString()
        });
    },
    
    removeSet(setIndex) {
        if (!this.currentWorkout) return;
        
        const currentExercise = this.currentWorkout.exercises[this.currentWorkout.currentIndex];
        currentExercise.sets.splice(setIndex, 1);
    },
    
    nextExercise() {
        if (!this.currentWorkout) return false;
        
        if (this.currentWorkout.currentIndex < this.currentWorkout.exercises.length - 1) {
            this.currentWorkout.currentIndex++;
            return true;
        }
        return false;
    },
    
    prevExercise() {
        if (!this.currentWorkout) return false;
        
        if (this.currentWorkout.currentIndex > 0) {
            this.currentWorkout.currentIndex--;
            return true;
        }
        return false;
    },
    
    finish() {
        if (!this.currentWorkout) return null;
        
        this.currentWorkout.endTime = new Date().toISOString();
        this.saveToHistory(this.currentWorkout);
        const finished = this.currentWorkout;
        this.currentWorkout = null;
        return finished;
    },
    
    saveToHistory(workout) {
        const history = this.getHistory();
        history.unshift(workout);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
    },
    
    getHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    },
    
    clearCurrent() {
        this.currentWorkout = null;
    }
};
