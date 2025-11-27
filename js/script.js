// ===== LOADING SCREEN =====
function hideLoader() {
    const loader = document.getElementById('loadingScreen');
    if (loader) {
        loader.style.opacity = '0';
        // Force removal after transition
        setTimeout(() => {
            loader.style.display = 'none';
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 500);
    }
}

// Hide immediately if already loaded, otherwise wait for load event
if (document.readyState === 'complete') {
    setTimeout(hideLoader, window.innerWidth < 768 ? 200 : 500);
} else {
    window.addEventListener('load', () => setTimeout(hideLoader, window.innerWidth < 768 ? 200 : 500));
}

// Safety fallback: Force hide after timeout (faster on mobile)
setTimeout(hideLoader, window.innerWidth < 768 ? 1000 : 2000);

// ===== UTILS =====
const isMobile = () => window.innerWidth < 768;

// ===== SPOTLIGHT EFFECT =====
const spotlight = document.querySelector('.spotlight');
if (spotlight) {
    // Only enable spotlight on non-mobile devices to save battery/performance
    if (!isMobile()) {
        window.addEventListener('mousemove', e => {
            requestAnimationFrame(() => {
                spotlight.style.setProperty('--x', `${e.clientX}px`);
                spotlight.style.setProperty('--y', `${e.clientY}px`);
            });
        });
    } else {
        spotlight.style.display = 'none';
    }
}

// ===== PARTICLES =====
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    // Reduce particles on mobile for better performance
    const particleCount = isMobile() ? 20 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        container.appendChild(particle);
    }
}
createParticles();

// ===== MODAL =====
function openContactModal(planName) {
    const modal = document.getElementById('contactModal');
    const planInput = document.getElementById('selectedPlan');
    const planDisplay = document.getElementById('planDisplay');
    
    if (modal && planInput && planDisplay) {
        planInput.value = planName;
        planDisplay.value = planName;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// ===== GSAP ANIMATIONS (DESKTOP ONLY) =====
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && window.innerWidth >= 768) {
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate cards on scroll
    gsap.utils.toArray('.card-3d').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
            },
            y: 100,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });
    });
    
    // Animate timeline items
    gsap.utils.toArray('.timeline-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
            },
            x: -50,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.2,
            ease: 'power2.out'
        });
    });
}
