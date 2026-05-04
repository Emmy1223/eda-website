// Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initDashboard();
    loadUserData();
    loadCourses();
    loadAssignments();
    loadAchievements();
    setupEventListeners();
    
    // Check login status
    checkLoginStatus();
});

// Initialize dashboard
function initDashboard() {
    // Set up sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('dashboardSidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            this.innerHTML = sidebar.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 992) {
            if (!sidebar.contains(event.target) && 
                !sidebarToggle.contains(event.target) && 
                sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    });
    
    // Set greeting based on time of day
    setGreeting();
}

// Load user data from localStorage or session
function loadUserData() {
    const userName = sessionStorage.getItem('userName') || localStorage.getItem('rememberedName') || 'Student';
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('rememberedEmail') || 'student@emmysacademy.com';
    const userPlan = 'Premium Plan';
    
    // Update UI
    document.getElementById('userName').textContent = userName;
    document.getElementById('userEmail').textContent = userEmail;
    document.getElementById('userPlan').textContent = userPlan;
    document.getElementById('greetingName').textContent = userName.split(' ')[0];
    
    // Generate avatar based on name
    generateUserAvatar(userName);
}

// Generate avatar with initials
function generateUserAvatar(name) {
    const avatar = document.getElementById('userAvatar');
    const initials = name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    
    avatar.innerHTML = `<span>${initials}</span>`;
    avatar.style.background = getRandomGradient();
}

// Get random gradient for avatar
function getRandomGradient() {
    const gradients = [
        'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ];
    
    return gradients[Math.floor(Math.random() * gradients.length)];
}

// Set greeting based on time of day
function setGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good ';
    
    if (hour < 12) greeting += 'Morning';
    else if (hour < 18) greeting += 'Afternoon';
    else greeting += 'Evening';
    
    const greetingElement = document.querySelector('.header-title h1');
    if (greetingElement) {
        greetingElement.innerHTML = `${greeting}, <span id="greetingName">Student</span>! 👋`;
    }
}

// Load courses data
function loadCourses() {
    const courses = [
        {
            id: 1,
            title: 'Web Development Pro',
            instructor: 'John Doe',
            progress: 85,
            status: 'Active',
            icon: 'fas fa-code',
            color: '#D4AF37'
        },
        {
            id: 2,
            title: 'Data Science Mastery',
            instructor: 'Jane Smith',
            progress: 65,
            status: 'Active',
            icon: 'fas fa-chart-bar',
            color: '#667eea'
        },
        {
            id: 3,
            title: 'UI/UX Design Premium',
            instructor: 'Mike Johnson',
            progress: 45,
            status: 'In Progress',
            icon: 'fas fa-paint-brush',
            color: '#f093fb'
        },
        {
            id: 4,
            title: 'Digital Marketing Expert',
            instructor: 'Sarah Williams',
            progress: 30,
            status: 'Started',
            icon: 'fas fa-bullhorn',
            color: '#4facfe'
        },
        {
            id: 5,
            title: 'Business Intelligence',
            instructor: 'David Brown',
            progress: 10,
            status: 'New',
            icon: 'fas fa-briefcase',
            color: '#43e97b'
        }
    ];
    
    const courseGrid = document.getElementById('courseGrid');
    if (!courseGrid) return;
    
    // Update course count
    document.getElementById('courseCount').textContent = courses.length;
    document.getElementById('courseCountValue').textContent = courses.length;
    
    // Calculate overall progress
    const totalProgress = courses.reduce((sum, course) => sum + course.progress, 0);
    const averageProgress = Math.round(totalProgress / courses.length);
    document.getElementById('overallProgress').textContent = `${averageProgress}%`;
    document.querySelector('.progress-fill').style.width = `${averageProgress}%`;
    
    // Render courses
    courseGrid.innerHTML = courses.map(course => `
        <div class="course-card" data-course-id="${course.id}">
            <div class="course-header">
                <div style="display: flex; align-items: start;">
                    <div class="course-icon" style="background: ${course.color}20; color: ${course.color};">
                        <i class="${course.icon}"></i>
                    </div>
                    <div class="course-info">
                        <h3 class="course-title">${course.title}</h3>
                        <p class="course-instructor">By ${course.instructor}</p>
                    </div>
                </div>
                <span class="course-status">${course.status}</span>
            </div>
            
            <div class="course-progress">
                <div class="progress-info">
                    <span class="progress-text">Progress</span>
                    <span class="progress-percent">${course.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${course.progress}%; background: ${course.color};"></div>
                </div>
            </div>
            
            <div class="course-actions">
                <a href="#" class="course-btn" onclick="continueCourse(${course.id})">
                    <i class="fas fa-play"></i> Continue
                </a>
                <a href="#" class="course-btn primary" onclick="viewCourseDetails(${course.id})">
                    <i class="fas fa-eye"></i> Details
                </a>
            </div>
        </div>
    `).join('');
}

// Load assignments data
function loadAssignments() {
    const assignments = [
        {
            id: 1,
            title: 'Final Web Development Project',
            course: 'Web Development Pro',
            dueDate: '2024-02-15',
            status: 'pending',
            icon: 'fas fa-code'
        },
        {
            id: 2,
            title: 'Data Analysis Report',
            course: 'Data Science Mastery',
            dueDate: '2024-02-18',
            status: 'pending',
            icon: 'fas fa-chart-bar'
        },
        {
            id: 3,
            title: 'UI Design Portfolio',
            course: 'UI/UX Design Premium',
            dueDate: '2024-02-20',
            status: 'pending',
            icon: 'fas fa-paint-brush'
        },
        {
            id: 4,
            title: 'Marketing Campaign Plan',
            course: 'Digital Marketing Expert',
            dueDate: '2024-02-22',
            status: 'submitted',
            icon: 'fas fa-bullhorn'
        }
    ];
    
    const assignmentsList = document.getElementById('assignmentsList');
    if (!assignmentsList) return;
    
    // Update assignment count
    const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
    document.getElementById('assignmentCount').textContent = pendingAssignments;
    
    // Render assignments
    assignmentsList.innerHTML = assignments.map(assignment => {
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="assignment-item">
                <div class="assignment-icon">
                    <i class="${assignment.icon}"></i>
                </div>
                <div class="assignment-details">
                    <h3 class="assignment-title">${assignment.title}</h3>
                    <p class="assignment-meta">
                        ${assignment.course} • 
                        Due: ${dueDate.toLocaleDateString()} • 
                        <span class="assignment-due">${daysLeft > 0 ? `${daysLeft} days left` : 'Due soon'}</span>
                    </p>
                </div>
                <div class="assignment-actions">
                    ${assignment.status === 'pending' 
                        ? `<button class="course-btn" onclick="submitAssignment(${assignment.id})">
                            <i class="fas fa-upload"></i> Submit
                           </button>`
                        : `<span class="course-status" style="background: var(--success);">Submitted</span>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Load achievements data
function loadAchievements() {
    const achievements = [
        {
            id: 1,
            title: 'Fast Learner',
            description: 'Complete 5 courses in one month',
            icon: 'fas fa-bolt',
            unlocked: true
        },
        {
            id: 2,
            title: 'Perfect Score',
            description: 'Score 100% on 3 consecutive quizzes',
            icon: 'fas fa-star',
            unlocked: true
        },
        {
            id: 3,
            title: 'Community Star',
            description: 'Help 50 fellow students',
            icon: 'fas fa-users',
            unlocked: true
        },
        {
            id: 4,
            title: 'Early Bird',
            description: 'Complete assignments 3 days early',
            icon: 'fas fa-clock',
            unlocked: false
        },
        {
            id: 5,
            title: 'Course Master',
            description: 'Complete all courses in a category',
            icon: 'fas fa-trophy',
            unlocked: true
        },
        {
            id: 6,
            title: 'Study Streak',
            description: 'Study for 30 consecutive days',
            icon: 'fas fa-fire',
            unlocked: false
        }
    ];
    
    const achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;
    
    // Update achievement count
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    document.getElementById('achievementCount').textContent = unlockedCount;
    
    // Update streak days
    document.getElementById('streakDays').textContent = '14';
    
    // Render achievements
    achievementsGrid.innerHTML = achievements.map(achievement => `
        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon" style="${!achievement.unlocked ? 'opacity: 0.5;' : ''}">
                <i class="${achievement.icon}"></i>
            </div>
            <h3 class="achievement-title">${achievement.title}</h3>
            <p class="achievement-desc">${achievement.description}</p>
            ${!achievement.unlocked 
                ? `<div class="progress-bar" style="margin-top: 10px;">
                    <div class="progress-fill" style="width: ${Math.random() * 100}%;"></div>
                   </div>`
                : ''
            }
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.dataset.section + 'Section';
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.style.display = 'none';
            });
            
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // Close sidebar on mobile
            if (window.innerWidth <= 992) {
                document.getElementById('dashboardSidebar').classList.remove('active');
                document.getElementById('sidebarToggle').innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Notification button
    document.getElementById('notificationBtn').addEventListener('click', showNotifications);
    
    // Close notifications modal
    document.getElementById('closeNotifications')?.addEventListener('click', hideNotifications);
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchContent(this.value);
        });
    }
    
    // Update hours spent randomly (for demo)
    setInterval(() => {
        const hoursElement = document.getElementById('hoursSpent');
        if (hoursElement) {
            const currentHours = parseInt(hoursElement.textContent);
            const newHours = Math.min(168, currentHours + Math.floor(Math.random() * 3));
            hoursElement.textContent = newHours;
        }
    }, 30000);
}

// Check login status
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') || localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn) {
        showToast('Please login to access dashboard', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// Logout function
function logout() {
    // Clear session
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    
    // Clear localStorage if not remembered
    if (!localStorage.getItem('rememberedEmail')) {
        localStorage.removeItem('isLoggedIn');
    }
    
    showToast('Logged out successfully', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Show notifications modal
function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    const modalBody = modal.querySelector('.modal-body');
    
    const notifications = [
        { id: 1, text: 'New assignment added to Web Development Pro', time: '5 min ago', read: false },
        { id: 2, text: 'Your submission has been graded: 95%', time: '2 hours ago', read: false },
        { id: 3, text: 'Live session starting in 30 minutes', time: '1 day ago', read: true },
        { id: 4, text: 'New course material available: Advanced JavaScript', time: '2 days ago', read: true },
        { id: 5, text: 'Welcome to Emmys Digital Academy!', time: '1 week ago', read: true }
    ];
    
    modalBody.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.read ? 'read' : 'unread'}">
            <div class="notification-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="notification-content">
                <p>${notification.text}</p>
                <span class="notification-time">${notification.time}</span>
            </div>
            ${!notification.read ? '<div class="notification-dot"></div>' : ''}
        </div>
    `).join('');
    
    modal.style.display = 'block';
    
    // Update badge count
    document.querySelector('.notification-badge').textContent = '0';
}

// Hide notifications modal
function hideNotifications() {
    document.getElementById('notificationsModal').style.display = 'none';
}

// Search functionality
function searchContent(query) {
    if (query.length < 2) return;
    
    // In a real app, this would make an API call
    console.log('Searching for:', query);
    
    showToast(`Searching for "${query}"...`, 'info');
}

// Course actions
function continueCourse(courseId) {
    showToast(`Continuing course ${courseId}...`, 'info');
    // Navigate to course player
}

function viewCourseDetails(courseId) {
    showToast(`Viewing details for course ${courseId}...`, 'info');
    // Navigate to course details page
}

function submitAssignment(assignmentId) {
    showToast(`Submitting assignment ${assignmentId}...`, 'info');
    // Show submission modal
}

// Add modal styles
const modalStyles = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }
    
    .modal-content {
        background: var(--black-card);
        border-radius: 20px;
        border: var(--border-gold-strong);
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: var(--shadow-heavy);
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        color: var(--gold);
        font-size: 1.5rem;
    }
    
    .modal-close {
        background: transparent;
        border: none;
        color: var(--gold);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 5px;
    }
    
    .modal-body {
        padding: 20px;
        overflow-y: auto;
    }
    
    .notification-item {
        display: flex;
        align-items: start;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 10px;
        background: var(--black-light);
        border: var(--border-gold);
        position: relative;
    }
    
    .notification-item.unread {
        background: rgba(212, 175, 55, 0.1);
    }
    
    .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--gradient-gold);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--black);
        margin-right: 15px;
        flex-shrink: 0;
    }
    
    .notification-content {
        flex: 1;
    }
    
    .notification-content p {
        color: var(--white);
        margin-bottom: 5px;
    }
    
    .notification-time {
        color: var(--gray);
        font-size: 0.85rem;
    }
    
    .notification-dot {
        position: absolute;
        top: 15px;
        right: 15px;
        width: 10px;
        height: 10px;
        background: var(--gold);
        border-radius: 50%;
    }
`;

// Add modal styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);