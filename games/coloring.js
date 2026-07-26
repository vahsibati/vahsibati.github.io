class ColoringGame {
    constructor(container) {
        this.container = container;
        this.activeColor = '#ff5252'; // Default red
        this.activeTheme = 'blank'; // Default to blank page
        this.brushSize = 8;
        this.isDrawing = false;
        
        // Color Palette
        this.colors = [
            '#ff5252', '#ff4081', '#e040fb', '#7c4dff', '#536dfe', 
            '#448aff', '#40c4ff', '#18ffff', '#64ffda', '#69f0ae', 
            '#b2ff59', '#eeff41', '#ffff00', '#ffd740', '#ffab40', 
            '#ff6e40', '#8d6e63', '#ffffff', '#cbd5e1', '#000000'
        ];

        // Hardcoded SVG templates for high-quality coloring
        this.templates = {
            fruits: `
            <svg id="coloring-svg" viewBox="0 0 400 400" width="100%" height="100%">
                <!-- Background -->
                <rect width="400" height="400" fill="#ffffff" />
                
                <!-- STRAWBERRY -->
                <!-- Body -->
                <path class="colorable" d="M 120,80 C 170,80 180,180 140,210 C 110,230 90,230 60,210 C 20,180 30,80 80,80 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
                <!-- Leaf 1 -->
                <path class="colorable" d="M 70,82 Q 70,50 90,75 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" stroke-linejoin="round"/>
                <!-- Leaf 2 -->
                <path class="colorable" d="M 100,82 Q 130,50 110,75 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" stroke-linejoin="round"/>
                <!-- Stem -->
                <path class="colorable" d="M 95,70 Q 100,50 90,52" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                <!-- Seeds -->
                <circle cx="65" cy="110" r="3" fill="#1e293b" />
                <circle cx="85" cy="120" r="3" fill="#1e293b" />
                <circle cx="115" cy="115" r="3" fill="#1e293b" />
                <circle cx="75" cy="150" r="3" fill="#1e293b" />
                <circle cx="105" cy="150" r="3" fill="#1e293b" />
                <circle cx="90" cy="180" r="3" fill="#1e293b" />

                <!-- APPLE -->
                <!-- Apple Body -->
                <path class="colorable" d="M 280,100 C 330,80 370,140 330,200 C 300,230 280,210 270,200 C 260,210 240,230 210,200 C 170,140 210,80 260,100 C 270,105 270,105 280,100 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
                <!-- Stem -->
                <path class="colorable" d="M 270,102 Q 275,70 295,75" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                <!-- Leaf -->
                <path class="colorable" d="M 283,75 Q 315,65 300,90 Q 280,85 283,75 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" stroke-linejoin="round"/>
                
                <!-- ORANGE / CITRUS -->
                <!-- Body -->
                <circle class="colorable" cx="200" cy="300" r="65" fill="#ffffff" stroke="#1e293b" stroke-width="4" />
                <!-- Leaf -->
                <path class="colorable" d="M 200,235 Q 230,210 220,230" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                <!-- Citrus Texture Dots -->
                <circle cx="160" cy="280" r="2.5" fill="#1e293b" />
                <circle cx="240" cy="310" r="2.5" fill="#1e293b" />
                <circle cx="210" cy="340" r="2.5" fill="#1e293b" />
                <circle cx="180" cy="330" r="2.5" fill="#1e293b" />
            </svg>`,
            
            animals: `
            <svg id="coloring-svg" viewBox="0 0 400 400" width="100%" height="100%">
                <rect width="400" height="400" fill="#ffffff" />
                
                <!-- CUTE TEDDY BEAR -->
                <!-- Left Ear -->
                <circle class="colorable" cx="140" cy="120" r="25" fill="#ffffff" stroke="#1e293b" stroke-width="4" />
                <circle class="colorable" cx="140" cy="120" r="14" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
                <!-- Right Ear -->
                <circle class="colorable" cx="260" cy="120" r="25" fill="#ffffff" stroke="#1e293b" stroke-width="4" />
                <circle class="colorable" cx="260" cy="120" r="14" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
                
                <!-- Head -->
                <ellipse class="colorable" cx="200" cy="165" rx="65" ry="55" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>
                
                <!-- Eyes -->
                <circle cx="175" cy="150" r="6" fill="#1e293b" />
                <circle cx="173" cy="148" r="1.5" fill="#ffffff" />
                <circle cx="225" cy="150" r="6" fill="#1e293b" />
                <circle cx="223" cy="148" r="1.5" fill="#ffffff" />
                
                <!-- Snout -->
                <ellipse class="colorable" cx="200" cy="180" rx="24" ry="18" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
                <!-- Nose -->
                <path class="colorable" d="M 190,175 L 210,175 Q 200,187 190,175 Z" fill="#1e293b" stroke="#1e293b" stroke-width="2" />
                <!-- Mouth -->
                <path d="M 200,183 Q 200,192 192,192" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M 200,183 Q 200,192 208,192" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>

                <!-- Body -->
                <path class="colorable" d="M 155,215 Q 120,330 200,330 Q 280,330 245,215" fill="#ffffff" stroke="#1e293b" stroke-width="4" />
                <!-- Belly patch -->
                <ellipse class="colorable" cx="200" cy="275" rx="35" ry="30" fill="#ffffff" stroke="#1e293b" stroke-width="3" />

                <!-- Left Arm -->
                <path class="colorable" d="M 145,225 C 110,230 110,270 140,265 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
                <!-- Right Arm -->
                <path class="colorable" d="M 255,225 C 290,230 290,270 260,265 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>

                <!-- Left Leg -->
                <circle class="colorable" cx="145" cy="325" r="24" fill="#ffffff" stroke="#1e293b" stroke-width="4" />
                <!-- Right Leg -->
                <circle class="colorable" cx="255" cy="325" r="24" fill="#ffffff" stroke="#1e293b" stroke-width="4" />
            </svg>`,

            catdog: `
            <svg id="coloring-svg" viewBox="0 0 400 400" width="100%" height="100%">
                <rect width="400" height="400" fill="#ffffff" />
                
                <!-- CUTE PUPPY -->
                <!-- Dog Head -->
                <ellipse class="colorable" cx="200" cy="180" rx="75" ry="60" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>
                
                <!-- Left Floppy Ear -->
                <path class="colorable" d="M 130,150 C 90,140 85,250 120,240 Q 140,230 135,170 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
                <!-- Right Floppy Ear -->
                <path class="colorable" d="M 270,150 C 310,140 315,250 280,240 Q 260,230 265,170 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>

                <!-- Eyes -->
                <circle cx="170" cy="170" r="7" fill="#1e293b" />
                <circle cx="168" cy="167" r="2" fill="#ffffff" />
                <circle cx="230" cy="170" r="7" fill="#1e293b" />
                <circle cx="228" cy="167" r="2" fill="#ffffff" />

                <!-- Left Eye Patch (Cute detail) -->
                <path class="colorable" d="M 150,170 A 25,25 0 0 1 190,165 A 25,25 0 0 1 150,170" fill="#ffffff" opacity="0.3" stroke="#1e293b" stroke-width="2"/>

                <!-- Snout -->
                <ellipse class="colorable" cx="200" cy="200" rx="22" ry="16" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
                <path class="colorable" d="M 190,196 L 210,196 Q 200,206 190,196 Z" fill="#1e293b" stroke="#1e293b" stroke-width="2"/>
                <path d="M 200,204 Q 200,212 208,212" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M 200,204 Q 200,212 192,212" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
                
                <!-- Tongue -->
                <path class="colorable" d="M 196,211 Q 200,230 204,211 Z" fill="#ffffff" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>

                <!-- Dog Body -->
                <path class="colorable" d="M 155,235 Q 120,350 200,350 Q 280,350 245,235" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>
                
                <!-- Paws -->
                <path class="colorable" d="M 140,340 C 140,320 170,320 170,340 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
                <path class="colorable" d="M 230,340 C 230,320 260,320 260,340 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
            </svg>`,

            cafe: `
            <svg id="coloring-svg" viewBox="0 0 400 400" width="100%" height="100%">
                <rect width="400" height="400" fill="#ffffff" />
                
                <!-- LUUQ CAFE SCENE -->
                <!-- Big Table -->
                <ellipse class="colorable" cx="200" cy="340" rx="160" ry="30" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>
                <path class="colorable" d="M 80,345 L 80,400 L 105,400 L 105,350" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>
                <path class="colorable" d="M 320,345 L 320,400 L 295,400 L 295,350" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>

                <!-- COFFEE CUP -->
                <!-- Lid -->
                <path class="colorable" d="M 130,160 L 230,160 L 222,145 L 138,145 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
                <rect class="colorable" x="168" y="138" width="24" height="8" rx="2" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
                <!-- Cup Body -->
                <path class="colorable" d="M 136,160 L 224,160 L 206,290 L 154,290 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
                <!-- Sleeve -->
                <path class="colorable" d="M 141,200 L 219,200 L 211,250 L 149,250 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
                <!-- Cup Label Text Box -->
                <rect class="colorable" x="155" y="210" width="50" height="30" rx="3" fill="#ffffff" stroke="#1e293b" stroke-width="2" />
                <text x="180" y="230" font-size="10" font-family="Fredoka" fill="#1e293b" font-weight="bold" text-anchor="middle">LUUQ</text>

                <!-- Giant Donut on the table -->
                <ellipse class="colorable" cx="290" cy="300" rx="45" ry="30" fill="#ffffff" stroke="#1e293b" stroke-width="4" />
                <!-- Donut Glaze -->
                <path class="colorable" d="M 252,298 C 255,275 325,275 328,298 C 310,315 270,315 252,298 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
                <!-- Donut Hole -->
                <ellipse class="colorable" cx="290" cy="300" rx="12" ry="8" fill="#ffffff" stroke="#1e293b" stroke-width="3" />

                <!-- Steam lines rising from cup -->
                <path d="M 160,120 Q 165,100 160,85" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
                <path d="M 180,120 Q 185,100 180,85" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
                <path d="M 200,120 Q 205,100 200,85" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
            </svg>`
        };
    }

    start() {
        this.activeTheme = 'blank';
        this.activeColor = '#ff5252';
        this.brushSize = 8;
        this.isDrawing = false;
        
        this.setupHTML();
        this.bindEvents();
        this.setupCanvasDrawing(); // For blank page
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="coloring-game-layout">
                <!-- Left: Canvas / SVG Preview -->
                <div class="canvas-area">
                    <div id="coloring-content-wrapper">
                        <!-- Filled dynamically -->
                    </div>
                </div>

                <!-- Right: Tool settings -->
                <div class="tools-area">
                    <!-- Themes -->
                    <div class="tool-section">
                        <h4>Şablon Seç:</h4>
                        <div class="theme-select-grid">
                            <button class="theme-btn active" data-theme="blank">📄 Boş Sayfa</button>
                            <button class="theme-btn" data-theme="fruits">🍎 Meyveler</button>
                            <button class="theme-btn" data-theme="animals">🐻 Hayvanlar</button>
                            <button class="theme-btn" data-theme="catdog">🐶 Kedi & Köpek</button>
                            <button class="theme-btn" data-theme="cafe">☕ LUUQ Cafe</button>
                        </div>
                    </div>

                    <!-- Palette -->
                    <div class="tool-section">
                        <h4>Renk Seç:</h4>
                        <div class="coloring-palette">
                            ${this.colors.map(color => `
                                <button class="color-swatch ${color === this.activeColor ? 'active' : ''}" 
                                        data-color="${color}" 
                                        style="background-color: ${color};">
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Brush details (Only for blank canvas) -->
                    <div class="tool-section" id="brush-settings-wrapper">
                        <h4>Fırça Kalınlığı:</h4>
                        <div class="brush-size-controls">
                            <input type="range" id="slider-brush-size" min="4" max="25" value="${this.brushSize}">
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
        
        this.contentWrapper = document.getElementById('coloring-content-wrapper');
        this.updateView();
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

        // Clear and Download
        document.getElementById('btn-clear-coloring').addEventListener('click', () => {
            soundEngine.play('fail');
            this.updateView();
        });

        document.getElementById('btn-download-coloring').addEventListener('click', () => {
            this.downloadImage();
        });
    }

    updateView() {
        // Toggle brush settings slider view (only relevant on blank drawing canvas)
        const brushWrapper = document.getElementById('brush-settings-wrapper');
        if (brushWrapper) {
            brushWrapper.style.display = this.activeTheme === 'blank' ? 'block' : 'none';
        }

        if (this.activeTheme === 'blank') {
            // Render a standard Canvas for freehand draw
            this.contentWrapper.innerHTML = `<canvas id="freehandCanvas" width="360" height="360"></canvas>`;
            this.setupCanvasDrawing();
        } else {
            // Render clickable SVG template
            this.contentWrapper.innerHTML = this.templates[this.activeTheme];
            this.setupSVGColoring();
        }
    }

    setupSVGColoring() {
        const svg = document.getElementById('coloring-svg');
        if (!svg) return;

        svg.querySelectorAll('.colorable').forEach(path => {
            path.addEventListener('click', (e) => {
                path.style.fill = this.activeColor;
                soundEngine.play('pop');
                e.stopPropagation();
            });

            // Touch support for fast filling
            path.addEventListener('touchstart', (e) => {
                path.style.fill = this.activeColor;
                soundEngine.play('pop');
                e.stopPropagation();
                e.preventDefault();
            }, { passive: false });
        });
    }

    setupCanvasDrawing() {
        const canvas = document.getElementById('freehandCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Draw initial white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Brush slider listener
        const brushSlider = document.getElementById('slider-brush-size');
        const brushLabel = document.getElementById('label-brush-size');
        if (brushSlider) {
            brushSlider.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
                if (brushLabel) brushLabel.innerText = `${this.brushSize}px`;
            });
        }

        const getCoords = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        };

        const drawStart = (clientX, clientY) => {
            this.isDrawing = true;
            const pos = getCoords(clientX, clientY);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineWidth = this.brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = this.activeColor;
        };

        const drawMove = (clientX, clientY) => {
            if (!this.isDrawing) return;
            const pos = getCoords(clientX, clientY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        };

        const drawEnd = () => {
            this.isDrawing = false;
        };

        // Mouse listeners
        canvas.addEventListener('mousedown', (e) => drawStart(e.clientX, e.clientY));
        canvas.addEventListener('mousemove', (e) => drawMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', drawEnd);

        // Touch listeners
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                drawStart(e.touches[0].clientX, e.touches[0].clientY);
            }
            e.preventDefault();
        }, { passive: false });
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                drawMove(e.touches[0].clientX, e.touches[0].clientY);
            }
            e.preventDefault();
        }, { passive: false });
        canvas.addEventListener('touchend', drawEnd);

        // Reference saving for unbinding
        this.winCanvasMouseUpRef = drawEnd;
    }

    downloadImage() {
        soundEngine.play('success');
        
        let dataURL;
        if (this.activeTheme === 'blank') {
            const canvas = document.getElementById('freehandCanvas');
            dataURL = canvas.toDataURL('image/png');
        } else {
            // Render SVG to image
            const svg = document.getElementById('coloring-svg');
            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            
            // Create a temporary link to open or download
            dataURL = URL.createObjectURL(svgBlob);
        }

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
