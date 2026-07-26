class MazeGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.currentLevel = 0;
        this.playerPos = { r: 1, c: 1 };
        
        // Path trace
        this.trail = [];
        this.isDragging = false;
        
        // Target SVGs
        this.charImg = new Image();
        this.milkImg = new Image();
        this.chocolateImg = new Image();
        
        this.levels = [
            // Level 1: 7x7 grid
            {
                grid: [
                    [1, 1, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 0, 1, 0, 1],
                    [1, 0, 1, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 0, 1],
                    [1, 0, 0, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1]
                ],
                start: { r: 1, c: 1 },
                end: { r: 5, c: 5 },
                endType: 'milk'
            },
            // Level 2: 9x9 grid
            {
                grid: [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 0, 0, 1, 0, 1],
                    [1, 1, 1, 1, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 1],
                    [1, 0, 1, 0, 1, 1, 1, 1, 1],
                    [1, 0, 1, 0, 0, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1, 1]
                ],
                start: { r: 1, c: 1 },
                end: { r: 7, c: 7 },
                endType: 'chocolate'
            },
            // Level 3: 11x11 grid
            {
                grid: [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
                    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
                    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ],
                start: { r: 1, c: 1 },
                end: { r: 9, c: 9 },
                endType: 'milk'
            },
            // Level 4: 13x13 grid
            {
                grid: [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
                    [1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                    [1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
                    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ],
                start: { r: 1, c: 1 },
                end: { r: 11, c: 11 },
                endType: 'chocolate'
            },
            // Level 5: 15x15 grid
            {
                grid: [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
                    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
                    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
                    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ],
                start: { r: 1, c: 1 },
                end: { r: 13, c: 13 },
                endType: 'milk'
            }
        ];

        this.initImages();
    }

    initImages() {
        const charType = state.selectedCharacter || 'girl';
        const rawCharSVG = AVATAR_SVGS[charType];
        
        const rawMilkSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <path d="M 35,80 L 65,80 L 65,40 Q 65,30 55,25 L 55,15 L 45,15 L 45,25 Q 35,30 35,40 Z" fill="#ffffff" stroke="#90caf9" stroke-width="4"/>
            <rect x="42" y="8" width="16" height="7" rx="2" fill="#ff5252" />
            <rect x="37" y="45" width="26" height="15" fill="#90caf9" opacity="0.3" />
            <text x="50" y="56" font-size="10" font-family="Fredoka" fill="#1e88e5" font-weight="bold" text-anchor="middle">SÜT</text>
        </svg>`;

        const rawChocolateSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect x="20" y="15" width="60" height="70" rx="8" fill="#4e342e" stroke="#3e2723" stroke-width="4"/>
            <!-- Grid lines for chocolate chunks -->
            <line x1="40" y1="15" x2="40" y2="85" stroke="#3e2723" stroke-width="4"/>
            <line x1="60" y1="15" x2="60" y2="85" stroke="#3e2723" stroke-width="4"/>
            <line x1="20" y1="38" x2="80" y2="38" stroke="#3e2723" stroke-width="4"/>
            <line x1="20" y1="62" x2="80" y2="62" stroke="#3e2723" stroke-width="4"/>
            <!-- Wrapper at bottom -->
            <path d="M 20,60 L 80,60 L 80,85 L 20,85 Z" fill="#ff5252" />
            <path d="M 20,60 L 80,60 L 80,66 L 20,66 Z" fill="#ffd740" />
        </svg>`;

        this.charImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawCharSVG);
        this.milkImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawMilkSVG);
        this.chocolateImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawChocolateSVG);
    }

    start() {
        this.currentLevel = 0;
        this.loadLevel(0);
    }

    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        const level = this.levels[this.currentLevel];
        this.playerPos = { ...level.start };
        this.trail = [`${this.playerPos.r},${this.playerPos.c}`];
        this.isDragging = false;
        
        this.setupHTML();
        this.updateStatus();
        this.bindEvents();
        this.draw();
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="maze-game-container">
                <canvas id="mazeCanvas" width="400" height="400"></canvas>
                <div class="maze-instructions">Karakteri parmağınla veya farenle sürükleyerek hedefe ulaştır!</div>
            </div>
        `;
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    updateStatus() {
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="status-item">Seviye: <span id="maze-level">${this.currentLevel + 1}/5</span></div>
            `;
        }
    }

    bindEvents() {
        const getCellFromCoords = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;
            
            const gridLen = this.levels[this.currentLevel].grid.length;
            const cellSize = this.canvas.width / gridLen;
            
            return {
                r: Math.floor(y / cellSize),
                c: Math.floor(x / cellSize)
            };
        };

        const handleStart = (clientX, clientY) => {
            const cell = getCellFromCoords(clientX, clientY);
            if (cell.r === this.playerPos.r && cell.c === this.playerPos.c) {
                this.isDragging = true;
                soundEngine.play('click');
            }
        };

        const handleMove = (clientX, clientY) => {
            if (!this.isDragging) return;
            const cell = getCellFromCoords(clientX, clientY);
            const grid = this.levels[this.currentLevel].grid;
            
            // Validate if cell is adjacent to current position
            const dr = Math.abs(cell.r - this.playerPos.r);
            const dc = Math.abs(cell.c - this.playerPos.c);
            
            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                // Check walls
                if (cell.r >= 0 && cell.r < grid.length && cell.c >= 0 && cell.c < grid[0].length) {
                    if (grid[cell.r][cell.c] === 0) {
                        this.playerPos = cell;
                        const key = `${cell.r},${cell.c}`;
                        if (!this.trail.includes(key)) {
                            this.trail.push(key);
                        }
                        soundEngine.play('pop');
                        this.draw();
                        this.checkWinCondition();
                    }
                }
            }
        };

        const handleEnd = () => {
            this.isDragging = false;
        };

        // Mouse listeners
        this.canvas.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
        this.canvas.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', handleEnd);

        // Touch listeners
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                handleStart(e.touches[0].clientX, e.touches[0].clientY);
            }
            e.preventDefault();
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
            e.preventDefault();
        }, { passive: false });
        this.canvas.addEventListener('touchend', handleEnd);

        // Reference saving
        this.winMouseUpRef = handleEnd;
    }

    draw() {
        if (!this.ctx) return;
        
        const grid = this.levels[this.currentLevel].grid;
        const gridLen = grid.length;
        const cellSize = this.canvas.width / gridLen;
        
        // Clear Canvas
        this.ctx.fillStyle = '#2c104e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Maze Walls & Paths
        for (let r = 0; r < gridLen; r++) {
            for (let c = 0; c < gridLen; c++) {
                const x = c * cellSize;
                const y = r * cellSize;

                if (grid[r][c] === 1) {
                    // Wall
                    this.ctx.fillStyle = '#63259b';
                    this.ctx.beginPath();
                    // Draw slightly rounded wall blocks
                    this.ctx.roundRect(x + 1, y + 1, cellSize - 2, cellSize - 2, 6);
                    this.ctx.fill();
                } else {
                    // Path
                    this.ctx.fillStyle = '#1e083a';
                    this.ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }

        // Draw Trail (Sparkly dots)
        this.ctx.fillStyle = 'rgba(45, 212, 191, 0.6)';
        this.trail.forEach(posStr => {
            const [tr, tc] = posStr.split(',').map(Number);
            const cx = tc * cellSize + cellSize / 2;
            const cy = tr * cellSize + cellSize / 2;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, cellSize * 0.2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw Goal (End point node)
        const level = this.levels[this.currentLevel];
        const goalX = level.end.c * cellSize;
        const goalY = level.end.r * cellSize;
        const activeGoalImg = level.endType === 'milk' ? this.milkImg : this.chocolateImg;
        this.ctx.drawImage(activeGoalImg, goalX + 2, goalY + 2, cellSize - 4, cellSize - 4);

        // Draw Player (Start/Current point node)
        const playerX = this.playerPos.c * cellSize;
        const playerY = this.playerPos.r * cellSize;
        this.ctx.drawImage(this.charImg, playerX + 2, playerY + 2, cellSize - 4, cellSize - 4);
    }

    checkWinCondition() {
        const level = this.levels[this.currentLevel];
        if (this.playerPos.r === level.end.r && this.playerPos.c === level.end.c) {
            this.isDragging = false;
            triggerConfetti();
            
            if (this.currentLevel < this.levels.length - 1) {
                // Go to next level
                setTimeout(() => {
                    this.loadLevel(this.currentLevel + 1);
                }, 1500);
            } else {
                // Game completely won!
                setTimeout(() => {
                    this.container.innerHTML = `
                        <div class="game-win-overlay">
                            <h2>Tebrikler! 🏆</h2>
                            <p>Tüm labirentleri başarıyla tamamladın!</p>
                            <button class="play-again-btn" onclick="state.activeGameInstance.start()">Tekrar Oyna</button>
                        </div>
                    `;
                }, 1000);
            }
        }
    }

    destroy() {
        window.removeEventListener('mouseup', this.winMouseUpRef);
        this.container.innerHTML = '';
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) statusContainer.innerHTML = '';
    }
}

gameRegistry['maze'] = MazeGame;
