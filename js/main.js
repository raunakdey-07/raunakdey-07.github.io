document.addEventListener('DOMContentLoaded', function() {
    const headerOffset = 70; // Adjusted based on potentially sleeker navbar    // Loading Screen Animation
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeenIntro = sessionStorage.getItem('rd-intro-seen') === '1';
    
    function hideLoadingScreen() {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            mainContent.classList.add('loaded');
        }, 1200);
    }

    function skipLoadingScreen() {
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        if (mainContent) {
            mainContent.classList.add('loaded');
        }
    }

    if (prefersReducedMotion || hasSeenIntro) {
        skipLoadingScreen();
    } else {
        initLoadingNetworkBackground();
        hideLoadingScreen();
        sessionStorage.setItem('rd-intro-seen', '1');
    }

      // Loading Network Background Animation
    function initLoadingNetworkBackground() {
        const canvas = document.getElementById('loading-network-bg');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 100 }; // Smaller radius for loading screen
        const lowPowerMode = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
            || (navigator.deviceMemory && navigator.deviceMemory <= 4);
        const particleCount = lowPowerMode
            ? (window.innerWidth < 768 ? 16 : 24)
            : (window.innerWidth < 768 ? 26 : 40);
        const particleColors = ['#ff003c', '#ff4d6d', '#ff809b'];
        const lineColor = 'rgba(255, 0, 60, 0.2)';
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let canvasRect = canvas.getBoundingClientRect();
        
        class LoadingParticle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.density = Math.random() * 20 + 1;
            }
            
            update() {
                // Mouse interaction
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const maxDistance = mouse.radius;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * this.density * 0.5; // Gentler for loading
                    const directionY = forceDirectionY * force * this.density * 0.5;

                    if (distance < mouse.radius) {
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        // Return to base position
                        if (this.x !== this.baseX) {
                            const dx = this.x - this.baseX;
                            this.x -= dx / 15;
                        }
                        if (this.y !== this.baseY) {
                            const dy = this.y - this.baseY;
                            this.y -= dy / 15;
                        }
                    }
                }
                
                this.baseX += this.speedX;
                this.baseY += this.speedY;
                
                if (this.baseX < 0 || this.baseX > canvas.width) this.speedX *= -1;
                if (this.baseY < 0 || this.baseY > canvas.height) this.speedY *= -1;
                
                this.opacity += (Math.random() - 0.5) * 0.02;
                this.opacity = Math.max(0.1, Math.min(0.7, this.opacity));
            }
            
            draw() {
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = particleColors[Math.floor(Math.random() * particleColors.length)];
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
        
        function connectLoadingParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        let opacity = 1 - (distance / 100);
                        
                        // Enhance lines near mouse
                        if (mouse.x !== null && mouse.y !== null) {
                            const midX = (particles[i].x + particles[j].x) / 2;
                            const midY = (particles[i].y + particles[j].y) / 2;
                            const mouseDistance = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
                            
                            if (mouseDistance < mouse.radius) {
                                opacity *= 1.3;
                            }
                        }
                        
                        ctx.strokeStyle = lineColor.replace('0.2', (opacity * 0.3).toFixed(2));
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            // Mouse connections for loading screen
            if (mouse.x !== null && mouse.y !== null) {
                particles.forEach(particle => {
                    const dx = mouse.x - particle.x;
                    const dy = mouse.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        const opacity = 1 - (distance / mouse.radius);
                        ctx.strokeStyle = `rgba(255, 0, 60, ${opacity * 0.3})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(particle.x, particle.y);
                        ctx.stroke();
                    }
                });
            }
        }
        
        function initLoadingParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                particles.push(new LoadingParticle(x, y));
            }
        }
        
        function animateLoadingBackground() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            connectLoadingParticles();
            
            if (!loadingScreen.classList.contains('hidden')) {
                requestAnimationFrame(animateLoadingBackground);
            }
        }
        
        // Mouse events for loading screen
        canvas.addEventListener('mousemove', (event) => {
            mouse.x = event.clientX - canvasRect.left;
            mouse.y = event.clientY - canvasRect.top;
        });

        canvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            mouse.x = touch.clientX - canvasRect.left;
            mouse.y = touch.clientY - canvasRect.top;
        });

        canvas.addEventListener('touchend', () => {
            mouse.x = null;
            mouse.y = null;
        });
        
        initLoadingParticles();
        animateLoadingBackground();
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvasRect = canvas.getBoundingClientRect();
            initLoadingParticles();
        });

        window.addEventListener('scroll', () => {
            canvasRect = canvas.getBoundingClientRect();
        }, { passive: true });
    }// Typed.js initialization
    if (document.getElementById('typed-role')) {
        if (prefersReducedMotion) {
            document.getElementById('typed-role').textContent = 'Data Science Student.';
        } else {
        new Typed('#typed-role', {
            strings: [
                "Web Developer.",
                "Quant Researcher.",
                "Data Science Student."
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
            if (scrollY + headerOffset >= section.top) {
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

    cacheSectionPositions();
    setActiveLink();
    let activeLinkTicking = false;
    window.addEventListener('scroll', () => {
        if (activeLinkTicking) return;
        activeLinkTicking = true;
        requestAnimationFrame(() => {
            setActiveLink();
            activeLinkTicking = false;
        });
    }, { passive: true });

    window.addEventListener('resize', cacheSectionPositions, { passive: true });
    window.addEventListener('load', cacheSectionPositions);

    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-links a[href^="#"], a.cta-btn--hero[href^="#"], .back-to-top[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                let scrollToPosition = targetTop - (headerOffset - 10);
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
    }    // Swiper Initializations
    if (typeof Swiper !== 'undefined') {
        const projectSwiper = new Swiper('.project-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            autoplay: {
                delay: 4000,
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
        });        const achievementSwiper = new Swiper('.achievement-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            autoplay: {
                delay: 4500,
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
        });        const skillSwiper = new Swiper('.skill-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: '.skill-swiper-pagination',
                clickable: true,
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
    if (!prefersReducedMotion && typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal();
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach((title) => {
            sr.reveal(title, {
                delay: 0,
                distance: '40px',
                duration: 125,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                origin: 'bottom',
                reset: false,
                scale: 0.95,
                viewFactor: 0.1,
                viewOffset: { top: 100, right: 0, bottom: 0, left: 0 },
                beforeReveal: (el) => {
                    el.style.animation = 'none';
                    el.style.transform = 'translateY(40px) scale(0.95)';
                    el.style.opacity = '0';
                    el.style.filter = 'blur(6px)';
                },
                afterReveal: (el) => {
                    el.style.animation = 'sectionTitleReveal 0.2s ease-out forwards';
                    el.style.transform = '';
                    el.style.opacity = '';
                    el.style.filter = '';
                }
            });
        });

        const revealSections = document.querySelectorAll('.section');
        revealSections.forEach((section) => {
            section.classList.add('scroll-reveal-section');
            sr.reveal(section, {
                delay: 200,
                distance: '50px',
                duration: 800,
                easing: 'ease-in-out',
                origin: 'bottom',
                reset: false,
                afterReveal: (el) => {
                    el.classList.add('active');
                }
            });
        });
    }
});
