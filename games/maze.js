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
        
        // Target Avatar Image
        this.charImg = new Image();
        this.isCharLoaded = false;
        
        // 10 Levels with increasing maze grid sizes & seeds
        this.levels = [
            { size: 11, seed: 101, endType: 'milk' },
            { size: 13, seed: 202, endType: 'chocolate' },
            { size: 15, seed: 303, endType: 'milk' },
            { size: 17, seed: 404, endType: 'chocolate' },
            { size: 19, seed: 505, endType: 'milk' },
            { size: 21, seed: 606, endType: 'chocolate' },
            { size: 23, seed: 707, endType: 'milk' },
            { size: 25, seed: 808, endType: 'chocolate' },
            { size: 27, seed: 909, endType: 'milk' },
            { size: 29, seed: 1010, endType: 'chocolate' }
        ];

        this.currentMaze = null;
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

    // DFS Recursive Backtracker Algorithm for Genuine Complex Mazes
    generateComplexMaze(size, seed) {
        if (size % 2 === 0) size += 1;
        
        // Fill grid with walls (1)
        const grid = Array.from({ length: size }, () => Array(size).fill(1));
        
        const stack = [];
        const startR = 1, startC = 1;
        grid[startR][startC] = 0;
        stack.push({ r: startR, c: startC });
        
        let s = seed;
        const rng = () => {
            let x = Math.sin(s++) * 10000;
            return x - Math.floor(x);
        };

        const directions = [
            { dr: -2, dc: 0 },
            { dr: 2, dc: 0 },
            { dr: 0, dc: -2 },
            { dr: 0, dc: 2 }
        ];

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const unvisited = [];

            for (const dir of directions) {
                const nr = current.r + dir.dr;
                const nc = current.c + dir.dc;
                
                if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1) {
                    if (grid[nr][nc] === 1) {
                        unvisited.push({ r: nr, c: nc, dir });
                    }
                }
            }

            if (unvisited.length > 0) {
                const chosen = unvisited[Math.floor(rng() * unvisited.length)];
                const midR = current.r + chosen.dir.dr / 2;
                const midC = current.c + chosen.dir.dc / 2;
                
                grid[midR][midC] = 0;
                grid[chosen.r][chosen.c] = 0;
                
                stack.push({ r: chosen.r, c: chosen.c });
            } else {
                stack.pop();
            }
        }

        return grid;
    }

    start() {
        this.currentLevel = 0;
        this.loadLevel(0);
    }

    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        const config = this.levels[this.currentLevel];
        
        // Generate complex maze layout
        const grid = this.generateComplexMaze(config.size, config.seed);
        const endR = config.size - 2;
        const endC = config.size - 2;

        this.currentMaze = {
            grid: grid,
            start: { r: 1, c: 1 },
            end: { r: endR, c: endC },
            endType: config.endType
        };

        this.playerPos = { r: 1, c: 1 };
        this.trail = [`1,1`];
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
                <div class="maze-instructions">Çıkmaz sokaklara dikkat et! Parmağınla veya farenle sürükleyerek hedefe ulaş!</div>
            </div>
        `;
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    updateStatus() {
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="status-item">Zorluk Seviyesi: <span id="maze-level">${this.currentLevel + 1}/10</span></div>
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
            
            const gridLen = this.currentMaze.grid.length;
            const cellSize = this.canvas.width / gridLen;
            
            return {
                r: Math.floor(y / cellSize),
                c: Math.floor(x / cellSize)
            };
        };

        const tryMoveTo = (targetCell) => {
            const grid = this.currentMaze.grid;
            let moved = false;
            
            while (true) {
                let dr = targetCell.r - this.playerPos.r;
                let dc = targetCell.c - this.playerPos.c;
                
                if (dr === 0 && dc === 0) break;
                
                let stepR = this.playerPos.r + (dr !== 0 ? Math.sign(dr) : 0);
                let stepC = this.playerPos.c + (dc !== 0 ? Math.sign(dc) : 0);

                if (Math.abs(dr) > 0 && Math.abs(dc) > 0) break;

                if (stepR >= 0 && stepR < grid.length && stepC >= 0 && stepC < grid[0].length) {
                    if (grid[stepR][stepC] === 0) {
                        this.playerPos = { r: stepR, c: stepC };
                        const key = `${stepR},${stepC}`;
                        if (!this.trail.includes(key)) {
                            this.trail.push(key);
                        }
                        moved = true;
                        if (this.playerPos.r === this.currentMaze.end.r && this.playerPos.c === this.currentMaze.end.c) {
                            this.checkWinCondition();
                            break;
                        }
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }

            if (moved) {
                soundEngine.play('pop');
                this.draw();
            }
        };

        const handleStart = (clientX, clientY) => {
            const cell = getCellFromCoords(clientX, clientY);
            if (cell.r === this.playerPos.r && cell.c === this.playerPos.c) {
                this.isDragging = true;
                soundEngine.play('click');
            } else {
                // Tap adjacent step
                tryMoveTo(cell);
            }
        };

        const handleMove = (clientX, clientY) => {
            if (!this.isDragging) return;
            const cell = getCellFromCoords(clientX, clientY);
            tryMoveTo(cell);
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

        this.winMouseUpRef = handleEnd;
    }

    draw() {
        if (!this.ctx || !this.currentMaze) return;
        
        const grid = this.currentMaze.grid;
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
                    // Wall Block
                    this.ctx.fillStyle = '#63259b';
                    this.ctx.fillRect(x, y, cellSize, cellSize);
                } else {
                    // Path Corridor
                    this.ctx.fillStyle = '#1e083a';
                    this.ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }

        // Draw Visited Path Trail
        this.ctx.fillStyle = 'rgba(45, 212, 191, 0.7)';
        this.trail.forEach(posStr => {
            const [tr, tc] = posStr.split(',').map(Number);
            const cx = tc * cellSize + cellSize / 2;
            const cy = tr * cellSize + cellSize / 2;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, Math.max(2, cellSize * 0.25), 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw Goal Target (Native 2D Canvas rendering)
        const goalX = this.currentMaze.end.c * cellSize;
        const goalY = this.currentMaze.end.r * cellSize;

        if (this.currentMaze.endType === 'milk') {
            this.drawMilkBottle(goalX, goalY, cellSize);
        } else {
            this.drawChocolateBar(goalX, goalY, cellSize);
        }

        // Draw Player Avatar
        const playerX = this.playerPos.c * cellSize;
        const playerY = this.playerPos.r * cellSize;
        if (this.isCharLoaded) {
            this.ctx.drawImage(this.charImg, playerX, playerY, cellSize, cellSize);
        } else {
            this.ctx.fillStyle = '#ffe0b2';
            this.ctx.beginPath();
            this.ctx.arc(playerX + cellSize/2, playerY + cellSize/2, cellSize*0.4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // Native Canvas 2D Milk Bottle Renderer
    drawMilkBottle(x, y, size) {
        this.ctx.save();
        
        // Bottle Body
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#90caf9';
        this.ctx.lineWidth = Math.max(1, size * 0.08);
        this.ctx.beginPath();
        this.ctx.roundRect(x + size * 0.22, y + size * 0.32, size * 0.56, size * 0.6, 3);
        this.ctx.fill();
        this.ctx.stroke();

        // Bottle Neck
        this.ctx.beginPath();
        this.ctx.rect(x + size * 0.35, y + size * 0.16, size * 0.3, size * 0.16);
        this.ctx.fill();
        this.ctx.stroke();

        // Red Cap
        this.ctx.fillStyle = '#ff5252';
        this.ctx.beginPath();
        this.ctx.roundRect(x + size * 0.3, y + size * 0.06, size * 0.4, size * 0.1, 2);
        this.ctx.fill();

        // Blue Label
        this.ctx.fillStyle = '#64b5f6';
        this.ctx.fillRect(x + size * 0.22, y + size * 0.5, size * 0.56, size * 0.22);

        // Text "SÜT" (only if cell size is large enough)
        if (size >= 20) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = `bold ${Math.floor(size * 0.15)}px Fredoka`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('SÜT', x + size * 0.5, y + size * 0.61);
        }

        this.ctx.restore();
    }

    // Native Canvas 2D Chocolate Bar Renderer
    drawChocolateBar(x, y, size) {
        this.ctx.save();

        // Chocolate Base
        this.ctx.fillStyle = '#4e342e';
        this.ctx.strokeStyle = '#3e2723';
        this.ctx.lineWidth = Math.max(1, size * 0.08);
        this.ctx.beginPath();
        this.ctx.roundRect(x + size * 0.12, y + size * 0.12, size * 0.76, size * 0.76, 3);
        this.ctx.fill();
        this.ctx.stroke();

        // Grid lines
        this.ctx.strokeStyle = '#3e2723';
        this.ctx.lineWidth = Math.max(1, size * 0.05);
        this.ctx.beginPath();
        this.ctx.moveTo(x + size * 0.5, y + size * 0.12);
        this.ctx.lineTo(x + size * 0.5, y + size * 0.88);
        this.ctx.moveTo(x + size * 0.12, y + size * 0.5);
        this.ctx.lineTo(x + size * 0.88, y + size * 0.5);
        this.ctx.stroke();

        // Red Wrapper at bottom
        this.ctx.fillStyle = '#ff5252';
        this.ctx.beginPath();
        this.ctx.roundRect(x + size * 0.12, y + size * 0.52, size * 0.76, size * 0.36, [0, 0, 3, 3]);
        this.ctx.fill();

        // Gold Trim
        this.ctx.fillStyle = '#ffd740';
        this.ctx.fillRect(x + size * 0.12, y + size * 0.52, size * 0.76, size * 0.06);

        this.ctx.restore();
    }

    checkWinCondition() {
        if (this.playerPos.r === this.currentMaze.end.r && this.playerPos.c === this.currentMaze.end.c) {
            this.isDragging = false;
            triggerConfetti();
            
            if (this.currentLevel < this.levels.length - 1) {
                // Next level
                setTimeout(() => {
                    this.loadLevel(this.currentLevel + 1);
                }, 1200);
            } else {
                // Game completely won!
                setTimeout(() => {
                    this.container.innerHTML = `
                        <div class="game-win-overlay">
                            <h2>Zekâ Şampiyonu! 🏆</h2>
                            <p>10 Karmaşık Labirentin Tamamını Başarıyla Çözdün!</p>
                            <button class="play-again-btn" onclick="state.activeGameInstance.start()">Tekrar Oyna</button>
                        </div>
                    `;
                }, 800);
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
