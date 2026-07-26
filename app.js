// Global State
const state = {
    selectedCharacter: localStorage.getItem('luuq_char') || null,
    activeGame: null,
    activeGameInstance: null
};

// SVG Assets for dynamic injection
const AVATAR_SVGS = {
    girl: `
    <svg xmlns="http://www.w3.org/2000/svg" class="avatar-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="#FFE0B2" />
        <circle cx="18" cy="30" r="12" fill="#FFB74D" />
        <circle cx="82" cy="30" r="12" fill="#FFB74D" />
        <rect x="15" y="27" width="6" height="6" rx="2" fill="#FF5252" />
        <rect x="79" y="27" width="6" height="6" rx="2" fill="#FF5252" />
        <path d="M 20,38 Q 50,20 80,38 Q 50,30 20,38 Z" fill="#FFB74D" />
        <circle cx="42" cy="48" r="3.5" fill="#2E7D32" />
        <circle cx="43" cy="47" r="1" fill="#FFFFFF" />
        <circle cx="58" cy="48" r="3.5" fill="#2E7D32" />
        <circle cx="59" cy="47" r="1" fill="#FFFFFF" />
        <circle cx="36" cy="54" r="3" fill="#FF8A80" opacity="0.6" />
        <circle cx="64" cy="54" r="3" fill="#FF8A80" opacity="0.6" />
        <path d="M 45,55 Q 50,62 55,55" stroke="#D32F2F" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M 32,80 Q 50,68 68,80 L 68,100 L 32,100 Z" fill="#FF5252" />
        <path d="M 33,86 Q 50,76 67,86" stroke="#FFFFFF" stroke-width="2.5" fill="none" />
        <path d="M 32,94 Q 50,84 68,94" stroke="#FFFFFF" stroke-width="2.5" fill="none" />
    </svg>`,
    boy: `
    <svg xmlns="http://www.w3.org/2000/svg" class="avatar-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="#FFE0B2" />
        <path d="M 20,40 Q 50,15 80,40 Q 50,25 20,40" fill="#8D6E63" />
        <path d="M 23,30 Q 35,10 50,22 Q 65,10 77,30 Z" fill="#8D6E63" />
        <path d="M 24,35 C 24,15 76,15 76,35 Z" fill="#29B6F6" />
        <path d="M 70,32 L 88,32 A 4 4 0 0 1 92,36 L 90,38 A 4 4 0 0 1 86,40 L 72,36 Z" fill="#039BE5" />
        <circle cx="42" cy="48" r="3.5" fill="#1565C0" />
        <circle cx="43" cy="47" r="1" fill="#FFFFFF" />
        <circle cx="58" cy="48" r="3.5" fill="#1565C0" />
        <circle cx="59" cy="47" r="1" fill="#FFFFFF" />
        <circle cx="36" cy="54" r="3" fill="#FF8A80" opacity="0.6" />
        <circle cx="64" cy="54" r="3" fill="#FF8A80" opacity="0.6" />
        <path d="M 44,55 Q 50,63 56,55" stroke="#D32F2F" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M 32,80 Q 50,68 68,80 L 68,100 L 32,100 Z" fill="#0288D1" />
        <path d="M 33,86 Q 50,76 67,86" stroke="#FFFFFF" stroke-width="2.5" fill="none" />
        <path d="M 32,94 Q 50,84 68,94" stroke="#FFFFFF" stroke-width="2.5" fill="none" />
    </svg>`
};

// Web Audio API Synthesis Engine
const soundEngine = {
    ctx: null,
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    play(type) {
        this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        const now = this.ctx.currentTime;
        
        switch (type) {
            case 'click': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
                
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            }
            case 'pop': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
                
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            }
            case 'success': {
                // Arpeggio C4 -> E4 -> G4 -> C5
                const notes = [261.63, 329.63, 392.00, 523.25];
                notes.forEach((freq, index) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + index * 0.1);
                    
                    gain.gain.setValueAtTime(0.2, now + index * 0.1);
                    gain.gain.linearRampToValueAtTime(0.01, now + index * 0.1 + 0.2);
                    
                    osc.start(now + index * 0.1);
                    osc.stop(now + index * 0.1 + 0.2);
                });
                break;
            }
            case 'fail': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(110, now + 0.4);
                
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
                
                osc.start(now);
                osc.stop(now + 0.4);
                break;
            }
            case 'eat': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.08); // C6
                
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
                
                osc.start(now);
                osc.stop(now + 0.08);
                break;
            }
            case 'drop': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
                
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
                
                osc.start(now);
                osc.stop(now + 0.12);
                break;
            }
        }
    }
};

// UI Navigation and Screen Management
function selectScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function selectCharacter(charType) {
    soundEngine.play('click');
    state.selectedCharacter = charType;
    localStorage.setItem('luuq_char', charType);
    setupHubProfile();
    selectScreen('game-hub-screen');
}

function changeCharacter() {
    soundEngine.play('click');
    selectScreen('char-selection-screen');
}

function setupHubProfile() {
    const avatarContainer = document.getElementById('header-avatar');
    if (avatarContainer && state.selectedCharacter) {
        avatarContainer.innerHTML = AVATAR_SVGS[state.selectedCharacter];
    }
}

// Launcher Registry for all games
const gameRegistry = {};

function launchGame(gameId) {
    soundEngine.play('click');
    state.activeGame = gameId;
    
    // Show stage
    selectScreen('game-stage-screen');
    
    // Set game title
    const titles = {
        'memory': 'Hafıza Kartı Oyunu',
        'snake': 'Renkli Yılan Oyunu',
        'catcher': 'Kahve Çekirdeği Yakala',
        'maze': 'Süt & Kahve Labirenti',
        'tower': 'Bisküvi Kulesi',
        'coloring': 'Boyama Kitabı'
    };
    document.getElementById('game-title-display').innerText = titles[gameId] || 'Oyun';
    
    // Hide all game containers
    document.querySelectorAll('.game-container').forEach(c => {
        c.classList.remove('active');
        c.innerHTML = ''; // Clear contents
    });
    
    // Activate target game container
    const container = document.getElementById(`game-container-${gameId}`);
    container.classList.add('active');
    
    // Initialize corresponding game class/module
    if (gameRegistry[gameId]) {
        state.activeGameInstance = new gameRegistry[gameId](container);
        state.activeGameInstance.start();
    } else {
        container.innerHTML = `<div style="padding:40px; text-align:center;"><h2>Çok yakında!</h2></div>`;
    }
}

function exitGame() {
    soundEngine.play('click');
    if (state.activeGameInstance && typeof state.activeGameInstance.destroy === 'function') {
        state.activeGameInstance.destroy();
    }
    state.activeGame = null;
    state.activeGameInstance = null;
    selectScreen('game-hub-screen');
}

// Confetti Celebration
function triggerConfetti() {
    const overlay = document.getElementById('confetti-overlay');
    overlay.innerHTML = '';
    const colors = ['#f472b6', '#fb923c', '#ca8a04', '#2dd4bf', '#60a5fa', '#a78bfa'];
    
    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 1 + 's';
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        // Random dimensions
        const size = Math.random() * 8 + 8;
        piece.style.width = size + 'px';
        piece.style.height = size + 'px';
        
        overlay.appendChild(piece);
    }
    
    soundEngine.play('success');
    
    // Clean up
    setTimeout(() => {
        overlay.innerHTML = '';
    }, 4000);
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Register initial click to enable Web Audio Context
    document.body.addEventListener('click', () => {
        soundEngine.init();
    }, { once: true });
    
    if (state.selectedCharacter) {
        setupHubProfile();
        selectScreen('game-hub-screen');
    } else {
        selectScreen('char-selection-screen');
    }
});
