document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const getHeaderOffset = () => (header ? header.offsetHeight : 70);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isAndroidPhone = /Android/i.test(navigator.userAgent) && window.innerWidth <= 900;
    const motionScale = prefersReducedMotion ? 0 : (isAndroidPhone ? 0.55 : 1);

    // Typed.js initialization
    if (document.getElementById('typed-role')) {
        if (prefersReducedMotion) {
            document.getElementById('typed-role').textContent = 'Data Science Student.';
        } else {
        new Typed('#typed-role', {
            strings: [
                "Web Developer.",
                "Quant Researcher.",
                "Kaggle Competitor."
            ],
            typeSpeed: Math.max(18, Math.round(40 * motionScale)), // Speed of typing in milliseconds
            backSpeed: Math.max(14, Math.round(28 * motionScale)), // Speed of deleting in milliseconds
            backDelay: Math.round(800 * motionScale), // Pause before deleting
            startDelay: Math.round(150 * motionScale), // Pause before typing starts
            loop: true, // Loop the animation
            showCursor: true,
            cursorChar: '|',
            smartBackspace: true // Only backspace what doesn't match the next string
        });
        }
    }

    // Active Nav Link Highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinksForHighlight = document.querySelectorAll('.nav-links li a'); // Renamed for clarity
    let sectionPositions = [];

    function cacheSectionPositions() {
        sectionPositions = Array.from(sections)
            .map((section) => ({ id: section.id, top: section.offsetTop }))
            .sort((a, b) => a.top - b.top);
    }

    function setActiveLink() {
        let scrollY = window.scrollY;
        let currentSectionId = '';

        for (let i = sectionPositions.length - 1; i >= 0; i--) {
            const section = sectionPositions[i];
            if (scrollY + getHeaderOffset() >= section.top) {
                currentSectionId = section.id;
                break; 
            }
        }
        
        navLinksForHighlight.forEach(link => { // Use renamed variable
            const linkHref = link.getAttribute('href');
            // Check if it's an internal section link
            if (linkHref && linkHref.startsWith('#')) {
                if (linkHref === `#${currentSectionId}`) {
                    link.classList.add('active-link');
                } else {
                    link.classList.remove('active-link');
                }
            } else {
                // For non-section links (like Resume), ensure they are not active
                link.classList.remove('active-link');
            }
        });
    }

    const backToTopButton = document.querySelector('.back-to-top');

    function setBackToTopVisibility() {
        if (!backToTopButton) {
            return;
        }
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const docHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );
        const isNearBottom = (scrollY + viewportHeight) >= (docHeight - 8);
        backToTopButton.classList.toggle('visible', scrollY > 260 || isNearBottom);
    }

    cacheSectionPositions();
    setActiveLink();
    setBackToTopVisibility();
    let activeLinkTicking = false;
    window.addEventListener('scroll', () => {
        if (activeLinkTicking) return;
        activeLinkTicking = true;
        requestAnimationFrame(() => {
            setActiveLink();
            setBackToTopVisibility();
            activeLinkTicking = false;
        });
    }, { passive: true });

    window.addEventListener('resize', () => {
        cacheSectionPositions();
        setBackToTopVisibility();
    }, { passive: true });

    window.addEventListener('load', () => {
        cacheSectionPositions();
        setBackToTopVisibility();
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-links a[href^="#"], a.cta-btn--hero[href^="#"], .back-to-top[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                let scrollToPosition = targetTop - Math.max(getHeaderOffset() - 10, 0);
                if (targetId === '#top') { // Special case for back-to-top
                    scrollToPosition = 0;
                }
                window.scrollTo({
                    top: scrollToPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Current Year for Footer
    if (document.getElementById('current-year')) {
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }

    // Swiper Initializations
    if (typeof Swiper !== 'undefined') {
        new Swiper('.project-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            autoplay: {
                delay: Math.max(1800, Math.round(4000 * motionScale)),
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: '.project-swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                // when window width is >= 768px
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                },
                // when window width is >= 1024px
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 40
                }
            }
        });

        new Swiper('.achievement-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            autoplay: {
                delay: Math.max(2000, Math.round(4500 * motionScale)),
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: '.achievement-swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 40
                }
            }
        });

        new Swiper('.skill-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            autoplay: {
                delay: Math.max(2000, Math.round(4500 * motionScale)),
                disableOnInteraction: false,
                pauseOnMouseEnter: false
            },
            pagination: {
                el: '.skill-swiper-pagination',
                clickable: true,
            },
            on: {
                init(swiper) {
                    if (swiper.autoplay) {
                        swiper.autoplay.start();
                    }
                }
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30
                }
            }
        });

    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavLinks = document.querySelector('.nav-links'); // Renamed to avoid conflict
    const menuIcon = mobileMenuBtn?.querySelector('.fa-bars') ?? null;
    const closeIcon = mobileMenuBtn?.querySelector('.fa-times') ?? null;

    if (mobileMenuBtn && mobileNavLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNavLinks.classList.toggle('active');
            const isOpen = mobileNavLinks.classList.contains('active');
            mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
            if (isOpen) {
                mobileMenuBtn.setAttribute('aria-label', 'Close menu');
                if(menuIcon) menuIcon.style.display = 'none';
                if(closeIcon) closeIcon.style.display = 'block';
            } else {
                mobileMenuBtn.setAttribute('aria-label', 'Open menu');
                if(menuIcon) menuIcon.style.display = 'block';
                if(closeIcon) closeIcon.style.display = 'none';
            }
        });

        // Close mobile menu when a link is clicked
        mobileNavLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNavLinks.classList.contains('active')) {
                    mobileNavLinks.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    mobileMenuBtn.setAttribute('aria-label', 'Open menu');
                    if(menuIcon) menuIcon.style.display = 'block';
                    if(closeIcon) closeIcon.style.display = 'none';
                }
            });
        });
    }

    // Scroll Reveal Animations
    if (!prefersReducedMotion && typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal();
        const revealSections = document.querySelectorAll('.section');
        revealSections.forEach((section) => {
            section.classList.add('scroll-reveal-section');
            sr.reveal(section, {
                delay: Math.round(80 * motionScale),
                distance: isAndroidPhone ? '10px' : '16px',
                duration: Math.round(420 * motionScale),
                easing: 'ease-out',
                origin: 'bottom',
                reset: false,
                afterReveal: (el) => {
                    el.classList.add('active');
                }
            });
        });
    }
});
