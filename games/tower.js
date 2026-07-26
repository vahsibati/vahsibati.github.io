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
        this.blockSpeed = 3;
        this.blockDirection = 1;
        this.gravity = 8;
        
        // Stack camera viewport
        this.viewY = 0;
        
        // Types of sweets to stack
        this.sweetTypes = ['cookie', 'donut', 'pancake', 'macaron', 'waffle'];
        
        this.gameInterval = null;
    }

    start() {
        this.score = 0;
        this.isGameOver = false;
        this.viewY = 0;
        this.blockSpeed = 4;
        
        // Initial plate block
        this.stack = [
            {
                x: 100,
                y: 350,
                width: 200,
                height: 30,
                type: 'plate',
                color: '#94a3b8'
            }
        ];
        
        this.spawnBlock();
        this.setupHTML();
        this.updateStatus();
        this.bindEvents();
        
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.tick(), 1000 / 60); // 60 FPS tick
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="tower-game-container">
                <canvas id="towerCanvas" width="400" height="400"></canvas>
                <div class="tower-instructions">Kekleri üst üste bırakmak için ekrana tıkla veya dokun!</div>
            </div>
        `;
        this.canvas = document.getElementById('towerCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    updateStatus() {
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="status-item">Yükseklik: <span id="tower-score">${this.score}</span></div>
            `;
        }
    }

    spawnBlock() {
        if (this.isGameOver) return;

        const prevBlock = this.stack[this.stack.length - 1];
        const nextType = this.sweetTypes[this.stack.length % this.sweetTypes.length];
        
        this.currentBlock = {
            x: 0,
            y: prevBlock.y - 45, // Stack upwards
            width: prevBlock.width,
            height: 35,
            type: nextType,
            isFalling: false,
            fallY: 0
        };
        
        // Speed up slightly as stack gets higher
        this.blockSpeed = 4 + Math.min(6, this.stack.length * 0.2);
        this.blockDirection = Math.random() < 0.5 ? -1 : 1;
        if (this.blockDirection === -1) {
            this.currentBlock.x = this.canvas.width - this.currentBlock.width;
        }
    }

    bindEvents() {
        const handleAction = () => {
            if (this.isGameOver || !this.currentBlock || this.currentBlock.isFalling) return;
            
            // Drop current block
            this.currentBlock.isFalling = true;
            soundEngine.play('drop');
        };

        this.canvas.addEventListener('mousedown', handleAction);
        
        // Touch events
        this.touchHandler = (e) => {
            handleAction();
            e.preventDefault();
        };
        this.canvas.addEventListener('touchstart', this.touchHandler, { passive: false });
    }

    tick() {
        if (this.isGameOver || !this.currentBlock) return;

        // Block movement back and forth
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
        // Fall simulation
        else {
            this.currentBlock.y += this.gravity;
            
            const prevBlock = this.stack[this.stack.length - 1];
            // Landing collision check
            if (this.currentBlock.y >= prevBlock.y - this.currentBlock.height) {
                this.currentBlock.y = prevBlock.y - this.currentBlock.height;
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

        // Check if completely missed
        if (curRight <= leftBoundary || curLeft >= rightBoundary) {
            this.gameOver();
            return;
        }

        // Calculate overlap
        let newX, newWidth;
        if (curLeft < leftBoundary) {
            newX = leftBoundary;
            newWidth = this.currentBlock.width - (leftBoundary - curLeft);
        } else {
            newX = curLeft;
            newWidth = prevBlock.x + prevBlock.width - curLeft;
        }

        // Apply new values to overlap
        this.currentBlock.x = newX;
        this.currentBlock.width = newWidth;
        
        // Save to stack
        this.stack.push(this.currentBlock);
        this.score++;
        this.updateStatus();
        soundEngine.play('success');

        // Confetti feedback for perfect/near perfect drops
        const offset = Math.abs(curLeft - prevBlock.x);
        if (offset < 6) {
            triggerConfetti();
        }

        // Camera follow
        const idealY = this.canvas.height - 180;
        if (this.currentBlock.y < idealY) {
            this.viewY = idealY - this.currentBlock.y;
        }

        this.spawnBlock();
    }

    draw() {
        if (!this.ctx) return;

        // Clear Canvas
        this.ctx.fillStyle = '#2c104e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        // Translate view Y for camera scrolling
        this.ctx.translate(0, this.viewY);

        // Draw Stack Blocks
        this.stack.forEach(block => {
            this.drawSweet(block);
        });

        // Draw Current active swinging/falling Block
        if (this.currentBlock) {
            this.drawSweet(this.currentBlock);
        }

        this.ctx.restore();
    }

    drawSweet(block) {
        const x = block.x;
        const y = block.y;
        const w = block.width;
        const h = block.height;

        this.ctx.save();
        
        if (block.type === 'plate') {
            // Draw a cute serving plate
            this.ctx.fillStyle = '#e2e8f0';
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, w, h, 8);
            this.ctx.fill();
            this.ctx.fillStyle = '#cbd5e1';
            this.ctx.beginPath();
            this.ctx.roundRect(x + 10, y + 5, w - 20, h - 10, 6);
            this.ctx.fill();
        } 
        else if (block.type === 'cookie') {
            // Chocolate Chip Cookie
            this.ctx.fillStyle = '#b45309';
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, w, h, 14);
            this.ctx.fill();

            // Chocolate chips
            this.ctx.fillStyle = '#451a03';
            const numChips = Math.max(3, Math.floor(w / 40));
            const chipSpacing = w / (numChips + 1);
            for (let i = 1; i <= numChips; i++) {
                this.ctx.beginPath();
                this.ctx.arc(x + i * chipSpacing, y + h/2, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } 
        else if (block.type === 'donut') {
            // Pink Glazed Donut
            // Base cake
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, w, h, 16);
            this.ctx.fill();

            // Pink glaze
            this.ctx.fillStyle = '#f472b6';
            this.ctx.beginPath();
            this.ctx.roundRect(x + 2, y + 2, w - 4, h - 8, 12);
            this.ctx.fill();

            // Donut Hole cut out simulation (draw dark background ellipse in center)
            this.ctx.fillStyle = '#2c104e';
            this.ctx.beginPath();
            this.ctx.ellipse(x + w/2, y + h/2, Math.max(5, w * 0.15), h * 0.25, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Sprinkles
            this.ctx.fillStyle = '#ffffff';
            const numSprinkles = Math.max(4, Math.floor(w / 35));
            for (let i = 0; i < numSprinkles; i++) {
                const sx = x + 15 + i * (w - 30) / numSprinkles;
                if (Math.abs(sx - (x + w/2)) > w * 0.15) { // don't draw inside hole
                    this.ctx.fillStyle = i % 2 === 0 ? '#60a5fa' : '#ca8a04';
                    this.ctx.fillRect(sx, y + 8, 5, 2);
                }
            }
        } 
        else if (block.type === 'pancake') {
            // Pancake
            this.ctx.fillStyle = '#d97706';
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, w, h, 12);
            this.ctx.fill();
            
            // Syrup highlight
            this.ctx.fillStyle = '#ca8a04';
            this.ctx.beginPath();
            this.ctx.roundRect(x + 5, y + 2, w - 10, 8, 4);
            this.ctx.fill();

            // Little butter square in center
            this.ctx.fillStyle = '#fef08a';
            this.ctx.beginPath();
            this.ctx.rect(x + w/2 - 8, y + 4, 16, 8);
            this.ctx.fill();
        } 
        else if (block.type === 'macaron') {
            // Cute Green Macaron
            this.ctx.fillStyle = '#4ade80';
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, w, h * 0.35, 6);
            this.ctx.roundRect(x, y + h * 0.65, w, h * 0.35, 6);
            this.ctx.fill();

            // White filling cream
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.roundRect(x + 2, y + h * 0.35, w - 4, h * 0.3, 2);
            this.ctx.fill();
        } 
        else if (block.type === 'waffle') {
            // Waffle grid
            this.ctx.fillStyle = '#ca8a04';
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, w, h, 8);
            this.ctx.fill();

            // Grid lines
            this.ctx.strokeStyle = '#854d0e';
            this.ctx.lineWidth = 1.5;
            const wStep = w / 6;
            for (let i = 1; i < 6; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(x + i * wStep, y);
                this.ctx.lineTo(x + i * wStep, y + h);
                this.ctx.stroke();
            }
        }

        this.ctx.restore();
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        soundEngine.play('fail');

        // Let the falling block drop offscreen
        if (this.currentBlock) {
            let dropTimer = setInterval(() => {
                this.currentBlock.y += 10;
                this.draw();
                if (this.currentBlock.y > this.canvas.height + this.viewY) {
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
