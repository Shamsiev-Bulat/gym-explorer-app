export const timer = {
    intervalId: null,
    seconds: 0,
    callback: null,
    
    start(seconds, onTick, onComplete) {
        this.seconds = seconds;
        this.callback = { onTick, onComplete };
        this.onTick();
        
        this.intervalId = setInterval(() => {
            this.seconds--;
            this.onTick();
            
            if (this.seconds <= 0) {
                this.complete();
            }
        }, 1000);
    },
    
    onTick() {
        if (this.callback?.onTick) {
            this.callback.onTick(this.seconds);
        }
    },
    
    complete() {
        this.stop();
        if (this.callback?.onComplete) {
            this.callback.onComplete();
        }
    },
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },
    
    pause() {
        this.stop();
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};
