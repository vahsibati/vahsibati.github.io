class CupDesignerGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        
        // Colors
        this.cupColor = '#e2e8f0';
        this.lidColor = '#475569';
        this.sleeveColor = '#d97706';
        
        // Name
        this.userName = '';
        
        // Stickers
        this.stickers = [];
        this.selectedStickerIdx = -1;
        
        // Dragging state
        this.isDragging = false;
        this.draggedStickerIdx = -1;
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        // Available Stickers
        this.emojiStickers = ['🐱', '🐶', '🦖', '🦄', '🍓', '🍩', '🚀', '🎨', '🌟', '❤️', '☕', '🍪'];
        
        // Canvas coordinates of parts
        this.cupPath = [
            { x: 110, y: 110 }, // Top Left
            { x: 250, y: 110 }, // Top Right
            { x: 220, y: 350 }, // Bottom Right
            { x: 140, y: 350 }  // Bottom Left
        ];
        
        this.sleevePath = [
            { x: 122, y: 180 }, // Top Left
            { x: 238, y: 180 }, // Top Right
            { x: 228, y: 270 }, // Bottom Right
            { x: 132, y: 270 }  // Bottom Left
        ];
    }

    start() {
        this.stickers = [];
        this.selectedStickerIdx = -1;
        this.cupColor = '#f87171'; // Default bright coral
        this.lidColor = '#ffffff'; // Default white lid
        this.sleeveColor = '#fbbf24'; // Default yellow sleeve
        this.userName = '';

        this.setupHTML();
        this.bindEvents();
        this.draw();
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="designer-game-layout">
                <!-- Preview Canvas -->
                <div class="canvas-area">
                    <canvas id="designerCanvas" width="360" height="400"></canvas>
                </div>
                
                <!-- Customizer Tools -->
                <div class="tools-area">
                    <!-- Name Input -->
                    <div class="tool-section">
                        <h4>Bardağa İsmini Yaz:</h4>
                        <input type="text" id="cup-name-input" maxlength="12" placeholder="İsmin..." value="${this.userName}">
                    </div>

                    <!-- Colors -->
                    <div class="tool-section">
                        <h4>Renk Seç:</h4>
                        <div class="color-pickers">
                            <div>
                                <label>Bardak</label>
                                <input type="color" id="picker-cup" value="${this.cupColor}">
                            </div>
                            <div>
                                <label>Kapak</label>
                                <input type="color" id="picker-lid" value="${this.lidColor}">
                            </div>
                            <div>
                                <label>Kuşak</label>
                                <input type="color" id="picker-sleeve" value="${this.sleeveColor}">
                            </div>
                        </div>
                    </div>

                    <!-- Sticker Picker -->
                    <div class="tool-section">
                        <h4>Çıkartma Ekle (Sürükle veya Dokun):</h4>
                        <div class="sticker-palette">
                            ${this.emojiStickers.map(emoji => `
                                <button class="sticker-add-btn" data-emoji="${emoji}">${emoji}</button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Sticker Controls (Active Only) -->
                    <div class="tool-section id="sticker-controls-wrapper" style="display: none;">
                        <h4>Aktif Çıkartma Ayarları:</h4>
                        <div class="sticker-ctrl-btns">
                            <button id="btn-sticker-grow" class="ctrl-btn-small">➕ Büyüt</button>
                            <button id="btn-sticker-shrink" class="ctrl-btn-small">➖ Küçült</button>
                            <button id="btn-sticker-rotate" class="ctrl-btn-small">🔄 Döndür</button>
                            <button id="btn-sticker-delete" class="ctrl-btn-small btn-delete">🗑️ Sil</button>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="designer-actions">
                        <button id="btn-download-cup" class="play-btn">💾 Tasarımı İndir</button>
                        <button id="btn-print-cup" class="play-btn-outline">🖨️ Boyama Sayfası</button>
                    </div>
                </div>
            </div>
        `;
        
        this.canvas = document.getElementById('designerCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    bindEvents() {
        // Name Input
        const nameInput = document.getElementById('cup-name-input');
        nameInput.addEventListener('input', (e) => {
            this.userName = e.target.value;
            this.draw();
        });

        // Color Pickers
        document.getElementById('picker-cup').addEventListener('input', (e) => {
            this.cupColor = e.target.value;
            this.draw();
        });
        document.getElementById('picker-lid').addEventListener('input', (e) => {
            this.lidColor = e.target.value;
            this.draw();
        });
        document.getElementById('picker-sleeve').addEventListener('input', (e) => {
            this.sleeveColor = e.target.value;
            this.draw();
        });

        // Add Sticker Buttons
        this.container.querySelectorAll('.sticker-add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.getAttribute('data-emoji');
                this.addSticker(emoji);
            });
        });

        // Active Sticker Edit Controls
        document.getElementById('btn-sticker-grow').addEventListener('click', () => this.resizeSticker(1.15));
        document.getElementById('btn-sticker-shrink').addEventListener('click', () => this.resizeSticker(0.85));
        document.getElementById('btn-sticker-rotate').addEventListener('click', () => this.rotateSticker(Math.PI / 8));
        document.getElementById('btn-sticker-delete').addEventListener('click', () => this.deleteSticker());

        // Actions
        document.getElementById('btn-download-cup').addEventListener('click', () => this.downloadDesign());
        document.getElementById('btn-print-cup').addEventListener('click', () => this.printDesign());

        // Canvas mouse/touch drag handlers
        const getCanvasCoords = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        };

        const handleStart = (clientX, clientY) => {
            const pos = getCanvasCoords(clientX, clientY);
            
            // Check if clicked any sticker (from top to bottom layer)
            let clickedIdx = -1;
            for (let i = this.stickers.length - 1; i >= 0; i--) {
                const st = this.stickers[i];
                const dx = pos.x - st.x;
                const dy = pos.y - st.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // Active diameter size is around 40px base * scale
                if (dist <= 25 * st.scale) {
                    clickedIdx = i;
                    break;
                }
            }

            if (clickedIdx !== -1) {
                this.selectedStickerIdx = clickedIdx;
                this.draggedStickerIdx = clickedIdx;
                this.isDragging = true;
                this.dragStartX = pos.x - this.stickers[clickedIdx].x;
                this.dragStartY = pos.y - this.stickers[clickedIdx].y;
                
                // Show controls
                document.getElementById('sticker-controls-wrapper').style.display = 'block';
                soundEngine.play('click');
            } else {
                this.selectedStickerIdx = -1;
                this.draggedStickerIdx = -1;
                this.isDragging = false;
                document.getElementById('sticker-controls-wrapper').style.display = 'none';
            }
            this.draw();
        };

        const handleMove = (clientX, clientY) => {
            if (!this.isDragging || this.draggedStickerIdx === -1) return;
            const pos = getCanvasCoords(clientX, clientY);
            const st = this.stickers[this.draggedStickerIdx];
            
            // Constrain sticker to stay within canvas borders
            st.x = Math.max(20, Math.min(this.canvas.width - 20, pos.x - this.dragStartX));
            st.y = Math.max(20, Math.min(this.canvas.height - 20, pos.y - this.dragStartY));
            this.draw();
        };

        const handleEnd = () => {
            this.isDragging = false;
            this.draggedStickerIdx = -1;
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
        
        // Save references for unbinding
        this.winMouseUpRef = handleEnd;
    }

    addSticker(emoji) {
        soundEngine.play('pop');
        this.stickers.push({
            emoji: emoji,
            x: 180,
            y: 200,
            scale: 1.0,
            rotation: 0
        });
        this.selectedStickerIdx = this.stickers.length - 1;
        document.getElementById('sticker-controls-wrapper').style.display = 'block';
        this.draw();
    }

    resizeSticker(factor) {
        if (this.selectedStickerIdx === -1) return;
        soundEngine.play('click');
        const st = this.stickers[this.selectedStickerIdx];
        st.scale = Math.max(0.4, Math.min(2.5, st.scale * factor));
        this.draw();
    }

    rotateSticker(rad) {
        if (this.selectedStickerIdx === -1) return;
        soundEngine.play('click');
        const st = this.stickers[this.selectedStickerIdx];
        st.rotation += rad;
        this.draw();
    }

    deleteSticker() {
        if (this.selectedStickerIdx === -1) return;
        soundEngine.play('fail');
        this.stickers.splice(this.selectedStickerIdx, 1);
        this.selectedStickerIdx = -1;
        document.getElementById('sticker-controls-wrapper').style.display = 'none';
        this.draw();
    }

    draw(outlineOnly = false) {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Canvas Background
        if (!outlineOnly) {
            this.ctx.fillStyle = '#2c104e';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw Cup Shadow (If not outlineOnly)
        if (!outlineOnly) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
            this.ctx.beginPath();
            this.ctx.ellipse(180, 360, 50, 10, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw Cup Body
        this.ctx.lineWidth = outlineOnly ? 4 : 2;
        this.ctx.strokeStyle = outlineOnly ? '#000000' : 'rgba(255,255,255,0.1)';
        this.ctx.fillStyle = outlineOnly ? '#ffffff' : this.cupColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.cupPath[0].x, this.cupPath[0].y);
        for (let i = 1; i < this.cupPath.length; i++) {
            this.ctx.lineTo(this.cupPath[i].x, this.cupPath[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        if (outlineOnly) this.ctx.stroke();

        // Draw Sleeve
        this.ctx.fillStyle = outlineOnly ? '#ffffff' : this.sleeveColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.sleevePath[0].x, this.sleevePath[0].y);
        for (let i = 1; i < this.sleevePath.length; i++) {
            this.ctx.lineTo(this.sleevePath[i].x, this.sleevePath[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        if (outlineOnly) this.ctx.stroke();

        // Draw Sleeve Label Box
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = outlineOnly ? '#000000' : 'rgba(0,0,0,0.15)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.rect(130, 205, 100, 45);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw Name text inside label box
        if (this.userName) {
            this.ctx.fillStyle = '#1e293b';
            this.ctx.font = 'bold 18px Fredoka';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.userName, 180, 227.5);
        } else {
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.font = '13px Fredoka';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('LUUQ Cafe', 180, 227.5);
        }

        // Draw Lid
        this.ctx.fillStyle = outlineOnly ? '#ffffff' : this.lidColor;
        this.ctx.beginPath();
        // Draw trapezoid lid
        this.ctx.moveTo(100, 110);
        this.ctx.lineTo(260, 110);
        this.ctx.lineTo(250, 85);
        this.ctx.lineTo(110, 85);
        this.ctx.closePath();
        this.ctx.fill();
        if (outlineOnly) this.ctx.stroke();

        // Lid top node
        this.ctx.beginPath();
        this.ctx.rect(160, 75, 40, 10);
        this.ctx.fill();
        if (outlineOnly) this.ctx.stroke();

        // Draw Stickers
        this.stickers.forEach((st, idx) => {
            this.ctx.save();
            this.ctx.translate(st.x, st.y);
            this.ctx.rotate(st.rotation);
            
            // Draw highlight if selected (except in printable outline)
            if (!outlineOnly && idx === this.selectedStickerIdx) {
                this.ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 3]);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 24 * st.scale, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            this.ctx.font = `${Math.floor(35 * st.scale)}px Fredoka`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(st.emoji, 0, 0);
            this.ctx.restore();
        });
    }

    downloadDesign() {
        soundEngine.play('success');
        this.draw(false); // Make sure active sticker border is NOT in download
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `luuq-tasarim-${this.userName || 'karton-bardak'}.png`;
        link.href = dataURL;
        link.click();
        this.draw(); // Redraw selection borders if active
    }

    printDesign() {
        soundEngine.play('success');
        
        // Render in Outline mode on a separate temporary canvas or same canvas temporarily
        this.draw(true);
        const dataURL = this.canvas.toDataURL('image/png');
        
        // Trigger download
        const link = document.createElement('a');
        link.download = `luuq-boyama-${this.userName || 'karton-bardak'}.png`;
        link.href = dataURL;
        link.click();
        
        // Revert canvas back to color view
        setTimeout(() => this.draw(), 500);
    }

    destroy() {
        window.removeEventListener('mouseup', this.winMouseUpRef);
        this.container.innerHTML = '';
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) statusContainer.innerHTML = '';
    }
}

gameRegistry['cup-designer'] = CupDesignerGame;
