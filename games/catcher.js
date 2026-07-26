class CatcherGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.timeLeft = 45;
        this.isGameOver = false;
        
        // Catcher positioning
        this.catcherX = 155; // Center of 400px width canvas
        this.catcherWidth = 90;
        this.catcherHeight = 80;
        this.catcherSpeed = 12;
        
        this.beans = [];
        this.particles = [];
        this.floatingTexts = [];
        
        this.gameInterval = null;
        this.timerInterval = null;
        
        // Character SVG Image
        this.charImg = new Image();
        this.isCharLoaded = false;
        this.initCharImage();
    }

    initCharImage() {
        const charType = state.selectedCharacter || 'girl';
        const rawCharSVG = AVATAR_SVGS[charType];
        
        this.charImg.onload = () => {
            this.isCharLoaded = true;
        };
        this.charImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawCharSVG);
    }

    start() {
        this.score = 0;
        this.timeLeft = 45;
        this.isGameOver = false;
        this.catcherX = 155;
        this.beans = [];
        this.particles = [];
        this.floatingTexts = [];
        
        this.setupHTML();
        this.updateStatus();
        this.bindEvents();

        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);

        // Spawn bean every 700ms
        this.gameInterval = setInterval(() => this.spawnBean(), 700);
        this.timerInterval = setInterval(() => this.tickTimer(), 1000);

        this.drawLoop();
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="catcher-game-container">
                <canvas id="catcherCanvas" width="400" height="400"></canvas>
                <div class="catcher-instructions">Farenle/parmağınla sürükleyerek veya ok tuşlarıyla çekirdekleri yakala!</div>
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
        
        const isGolden = Math.random() < 0.2; // 20% chance of golden bean
        const size = Math.random() * 8 + 34; // 34px to 42px - LARGE & VERY CLEAR
        this.beans.push({
            x: Math.random() * (this.canvas.width - size - 20) + 10,
            y: -40,
            width: size,
            height: size * 1.2, // Slightly elongated oval
            speed: Math.random() * 2 + 3.5,
            isGolden: isGolden,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.08
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
        const moveCatcherTo = (clientX) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const x = (clientX - rect.left) * scaleX;
            this.catcherX = Math.max(0, Math.min(this.canvas.width - this.catcherWidth, x - this.catcherWidth / 2));
        };

        // Mouse Move
        this.mouseMoveHandler = (e) => moveCatcherTo(e.clientX);
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);

        // Touch Move
        this.touchMoveHandler = (e) => {
            if (e.touches && e.touches[0]) moveCatcherTo(e.touches[0].clientX);
            e.preventDefault();
        };
        this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        this.canvas.addEventListener('touchstart', this.touchMoveHandler, { passive: false });

        // Keyboard Controls (Arrow Keys)
        this.keyDownHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.catcherX = Math.max(0, this.catcherX - 25);
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.catcherX = Math.min(this.canvas.width - this.catcherWidth, this.catcherX + 25);
            }
        };
        window.addEventListener('keydown', this.keyDownHandler);
    }

    drawLoop() {
        if (this.isGameOver || !this.ctx) return;

        // Clear Canvas
        this.ctx.fillStyle = '#2c104e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Catcher (Character avatar + LUUQ Cup on top)
        const charY = this.canvas.height - this.catcherHeight;
        
        // Character Body/Avatar
        if (this.isCharLoaded) {
            this.ctx.drawImage(this.charImg, this.catcherX + 15, charY + 25, 60, 60);
        } else {
            // Native fallback head
            this.ctx.fillStyle = '#ffe0b2';
            this.ctx.beginPath();
            this.ctx.arc(this.catcherX + 45, charY + 50, 25, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Catching Cup (held on top of head)
        this.drawCup(this.catcherX, charY - 5, this.catcherWidth, 35);

        // Move and draw Coffee Beans
        this.beans.forEach((bean, idx) => {
            bean.y += bean.speed;
            bean.rotation += bean.rotSpeed;

            // Collision check (Hits cup rim)
            const cupTop = charY - 5;
            const beanBottom = bean.y + bean.height / 2;
            const beanCenterX = bean.x;

            const isCollidingX = beanCenterX >= (this.catcherX - 10) && beanCenterX <= (this.catcherX + this.catcherWidth + 10);
            const isCollidingY = beanBottom >= cupTop && (beanBottom - bean.speed) <= (cupTop + 25);

            if (isCollidingX && isCollidingY) {
                // Catch!
                const points = bean.isGolden ? 20 : 10;
                this.score += points;
                this.updateStatus();
                
                soundEngine.play('drop');

                // Explosion particles
                this.createExplosion(bean.x, bean.y, bean.isGolden);

                // Floating Text
                this.floatingTexts.push({
                    text: `+${points}`,
                    x: bean.x,
                    y: bean.y,
                    alpha: 1.0,
                    yOffset: 0,
                    color: bean.isGolden ? '#ffd700' : '#ffab40'
                });

                this.beans.splice(idx, 1);
            } 
            // Miss check (hits floor)
            else if (bean.y - bean.height / 2 > this.canvas.height) {
                this.createExplosion(bean.x, this.canvas.height - 5, false, 5);
                this.beans.splice(idx, 1);
            } 
            // Draw bean natively
            else {
                this.drawCoffeeBean(bean.x, bean.y, bean.width, bean.height, bean.isGolden, bean.rotation);
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
            t.yOffset -= 1.2;
            t.alpha -= 0.03;
            if (t.alpha <= 0) {
                this.floatingTexts.splice(idx, 1);
            } else {
                this.ctx.save();
                this.ctx.globalAlpha = t.alpha;
                this.ctx.fillStyle = t.color || '#ffffff';
                this.ctx.font = 'bold 18px Fredoka';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(t.text, t.x, t.y + t.yOffset);
                this.ctx.restore();
            }
        });

        requestAnimationFrame(() => this.drawLoop());
    }

    // Native Canvas 2D Coffee Bean Renderer (100% reliable)
    drawCoffeeBean(x, y, width, height, isGolden, rotation) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);

        const rx = width / 2;
        const ry = height / 2;

        // Outer Bean Body
        this.ctx.fillStyle = isGolden ? '#ffd700' : '#5c3826';
        this.ctx.strokeStyle = isGolden ? '#ca8a04' : '#331e13';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, rx, ry, -Math.PI / 12, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // S-curve crack line
        this.ctx.strokeStyle = isGolden ? '#b45309' : '#26140b';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -ry * 0.75);
        this.ctx.bezierCurveTo(rx * 0.35, -ry * 0.25, -rx * 0.35, ry * 0.25, 0, ry * 0.75);
        this.ctx.stroke();

        // Sheen highlight
        this.ctx.fillStyle = isGolden ? '#fff9a6' : '#8d5b42';
        this.ctx.beginPath();
        this.ctx.ellipse(-rx * 0.35, -ry * 0.2, rx * 0.18, ry * 0.3, -Math.PI / 6, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    // Native Canvas 2D Cup Renderer
    drawCup(x, y, width, height) {
        this.ctx.save();
        
        // Cup Body
        this.ctx.fillStyle = '#ffab40';
        this.ctx.strokeStyle = '#e65100';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 5, y);
        this.ctx.lineTo(x + width - 5, y);
        this.ctx.lineTo(x + width - 15, y + height);
        this.ctx.lineTo(x + 15, y + height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Handle
        this.ctx.beginPath();
        this.ctx.arc(x + width - 8, y + height / 2, 10, -Math.PI/2, Math.PI/2);
        this.ctx.strokeStyle = '#ffab40';
        this.ctx.lineWidth = 4.5;
        this.ctx.stroke();

        // LUUQ text on cup
        this.ctx.fillStyle = '#e65100';
        this.ctx.font = 'bold 13px Fredoka';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('LUUQ', x + width / 2, y + height / 2);

        this.ctx.restore();
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
        window.removeEventListener('keydown', this.keyDownHandler);
        this.container.innerHTML = '';
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) statusContainer.innerHTML = '';
    }
}

gameRegistry['catcher'] = CatcherGame;
