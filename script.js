const DOM = {
    themeToggleBtn: null,
    hamburger: null,
    navMenu: null,
    navLinks: null,
    sections: null,
    animatedSubtitle: null
};

// Initialize DOM elements safely
function initializeDOM() {
    DOM.themeToggleBtn = document.getElementById('theme-toggle-btn');
    DOM.hamburger = document.querySelector('.hamburger');
    DOM.navMenu = document.querySelector('.nav-menu');
    DOM.navLinks = document.querySelectorAll('.nav-link');
    DOM.sections = document.querySelectorAll('section');
    DOM.animatedSubtitle = document.getElementById('animated-subtitle');
}

// ==========================================
// Theme Toggle Functionality
// ==========================================
function initializeTheme() {
    // Check if localStorage is available
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (e) {
        console.warn('localStorage not available, using default theme');
    }

    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply saved theme, or system preference, or default to light
    let themeToApply = 'light';
    if (savedTheme) {
        themeToApply = savedTheme;
    } else if (systemPrefersDark) {
        themeToApply = 'dark';
    }

    document.documentElement.setAttribute('data-theme', themeToApply);

    // Save theme preference if localStorage is available
    try {
        localStorage.setItem('theme', themeToApply);
    } catch (e) {
        console.warn('Cannot save theme preference: localStorage not available');
    }

    // Add event listener for the theme toggle button
    if (DOM.themeToggleBtn) {
        DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);

    try {
        localStorage.setItem('theme', newTheme);
    } catch (e) {
        console.warn('Cannot save theme preference: localStorage not available');
    }
}

// ==========================================
// Hamburger Menu Functionality
// ==========================================
function setupHamburgerMenu() {
    if (!DOM.hamburger || !DOM.navMenu) return;

    // Toggle menu on hamburger click
    DOM.hamburger.addEventListener('click', toggleHamburgerMenu);

    // Close menu when a navigation link is clicked (for mobile UX)
    const navLinks = DOM.navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeHamburgerMenu);
    });
}

function toggleHamburgerMenu() {
    DOM.hamburger.classList.toggle('active');
    DOM.navMenu.classList.toggle('active');
}

function closeHamburgerMenu() {
    DOM.hamburger.classList.remove('active');
    DOM.navMenu.classList.remove('active');
}

// ==========================================
// Active Navigation Link Highlighting on Scroll
// ==========================================
function activateSectionOnScroll() {
    if (!DOM.sections || DOM.sections.length === 0 || !DOM.navLinks || DOM.navLinks.length === 0) {
        return;
    }

    // Offset to activate section slightly before it reaches the very top
    const scrollOffset = 100;
    const navHeight = DOM.navMenu ? DOM.navMenu.offsetHeight : 0;
    let currentActiveSectionId = '';

    // Find the currently visible section
    Array.from(DOM.sections).forEach(section => {
        if (!section.id) return; // Skip sections without IDs

        const sectionTop = section.offsetTop - navHeight - scrollOffset;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
            currentActiveSectionId = section.id;
        }
    });

    // Update active navigation links
    updateActiveNavLink(currentActiveSectionId);
}

function updateActiveNavLink(activeSectionId) {
    Array.from(DOM.navLinks).forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref === `#${activeSectionId}`) {
            link.classList.add('active');
        }
    });
}

// Debounce utility function: limits how often a function can run
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

function setupScrollHandlers() {
    // Attach debounced scroll listener
    const debouncedActivateSectionOnScroll = debounce(activateSectionOnScroll, 100);
    window.addEventListener('scroll', debouncedActivateSectionOnScroll, { passive: true });

    // Set initial active link
    activateSectionOnScroll();

    // Ensure clicking a nav link also sets it active immediately
    if (DOM.navLinks) {
        Array.from(DOM.navLinks).forEach(link => {
            link.addEventListener('click', function () {
                Array.from(DOM.navLinks).forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
}

// ==========================================
// Intersection Observer for Section Animations
// ==========================================
function setupSectionAnimations() {
    if (!DOM.sections || DOM.sections.length === 0) return;

    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers: just make all sections visible
        Array.from(DOM.sections).forEach(section => {
            section.classList.add('visible');
        });
        return;
    }

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% of the section is visible
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    Array.from(DOM.sections).forEach(section => {
        section.classList.add('section-animate'); // Add initial hidden state class
        sectionObserver.observe(section);
    });
}

// ==========================================
// Rotating Typing Subtitle Animation
// ==========================================
const subtitles = [
    "Aspiring Software Engineer",
    "Machine Learning Enthusiast",
    "Full Stack Developer"
];

// Animation parameters (milliseconds per character/pause duration)
const TYPING_SPEED_MS = 60;   // Time per character when typing
const DELETING_SPEED_MS = 30; // Time per character when deleting
const PAUSE_AT_END_MS = 1500; // Pause after typing a word
const PAUSE_BEFORE_NEXT_MS = 400; // Pause before typing next word

let subtitleState = {
    index: 0,
    charIndex: 0,
    isTyping: true,
    lastFrameTime: 0,
    accumulatedTime: 0,
    animationId: null
};

function animateSubtitle(currentTime) {
    if (!DOM.animatedSubtitle || subtitles.length === 0) {
        return; // Exit if the element is not found or no subtitles
    }

    // Calculate time elapsed since last frame
    if (!subtitleState.lastFrameTime) {
        subtitleState.lastFrameTime = currentTime;
    }

    const deltaTime = currentTime - subtitleState.lastFrameTime;
    subtitleState.lastFrameTime = currentTime;
    subtitleState.accumulatedTime += deltaTime;

    const currentText = subtitles[subtitleState.index];

    if (subtitleState.isTyping) {
        // Typing phase
        const charsToAdd = Math.floor(subtitleState.accumulatedTime / TYPING_SPEED_MS);
        if (charsToAdd > 0) {
            subtitleState.charIndex = Math.min(currentText.length, subtitleState.charIndex + charsToAdd);
            DOM.animatedSubtitle.textContent = currentText.slice(0, subtitleState.charIndex);
            subtitleState.accumulatedTime %= TYPING_SPEED_MS;
        }

        if (subtitleState.charIndex === currentText.length) {
            // Finished typing, switch to deleting after a pause
            subtitleState.isTyping = false;
            subtitleState.accumulatedTime = -PAUSE_AT_END_MS;
        }
    } else {
        // Deleting phase
        if (subtitleState.accumulatedTime >= 0) {
            const charsToRemove = Math.floor(subtitleState.accumulatedTime / DELETING_SPEED_MS);
            if (charsToRemove > 0) {
                subtitleState.charIndex = Math.max(0, subtitleState.charIndex - charsToRemove);
                DOM.animatedSubtitle.textContent = currentText.slice(0, subtitleState.charIndex);
                subtitleState.accumulatedTime %= DELETING_SPEED_MS;
            }
        }

        if (subtitleState.charIndex === 0 && subtitleState.accumulatedTime >= 0) {
            // Finished deleting, switch to typing next word after a pause
            subtitleState.isTyping = true;
            subtitleState.index = (subtitleState.index + 1) % subtitles.length;
            subtitleState.accumulatedTime = -PAUSE_BEFORE_NEXT_MS;
        }
    }

    // Continue the animation loop
    subtitleState.animationId = requestAnimationFrame(animateSubtitle);
}

function startSubtitleAnimation() {
    if (DOM.animatedSubtitle && subtitles.length > 0) {
        // Reset state
        subtitleState = {
            index: 0,
            charIndex: 0,
            isTyping: true,
            lastFrameTime: 0,
            accumulatedTime: 0,
            animationId: null
        };

        subtitleState.animationId = requestAnimationFrame(animateSubtitle);
    }
}

function stopSubtitleAnimation() {
    if (subtitleState.animationId) {
        cancelAnimationFrame(subtitleState.animationId);
        subtitleState.animationId = null;
    }
}

// ==========================================
// Error Handling and Cleanup
// ==========================================
function handleVisibilityChange() {
    if (document.hidden) {
        // Page is hidden, pause animations to save resources
        stopSubtitleAnimation();
    } else {
        // Page is visible again, resume animations
        startSubtitleAnimation();
    }
}

// ==========================================
// Initialize All Functionalities on DOM Load
// ==========================================
function initializeApp() {
    try {
        initializeDOM();
        initializeTheme();
        setupHamburgerMenu();
        setupSectionAnimations();
        setupScrollHandlers();
        startSubtitleAnimation();

        // Handle page visibility changes for performance
        if (typeof document.hidden !== "undefined") {
            document.addEventListener("visibilitychange", handleVisibilityChange);
        }

        console.log('Portfolio website initialized successfully');
    } catch (error) {
        console.error('Error initializing portfolio website:', error);
    }
}

// Ensure all JavaScript functions run only after the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}