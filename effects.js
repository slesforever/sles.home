const canvas = document.getElementById('effect-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 60; // 粒子數量

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
        // 從螢幕底部下方開始
        this.y = canvas.height + Math.random() * 200;
        // 隨機大小，長條狀看起來更像光束
        this.width = Math.random() * 2 + 1;
        this.height = Math.random() * 15 + 5;
        this.speedY = Math.random() * 1.2 + 0.3; 
        this.opacity = Math.random() * 0.4 + 0.1;
        this.fade = Math.random() * 0.005 + 0.002;
    }

    update() {
        this.y -= this.speedY;
        
        // 越往上走越透明
        if (this.y < canvas.height * 0.8) {
            this.opacity -= this.fade;
        }

        // 重新循環
        if (this.y < -20 || this.opacity <= 0) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
        // 加點發光效果
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#d4af37';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    // 稍微留下殘影，讓光束更有流動感
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

init();
animate();
