class SnakeGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gridSize = 20;
        this.tileCount = 20;
        this.snake = [];
        this.dx = 1;
        this.dy = 0;
        this.food = { x: 5, y: 5 };
        this.gameInterval = null;
        this.particles = [];
        this.floatingTexts = [];
        this.isGameOver = false;
        this.inputQueue = [];
    }

    start() {
        this.score = 0;
        this.isGameOver = false;
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.dx = 1;
        this.dy = 0;
        this.inputQueue = [];
        this.particles = [];
        this.floatingTexts = [];
        this.spawnFood();
        this.setupHTML();
        this.updateStatus();
        this.bindEvents();
        
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.tick(), 150); // Kid friendly speed
        this.drawLoop();
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="snake-game-container">
                <canvas id="snakeCanvas" width="400" height="400"></canvas>
                <div class="mobile-controls">
                    <div class="control-row">
                        <button class="ctrl-btn" id="ctrl-up">▲</button>
                    </div>
                    <div class="control-row">
                        <button class="ctrl-btn" id="ctrl-left">◀</button>
                        <button class="ctrl-btn" id="ctrl-down">▼</button>
                        <button class="ctrl-btn" id="ctrl-right">▶</button>
                    </div>
                </div>
            </div>
        `;
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    updateStatus() {
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="status-item">Skor: <span id="snake-score">${this.score}</span></div>
            `;
        }
    }

    spawnFood() {
        let proposedFood;
        let onSnake = true;
        while (onSnake) {
            proposedFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            onSnake = this.snake.some(segment => segment.x === proposedFood.x && segment.y === proposedFood.y);
        }
        this.food = proposedFood;
    }

    bindEvents() {
        // Keyboard controls
        this.keydownHandler = (e) => {
            const head = this.snake[0];
            let nextDx = this.dx;
            let nextDy = this.dy;
            
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.dy === 0) { nextDx = 0; nextDy = -1; }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.dy === 0) { nextDx = 0; nextDy = 1; }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.dx === 0) { nextDx = -1; nextDy = 0; }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.dx === 0) { nextDx = 1; nextDy = 0; }
                    break;
                default:
                    return;
            }
            e.preventDefault();
            this.inputQueue.push({ dx: nextDx, dy: nextDy });
        };
        window.addEventListener('keydown', this.keydownHandler);

        // Mobile touch controls
        const handleDirection = (dName) => {
            let nextDx = this.dx;
            let nextDy = this.dy;
            if (dName === 'up' && this.dy === 0) { nextDx = 0; nextDy = -1; }
            if (dName === 'down' && this.dy === 0) { nextDx = 0; nextDy = 1; }
            if (dName === 'left' && this.dx === 0) { nextDx = -1; nextDy = 0; }
            if (dName === 'right' && this.dx === 0) { nextDx = 1; nextDy = 0; }
            this.inputQueue.push({ dx: nextDx, dy: nextDy });
            soundEngine.play('click');
        };

        const upBtn = document.getElementById('ctrl-up');
        const downBtn = document.getElementById('ctrl-down');
        const leftBtn = document.getElementById('ctrl-left');
        const rightBtn = document.getElementById('ctrl-right');

        if (upBtn) upBtn.addEventListener('click', () => handleDirection('up'));
        if (downBtn) downBtn.addEventListener('click', () => handleDirection('down'));
        if (leftBtn) leftBtn.addEventListener('click', () => handleDirection('left'));
        if (rightBtn) rightBtn.addEventListener('click', () => handleDirection('right'));
    }

    tick() {
        if (this.isGameOver) return;

        // Apply queued movement
        if (this.inputQueue.length > 0) {
            const next = this.inputQueue.shift();
            this.dx = next.dx;
            this.dy = next.dy;
        }

        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        // Collision Check (Walls & Self)
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Food eating check
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateStatus();
            soundEngine.play('eat');
            
            // Add particles
            const px = this.food.x * this.gridSize + this.gridSize / 2;
            const py = this.food.y * this.gridSize + this.gridSize / 2;
            this.createExplosion(px, py);
            
            // Add floating text
            this.floatingTexts.push({
                text: '+10',
                x: px,
                y: py,
                alpha: 1.0,
                yOffset: 0
            });

            this.spawnFood();
        } else {
            this.snake.pop();
        }
    }

    createExplosion(x, y) {
        const colors = ['#f472b6', '#fb923c', '#ca8a04', '#2dd4bf', '#60a5fa', '#a78bfa'];
        for (let i = 0; i < 15; i++) {
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

    drawLoop() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#2c104e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines faintly for visual guide
        this.ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        // Draw food (Shiny glowing berry)
        const fx = this.food.x * this.gridSize + this.gridSize / 2;
        const fy = this.food.y * this.gridSize + this.gridSize / 2;
        
        // Food glow
        const glowGrad = this.ctx.createRadialGradient(fx, fy, 2, fx, fy, 12);
        glowGrad.addColorStop(0, '#f472b6');
        glowGrad.addColorStop(1, 'rgba(244,114,182,0)');
        this.ctx.fillStyle = glowGrad;
        this.ctx.beginPath();
        this.ctx.arc(fx, fy, 12, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner food body
        this.ctx.fillStyle = '#ff2a85';
        this.ctx.beginPath();
        this.ctx.arc(fx, fy, 7, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Food leaf (little detail)
        this.ctx.fillStyle = '#2dd4bf';
        this.ctx.beginPath();
        this.ctx.ellipse(fx + 3, fy - 7, 3, 2, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw Snake (Caterpillar)
        this.snake.forEach((segment, index) => {
            const sx = segment.x * this.gridSize + this.gridSize / 2;
            const sy = segment.y * this.gridSize + this.gridSize / 2;
            const radius = index === 0 ? 10 : 8;
            
            // Colorful segment gradient
            const colorHue = (index * 25) % 360;
            this.ctx.fillStyle = `hsl(${colorHue}, 90%, 60%)`;
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Head details (Eyes, Smile)
            if (index === 0) {
                this.ctx.fillStyle = '#ffffff';
                let eyeOffsetLeftX = -4;
                let eyeOffsetRightX = 4;
                let eyeOffsetY = -4;
                
                // Adjust eye positions based on direction
                if (this.dx === 1) { eyeOffsetLeftX = 3; eyeOffsetRightX = 3; eyeOffsetY = -4; }
                else if (this.dx === -1) { eyeOffsetLeftX = -3; eyeOffsetRightX = -3; eyeOffsetY = -4; }
                else if (this.dy === 1) { eyeOffsetLeftX = -4; eyeOffsetRightX = 4; eyeOffsetY = 3; }
                else if (this.dy === -1) { eyeOffsetLeftX = -4; eyeOffsetRightX = 4; eyeOffsetY = -3; }

                // Eyes
                this.ctx.beginPath();
                this.ctx.arc(sx + eyeOffsetLeftX, sy + eyeOffsetY, 3, 0, Math.PI * 2);
                this.ctx.arc(sx + eyeOffsetRightX, sy + eyeOffsetY, 3, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.arc(sx + eyeOffsetLeftX, sy + eyeOffsetY, 1.2, 0, Math.PI * 2);
                this.ctx.arc(sx + eyeOffsetRightX, sy + eyeOffsetY, 1.2, 0, Math.PI * 2);
                this.ctx.fill();

                // Cute cheeks
                this.ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
                this.ctx.beginPath();
                this.ctx.arc(sx - 7, sy + 2, 2.5, 0, Math.PI * 2);
                this.ctx.arc(sx + 7, sy + 2, 2.5, 0, Math.PI * 2);
                this.ctx.fill();
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
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = `bold 16px ${state.primaryFont || 'Fredoka'}`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(t.text, t.x, t.y + t.yOffset);
                this.ctx.restore();
            }
        });

        if (!this.isGameOver) {
            requestAnimationFrame(() => this.drawLoop());
        }
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        soundEngine.play('fail');

        setTimeout(() => {
            this.container.innerHTML = `
                <div class="game-win-overlay">
                    <h2>Oyun Bitti! 🐍</h2>
                    <p>Harika yarıştın!</p>
                    <div class="win-stats">
                        <div>Toplanan Skor: <strong>${this.score}</strong></div>
                    </div>
                    <button class="play-again-btn" onclick="state.activeGameInstance.start()">Tekrar Dene</button>
                </div>
            `;
        }, 600);
    }

    destroy() {
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.isGameOver = true;
        window.removeEventListener('keydown', this.keydownHandler);
        this.container.innerHTML = '';
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) statusContainer.innerHTML = '';
    }
}

gameRegistry['snake'] = SnakeGame;
