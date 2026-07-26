class CatcherGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.timeLeft = 45;
        this.isGameOver = false;
        
        // Catcher positioning
        this.catcherX = 175; // Center of 400px width canvas
        this.catcherWidth = 90;
        this.catcherHeight = 85;
        
        this.beans = [];
        this.particles = [];
        this.floatingTexts = [];
        
        this.gameInterval = null;
        this.timerInterval = null;
        
        // Character SVGs & Cup Catcher
        this.charImg = new Image();
        this.catcherCupImg = new Image();
        this.beanImg = new Image();
        this.goldenBeanImg = new Image();
        
        this.initImages();
    }

    initImages() {
        const charType = state.selectedCharacter || 'girl';
        const rawCharSVG = AVATAR_SVGS[charType];
        
        const rawCupSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80">
            <path d="M 10,10 L 90,10 L 80,65 C 80,72 20,72 20,65 Z" fill="#ffab40" stroke="#e65100" stroke-width="4"/>
            <path d="M 88,25 C 98,25 98,45 88,45" stroke="#ffab40" stroke-width="5" fill="none" stroke-linecap="round"/>
            <text x="50" y="42" font-size="10" font-family="'Fredoka', sans-serif" fill="#e65100" font-weight="bold" text-anchor="middle">LUUQ</text>
        </svg>`;

        const rawBeanSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="32" ry="42" fill="#5c3826" stroke="#331e13" stroke-width="4" transform="rotate(-15, 50, 50)"/>
            <path d="M 50,10 Q 56,32 44,50 Q 56,68 50,90" stroke="#331e13" stroke-width="4.5" fill="none" stroke-linecap="round" transform="rotate(-15, 50, 50)"/>
            <ellipse cx="36" cy="40" rx="5" ry="12" fill="#7a4b33" transform="rotate(-25, 36, 40)"/>
        </svg>`;

        const rawGoldenBeanSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="32" ry="42" fill="#ffd700" stroke="#ca8a04" stroke-width="4" transform="rotate(-15, 50, 50)"/>
            <path d="M 50,10 Q 56,32 44,50 Q 56,68 50,90" stroke="#ca8a04" stroke-width="4.5" fill="none" stroke-linecap="round" transform="rotate(-15, 50, 50)"/>
            <ellipse cx="36" cy="40" rx="5" ry="12" fill="#fff9a6" transform="rotate(-25, 36, 40)"/>
        </svg>`;

        this.charImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawCharSVG);
        this.catcherCupImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawCupSVG);
        this.beanImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawBeanSVG);
        this.goldenBeanImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawGoldenBeanSVG);
    }

    start() {
        this.score = 0;
        this.timeLeft = 45;
        this.isGameOver = false;
        this.beans = [];
        this.particles = [];
        this.floatingTexts = [];
        
        this.setupHTML();
        this.updateStatus();
        this.bindEvents();

        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);

        // Spawn bean every 800ms
        this.gameInterval = setInterval(() => this.spawnBean(), 800);
        this.timerInterval = setInterval(() => this.tickTimer(), 1000);

        this.drawLoop();
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="catcher-game-container">
                <canvas id="catcherCanvas" width="400" height="400"></canvas>
                <div class="catcher-instructions">Sağa sola hareket etmek için parmağınla sürükle veya fareyi oynat!</div>
            </div>
        `;
        this.canvas = document.getElementById('catcherCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    updateStatus() {
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="status-item">Skor: <span id="catcher-score">${this.score}</span></div>
                <div class="status-item">Süre: <span id="catcher-time">${this.timeLeft}s</span></div>
            `;
        }
    }

    spawnBean() {
        if (this.isGameOver) return;
        
        const isGolden = Math.random() < 0.15; // 15% chance of golden bean
        const size = Math.random() * 10 + 30; // 30px to 40px - BIG AND VERY VISIBLE
        this.beans.push({
            x: Math.random() * (this.canvas.width - size),
            y: -50,
            width: size,
            height: size,
            speed: Math.random() * 2 + 3,
            isGolden: isGolden,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05
        });
    }

    tickTimer() {
        if (this.isGameOver) return;
        this.timeLeft--;
        this.updateStatus();
        if (this.timeLeft <= 0) {
            this.gameOver();
        }
    }

    bindEvents() {
        const handleMove = (clientX) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const x = (clientX - rect.left) * scaleX;
            // Center catcher on X
            this.catcherX = Math.max(0, Math.min(this.canvas.width - this.catcherWidth, x - this.catcherWidth / 2));
        };

        // Mouse Move
        this.mouseMoveHandler = (e) => {
            handleMove(e.clientX);
        };
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);

        // Touch Move
        this.touchMoveHandler = (e) => {
            if (e.touches && e.touches[0]) {
                handleMove(e.touches[0].clientX);
            }
            e.preventDefault();
        };
        this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        this.canvas.addEventListener('touchstart', this.touchMoveHandler, { passive: false });
    }

    drawLoop() {
        if (this.isGameOver || !this.ctx) return;

        // Clear Canvas
        this.ctx.fillStyle = '#2c104e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Catcher (Character + Wide Cup on head)
        const charY = this.canvas.height - this.catcherHeight;
        
        // Character Body
        this.ctx.drawImage(this.charImg, this.catcherX + 15, charY + 25, 60, 60);
        // Catching Cup (held above or on head)
        this.ctx.drawImage(this.catcherCupImg, this.catcherX, charY - 5, this.catcherWidth, 40);

        // Move and draw Beans
        this.beans.forEach((bean, idx) => {
            bean.y += bean.speed;
            bean.rotation += bean.rotSpeed;

            // Collision check (bean hits top edge of catcher cup)
            const cupTop = charY - 5;
            const isCollidingX = (bean.x + bean.width / 2) >= this.catcherX && (bean.x + bean.width / 2) <= (this.catcherX + this.catcherWidth);
            const isCollidingY = (bean.y + bean.height) >= cupTop && (bean.y + bean.height) <= (cupTop + 25);

            if (isCollidingX && isCollidingY) {
                // Catch!
                const points = bean.isGolden ? 20 : 10;
                this.score += points;
                this.updateStatus();
                
                soundEngine.play('drop'); // catching sound

                // Create explosion particles (coffee brown or golden yellow)
                const px = bean.x + bean.width / 2;
                const py = bean.y + bean.height / 2;
                this.createExplosion(px, py, bean.isGolden);

                // Floating Text
                this.floatingTexts.push({
                    text: `+${points}`,
                    x: px,
                    y: py,
                    alpha: 1.0,
                    yOffset: 0,
                    color: bean.isGolden ? '#ffd700' : '#ffab40'
                });

                // Remove bean
                this.beans.splice(idx, 1);
            } 
            // Miss check
            else if (bean.y > this.canvas.height) {
                // Particle splash on floor
                this.createExplosion(bean.x + bean.width / 2, this.canvas.height - 5, false, 5);
                this.beans.splice(idx, 1);
            } 
            // Draw bean
            else {
                this.ctx.save();
                this.ctx.translate(bean.x + bean.width / 2, bean.y + bean.height / 2);
                this.ctx.rotate(bean.rotation);
                const activeImg = bean.isGolden ? this.goldenBeanImg : this.beanImg;
                this.ctx.drawImage(activeImg, -bean.width / 2, -bean.height / 2, bean.width, bean.height);
                this.ctx.restore();
            }
        });

        // Draw and update particles
        this.particles.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.04;
            if (p.alpha <= 0) {
                this.particles.splice(idx, 1);
            } else {
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });

        // Draw and update floating texts
        this.floatingTexts.forEach((t, idx) => {
            t.yOffset -= 1;
            t.alpha -= 0.03;
            if (t.alpha <= 0) {
                this.floatingTexts.splice(idx, 1);
            } else {
                this.ctx.save();
                this.ctx.globalAlpha = t.alpha;
                this.ctx.fillStyle = t.color || '#ffffff';
                this.ctx.font = `bold 18px Fredoka`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(t.text, t.x, t.y + t.yOffset);
                this.ctx.restore();
            }
        });

        requestAnimationFrame(() => this.drawLoop());
    }

    createExplosion(x, y, isGolden, count = 12) {
        const colors = isGolden ? ['#ffe082', '#ffd54f', '#ffca28', '#ffd700'] : ['#8d6e63', '#795548', '#6d4c41', '#5c3826'];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 4 + 3,
                alpha: 1.0
            });
        }
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        clearInterval(this.timerInterval);
        triggerConfetti();

        setTimeout(() => {
            this.container.innerHTML = `
                <div class="game-win-overlay">
                    <h2>Süre Bitti! ☕</h2>
                    <p>Müthiş topladın!</p>
                    <div class="win-stats">
                        <div>Yakalanan Çekirdek: <strong>${this.score / 10} adet</strong></div>
                        <div>Toplam Skor: <strong>${this.score}</strong></div>
                    </div>
                    <button class="play-again-btn" onclick="state.activeGameInstance.start()">Tekrar Dene</button>
                </div>
            `;
        }, 600);
    }

    destroy() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        clearInterval(this.timerInterval);
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
        this.container.innerHTML = '';
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) statusContainer.innerHTML = '';
    }
}

gameRegistry['catcher'] = CatcherGame;
