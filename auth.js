// Authentication System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkSession();
        this.bindEvents();
        this.initializeUI();
    }

    bindEvents() {
        // Modal controls
        const modal = document.getElementById('authModal');
        const loginBtn = document.getElementById('loginBtn');
        const closeBtn = document.querySelector('.close');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) {
            loginBtn.onclick = () => this.openModal();
        }

        if (closeBtn) {
            closeBtn.onclick = () => this.closeModal();
        }

        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Close modal on outside click
        window.onclick = (event) => {
            if (event.target === modal) {
                this.closeModal();
            }
        };
    }

    openModal() {
        document.getElementById('authModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('authModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}Form`);
        });
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Simulate API call (in production, this would be a real API)
        if (this.validateEmail(email) && password.length >= 6) {
            const user = {
                id: this.generateId(),
                email: email,
                name: email.split('@')[0],
                joinDate: new Date().toISOString(),
                analysisCount: 0,
                lastAnalysis: null
            };

            this.setSession(user, rememberMe);
            this.showNotification('¡Bienvenido de vuelta!', 'success');
            this.closeModal();
            this.updateUI(user);
        } else {
            this.showNotification('Credenciales inválidas', 'error');
        }
    }

    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('Email inválido', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        // Simulate registration
        const user = {
            id: this.generateId(),
            name: name,
            email: email,
            joinDate: new Date().toISOString(),
            analysisCount: 0,
            lastAnalysis: null
        };

        this.setSession(user, true);
        this.showNotification('¡Cuenta creada exitosamente!', 'success');
        this.closeModal();
        this.updateUI(user);
    }

    setSession(user, persist = false) {
        this.currentUser = user;
        const storage = persist ? localStorage : sessionStorage;
        storage.setItem('atsUser', JSON.stringify(user));
    }

    checkSession() {
        const localUser = localStorage.getItem('atsUser');
        const sessionUser = sessionStorage.getItem('atsUser');
        
        if (localUser) {
            this.currentUser = JSON.parse(localUser);
            this.updateUI(this.currentUser);
        } else if (sessionUser) {
            this.currentUser = JSON.parse(sessionUser);
            this.updateUI(this.currentUser);
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('atsUser');
        sessionStorage.removeItem('atsUser');
        this.showNotification('Sesión cerrada', 'info');
        this.initializeUI();
    }

    updateUI(user) {
        const loginBtn = document.getElementById('loginBtn');
        const userProfile = document.getElementById('userProfile');
        const userName = document.querySelector('.user-name');
        const userAvatar = document.querySelector('.user-avatar');

        if (user) {
            loginBtn.style.display = 'none';
            userProfile.style.display = 'flex';
            userName.textContent = user.name;
            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff`;
            
            // Enable premium features
            this.enablePremiumFeatures();
        } else {
            loginBtn.style.display = 'block';
            userProfile.style.display = 'none';
        }
    }

    initializeUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userProfile = document.getElementById('userProfile');
        
        if (this.currentUser) {
            loginBtn.style.display = 'none';
            userProfile.style.display = 'flex';
        } else {
            loginBtn.style.display = 'block';
            userProfile.style.display = 'none';
        }
    }

    enablePremiumFeatures() {
        // Enable advanced features for logged-in users
        console.log('Premium features enabled for user:', this.currentUser.name);
        // Add premium badge, unlimited analyses, etc.
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    generateId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 8px;
            z-index: 2000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Track user analytics
    trackAnalysis() {
        if (this.currentUser) {
            this.currentUser.analysisCount++;
            this.currentUser.lastAnalysis = new Date().toISOString();
            
            // Update storage
            const storage = localStorage.getItem('atsUser') ? localStorage : sessionStorage;
            storage.setItem('atsUser', JSON.stringify(this.currentUser));
        }
    }

    getUserAnalytics() {
        if (!this.currentUser) return null;
        
        return {
            totalAnalyses: this.currentUser.analysisCount,
            memberSince: new Date(this.currentUser.joinDate).toLocaleDateString(),
            lastActive: this.currentUser.lastAnalysis ? 
                new Date(this.currentUser.lastAnalysis).toLocaleDateString() : 'Nueva cuenta'
        };
    }
}

// Initialize authentication system
const authManager = new AuthManager();
window.authManager = authManager;