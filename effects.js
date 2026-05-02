const canvas = document.getElementById('effect-canvas');
const ctx = canvas.getContext('2d');

let particles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 1.5 + 0.5; // 往上飄的速度
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = `rgba(212, 175, 55, ${this.opacity})`; // 金色
    }

    update() {
        this.y -= this.speedY;
        if (this.y < -10) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#d4af37';
        ctx.fillRect(this.x, this.y, this.size, this.size * 2); // 長條狀光點
    }
}

function init() {
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

init();
animate();
