// Theme management
const ThemeManager = {
    init() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(this.currentTheme);
        this.createToggleButton();
        this.bindEvents();
    },

    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.innerHTML = '<span class="icon">🌙</span>';
        button.setAttribute('aria-label', 'Toggle dark mode');
        document.body.appendChild(button);
        this.updateButtonIcon();
    },

    bindEvents() {
        document.querySelector('.theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    },

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateButtonIcon();
        this.showNotification(`Modo ${this.currentTheme === 'dark' ? 'oscuro' : 'claro'} activado`);
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    },

    updateButtonIcon() {
        const icon = document.querySelector('.theme-toggle .icon');
        icon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
    },

    showNotification(message) {
        // Simple notification for theme change
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-soft);
            animation: slideInUp 0.3s ease;
            z-index: 1000;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
};

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}