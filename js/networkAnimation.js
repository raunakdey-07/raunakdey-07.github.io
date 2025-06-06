const canvas = document.getElementById('network-bg');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { 
    x: null, 
    y: null, 
    radius: 200, 
    lastX: null, 
    lastY: null,
    velocity: { x: 0, y: 0 },
    trail: []
}; 

// Enhanced particle count for richer visuals
const particleCount = window.innerWidth < 768 ? 60 : 120; 
// Expanded color palette for artistic effects
const particleColors = [
    '#ff003c', '#ff4d6d', '#ff809b', '#ff1a47', '#ff6680',
    '#cc0033', '#e60039', '#ff3358', '#ff5c7a', '#ff8ca3'
]; 
const lineColor = 'rgba(255, 0, 60, 0.4)';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Animation timing
let animationTime = 0;

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
        
        // Artistic enhancement properties
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
        animationTime += 0.003; // Slowed down from 0.01 for less distracting movement
        
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
                    const orbitalAngle = Math.atan2(dy, dx) + this.angleSpeed * 1.5; // Slower orbit
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
                    this.x += this.magneticForce.x * 0.15; // Slower interpolation
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
                const returnForceX = (this.baseX - this.x) * 0.012;
                const returnForceY = (this.baseY - this.y) * 0.012;
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
            const sineX = Math.sin(animationTime + this.baseX * 0.001) * 0.22;
            const sineY = Math.cos(animationTime + this.baseY * 0.001) * 0.22;
            
            this.baseX += (this.speedX + sineX) * 0.25; // Slower base drift
            this.baseY += (this.speedY + sineY) * 0.25;
            
            // Smooth return to base position
            this.x += (this.baseX - this.x) * 0.01; // Slower return
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

        // Pulsing effect
        this.pulsePhase += 0.008; // Slower pulse
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
        this.angle += this.angleSpeed;
    }

    draw() {
        // Draw particle trail
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length - 1; i++) {
                const current = this.trail[i];
                const next = this.trail[i + 1];
                const trailOpacity = (1 - (i / this.trail.length)) * current.opacity * 0.3;
                
                ctx.strokeStyle = `rgba(255, 0, 60, ${trailOpacity})`;
                ctx.lineWidth = (this.size * (1 - (i / this.trail.length))) * 0.5;
                ctx.beginPath();
                ctx.moveTo(current.x, current.y);
                ctx.lineTo(next.x, next.y);
                ctx.stroke();
            }
        }

        // Enhanced particle rendering with glow
        const glowIntensity = Math.min(1, this.energy / 100);
        const pulseSize = this.size * (1 + Math.sin(this.pulsePhase) * 0.1);
        
        // Outer glow
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
        
        // Main particle with dynamic color
        const energyFactor = this.energy / 100;
        const colorIndex = Math.floor(this.colorIndex + energyFactor * 2) % particleColors.length;
        
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = particleColors[colorIndex];
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner highlight
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
    // Enhanced connection system with artistic effects
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Dynamic connection distance based on particle energy
            const maxConnectionDistance = window.innerWidth < 768 ? 80 : 120;
            const energyFactor = (particles[i].energy + particles[j].energy) / 200;
            const connectionDistance = maxConnectionDistance * (1 + energyFactor * 0.5);

            if (distance < connectionDistance) {
                let opacity = 1 - (distance / connectionDistance);
                
                // Enhanced opacity based on particle energy
                opacity *= (1 + energyFactor * 0.5);
                
                // Artistic line variations
                const lineVariation = Math.sin(animationTime + distance * 0.01) * 0.3 + 0.7;
                opacity *= lineVariation;
                
                // Dynamic line width based on proximity and energy
                const baseLineWidth = 0.5;
                const energyLineWidth = baseLineWidth * (1 + energyFactor);
                
                // Create gradient lines for energy connections
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
                
                // Add secondary connection lines for high energy particles
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
    
    // Enhanced mouse connections with artistic effects
    if (mouse.x !== null && mouse.y !== null) {
        // Mouse cursor glow effect
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
        
        // Dynamic connections from mouse to particles
        particles.forEach(particle => {
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const opacity = (1 - (distance / mouse.radius)) * 0.8;
                const energyBonus = particle.energy / 100;
                
                // Main connection line
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
                
                // Secondary electric-like connections for high energy
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
                
                // Ripple effect around highly energized particles
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
        
        // Magnetic field visualization
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

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    const currentParticleCount = window.innerWidth < 768 ? 60 : 120;
    
    for (let i = 0; i < currentParticleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
    }
}

// Enhanced mouse event listeners with velocity tracking
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const newX = event.clientX - rect.left;
    const newY = event.clientY - rect.top;
    
    // Track mouse velocity for fluid interactions
    if (mouse.x !== null && mouse.y !== null) {
        mouse.velocity.x = newX - mouse.x;
        mouse.velocity.y = newY - mouse.y;
    }
    
    mouse.x = newX;
    mouse.y = newY;
    
    // Add mouse position to trail for visual effects
    mouse.trail.unshift({ x: mouse.x, y: mouse.y, time: Date.now() });
    if (mouse.trail.length > 10) {
        mouse.trail.pop();
    }
}, { passive: true }); // Use passive event listener for better scroll performance

canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
    mouse.velocity = { x: 0, y: 0 };
    mouse.trail = [];
}, { passive: true });

// Enhanced touch event listeners for mobile
canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const newX = touch.clientX - rect.left;
    const newY = touch.clientY - rect.top;
    
    if (mouse.x !== null && mouse.y !== null) {
        mouse.velocity.x = newX - mouse.x;
        mouse.velocity.y = newY - mouse.y;
    }
    
    mouse.x = newX;
    mouse.y = newY;
    
    mouse.trail.unshift({ x: mouse.x, y: mouse.y, time: Date.now() });
    if (mouse.trail.length > 10) {
        mouse.trail.pop();
    }
}, { passive: false }); // preventDefault requires passive: false

canvas.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
    mouse.velocity = { x: 0, y: 0 };
    mouse.trail = [];
}, { passive: true });

function animate() {
    // Clear canvas with subtle fade effect for trails
    ctx.fillStyle = 'rgba(18, 18, 18, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw all particles
    particles.forEach((particle) => {
        particle.update();
        particle.draw();
    });
    
    // Draw particle connections
    connectParticles();
    
    // Increment animation time
    animationTime += 0.006; // Slower global animation time
    
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    init(); // Re-initialize on resize to adjust canvas and particle count
});

// Ensure canvas is present before starting
if (canvas) {
    init();
    animate();
} else {
    console.error('Network animation canvas not found');
}