const canvas = document.getElementById('network-bg');
const ctx = canvas.getContext('2d');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isAndroidPhone = /Android/i.test(navigator.userAgent) && window.innerWidth <= 900;
const isLowPowerDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4);
const motionMultiplier = prefersReducedMotion ? 0 : (isAndroidPhone ? 1.8 : 1);
const timeScale = motionMultiplier > 0 ? 1 / motionMultiplier : 1;

let particles = [];
let mouse = { 
    x: null, 
    y: null, 
    radius: 200, 
    lastX: null, 
    lastY: null,
    velocity: { x: 0, y: 0 }
}; 

// Adaptive particle count for balanced visuals and runtime cost
const particleCount = isLowPowerDevice
    ? (window.innerWidth < 768 ? 28 : 48)
    : (window.innerWidth < 768 ? 44 : 90);
// Expanded color palette for artistic effects
const particleColors = [
    '#ff003c', '#ff4d6d', '#ff809b', '#ff1a47', '#ff6680',
    '#cc0033', '#e60039', '#ff3358', '#ff5c7a', '#ff8ca3'
]; 
const lineColor = 'rgba(255, 0, 60, 0.4)';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let canvasRect = canvas.getBoundingClientRect();

// Animation timing
let animationTime = 0;
let lastFrameTime = 0;
const frameInterval = prefersReducedMotion ? 1000 : (isLowPowerDevice ? 33 : 20) * timeScale;

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x; 
        this.baseY = y;
        this.size = Math.random() * 4 + 1;
        this.baseSize = this.size;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.density = Math.random() * 40 + 10; 
        this.opacity = Math.random() * 0.8 + 0.2;
        this.baseOpacity = this.opacity;
        
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = (Math.random() - 0.5) * 0.02;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.colorIndex = Math.floor(Math.random() * particleColors.length);
        this.trail = [];
        this.maxTrailLength = 5;
        this.magneticForce = { x: 0, y: 0 };
        this.orbitalRadius = Math.random() * 100 + 50;
        this.isOrbiting = false;
        this.energy = Math.random() * 100;
    }

    update() {
        animationTime += 0.003 * motionMultiplier;
        
        // Update mouse velocity for fluid interactions
        if (mouse.x !== null && mouse.y !== null) {
            if (mouse.lastX !== null && mouse.lastY !== null) {
                mouse.velocity.x = mouse.x - mouse.lastX;
                mouse.velocity.y = mouse.y - mouse.lastY;
            }
            mouse.lastX = mouse.x;
            mouse.lastY = mouse.y;
        }

        // Store previous position for trail effect
        this.trail.unshift({ x: this.x, y: this.y, opacity: this.opacity });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }

        // Enhanced mouse interaction with artistic effects
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = mouse.radius;
            
            if (distance < maxDistance) {
                // Dynamic interaction based on mouse velocity
                const velocityMagnitude = Math.sqrt(mouse.velocity.x ** 2 + mouse.velocity.y ** 2);
                const interactionStrength = Math.max(0.3, velocityMagnitude * 0.1);
                
                // Orbital motion for close particles
                if (distance < maxDistance * 0.3) {
                    this.isOrbiting = true;
                    const orbitalAngle = Math.atan2(dy, dx) + this.angleSpeed * 1.5 * motionMultiplier;
                    this.x = mouse.x + Math.cos(orbitalAngle) * this.orbitalRadius * (distance / maxDistance);
                    this.y = mouse.y + Math.sin(orbitalAngle) * this.orbitalRadius * (distance / maxDistance);
                } else {
                    this.isOrbiting = false;
                    
                    // Fluid magnetic field effect
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (maxDistance - distance) / maxDistance;
                    
                    // Wave-like distortion
                    const wave = Math.sin(animationTime + distance * 0.01) * 0.18; // Reduced wave amplitude
                    const perpX = -forceDirectionY * wave * force;
                    const perpY = forceDirectionX * wave * force;
                    this.magneticForce.x = forceDirectionX * force * this.density * interactionStrength * 0.5 + perpX; // Reduce force
                    this.magneticForce.y = forceDirectionY * force * this.density * interactionStrength * 0.5 + perpY;
                    this.x += this.magneticForce.x * 0.15 * motionMultiplier;
                    this.y += this.magneticForce.y * 0.15;
                }
                
                // Dynamic size and opacity based on proximity
                const proximityFactor = 1 - (distance / maxDistance);
                this.size = this.baseSize * (1 + proximityFactor * 2);
                this.opacity = this.baseOpacity * (1 + proximityFactor);
                this.energy = Math.min(100, this.energy + proximityFactor * 10);
                
            } else {
                // Return to natural state
                this.isOrbiting = false;
                this.magneticForce.x *= 0.95;
                this.magneticForce.y *= 0.95;
                
                // Smooth return to base position with sine wave motion
                const returnForceX = (this.baseX - this.x) * 0.012 * motionMultiplier;
                const returnForceY = (this.baseY - this.y) * 0.012 * motionMultiplier;
                this.x += returnForceX;
                this.y += returnForceY;
                
                // Return to base size and opacity
                this.size += (this.baseSize - this.size) * 0.05;
                this.opacity += (this.baseOpacity - this.opacity) * 0.05;
                this.energy *= 0.99;
            }
        } else {
            // Natural floating motion with sine waves
            this.isOrbiting = false;
            this.magneticForce.x *= 0.9;
            this.magneticForce.y *= 0.9;
            
            // Organic sine wave movement
            const sineX = Math.sin(animationTime + this.baseX * 0.001) * 0.22 * motionMultiplier;
            const sineY = Math.cos(animationTime + this.baseY * 0.001) * 0.22 * motionMultiplier;
            
            this.baseX += (this.speedX + sineX) * 0.25 * motionMultiplier;
            this.baseY += (this.speedY + sineY) * 0.25;
            
            // Smooth return to base position
            this.x += (this.baseX - this.x) * 0.01 * motionMultiplier;
            this.y += (this.baseY - this.y) * 0.01;
            
            this.size += (this.baseSize - this.size) * 0.05;
            this.opacity += (this.baseOpacity - this.opacity) * 0.05;
            this.energy *= 0.99;
        }

        // Boundary reflection with smooth transitions
        if (this.baseX < 0 || this.baseX > canvas.width) {
            this.speedX *= -0.8;
            this.baseX = Math.max(0, Math.min(canvas.width, this.baseX));
        }
        if (this.baseY < 0 || this.baseY > canvas.height) {
            this.speedY *= -0.8;
            this.baseY = Math.max(0, Math.min(canvas.height, this.baseY));
        }

        this.pulsePhase += 0.008 * motionMultiplier;
        this.angle += this.angleSpeed;
    }

    draw() {
        const glowIntensity = Math.min(1, this.energy / 100);
        const pulseSize = this.size * (1 + Math.sin(this.pulsePhase) * 0.1);

        if (glowIntensity > 0.1) {
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, pulseSize * 3
            );
            gradient.addColorStop(0, `rgba(255, 0, 60, ${this.opacity * glowIntensity * 0.3})`);
            gradient.addColorStop(1, 'rgba(255, 0, 60, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseSize * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const energyFactor = this.energy / 100;
        const colorIndex = Math.floor(this.colorIndex + energyFactor * 2) % particleColors.length;
        
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = particleColors[colorIndex];
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        if (energyFactor > 0.3) {
            ctx.fillStyle = `rgba(255, 255, 255, ${energyFactor * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const maxConnectionDistance = window.innerWidth < 768 ? 80 : 120;
            const energyFactor = (particles[i].energy + particles[j].energy) / 200;
            const connectionDistance = maxConnectionDistance * (1 + energyFactor * 0.5);

            if (distance < connectionDistance) {
                let opacity = 1 - (distance / connectionDistance);
                
                opacity *= (1 + energyFactor * 0.5);

                const lineVariation = Math.sin(animationTime + distance * 0.01) * 0.3 + 0.7;
                opacity *= lineVariation;

                const baseLineWidth = 0.5;
                const energyLineWidth = baseLineWidth * (1 + energyFactor);

                if (energyFactor > 0.3) {
                    const gradient = ctx.createLinearGradient(
                        particles[i].x, particles[i].y,
                        particles[j].x, particles[j].y
                    );
                    gradient.addColorStop(0, `rgba(255, 0, 60, ${opacity})`);
                    gradient.addColorStop(0.5, `rgba(255, 80, 120, ${opacity * 1.2})`);
                    gradient.addColorStop(1, `rgba(255, 0, 60, ${opacity})`);
                    ctx.strokeStyle = gradient;
                } else {
                    ctx.strokeStyle = `rgba(255, 0, 60, ${opacity})`;
                }
                
                ctx.lineWidth = energyLineWidth;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
                
                if (energyFactor > 0.6) {
                    ctx.strokeStyle = `rgba(255, 120, 160, ${opacity * 0.3})`;
                    ctx.lineWidth = energyLineWidth * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    if (mouse.x !== null && mouse.y !== null) {
        const mouseGlow = ctx.createRadialGradient(
            mouse.x, mouse.y, 0,
            mouse.x, mouse.y, mouse.radius
        );
        mouseGlow.addColorStop(0, 'rgba(255, 0, 60, 0.1)');
        mouseGlow.addColorStop(0.7, 'rgba(255, 0, 60, 0.05)');
        mouseGlow.addColorStop(1, 'rgba(255, 0, 60, 0)');
        
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
        
        particles.forEach(particle => {
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const opacity = (1 - (distance / mouse.radius)) * 0.8;
                const energyBonus = particle.energy / 100;
                
                const connectionGradient = ctx.createLinearGradient(
                    mouse.x, mouse.y,
                    particle.x, particle.y
                );
                connectionGradient.addColorStop(0, `rgba(255, 80, 120, ${opacity})`);
                connectionGradient.addColorStop(0.6, `rgba(255, 0, 60, ${opacity * 0.8})`);
                connectionGradient.addColorStop(1, `rgba(255, 40, 80, ${opacity * 0.6})`);
                
                ctx.strokeStyle = connectionGradient;
                ctx.lineWidth = 1.5 + energyBonus;
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(particle.x, particle.y);
                ctx.stroke();
                
                if (energyBonus > 0.5 && Math.random() > 0.7) {
                    const midX = (mouse.x + particle.x) / 2;
                    const midY = (mouse.y + particle.y) / 2;
                    const offsetX = (Math.random() - 0.5) * 40;
                    const offsetY = (Math.random() - 0.5) * 40;
                    
                    ctx.strokeStyle = `rgba(255, 200, 220, ${opacity * 0.4})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(mouse.x, mouse.y);
                    ctx.quadraticCurveTo(midX + offsetX, midY + offsetY, particle.x, particle.y);
                    ctx.stroke();
                }
                
                if (energyBonus > 0.7) {
                    const rippleRadius = 20 + Math.sin(animationTime * 3) * 10;
                    ctx.strokeStyle = `rgba(255, 0, 60, ${opacity * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, rippleRadius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        });
        
        const velocityMagnitude = Math.sqrt(mouse.velocity.x ** 2 + mouse.velocity.y ** 2);
        if (velocityMagnitude > 2) {
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                const fieldRadius = mouse.radius * 0.7;
                const fieldX = mouse.x + Math.cos(angle + animationTime * 2) * fieldRadius;
                const fieldY = mouse.y + Math.sin(angle + animationTime * 2) * fieldRadius;
                
                ctx.fillStyle = `rgba(255, 0, 60, ${velocityMagnitude * 0.02})`;
                ctx.beginPath();
                ctx.arc(fieldX, fieldY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawHiddenMotifs() {
    const scale = Math.min(canvas.width, canvas.height);
    const motifAlpha = isAndroidPhone ? 0.24 : 0.18;
    const motifGlow = isAndroidPhone ? 0.35 : 0.24;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    drawScorpioMotif(scale, motifAlpha, motifGlow);
    drawBirdMotif(scale, motifAlpha, motifGlow);
    drawPawMotif(scale, motifAlpha, motifGlow);

    ctx.restore();
}

function drawScorpioMotif(scale, motifAlpha, motifGlow) {
    const centerX = canvas.width * 0.83;
    const centerY = canvas.height * 0.18;
    const points = [
        [centerX - scale * 0.07, centerY + scale * 0.01],
        [centerX - scale * 0.04, centerY - scale * 0.03],
        [centerX - scale * 0.01, centerY + scale * 0.00],
        [centerX + scale * 0.03, centerY + scale * 0.04],
        [centerX + scale * 0.06, centerY + scale * 0.08],
        [centerX + scale * 0.09, centerY + scale * 0.12],
        [centerX + scale * 0.12, centerY + scale * 0.16]
    ];

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = `rgba(255, 120, 160, ${motifGlow})`;
    ctx.strokeStyle = `rgba(255, 140, 170, ${motifAlpha})`;
    ctx.fillStyle = `rgba(255, 210, 225, ${motifAlpha + 0.08})`;
    ctx.lineWidth = 1.25;

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(points[points.length - 1][0], points[points.length - 1][1]);
    ctx.quadraticCurveTo(centerX + scale * 0.15, centerY + scale * 0.19, centerX + scale * 0.11, centerY + scale * 0.27);
    ctx.quadraticCurveTo(centerX + scale * 0.08, centerY + scale * 0.33, centerX + scale * 0.03, centerY + scale * 0.35);
    ctx.stroke();

    points.forEach(([x, y], index) => {
        ctx.beginPath();
        ctx.arc(x, y, index === 0 ? 2.4 : 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

function drawBirdMotif(scale, motifAlpha, motifGlow) {
    const baseX = canvas.width * 0.16;
    const baseY = canvas.height * 0.23;
    const birdScale = scale * 0.06;

    ctx.save();
    ctx.shadowBlur = 16;
    ctx.shadowColor = `rgba(255, 100, 120, ${motifGlow})`;
    ctx.strokeStyle = `rgba(255, 120, 150, ${motifAlpha})`;
    ctx.fillStyle = `rgba(255, 200, 215, ${motifAlpha})`;
    ctx.lineWidth = 1.15;

    ctx.beginPath();
    ctx.moveTo(baseX - birdScale * 0.65, baseY + birdScale * 0.1);
    ctx.quadraticCurveTo(baseX - birdScale * 0.2, baseY - birdScale * 0.55, baseX + birdScale * 0.35, baseY - birdScale * 0.12);
    ctx.quadraticCurveTo(baseX + birdScale * 0.02, baseY - birdScale * 0.05, baseX - birdScale * 0.35, baseY + birdScale * 0.2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(baseX + birdScale * 0.08, baseY + birdScale * 0.02);
    ctx.lineTo(baseX + birdScale * 0.42, baseY + birdScale * 0.2);
    ctx.lineTo(baseX + birdScale * 0.03, baseY + birdScale * 0.26);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(baseX - birdScale * 0.42, baseY + birdScale * 0.18, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(baseX - birdScale * 0.48, baseY + birdScale * 0.22);
    ctx.lineTo(baseX - birdScale * 0.6, baseY + birdScale * 0.28);
    ctx.stroke();
    ctx.restore();
}

function drawPawMotif(scale, motifAlpha, motifGlow) {
    const baseX = canvas.width * 0.82;
    const baseY = canvas.height * 0.83;
    const pawScale = scale * 0.028;

    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = `rgba(255, 130, 150, ${motifGlow})`;
    ctx.strokeStyle = `rgba(255, 150, 175, ${motifAlpha})`;
    ctx.fillStyle = `rgba(255, 210, 222, ${motifAlpha})`;
    ctx.lineWidth = 1.1;

    const toes = [
        [baseX - pawScale * 1.8, baseY - pawScale * 1.6, 2.1],
        [baseX - pawScale * 0.6, baseY - pawScale * 2.0, 2.2],
        [baseX + pawScale * 0.8, baseY - pawScale * 1.8, 2.2],
        [baseX + pawScale * 2.0, baseY - pawScale * 1.2, 2.0]
    ];

    toes.forEach(([x, y, radius]) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.beginPath();
    ctx.moveTo(baseX - pawScale * 2.6, baseY + pawScale * 0.2);
    ctx.bezierCurveTo(
        baseX - pawScale * 2.1, baseY - pawScale * 1.3,
        baseX + pawScale * 2.2, baseY - pawScale * 1.1,
        baseX + pawScale * 2.5, baseY + pawScale * 0.7
    );
    ctx.bezierCurveTo(
        baseX + pawScale * 1.8, baseY + pawScale * 2.2,
        baseX - pawScale * 1.7, baseY + pawScale * 2.1,
        baseX - pawScale * 2.6, baseY + pawScale * 0.2
    );
    ctx.stroke();
    ctx.fill();
    ctx.restore();
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    const currentParticleCount = isLowPowerDevice
        ? (window.innerWidth < 768 ? 28 : 48)
        : (window.innerWidth < 768 ? 44 : 90);
    
    for (let i = 0; i < currentParticleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
    }
}

canvas.addEventListener('mousemove', (event) => {
    const newX = event.clientX - canvasRect.left;
    const newY = event.clientY - canvasRect.top;
    
    if (mouse.x !== null && mouse.y !== null) {
        mouse.velocity.x = newX - mouse.x;
        mouse.velocity.y = newY - mouse.y;
    }
    
    mouse.x = newX;
    mouse.y = newY;
    
}, { passive: true }); // Use passive event listener for better scroll performance

canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
    mouse.velocity = { x: 0, y: 0 };
}, { passive: true });

canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const newX = touch.clientX - canvasRect.left;
    const newY = touch.clientY - canvasRect.top;
    
    if (mouse.x !== null && mouse.y !== null) {
        mouse.velocity.x = newX - mouse.x;
        mouse.velocity.y = newY - mouse.y;
    }
    
    mouse.x = newX;
    mouse.y = newY;
    
}, { passive: false }); // preventDefault requires passive: false

canvas.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
    mouse.velocity = { x: 0, y: 0 };
}, { passive: true });

function animate(timestamp = 0) {
    if (timestamp - lastFrameTime < frameInterval) {
        requestAnimationFrame(animate);
        return;
    }
    lastFrameTime = timestamp;

    ctx.fillStyle = 'rgba(18, 18, 18, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
        particle.update();
        particle.draw();
    });

    connectParticles();
    drawHiddenMotifs();

    animationTime += 0.006 * motionMultiplier;
    
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    init();
    canvasRect = canvas.getBoundingClientRect();
});

window.addEventListener('scroll', () => {
    canvasRect = canvas.getBoundingClientRect();
}, { passive: true });

// Ensure canvas is present before starting
if (canvas) {
    init();
    if (prefersReducedMotion) {
        ctx.fillStyle = 'rgba(18, 18, 18, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        particles.forEach((particle) => {
            particle.draw();
        });
        connectParticles();
    } else {
        animate();
    }
} else {
    console.error('Network animation canvas not found');
}
