(function () {
    'use strict';

    // ── Feature: Device & Motion State ──────────────────────────
    const header = document.querySelector('.header');
    const getHeaderOffset = () => (header ? header.offsetHeight : 70);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isAndroidPhone = /Android/i.test(navigator.userAgent) && window.innerWidth <= 900;
    const motionScale = prefersReducedMotion.matches ? 0 : (isAndroidPhone ? 0.55 : 1);
    const rootElement = document.documentElement;
    let scrollbarHideTimer = null;

    // ── Feature: Scrollbar Visibility ───────────────────────────
    let scrollbarTicking = false;
    
    function showScrollbarDuringActivity() {
        if (scrollbarTicking) return;
    
        scrollbarTicking = true;
    
        requestAnimationFrame(() => {
            rootElement.classList.add('scrolling-active');
    
            clearTimeout(scrollbarHideTimer);
            scrollbarHideTimer = setTimeout(() => {
                rootElement.classList.remove('scrolling-active');
            }, 800);
    
            scrollbarTicking = false;
        });
    }

    window.addEventListener('scroll', showScrollbarDuringActivity, { passive: true });
    window.addEventListener('wheel', showScrollbarDuringActivity, { passive: true });
    window.addEventListener('touchmove', showScrollbarDuringActivity, { passive: true });
    window.addEventListener('keydown', (event) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'].includes(event.code)) {
            showScrollbarDuringActivity();
        }
    });

    // ── Feature: Typed Role Text ────────────────────────────────
    function initTypedRole() {
        const typedRoleElement = document.getElementById('typed-role');
        if (!typedRoleElement) return;
    
        const roleStrings = [
            'Quant Researcher.',
            'Kaggle Competitor.',
            'Web Developer.'
        ];
    
        if (prefersReducedMotion.matches) {
            typedRoleElement.textContent = roleStrings.join(' • ');
            return;
        }
    
        if (typeof Typed !== 'undefined') {
            typedRoleElement.textContent = '';
            new Typed(typedRoleElement, {
                strings: roleStrings,
                typeSpeed: Math.max(18, Math.round(40 * motionScale)),
                backSpeed: Math.max(14, Math.round(28 * motionScale)),
                backDelay: Math.round(800 * motionScale),
                startDelay: Math.round(150 * motionScale),
                loop: true,
                showCursor: true,
                cursorChar: '|',
                smartBackspace: true
            });
            return;
        }
    
        // Fallback without Typed.js
        let roleIndex = 0;
        typedRoleElement.textContent = roleStrings[roleIndex];
    
        setInterval(() => {
            roleIndex = (roleIndex + 1) % roleStrings.length;
            typedRoleElement.textContent = roleStrings[roleIndex];
        }, 2400);
    }
    
    initTypedRole();

    // ── Feature: Active Nav Link Highlighting ───────────────────
    const sections = document.querySelectorAll('section[id]');
    const navLinksForHighlight = document.querySelectorAll('.nav-links li a');
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

        navLinksForHighlight.forEach((link) => {
            const linkHref = link.getAttribute('href');
            const isActive = Boolean(linkHref) && linkHref === `#${currentSectionId}`;
            link.classList.toggle('active-link', isActive);
            // Mirror the highlighted state for assistive tech. An absent attribute
            // means "not the current section", which is the correct default.
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    const backToTopButton = document.querySelector('.back-to-top');

    function setBackToTopVisibility() {
        if (!backToTopButton) return;
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const docHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );
        const isNearBottom = (scrollY + viewportHeight) >= (docHeight - 8);
        backToTopButton.classList.toggle('visible', scrollY > 260 || isNearBottom);
    }

    function updateOnScroll() {
        // Section offsets are re-read on every throttled scroll frame. Sections using
        // content-visibility change height as they render, and late webfonts change
        // text height, so caching these on load and resize alone goes stale.
        cacheSectionPositions();
        setActiveLink();
        setBackToTopVisibility();
    }

    let activeLinkTicking = false;
    window.addEventListener('scroll', () => {
        if (activeLinkTicking) return;
        activeLinkTicking = true;
        requestAnimationFrame(() => {
            updateOnScroll();
            activeLinkTicking = false;
        });
    }, { passive: true });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            cacheSectionPositions();
            setBackToTopVisibility();
        }, 150);
    }, { passive: true });

    window.addEventListener('load', updateOnScroll);
    cacheSectionPositions();
    setActiveLink();
    setBackToTopVisibility();

    // ── Feature: Smooth Scroll for Navigation ───────────────────
    document.querySelectorAll('.nav-links a[href^="#"], a.cta-btn--hero[href^="#"], .back-to-top[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                let scrollToPosition = targetTop - Math.max(getHeaderOffset() - 10, 0);
                if (targetId === '#top') {
                    scrollToPosition = 0;
                }
                window.scrollTo({
                    top: scrollToPosition,
                    behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
                });
            }
        });
    });

    // ── Feature: Footer Current Year ────────────────────────────
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // ── Feature: Swiper Initializations ─────────────────────────
    const swiperRegistry = [];
    if (typeof Swiper !== 'undefined') {

        const initSwiper = (selector, config) => {
            try {
                const instance = new Swiper(selector, config);
                swiperRegistry.push(instance);
                return instance;
            } catch (err) {
                console.warn(`Swiper initialization failed for ${selector}:`, err);
                return null;
            }
        };

        const bindSwiperVisibility = (swiper, rootSelector) => {
            const root = document.querySelector(rootSelector);
            if (!swiper || !root) return;

            let isVisible = !('IntersectionObserver' in window);
            let isHovered = root.matches(':hover');
            const start = () => {
                if (!isVisible || isHovered || root.matches(':focus-within') || prefersReducedMotion.matches) return;
                if (swiper.autoplay && !swiper.autoplay.running) swiper.autoplay.start();
            };
            const stop = () => {
                if (swiper.autoplay && swiper.autoplay.running) swiper.autoplay.stop();
            };

            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.45;
                        if (isVisible) start();
                        else stop();
                    });
                }, { threshold: [0, 0.25, 0.45, 0.7] });

                observer.observe(root);
            }

            root.addEventListener('focusin', stop);
            root.addEventListener('focusout', (event) => {
                // Moving between carousel links must not restart autoplay.
                if (!root.contains(event.relatedTarget)) start();
            });
            root.addEventListener('mouseenter', () => {
                isHovered = true;
                stop();
            });
            root.addEventListener('mouseleave', () => {
                isHovered = false;
                start();
            });
            prefersReducedMotion.addEventListener('change', () => {
                if (prefersReducedMotion.matches) stop();
                else start();
            });
        };

        // When every slide fits on screen at once there is nothing to page
                // through, so the dots would be focusable controls that do nothing.
                function syncPagination(swiper) {
                    if (!swiper || !swiper.pagination || !swiper.pagination.el) return;
                    const allVisible = swiper.slides.length <= swiper.params.slidesPerView;
                    swiper.pagination.el.style.display = allVisible ? 'none' : '';
                }

                const projectSwiper = initSwiper('.project-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            autoplay: {
                delay: Math.max(1800, Math.round(4000 * motionScale)),
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                stopOnLastSlide: false
            },
            pagination: {
                el: '.project-swiper-pagination',
                clickable: true,
            },
            on: {
                init(swiper) { syncPagination(swiper); },
                resize(swiper) { syncPagination(swiper); }
            },
            breakpoints: {
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 40 }
            }
        });
        bindSwiperVisibility(projectSwiper, '.projects-section');

        const achievementSwiper = initSwiper('.achievement-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            autoplay: {
                delay: Math.max(2000, Math.round(4500 * motionScale)),
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                stopOnLastSlide: false
            },
            pagination: {
                el: '.achievement-swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 40 }
            }
        });
        bindSwiperVisibility(achievementSwiper, '.achievements-section');

        const skillSwiper = initSwiper('.skill-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            autoplay: {
                delay: Math.max(2000, Math.round(4500 * motionScale)),
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                stopOnLastSlide: false
            },
            pagination: {
                el: '.skill-swiper-pagination',
                clickable: true,
            },
            on: {
                init(swiper) {
                    if (swiper.autoplay) swiper.autoplay.stop();
                }
            },
            breakpoints: {
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 30 }
            }
        });
        bindSwiperVisibility(skillSwiper, '.skills-section');

        if (prefersReducedMotion.matches) {
            swiperRegistry.forEach((swiper) => {
                if (swiper.autoplay) swiper.autoplay.stop();
            });
        }
    }

    // ── Feature: Mobile Menu Toggle ─────────────────────────────
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavLinks = document.querySelector('.nav-links');
    const menuIcon = mobileMenuBtn?.querySelector('.fa-bars') ?? null;
    const closeIcon = mobileMenuBtn?.querySelector('.fa-times') ?? null;

    const mobileNavItems = mobileNavLinks ? Array.from(mobileNavLinks.querySelectorAll('a')) : [];

    // restoreFocus is false when a menu item was activated, because focus should
    // follow the navigation rather than jump back to the toggle.
    function closeMobileMenu(restoreFocus = false) {
        if (!mobileNavLinks || !mobileNavLinks.classList.contains('active')) return;
        mobileNavLinks.classList.remove('active');
        if (mobileMenuBtn) {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.setAttribute('aria-label', 'Open menu');
        }
        if (menuIcon) menuIcon.style.display = 'block';
        if (closeIcon) closeIcon.style.display = 'none';
        if (restoreFocus && mobileMenuBtn) mobileMenuBtn.focus();
    }

    if (mobileMenuBtn && mobileNavLinks) {
        mobileMenuBtn.addEventListener('click', (event) => {
            const isOpen = !mobileNavLinks.classList.contains('active');
            mobileNavLinks.classList.toggle('active', isOpen);
            mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
            mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
            if (menuIcon) menuIcon.style.display = isOpen ? 'none' : 'block';
            if (closeIcon) closeIcon.style.display = isOpen ? 'block' : 'none';
            // Keyboard activation (click detail 0) moves focus into the menu so the
            // user is not stranded on the toggle. Pointer activation is left alone
            // so no focus ring appears after a tap.
            if (isOpen && event.detail === 0 && mobileNavItems.length) {
                mobileNavItems[0].focus();
            }
        });

        mobileNavItems.forEach((link) => {
            link.addEventListener('click', () => closeMobileMenu(false));
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            if (!mobileNavLinks.classList.contains('active')) return;
            closeMobileMenu(true);
        });
    }

    // ── Feature: Scroll Reveal Animations ───────────────────────
    if (!prefersReducedMotion.matches && typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal();
        const revealSections = document.querySelectorAll('.section:not(#contact)');
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
    } else if (typeof ScrollReveal !== 'undefined') {
        // Reduced motion: make sections visible immediately
        document.querySelectorAll('.section:not(#contact)').forEach((section) => {
            section.classList.add('scroll-reveal-section', 'active');
        });
    }

    // ── Feature: Lifecycle & Cleanup ────────────────────────────

    // React to prefers-reduced-motion changes at runtime
    prefersReducedMotion.addEventListener('change', () => {
        // ScrollReveal doesn't support dynamic reconfiguration,
        // but we can at least ensure sections are visible if motion is reduced
        if (prefersReducedMotion.matches) {
            document.querySelectorAll('.scroll-reveal-section').forEach((el) => {
                el.classList.add('active');
            });
        }
    });

})();
