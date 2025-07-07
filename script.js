// Theme Toggle
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Highlight nav link on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');
function activateSectionOnScroll() {
    let scrollPos = window.scrollY + 100;
    sections.forEach(section => {
        if (
            section.offsetTop <= scrollPos &&
            section.offsetTop + section.offsetHeight > scrollPos
        ) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${section.id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}
window.addEventListener('scroll', activateSectionOnScroll);
window.addEventListener('DOMContentLoaded', activateSectionOnScroll);
navLinks.forEach(link => {
    link.addEventListener('click', function () {
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Rotating Typing Subtitle Animation
const subtitles = [
    "Aspiring Software Engineer",
    "Machine Learning Enthusiast",
    "Full Stack Developer"
];
const subtitleElement = document.getElementById('animated-subtitle');
let subtitleIndex = 0;
let charIndex = 0;
let typing = true;
function typeSubtitle() {
    if (!subtitleElement) return;
    const currentText = subtitles[subtitleIndex];
    if (typing) {
        if (charIndex <= currentText.length) {
            subtitleElement.textContent = currentText.slice(0, charIndex);
            charIndex++;
            setTimeout(typeSubtitle, 60);
        } else {
            typing = false;
            setTimeout(typeSubtitle, 1500);
        }
    } else {
        if (charIndex >= 0) {
            subtitleElement.textContent = currentText.slice(0, charIndex);
            charIndex--;
            setTimeout(typeSubtitle, 30);
        } else {
            typing = true;
            subtitleIndex = (subtitleIndex + 1) % subtitles.length;
            setTimeout(typeSubtitle, 400);
        }
    }
}
window.addEventListener('DOMContentLoaded', typeSubtitle);