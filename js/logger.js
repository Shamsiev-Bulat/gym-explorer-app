// Logger module - пишет ошибки в консоль и на страницу

const errorLog = [];
const MAX_LOGS = 50;

export const logger = {
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        
        console.log(logEntry);
        errorLog.push(logEntry);
        
        if (errorLog.length > MAX_LOGS) {
            errorLog.shift();
        }
        
        this.updateErrorDisplay();
    },
    
    error(message, errorObj = null) {
        let fullMessage = message;
        if (errorObj) {
            fullMessage += `: ${errorObj.message}`;
            console.error(errorObj);
        }
        this.log(fullMessage, 'error');
    },
    
    warn(message) {
        this.log(message, 'warn');
    },
    
    success(message) {
        this.log(message, 'success');
    },
    
    getLogs() {
        return errorLog.join('\n');
    },
    
    clear() {
        errorLog.length = 0;
        this.updateErrorDisplay();
    },
    
    showErrorContainer() {
        const container = document.getElementById('error-log-container');
        const logElement = document.getElementById('error-log');
        
        if (container && logElement) {
            logElement.textContent = this.getLogs() || 'Нет ошибок';
            container.style.display = 'block';
        }
    },
    
    updateErrorDisplay() {
        const logElement = document.getElementById('error-log');
        if (logElement && errorLog.length > 0) {
            logElement.textContent = this.getLogs();
        }
    },
    
    exportToFile() {
        const blob = new Blob([this.getLogs()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fit-exercises-log-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// Перехват глобальных ошибок
window.addEventListener('error', (event) => {
    logger.error(event.message, event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', event.reason);
});

// Добавляем кнопку для показа логов в консоль
console.log('📝 Logger initialized. Use logger.exportToFile() to save logs to file.');
