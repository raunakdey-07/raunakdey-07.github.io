const canvas = document.getElementById('network-bg');
const ctx = canvas.getContext('2d');

let particles = [];
// Adjust particle count for performance vs. density
const particleCount = window.innerWidth < 768 ? 40 : 70; 
// Define theme-consistent colors (black and red theme)
const particleColors = ['#ff003c', '#ff4d6d', '#ff809b']; // Shades of red
const lineColor = 'rgba(255, 0, 60, 0.3)'; // Semi-transparent red for lines

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Keep particles within bounds
        if (this.x < 0 || this.x > canvas.width) {
            this.speedX *= -1;
        }
        if (this.y < 0 || this.y > canvas.height) {
            this.speedY *= -1;
        }

        if (this.size > 0.1) this.size -= 0.03; // Slower shrink, particles last longer
        else { // Respawn particle
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1; // Reset size
            this.speedX = (Math.random() * 1 - 0.5) * 0.5; // Slower speed
            this.speedY = (Math.random() * 1 - 0.5) * 0.5; // Slower speed
        }
    }

    draw() {
        ctx.fillStyle = particleColors[Math.floor(Math.random() * particleColors.length)];
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

function connectParticles() {
    let opacityValue = 1;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) { // j starts from i + 1 to avoid redundant checks and self-connection
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Adjust connection distance based on screen size
            const connectionDistance = window.innerWidth < 768 ? 80 : 120;

            if (distance < connectionDistance) {
                opacityValue = 1 - (distance / connectionDistance); // Lines fade with distance
                ctx.strokeStyle = lineColor.replace('0.3', opacityValue.toFixed(2)); // Dynamically set opacity
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    const currentParticleCount = window.innerWidth < 768 ? 40 : 70;
    for (let i = 0; i < currentParticleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        // Remove particles that are too small (optional, if not respawning)
        // if (particle.size <= 0.1) {
        //     particles.splice(index, 1);
        // }
    });
    // Add new particles if count drops below threshold (optional, if not respawning)
    // while (particles.length < particleCount) {
    //     const x = Math.random() * canvas.width;
    //     const y = Math.random() * canvas.height;
    //     particles.push(new Particle(x, y));
    // }
    connectParticles();
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