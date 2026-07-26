class ColoringGame {
    constructor(container) {
        this.container = container;
        this.activeColor = '#ff5252'; // Default red
        this.activeTheme = 'blank'; // Default to blank page
        this.brushSize = 14;
        this.isDrawing = false;
        
        // Color Palette
        this.colors = [
            '#ff5252', '#ff4081', '#e040fb', '#7c4dff', '#536dfe', 
            '#448aff', '#40c4ff', '#18ffff', '#64ffda', '#69f0ae', 
            '#b2ff59', '#eeff41', '#ffff00', '#ffd740', '#ffab40', 
            '#ff6e40', '#8d6e63', '#ffffff', '#cbd5e1', '#000000'
        ];

        // High-Quality SVG Outlines for Template Layer
        this.templates = {
            apple: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
                <!-- CUTE BIG APPLE -->
                <!-- Apple Main Body -->
                <path d="M 200,140 C 240,90 330,110 330,220 C 330,310 250,350 200,320 C 150,350 70,310 70,220 C 70,110 160,90 200,140 Z" fill="none" stroke="#1e293b" stroke-width="6" stroke-linejoin="round"/>
                
                <!-- Top Stem Curve -->
                <path d="M 200,140 Q 205,70 240,75" fill="none" stroke="#1e293b" stroke-width="6" stroke-linecap="round"/>
                
                <!-- Big Leaf -->
                <path d="M 215,95 C 270,60 300,90 270,120 C 230,130 210,110 215,95 Z" fill="none" stroke="#1e293b" stroke-width="5" stroke-linejoin="round"/>
                <!-- Leaf Vein -->
                <path d="M 218,98 Q 245,100 270,120" fill="none" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>

                <!-- Shine / Highlight Curve -->
                <path d="M 120,170 Q 100,220 120,260" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
            </svg>`,
            
            bear: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
                <!-- CUTE TEDDY BEAR -->
                <circle cx="140" cy="120" r="25" fill="none" stroke="#1e293b" stroke-width="5" />
                <circle cx="140" cy="120" r="14" fill="none" stroke="#1e293b" stroke-width="3" />
                <circle cx="260" cy="120" r="25" fill="none" stroke="#1e293b" stroke-width="5" />
                <circle cx="260" cy="120" r="14" fill="none" stroke="#1e293b" stroke-width="3" />
                <ellipse cx="200" cy="165" rx="65" ry="55" fill="none" stroke="#1e293b" stroke-width="5"/>
                <circle cx="175" cy="150" r="6" fill="#1e293b" />
                <circle cx="173" cy="148" r="2" fill="#ffffff" />
                <circle cx="225" cy="150" r="6" fill="#1e293b" />
                <circle cx="223" cy="148" r="2" fill="#ffffff" />
                <ellipse cx="200" cy="180" rx="24" ry="18" fill="none" stroke="#1e293b" stroke-width="4" />
                <path d="M 190,175 L 210,175 Q 200,187 190,175 Z" fill="#1e293b" stroke="#1e293b" stroke-width="2" />
                <path d="M 200,183 Q 200,192 192,192" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
                <path d="M 200,183 Q 200,192 208,192" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
                <path d="M 155,215 Q 120,330 200,330 Q 280,330 245,215" fill="none" stroke="#1e293b" stroke-width="5" />
                <ellipse cx="200" cy="275" rx="35" ry="30" fill="none" stroke="#1e293b" stroke-width="4" />
                <path d="M 145,225 C 110,230 110,270 140,265 Z" fill="none" stroke="#1e293b" stroke-width="5" stroke-linejoin="round"/>
                <path d="M 255,225 C 290,230 290,270 260,265 Z" fill="none" stroke="#1e293b" stroke-width="5" stroke-linejoin="round"/>
                <circle cx="145" cy="325" r="24" fill="none" stroke="#1e293b" stroke-width="5" />
                <circle cx="255" cy="325" r="24" fill="none" stroke="#1e293b" stroke-width="5" />
            </svg>`,

            cat: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
                <!-- CUTE KITTY -->
                <path d="M 120,150 L 150,70 L 180,135 Z" fill="none" stroke="#1e293b" stroke-width="5" stroke-linejoin="round"/>
                <path d="M 132,140 L 152,88 L 170,132 Z" fill="none" stroke="#1e293b" stroke-width="3" stroke-linejoin="round"/>
                <path d="M 220,135 L 250,70 L 280,150 Z" fill="none" stroke="#1e293b" stroke-width="5" stroke-linejoin="round"/>
                <path d="M 230,132 L 248,88 L 268,140 Z" fill="none" stroke="#1e293b" stroke-width="3" stroke-linejoin="round"/>
                <ellipse cx="200" cy="180" rx="75" ry="60" fill="none" stroke="#1e293b" stroke-width="5"/>
                <ellipse cx="165" cy="170" rx="9" ry="12" fill="#1e293b" />
                <circle cx="163" cy="166" r="3" fill="#ffffff" />
                <ellipse cx="235" cy="170" rx="9" ry="12" fill="#1e293b" />
                <circle cx="233" cy="166" r="3" fill="#ffffff" />
                <path d="M 194,190 L 206,190 Q 200,200 194,190 Z" fill="none" stroke="#1e293b" stroke-width="3" stroke-linejoin="round"/>
                <path d="M 200,198 Q 200,206 190,206" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
                <path d="M 200,198 Q 200,206 210,206" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
                <line x1="140" y1="185" x2="90" y2="175" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
                <line x1="135" y1="195" x2="85" y2="195" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
                <line x1="140" y1="205" x2="95" y2="215" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
                <line x1="260" y1="185" x2="310" y2="175" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
                <line x1="265" y1="195" x2="315" y2="195" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
                <line x1="260" y1="205" x2="305" y2="215" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M 155,235 Q 120,350 200,350 Q 280,350 245,235" fill="none" stroke="#1e293b" stroke-width="5"/>
                <ellipse cx="200" cy="290" rx="30" ry="40" fill="none" stroke="#1e293b" stroke-width="4"/>
                <path d="M 170,350 C 170,325 195,325 195,350 Z" fill="none" stroke="#1e293b" stroke-width="4" />
                <path d="M 205,350 C 205,325 230,325 230,350 Z" fill="none" stroke="#1e293b" stroke-width="4" />
                <path d="M 265,310 Q 340,320 330,250 Q 320,240 310,260 Q 315,300 255,290 Z" fill="none" stroke="#1e293b" stroke-width="4.5" stroke-linejoin="round"/>
            </svg>`,

            cafe: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
                <!-- LUUQ CAFE TAKEAWAY COFFEE CUP -->
                <!-- Steam Swirls -->
                <path d="M 170,75 Q 175,55 168,40" fill="none" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M 200,75 Q 205,50 198,35" fill="none" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M 230,75 Q 235,55 228,40" fill="none" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round"/>

                <!-- Lid Top Rim -->
                <path d="M 140,95 L 260,95 Q 268,95 264,82 L 254,75 L 146,75 L 136,82 Q 132,95 140,95 Z" fill="none" stroke="#1e293b" stroke-width="5" stroke-linejoin="round"/>
                <rect x="180" y="68" width="40" height="7" rx="3" fill="none" stroke="#1e293b" stroke-width="4" />

                <!-- Main Cup Body -->
                <path d="M 142,95 L 258,95 L 235,350 Q 233,360 220,360 L 180,360 Q 167,360 165,350 L 142,95 Z" fill="none" stroke="#1e293b" stroke-width="6" stroke-linejoin="round"/>

                <!-- Cup Sleeve / Band -->
                <path d="M 149,170 L 251,170 L 243,260 L 157,260 Z" fill="none" stroke="#1e293b" stroke-width="5.5" stroke-linejoin="round"/>

                <!-- LUUQ Logo Text on Sleeve -->
                <text x="200" y="222" font-size="28" font-family="Fredoka" fill="#1e293b" font-weight="bold" text-anchor="middle" letter-spacing="3">LUUQ</text>
                
                <!-- Decorative Coffee Bean Icon inside Sleeve -->
                <ellipse cx="200" cy="242" rx="7" ry="10" fill="none" stroke="#1e293b" stroke-width="3" transform="rotate(-20 200 242)"/>
                <path d="M 197,233 Q 203,242 197,251" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>

                <!-- Bottom Base Rim -->
                <line x1="165" y1="350" x2="235" y2="350" stroke="#1e293b" stroke-width="4" />
            </svg>`
        };
    }

    start() {
        this.activeTheme = 'blank';
        this.activeColor = '#ff5252';
        this.brushSize = 14;
        this.isDrawing = false;
        
        this.setupHTML();
        this.bindEvents();
        this.updateView();
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="coloring-game-layout">
                <!-- Left: 2-Layer Dual Canvas (Brush Layer 1 + Outline Layer 2) -->
                <div class="canvas-area">
                    <div id="coloring-content-wrapper" style="position: relative; width: 360px; height: 360px;">
                        <canvas id="brushCanvas" width="360" height="360" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index: 1; cursor: crosshair;"></canvas>
                        <canvas id="outlineCanvas" width="360" height="360" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index: 2; pointer-events: none;"></canvas>
                    </div>
                </div>

                <!-- Right: Tool settings -->
                <div class="tools-area">
                    <!-- Themes -->
                    <div class="tool-section">
                        <h4>Şablon Seç:</h4>
                        <div class="theme-select-grid">
                            <button class="theme-btn active" data-theme="blank">📄 Boş Sayfa</button>
                            <button class="theme-btn" data-theme="apple">🍎 Kırmızı Elma</button>
                            <button class="theme-btn" data-theme="bear">🐻 Sevimli Ayı</button>
                            <button class="theme-btn" data-theme="cat">🐱 Sevimli Kedi</button>
                            <button class="theme-btn" data-theme="cafe">☕ LUUQ Cafe</button>
                        </div>
                    </div>

                    <!-- Palette -->
                    <div class="tool-section">
                        <h4>Boya Rengi Seç:</h4>
                        <div class="coloring-palette">
                            ${this.colors.map(color => `
                                <button class="color-swatch ${color === this.activeColor ? 'active' : ''}" 
                                        data-color="${color}" 
                                        style="background-color: ${color};">
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Brush Slider -->
                    <div class="tool-section" id="brush-settings-wrapper">
                        <h4>Fırça Kalınlığı:</h4>
                        <div class="brush-size-controls">
                            <input type="range" id="slider-brush-size" min="4" max="35" value="${this.brushSize}">
                            <span id="label-brush-size">${this.brushSize}px</span>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="designer-actions">
                        <button id="btn-clear-coloring" class="play-btn-outline">🧹 Temizle</button>
                        <button id="btn-download-coloring" class="play-btn">💾 Resmi Kaydet</button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Theme button click
        this.container.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const theme = btn.getAttribute('data-theme');
                this.activeTheme = theme;
                soundEngine.play('click');
                this.updateView();
            });
        });

        // Color swatch click
        this.container.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                
                this.activeColor = swatch.getAttribute('data-color');
                soundEngine.play('pop');
            });
        });

        // Brush Slider
        const brushSlider = document.getElementById('slider-brush-size');
        const brushLabel = document.getElementById('label-brush-size');
        if (brushSlider) {
            brushSlider.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
                if (brushLabel) brushLabel.innerText = `${this.brushSize}px`;
            });
        }

        // Clear and Download
        document.getElementById('btn-clear-coloring').addEventListener('click', () => {
            soundEngine.play('fail');
            this.clearBrushCanvas();
        });

        document.getElementById('btn-download-coloring').addEventListener('click', () => {
            this.downloadImage();
        });
    }

    updateView() {
        this.clearBrushCanvas();
        this.renderOutlineLayer();
        this.setupCanvasDrawing();
    }

    clearBrushCanvas() {
        const canvas = document.getElementById('brushCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    renderOutlineLayer() {
        const outlineCanvas = document.getElementById('outlineCanvas');
        if (!outlineCanvas) return;
        const ctx = outlineCanvas.getContext('2d');
        ctx.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);

        if (this.activeTheme !== 'blank' && this.templates[this.activeTheme]) {
            const svgString = this.templates[this.activeTheme];
            const img = new Image();
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = () => {
                ctx.drawImage(img, 0, 0, outlineCanvas.width, outlineCanvas.height);
                URL.revokeObjectURL(url);
            };
            img.src = url;
        }
    }

    setupCanvasDrawing() {
        const canvas = document.getElementById('brushCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const getCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height)
            };
        };

        const startDraw = (e) => {
            this.isDrawing = true;
            const pos = getCoords(e);
            
            ctx.fillStyle = this.activeColor;
            ctx.strokeStyle = this.activeColor;
            ctx.lineWidth = this.brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Draw single point dot on tap
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.brushSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        };

        const moveDraw = (e) => {
            if (!this.isDrawing) return;
            const pos = getCoords(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        };

        const stopDraw = () => {
            this.isDrawing = false;
            ctx.beginPath();
        };

        // Standard Mouse Listeners directly on brushCanvas
        canvas.onmousedown = (e) => startDraw(e);
        canvas.onmousemove = (e) => moveDraw(e);
        canvas.onmouseup = stopDraw;
        canvas.onmouseleave = stopDraw;

        // Standard Touch Listeners directly on brushCanvas
        canvas.ontouchstart = (e) => { startDraw(e); e.preventDefault(); };
        canvas.ontouchmove = (e) => { moveDraw(e); e.preventDefault(); };
        canvas.ontouchend = stopDraw;

        this.winCanvasMouseUpRef = stopDraw;
    }

    downloadImage() {
        soundEngine.play('success');
        const brushCanvas = document.getElementById('brushCanvas');
        const outlineCanvas = document.getElementById('outlineCanvas');
        if (!brushCanvas) return;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = brushCanvas.width;
        tempCanvas.height = brushCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // 1. Draw brush strokes layer
        tempCtx.drawImage(brushCanvas, 0, 0);

        // 2. Draw outline layer on top
        if (outlineCanvas) {
            tempCtx.drawImage(outlineCanvas, 0, 0);
        }

        const dataURL = tempCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `luuq-boyama-${this.activeTheme}.png`;
        link.href = dataURL;
        link.click();
    }

    destroy() {
        window.removeEventListener('mouseup', this.winCanvasMouseUpRef);
        this.container.innerHTML = '';
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) statusContainer.innerHTML = '';
    }
}

gameRegistry['coloring'] = ColoringGame;
