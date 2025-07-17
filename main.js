
const DOM = {
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    hamburger: document.querySelector('.hamburger'),
    navMenu: document.querySelector('.nav-menu'),
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('section'),
    animatedSubtitle: document.getElementById('animated-subtitle')
};

// ==========================================
// Theme Toggle Functionality
// ==========================================
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply saved theme, or system preference, or default to light
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); // Save system preference for consistency
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light'); // Save default light for consistency
    }

    // Add event listener for the theme toggle button
    if (DOM.themeToggleBtn) {
        DOM.themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// ==========================================
// Hamburger Menu Functionality
// ==========================================
// Toggles the mobile navigation menu visibility and active state of the hamburger icon.
// Also closes the menu when a navigation link is clicked.
function setupHamburgerMenu() {
    if (DOM.hamburger && DOM.navMenu) {
        // Toggle menu on hamburger click
        DOM.hamburger.addEventListener('click', () => {
            DOM.hamburger.classList.toggle('active');
            DOM.navMenu.classList.toggle('active');
        });

        // Close menu when a navigation link is clicked (for mobile UX)
        DOM.navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                DOM.hamburger.classList.remove('active');
                DOM.navMenu.classList.remove('active');
            });
        });
    }
}

// ==========================================
// Active Navigation Link Highlighting on Scroll
// ==========================================
// Highlights the current section's corresponding navigation link as the user scrolls.
// Uses a debounce function to optimize performance for frequent scroll events.
function activateSectionOnScroll() {
    // Offset to activate section slightly before it reaches the very top
    // Adjust this value based on your navbar height and desired activation point.
    const scrollOffset = 100;
    let currentActiveSectionId = '';

    DOM.sections.forEach(section => {
        // Ensure navMenu is available before using its offsetHeight
        const navHeight = DOM.navMenu ? DOM.navMenu.offsetHeight : 0;
        const sectionTop = section.offsetTop - navHeight - scrollOffset;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
            currentActiveSectionId = section.id;
        }
    });

    // Remove 'active' from all links and add to the current one
    DOM.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentActiveSectionId}`) {
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

// Attach debounced scroll listener
const debouncedActivateSectionOnScroll = debounce(activateSectionOnScroll, 100); // 100ms debounce
window.addEventListener('scroll', debouncedActivateSectionOnScroll);

// Also run on DOMContentLoaded to set initial active link
window.addEventListener('DOMContentLoaded', activateSectionOnScroll);

// Ensure clicking a nav link also sets it active immediately
DOM.navLinks.forEach(link => {
    link.addEventListener('click', function () {
        DOM.navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// ==========================================
// Intersection Observer for Section Animations
// ==========================================
// Uses Intersection Observer API to trigger 'visible' class on sections
// when they enter the viewport, enabling CSS animations.
function setupSectionAnimations() {
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers: just make all sections visible
        DOM.sections.forEach(section => {
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

    DOM.sections.forEach(section => {
        section.classList.add('section-animate'); // Add initial hidden state class
        sectionObserver.observe(section);
    });
}

// ==========================================
// Rotating Typing Subtitle Animation (Improved with requestAnimationFrame)
// ==========================================
// Animates a sequence of subtitles by typing and deleting them character by character
// using requestAnimationFrame for smoother, time-based animation.
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

let subtitleIndex = 0;
let charIndex = 0;
let isTyping = true;
let lastFrameTime = 0;
let accumulatedTime = 0;

function animateSubtitle(currentTime) {
    if (!DOM.animatedSubtitle) return; // Exit if the element is not found

    // Calculate time elapsed since last frame
    if (!lastFrameTime) lastFrameTime = currentTime;
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    accumulatedTime += deltaTime;

    const currentText = subtitles[subtitleIndex];

    if (isTyping) {
        // Typing phase
        const charsToAdd = Math.floor(accumulatedTime / TYPING_SPEED_MS);
        if (charsToAdd > 0) {
            charIndex = Math.min(currentText.length, charIndex + charsToAdd);
            DOM.animatedSubtitle.textContent = currentText.slice(0, charIndex);
            accumulatedTime %= TYPING_SPEED_MS; // Reset accumulated time for next character
        }

        if (charIndex === currentText.length) {
            // Finished typing, switch to deleting after a pause
            isTyping = false;
            accumulatedTime = -PAUSE_AT_END_MS; // Use negative to count down pause
        }
    } else {
        // Deleting phase
        if (accumulatedTime >= 0) { // Only delete after the initial pause
            const charsToRemove = Math.floor(accumulatedTime / DELETING_SPEED_MS);
            if (charsToRemove > 0) {
                charIndex = Math.max(0, charIndex - charsToRemove);
                DOM.animatedSubtitle.textContent = currentText.slice(0, charIndex);
                accumulatedTime %= DELETING_SPEED_MS; // Reset accumulated time for next character
            }
        }

        if (charIndex === 0 && accumulatedTime >= 0) {
            // Finished deleting, switch to typing next word after a pause
            isTyping = true;
            subtitleIndex = (subtitleIndex + 1) % subtitles.length; // Cycle to next subtitle
            accumulatedTime = -PAUSE_BEFORE_NEXT_MS; // Use negative to count down pause
        }
    }

    // Continue the animation loop
    requestAnimationFrame(animateSubtitle);
}

// ==========================================
// Initialize All Functionalities on DOM Load
// ==========================================
// Ensures all JavaScript functions run only after the entire HTML document
// has been completely loaded and parsed.
window.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupHamburgerMenu();
    setupSectionAnimations();
    requestAnimationFrame(animateSubtitle); // Start the typing animation loop
});
