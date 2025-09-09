// script.js
// Import the functions you need from the SDKs you need

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoQcPq9ftoTfE8Wm7TOOcol0c_XPBXRpE",
  authDomain: "asbclubs-40fe1.firebaseapp.com",
  projectId: "asbclubs-40fe1",
  storageBucket: "asbclubs-40fe1.firebasestorage.app",
  messagingSenderId: "534365161502",
  appId: "1:534365161502:web:940ee13b2b3f105b65860f",
  measurementId: "G-WCSQQDHHR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { 
  getAuth, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail 
} from "firebase/auth";
import { app } from "./firebase-config"; // Import your Firebase app instance

class LoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.getElementById('loginBtn');
        this.rememberCheckbox = document.getElementById('remember');
        this.auth = getAuth(app);
        this.googleProvider = new GoogleAuthProvider();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadRememberedEmail();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.emailInput.addEventListener('focus', () => this.clearError('email'));
        this.passwordInput.addEventListener('focus', () => this.clearError('password'));
        this.emailInput.addEventListener('input', () => this.handleInputChange('email'));
        this.passwordInput.addEventListener('input', () => this.handleInputChange('password'));
        
        const googleBtn = document.querySelector('.google-btn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }
        
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => this.handleForgotPassword(e));
        }
        
        const signUpLink = document.querySelector('.signup-link');
        if (signUpLink) {
            signUpLink.addEventListener('click', (e) => this.handleSignUpClick(e));
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            this.shakeForm();
            return;
        }
        
        this.setLoadingState(true);
        
        try {
            const email = this.emailInput.value.trim();
            const password = this.passwordInput.value;
            
            const userCredential = await signInWithEmailAndPassword(
                this.auth, 
                email, 
                password
            );
            
            this.handleLoginSuccess(userCredential.user);
        } catch (error) {
            this.handleFirebaseError(error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    // Validation methods remain the same as your original
    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showError('email', 'Email address is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError('email', 'Please enter a valid email address');
            return false;
        }
        
        this.showSuccess('email');
        return true;
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showError('password', 'Password is required');
            return false;
        }
        
        if (password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters');
            return false;
        }
        
        this.showSuccess('password');
        return true;
    }
    
    async handleGoogleSignIn() {
        try {
            this.setLoadingState(true);
            const result = await signInWithPopup(this.auth, this.googleProvider);
            this.handleLoginSuccess(result.user);
        } catch (error) {
            this.handleFirebaseError(error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async handleForgotPassword(e) {
        e.preventDefault();
        const email = this.emailInput.value.trim();
        
        if (!email) {
            this.showError('email', 'Please enter your email first');
            return;
        }
        
        if (!this.validateEmail()) {
            return;
        }
        
        try {
            this.setLoadingState(true);
            await sendPasswordResetEmail(this.auth, email);
            this.showSuccessMessage(`Password reset email sent to ${email}`);
        } catch (error) {
            this.handleFirebaseError(error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    handleSignUpClick(e) {
        e.preventDefault();
        window.location.href = 'signup.html'; // Redirect to signup page
    }
    
    handleFirebaseError(error) {
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No user found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many attempts. Account temporarily locked.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email format.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
        }
        
        this.showErrorMessage(errorMessage);
    }
    
    handleLoginSuccess(user) {
        if (this.rememberCheckbox.checked) {
            this.saveRememberedEmail(user.email);
        } else {
            this.clearRememberedEmail();
        }
        
        this.showSuccessMessage('Login successful! Redirecting...');
        
        // Store user data in session or redirect
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    
    // UI Helper methods (unchanged from your original)
    showError(field, message) {
        const input = document.getElementById(field);
        const errorElement = document.getElementById(`${field}Error`);
        
        input.classList.add('error');
        input.classList.remove('success');
        errorElement.textContent = message;
        
        input.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
    
    showSuccess(field) {
        const input = document.getElementById(field);
        const errorElement = document.getElementById(`${field}Error`);
        
        input.classList.remove('error');
        input.classList.add('success');
        errorElement.textContent = '';
    }
    
    clearError(field) {
        const input = document.getElementById(field);
        const errorElement = document.getElementById(`${field}Error`);
        
        input.classList.remove('error');
        errorElement.textContent = '';
    }
    
    handleInputChange(field) {
        const input = document.getElementById(field);
        if (input.classList.contains('error') && input.value.trim()) {
            this.clearError(field);
        }
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.loginBtn.classList.add('loading');
            this.loginBtn.disabled = true;
            this.form.classList.add('loading');
        } else {
            this.loginBtn.classList.remove('loading');
            this.loginBtn.disabled = false;
            this.form.classList.remove('loading');
        }
    }
    
    shakeForm() {
        this.form.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.form.style.animation = '';
        }, 500);
    }
    
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }
    
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }
    
    showMessage(message, type) {
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message-toast ${type}`;
        messageElement.textContent = message;
        
        Object.assign(messageElement.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            zIndex: '1000',
            animation: 'slideInRight 0.3s ease-out',
            backgroundColor: type === 'success' ? '#48bb78' : '#e53e3e',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        });
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    messageElement.remove();
                }, 300);
            }
        }, 4000);
    }
    
    saveRememberedEmail(email) {
        localStorage.setItem('rememberedEmail', email);
    }
    
    loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            this.emailInput.value = rememberedEmail;
            this.rememberCheckbox.checked = true;
        }
    }
    
    clearRememberedEmail() {
        localStorage.removeItem('rememberedEmail');
    }
}

// Add animation styles
const additionalStyles = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    .message-toast.info {
        background-color: #4299e1 !important;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LoginForm();
});