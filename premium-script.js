// Premium Authentication System
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initPasswordToggle();
    initForms();
    checkRememberedUser();
    
    // Check if coming from signup with success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('signupSuccess')) {
        showToast('Account created successfully! Please login.', 'success');
    }
});

// Password visibility toggle: single implementation is defined later in this file

// Initialize form submissions
function initForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked;
    
    // Basic validation
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const API_BASE = (typeof window !== 'undefined' && window.API_BASE_URL)
            || 'http://localhost:3000';
        const resp = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await resp.json();
        
        if (data.success) {
            // Remember user if checkbox is checked
            if (remember) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Save login state
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userName', data.user.name);
            
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (err) {
        console.error('Login error:', err);
        showToast('Login failed', 'error');
    }
}

// Handle Signup
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const course = document.getElementById('course').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const plan = 'starter';
    
    // Validation
    if (!name || !email || !course || !password || !confirmPassword) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    // Password rules:
    // - Must be at least 6 characters
    // - Must not be only numbers
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    if (/^\d+$/.test(password)) {
        showToast('Password cannot be only numbers', 'error');
        return;
    }
    
    try {
        const API_BASE = (typeof window !== 'undefined' && window.API_BASE_URL)
            || 'http://localhost:3000';
        const resp = await fetch(`${API_BASE}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone, course, plan })
        });
        const data = await resp.json();
        
        if (data.success) {
            // Clear form
            e.target.reset();
            
            // Show success and redirect
            showToast('Account created successfully!', 'success');
            
            setTimeout(() => {
                window.location.href = 'login.html?signupSuccess=1';
            }, 1500);
        } else {
            showToast(data.message || 'Signup failed', 'error');
        }
    } catch (err) {
        console.error('Signup error:', err);
        showToast('Signup failed', 'error');
    }
}

// Check for remembered user
function checkRememberedUser() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const emailInput = document.getElementById('email');
    const rememberCheckbox = document.getElementById('remember');
    
    if (rememberedEmail && emailInput && rememberCheckbox) {
        emailInput.value = rememberedEmail;
        rememberCheckbox.checked = true;
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.getElementById('premiumToast');
    
    // Set message and type
    toast.textContent = message;
    
    // Set color based on type
    toast.style.borderLeftColor = type === 'success' ? '#4CAF50' : 
                                 type === 'error' ? '#f44336' : 
                                 '#D4AF37';
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Form input animations
document.querySelectorAll('.premium-input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
});

// Course selection enhancement
const courseSelect = document.getElementById('course');
if (courseSelect) {
    courseSelect.addEventListener('change', function() {
        if (this.value) {
            this.style.color = '#FFFFFF';
        } else {
            this.style.color = '#666666';
        }
    });
}
// Add these functions to your existing premium-script.js

// Password strength checker
function checkPasswordStrength(password) {
    if (!password) return { strength: 0, text: 'Enter password' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    let text, color;
    if (strength <= 25) {
        text = 'Weak';
        color = 'var(--danger)';
    } else if (strength <= 50) {
        text = 'Fair';
        color = 'var(--warning)';
    } else if (strength <= 75) {
        text = 'Good';
        color = 'var(--info)';
    } else {
        text = 'Strong';
        color = 'var(--success)';
    }
    
    return { strength, text, color };
}

// Send verification email via backend
async function sendVerificationEmail(email) {
    // Determine API base URL:
    // - If `window.API_BASE_URL` is set, use it.
    // - Otherwise use http://localhost:3000
    const API_BASE = (typeof window !== 'undefined' && window.API_BASE_URL)
        || 'http://localhost:3000';
    try {
        const resp = await fetch(`${API_BASE}/api/send-reset-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await resp.json();

        // Store email and timestamp client-side for UX (not the code)
        localStorage.setItem('resetEmail', email);
        localStorage.setItem('resetCodeTime', Date.now());

        // Show dev code if available
        if (data.code) {
            const devEl = document.getElementById('dev-debug');
            if (devEl) {
                devEl.innerHTML = `Dev Mode: Reset code is <strong>${data.code}</strong>`;
                devEl.style.display = 'block';
            }
        }

        return data;
    } catch (err) {
        console.error('Failed to call send-reset-code API', err);
        return { success: false, message: 'Failed to send verification code' };
    }
}

// Verify reset code via backend
async function verifyResetCode(code) {
    try {
        const API_BASE = (typeof window !== 'undefined' && window.API_BASE_URL)
            || 'http://localhost:3000';
        const email = localStorage.getItem('resetEmail');
        const resp = await fetch(`${API_BASE}/api/verify-reset-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        const data = await resp.json();
        return data; // { valid: true/false, message }
    } catch (err) {
        console.error('Failed to call verify-reset-code API', err);
        return { valid: false, message: 'Verification failed' };
    }
}

// Update user password
function updateUserPassword(email, newPassword) {
    const users = JSON.parse(localStorage.getItem('academyUsers') || '[]');
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        return { success: false, message: 'User not found' };
    }
    
    // Update password (in real app, hash this!)
    users[userIndex].password = newPassword;
    localStorage.setItem('academyUsers', JSON.stringify(users));
    
    // Clear reset data
    localStorage.removeItem('resetCode');
    localStorage.removeItem('resetEmail');
    localStorage.removeItem('resetCodeTime');
    
    return { success: true, message: 'Password updated successfully' };
}

// Reset password via backend
async function resetPassword(email, code, newPassword) {
    try {
        const API_BASE = (typeof window !== 'undefined' && window.API_BASE_URL)
            || 'http://localhost:3000';
        const resp = await fetch(`${API_BASE}/api/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, newPassword })
        });
        const data = await resp.json();
        return data;
    } catch (err) {
        console.error('Failed to call reset-password API', err);
        return { success: false, message: 'Failed to reset password' };
    }
}

// Format time (MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Password visibility toggle (updated) and code-input auto-focus
function initPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.type = button.type || 'button';
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const container = this.closest('.password-container') || this.parentElement;
            const input = container ? container.querySelector('input[type="password"], input[type="text"], input') : null;
            if (!input) return;
            const icon = this.querySelector('i');
            const wasPassword = input.type === 'password';
            input.type = wasPassword ? 'text' : 'password';
            if (icon) {
                if (wasPassword) {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });

    // Auto-focus next code input
    document.querySelectorAll('.code-input').forEach((input, index, inputs) => {
        input.addEventListener('input', function() {
            if (this.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}

// Initialize all forms
function initForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotForm = document.getElementById('forgotForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
}

// Handle forgot password
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    const codeInputs = document.querySelectorAll('.code-input');
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmNewPassword')?.value;
    
    // Check which step we're on
    const currentStep = document.querySelector('.step.active')?.dataset.step;
    
    if (currentStep === '1') {
        // Step 1: Send verification email
        if (!email) {
            showToast('Please enter your email address', 'error');
            return;
        }
        
        showToast('Sending verification code...', 'info');
        
        try {
            const result = await sendVerificationEmail(email);
            showToast(result.message, 'success');
            
            // Move to step 2
            document.querySelector('[data-step="2"]').classList.add('active');
            document.querySelector('[data-step="1"]').classList.add('completed');
            
            // Show step 2 form
            document.getElementById('step1Form').style.display = 'none';
            document.getElementById('step2Form').style.display = 'block';
            
            // Start timer
            startCodeTimer();
            
        } catch (error) {
            showToast('Failed to send verification code', 'error');
        }
        
    } else if (currentStep === '2') {
        // Step 2: Verify code
        let code = '';
        codeInputs.forEach(input => {
            code += input.value;
        });
        
        if (code.length !== 6) {
            showToast('Please enter the 6-digit code', 'error');
            return;
        }
        
        const result = await verifyResetCode(code);

        if (result && result.valid) {
            showToast('Code verified successfully', 'success');

            // Save the entered code in session so step 3 can finalize reset
            sessionStorage.setItem('pendingResetCode', code);

            // Move to step 3
            document.querySelector('[data-step="3"]').classList.add('active');
            document.querySelector('[data-step="2"]').classList.add('completed');

            // Show step 3 form
            document.getElementById('step2Form').style.display = 'none';
            document.getElementById('step3Form').style.display = 'block';

        } else {
            showToast(result?.message || 'Invalid verification code', 'error');
        }
        
    } else if (currentStep === '3') {
        // Step 3: Set new password
        if (!newPassword || !confirmPassword) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        const email = localStorage.getItem('resetEmail');
        const result = updateUserPassword(email, newPassword);
        
        if (result.success) {
            showToast('Password reset successfully!', 'success');
            
            // Show success message
            document.getElementById('step3Form').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            
        } else {
            showToast(result.message, 'error');
        }
    }
}

// Start code expiration timer
function startCodeTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;
    
    let timeLeft = 300; // 5 minutes in seconds
    
    const timer = setInterval(() => {
        timerElement.textContent = formatTime(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            timerElement.textContent = 'Expired';
            timerElement.style.color = 'var(--danger)';
            
            // Disable verification
            showToast('Verification code has expired', 'error');
        }
        
        timeLeft--;
    }, 1000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initPasswordToggle();
    initForms();
    checkRememberedUser();
    
    // Check for success messages
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('signupSuccess')) {
        showToast('Account created successfully! Please login.', 'success');
    }
});