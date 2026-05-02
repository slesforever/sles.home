// 確保 HTML 裡有 <canvas id="effect-canvas"></canvas>
const canvas = document.getElementById('effect-canvas');
if (!canvas) {
    console.error("找不到 effect-canvas 元素");
} else {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 70; // 稍微增加數量

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // 在 resize 後重新初始化，防止特效死掉
        init();
    }

    window.addEventListener('resize', resize);
    resize(); // 初始化 resize

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 200;
            this.width = Math.random() * 2 + 1; // 隨機寬度
            this.height = Math.random() * 15 + 8; // 隨機高度，形成光束感
            this.speedY = Math.random() * 1.5 + 0.5; // 由下往上的速度
            this.opacity = Math.random() * 0.6 + 0.2; // 隨機透明度
            this.fade = Math.random() * 0.005 + 0.002; // 隨機淡出速度
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
            // 使用金色 (d4af37)
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            // 強化發光效果
            ctx.shadowBlur = 12;
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
        // 使用微小的透明度清除，製造殘影流動感
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // 這裡是關鍵，控制殘影
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalCompositeOperation = 'lighter'; // 讓疊加的光更亮
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        ctx.globalCompositeOperation = 'source-over'; // 恢復預設

        requestAnimationFrame(animate);
    }

    // 確保只初始化一次
    if (particles.length === 0) {
        init();
        animate();
    }
}
