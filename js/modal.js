import { CONFIG } from './config.js';

export const modal = {
    open(ex, lang) {
        document.getElementById('modal-title').textContent = ex.name;
        
        const gifEl = document.getElementById('modal-gif');
        gifEl.src = CONFIG.BASE_URL + ex.gif_url;
        gifEl.onerror = function() {
            this.src = CONFIG.BASE_URL + ex.image;
        };
        
        const steps = ex.instruction_steps?.[lang] || ex.instruction_steps?.['en'] || [];
        const instructionText = ex.instructions?.[lang] || ex.instructions?.['en'] || 'Инструкция недоступна';
        
        const stepsHtml = steps.length > 0 
            ? '<ol class="steps-list">' + steps.map(step => `<li>${step}</li>`).join('') + '</ol>'
            : `<p class="instruction-text">${instructionText}</p>`;
        
        const secondary = ex.secondary_muscles?.join(', ') || 'Нет данных';
        
        document.getElementById('modal-info').innerHTML = `
            <div class="meta-tags">
                <span class="tag">${ex.category}</span>
                <span class="tag">${ex.equipment}</span>
                <span class="tag target-tag">Цель: ${ex.target}</span>
            </div>
            <p class="secondary">Вторичные мышцы: ${secondary}</p>
            <h3>Инструкция</h3>
            ${stepsHtml}
            <p class="attribution">${ex.attribution}</p>
        `;
        
        document.getElementById('modal').classList.add('active');
        document.getElementById('modal-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    close() {
        document.getElementById('modal').classList.remove('active');
        document.getElementById('modal-overlay').classList.remove('active');
        document.body.style.overflow = '';
    }
};
