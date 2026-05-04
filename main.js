// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Animate hamburger to X
        const spans = menuToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Close menu when clicking outside on mobile
document.addEventListener('click', (event) => {
    if (window.innerWidth <= 768) {
        if (!event.target.closest('.navbar') && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (window.innerWidth <= 768 && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    });
});

// Simple form validation for contact/enroll pages
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        let isValid = true;
        const requiredFields = this.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'var(--danger)';
                
                // Add error message if not exists
                if (!field.nextElementSibling?.classList.contains('error-message')) {
                    const error = document.createElement('div');
                    error.className = 'error-message';
                    error.textContent = 'This field is required';
                    error.style.color = 'var(--danger)';
                    error.style.fontSize = '0.8rem';
                    error.style.marginTop = '5px';
                    field.parentNode.insertBefore(error, field.nextSibling);
                }
            } else {
                field.style.borderColor = '';
                const errorMsg = field.nextElementSibling;
                if (errorMsg?.classList.contains('error-message')) {
                    errorMsg.remove();
                }
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            alert('Please fill in all required fields.');
        }
    });
}

// Initialize form validation on enroll and contact pages
if (window.location.pathname.includes('enroll.html') || 
    window.location.pathname.includes('contact.html')) {
    validateForm('enrollmentForm');
    validateForm('contactForm');
}

// Simple course filtering (for courses.html)
if (window.location.pathname.includes('courses.html')) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const courseCards = document.querySelectorAll('.course-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter courses
            courseCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}
// Navigation scroll effect with hide/show on scroll
const mainNav = document.querySelector('.main-nav');
let lastScrollTop = 0;
const scrollThreshold = 100; // Minimum scroll before hiding
const scrollHideThreshold = 30; // How much to scroll before hiding
let ticking = false;

function updateNavOnScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // At the top of the page, always show header
    if (scrollTop <= scrollThreshold) {
        mainNav.classList.remove('header-hidden');
        mainNav.classList.add('header-visible');
        if (scrollTop > 50) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
        return;
    }

    // Add scrolled class for compact style
    if (scrollTop > 100) {
        mainNav.classList.add('scrolled');
    } else {
        mainNav.classList.remove('scrolled');
    }

    // Determine scroll direction
    if (scrollTop > lastScrollTop) {
        // Scrolling DOWN - hide header
        if (scrollTop - lastScrollTop > scrollHideThreshold) {
            mainNav.classList.remove('header-visible');
            mainNav.classList.add('header-hidden');
        }
    } else {
        // Scrolling UP - show header
        if (lastScrollTop - scrollTop > scrollHideThreshold) {
            mainNav.classList.remove('header-hidden');
            mainNav.classList.add('header-visible');
        }
    }
    
    lastScrollTop = scrollTop;
    ticking = false;
}

// Use requestAnimationFrame for performance
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateNavOnScroll();
        });
        ticking = true;
    }
});

// Also handle logo resize on scroll
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const logoWrapper = document.querySelector('.logo-wrapper');
    
    if (scrollTop > 100) {
        mainNav.classList.add('scrolled');
        if (logoWrapper) {
            logoWrapper.style.transform = 'scale(0.8)';
        }
    } else {
        mainNav.classList.remove('scrolled');
        if (logoWrapper) {
            logoWrapper.style.transform = 'scale(1)';
        }
    }
});
// Simple navigation hide/show
const nav = document.querySelector('.main-nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // At top of page
    if (currentScroll <= 0) {
        nav.classList.remove('nav-hidden');
        nav.classList.add('nav-visible');
        return;
    }
    
    // Scrolling DOWN - hide
    if (currentScroll > lastScroll && currentScroll > 100) {
        nav.classList.add('nav-hidden');
        nav.classList.remove('nav-visible');
    }
    // Scrolling UP - show
    else if (currentScroll < lastScroll) {
        nav.classList.remove('nav-hidden');
        nav.classList.add('nav-visible');
    }
    
    lastScroll = currentScroll;
});