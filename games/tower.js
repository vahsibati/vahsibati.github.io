class TowerGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.isGameOver = false;
        
        // Physics and Stacking State
        this.stack = [];
        this.currentBlock = null;
        this.blockSpeed = 4;
        this.blockDirection = 1;
        this.gravity = 10;
        
        // Camera Viewport
        this.viewY = 0;
        this.targetViewY = 0;
        
        // Types of sweets to stack
        this.sweetTypes = ['cookie', 'donut', 'pancake', 'macaron', 'waffle'];
        
        this.gameInterval = null;
    }

    start() {
        this.score = 0;
        this.isGameOver = false;
        this.viewY = 0;
        this.targetViewY = 0;
        this.blockSpeed = 4;
        
        // Initial Base Plate block at bottom of canvas
        this.stack = [
            {
                x: 100,
                y: 340,
                width: 200,
                height: 30,
                type: 'plate'
            }
        ];
        
        this.setupHTML();
        this.updateStatus();
        this.bindEvents();
        this.spawnBlock();
        
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.tick(), 1000 / 60); // 60 FPS loop
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="tower-game-container">
                <canvas id="towerCanvas" width="400" height="400"></canvas>
                <div class="tower-instructions">Kurabiyeyi tam üstüne düşürmek için ekrana tıkla veya dokun!</div>
            </div>
        `;
        this.canvas = document.getElementById('towerCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    updateStatus() {
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="status-item">Kule Yüksekliği: <span id="tower-score">${this.score} Kat</span></div>
            `;
        }
    }

    spawnBlock() {
        if (this.isGameOver) return;

        const prevBlock = this.stack[this.stack.length - 1];
        const nextType = this.sweetTypes[this.stack.length % this.sweetTypes.length];
        
        // Spawn at top of screen (adjusted for current camera viewY)
        const spawnY = -this.viewY + 50;

        this.currentBlock = {
            x: 0,
            y: spawnY,
            width: prevBlock.width,
            height: 35,
            type: nextType,
            isFalling: false
        };
        
        // Progressive speed up as stack gets higher
        this.blockSpeed = 4 + Math.min(7, this.stack.length * 0.3);
        this.blockDirection = Math.random() < 0.5 ? -1 : 1;
        if (this.blockDirection === -1) {
            this.currentBlock.x = this.canvas.width - this.currentBlock.width;
        }
    }

    bindEvents() {
        const handleAction = () => {
            if (this.isGameOver || !this.currentBlock || this.currentBlock.isFalling) return;
            
            // Start falling
            this.currentBlock.isFalling = true;
            soundEngine.play('drop');
        };

        this.canvas.addEventListener('mousedown', handleAction);
        
        // Touch handler
        this.touchHandler = (e) => {
            handleAction();
            e.preventDefault();
        };
        this.canvas.addEventListener('touchstart', this.touchHandler, { passive: false });
    }

    tick() {
        if (this.isGameOver || !this.currentBlock) return;

        // Smooth camera movement
        this.viewY += (this.targetViewY - this.viewY) * 0.1;

        const prevBlock = this.stack[this.stack.length - 1];
        const targetY = prevBlock.y - this.currentBlock.height;

        // Block movement back and forth at top
        if (!this.currentBlock.isFalling) {
            this.currentBlock.x += this.blockSpeed * this.blockDirection;
            
            // Wall bounce
            if (this.currentBlock.x <= 0) {
                this.currentBlock.x = 0;
                this.blockDirection = 1;
            } else if (this.currentBlock.x + this.currentBlock.width >= this.canvas.width) {
                this.currentBlock.x = this.canvas.width - this.currentBlock.width;
                this.blockDirection = -1;
            }
        } 
        // Fall down animation
        else {
            this.currentBlock.y += this.gravity;
            
            // Landing collision check
            if (this.currentBlock.y >= targetY) {
                this.currentBlock.y = targetY;
                this.currentBlock.isFalling = false;
                this.evaluateLanding(prevBlock);
            }
        }

        this.draw();
    }

    evaluateLanding(prevBlock) {
        const leftBoundary = prevBlock.x;
        const rightBoundary = prevBlock.x + prevBlock.width;
        
        const curLeft = this.currentBlock.x;
        const curRight = this.currentBlock.x + this.currentBlock.width;

        // Completely missed the platform -> Game Over
        if (curRight <= leftBoundary || curLeft >= rightBoundary) {
            this.gameOver();
            return;
        }

        // Calculate overlap section
        let newX, newWidth;
        if (curLeft < leftBoundary) {
            newX = leftBoundary;
            newWidth = this.currentBlock.width - (leftBoundary - curLeft);
        } else {
            newX = curLeft;
            newWidth = prevBlock.x + prevBlock.width - curLeft;
        }

        // If slice makes block too thin (under 18px), crash stack -> Game Over
        if (newWidth < 18) {
            this.gameOver();
            return;
        }

        // Perfect drop alignment snap if very close (under 6px offset)
        const offset = Math.abs(curLeft - prevBlock.x);
        if (offset < 6) {
            newX = prevBlock.x;
            newWidth = prevBlock.width;
            triggerConfetti();
        }

        // Save new dimensions
        this.currentBlock.x = newX;
        this.currentBlock.width = newWidth;
        
        // Save to stack
        this.stack.push(this.currentBlock);
        this.score++;
        this.updateStatus();
        soundEngine.play('success');

        // Update target camera viewport
        const idealY = 220; // Keep active stack top around middle of screen
        const currentTopScreenY = this.currentBlock.y + this.viewY;
        if (currentTopScreenY < idealY) {
            this.targetViewY += (idealY - currentTopScreenY);
        }

        this.spawnBlock();
    }

    draw() {
        if (!this.ctx) return;

        // Clear Canvas
        this.ctx.fillStyle = '#2c104e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        // Camera translation
        this.ctx.translate(0, this.viewY);

        // Draw Stack Blocks
        this.stack.forEach(block => {
            this.drawSweet(block);
        });

        // Draw Active Swinging / Falling Block
        if (this.currentBlock) {
            this.drawSweet(this.currentBlock);
        }

        this.ctx.restore();
    }

    // Helper to draw rounded rectangle safely across all browsers
    drawRoundRect(x, y, w, h, radius, fillStyle, strokeStyle = null) {
        const r = Math.max(0, Math.min(radius, w / 2, h / 2));
        this.ctx.fillStyle = fillStyle;
        this.ctx.beginPath();
        if (typeof this.ctx.roundRect === 'function') {
            this.ctx.roundRect(x, y, w, h, r);
        } else {
            this.ctx.rect(x, y, w, h);
        }
        this.ctx.fill();
        if (strokeStyle) {
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    drawSweet(block) {
        const x = block.x;
        const y = block.y;
        const w = block.width;
        const h = block.height;

        if (w <= 0 || h <= 0) return;

        this.ctx.save();
        
        if (block.type === 'plate') {
            // Serving Plate Base
            this.drawRoundRect(x, y, w, h, 8, '#e2e8f0');
            this.drawRoundRect(x + Math.min(10, w*0.1), y + 4, Math.max(1, w - Math.min(20, w*0.2)), h - 8, 6, '#cbd5e1');
        } 
        else if (block.type === 'cookie') {
            // Chocolate Chip Cookie
            this.drawRoundRect(x, y, w, h, 12, '#b45309');

            // Chocolate chips
            this.ctx.fillStyle = '#451a03';
            const numChips = Math.max(2, Math.floor(w / 35));
            const chipSpacing = w / (numChips + 1);
            for (let i = 1; i <= numChips; i++) {
                this.ctx.beginPath();
                this.ctx.arc(x + i * chipSpacing, y + h / 2, Math.min(4, w / 6), 0, Math.PI * 2);
                this.ctx.fill();
            }
        } 
        else if (block.type === 'donut') {
            // Pink Glazed Donut
            this.drawRoundRect(x, y, w, h, 14, '#fbbf24');
            this.drawRoundRect(x + 2, y + 2, Math.max(1, w - 4), Math.max(1, h - 8), 10, '#f472b6');

            // Donut hole in middle
            if (w > 30) {
                this.ctx.fillStyle = '#2c104e';
                this.ctx.beginPath();
                this.ctx.ellipse(x + w / 2, y + h / 2, Math.min(12, w * 0.15), h * 0.25, 0, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } 
        else if (block.type === 'pancake') {
            // Pancake with Butter
            this.drawRoundRect(x, y, w, h, 10, '#d97706');
            this.drawRoundRect(x + 4, y + 2, Math.max(1, w - 8), 6, 3, '#ca8a04');

            // Butter square
            if (w > 25) {
                this.ctx.fillStyle = '#fef08a';
                this.ctx.fillRect(x + w / 2 - 6, y + 3, 12, 7);
            }
        } 
        else if (block.type === 'macaron') {
            // Cute Green Macaron
            this.drawRoundRect(x, y, w, h * 0.38, 5, '#4ade80');
            this.drawRoundRect(x, y + h * 0.62, w, h * 0.38, 5, '#4ade80');
            this.drawRoundRect(x + 2, y + h * 0.35, Math.max(1, w - 4), h * 0.3, 2, '#ffffff');
        } 
        else if (block.type === 'waffle') {
            // Waffle
            this.drawRoundRect(x, y, w, h, 8, '#ca8a04');

            // Grid lines
            if (w > 20) {
                this.ctx.strokeStyle = '#854d0e';
                this.ctx.lineWidth = 1.5;
                const numGrid = Math.max(2, Math.floor(w / 20));
                const step = w / numGrid;
                for (let i = 1; i < numGrid; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + i * step, y);
                    this.ctx.lineTo(x + i * step, y + h);
                    this.ctx.stroke();
                }
            }
        }

        this.ctx.restore();
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        soundEngine.play('fail');

        // Let falling block drop offscreen smoothly
        if (this.currentBlock) {
            let dropTimer = setInterval(() => {
                this.currentBlock.y += 12;
                this.draw();
                if (this.currentBlock.y > this.canvas.height + Math.abs(this.viewY) + 100) {
                    clearInterval(dropTimer);
                    this.showWinScreen();
                }
            }, 1000 / 60);
        } else {
            this.showWinScreen();
        }
    }

    showWinScreen() {
        this.container.innerHTML = `
            <div class="game-win-overlay">
                <h2>Oyun Bitti! 🥞</h2>
                <p>Harika bir kule yaptın!</p>
                <div class="win-stats">
                    <div>Kule Yüksekliği: <strong>${this.score} Kat</strong></div>
                </div>
                <button class="play-again-btn" onclick="state.activeGameInstance.start()">Tekrar Dene</button>
            </div>
        `;
    }

    destroy() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        this.container.innerHTML = '';
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) statusContainer.innerHTML = '';
    }
}

gameRegistry['tower'] = TowerGame;
