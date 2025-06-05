document.addEventListener('DOMContentLoaded', function() {
    const headerOffset = 70; // Adjusted based on potentially sleeker navbar

    // Typed.js initialization
    if (document.getElementById('typed-role')) {
        new Typed('#typed-role', {
            strings: [
                "Quant Researcher", // Changed from "Quantitative Researcher"
                "Data Analyst",
                "Data Science Student"
            ],
            typeSpeed: 70, // Speed of typing in milliseconds
            backSpeed: 50, // Speed of deleting in milliseconds
            backDelay: 1500, // Pause before deleting
            startDelay: 500, // Pause before typing starts
            loop: true, // Loop the animation
            showCursor: true,
            cursorChar: '|',
            smartBackspace: true // Only backspace what doesn't match the next string
        });
    }

    // Active Nav Link Highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinksForHighlight = document.querySelectorAll('.nav-links li a'); // Renamed for clarity

    function setActiveLink() {
        let scrollY = window.scrollY;
        let currentSectionId = '';

        // Determine which section is currently in view
        // Iterate from bottom to top, the first section found whose top is above scrollY + offset is the one.
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const sectionTop = section.offsetTop;
            if (scrollY + headerOffset >= sectionTop) {
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

    setActiveLink(); // Set active link on initial load
    window.addEventListener('scroll', setActiveLink); // Update on scroll

    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-links a[href^="#"], a.cta-btn--hero[href^="#"], .back-to-top[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                let scrollToPosition = targetElement.offsetTop - (headerOffset - 10); // Adjust scroll position to be just below header
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
        const projectSwiper = new Swiper('.project-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            pagination: {
                el: '.project-swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.project-swiper-button-next',
                prevEl: '.project-swiper-button-prev',
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

        const achievementSwiper = new Swiper('.achievement-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            pagination: {
                el: '.achievement-swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.achievement-swiper-button-next',
                prevEl: '.achievement-swiper-button-prev',
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

        const skillSwiper = new Swiper('.skill-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            pagination: {
                el: '.skill-swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.skill-swiper-button-next',
                prevEl: '.skill-swiper-button-prev',
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 30
                }
            }
        });
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavLinks = document.querySelector('.nav-links'); // Renamed to avoid conflict
    const menuIcon = mobileMenuBtn.querySelector('.fa-bars');
    const closeIcon = mobileMenuBtn.querySelector('.fa-times');

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
    const sr = ScrollReveal();

    const revealSections = document.querySelectorAll('.section');
    revealSections.forEach((section) => {
        section.classList.add('scroll-reveal-section'); // Add class for CSS targeting
        sr.reveal(section, {
            delay: 200,
            distance: '50px',
            duration: 800,
            easing: 'ease-in-out',
            origin: 'bottom',
            reset: true, // Add this line to make animations re-trigger
            afterReveal: (el) => {
                el.classList.add('active'); // Add active class for CSS transition
            },
            beforeReset: (el) => { // Optional: Remove active class before reset if needed
                el.classList.remove('active');
            }
        });
    });
});
