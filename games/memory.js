class MemoryGame {
    constructor(container) {
        this.container = container;
        this.cards = [];
        this.flippedCards = [];
        this.matchedCount = 0;
        this.moves = 0;
        this.canFlip = true;
        this.items = ['🦁', '🤖', '🦖', '🦄', '🍓', '🍩', '🚀', '🎨', '🦁', '🤖', '🦖', '🦄', '🍓', '🍩', '🚀', '🎨'];
    }

    start() {
        this.moves = 0;
        this.matchedCount = 0;
        this.flippedCards = [];
        this.canFlip = true;
        this.shuffle();
        this.render();
        this.updateStatus();
    }

    shuffle() {
        for (let i = this.items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
        }
    }

    updateStatus() {
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="status-item">Hamle: <span id="memory-moves">${this.moves}</span></div>
                <div class="status-item">Eşleşen: <span id="memory-matched">${this.matchedCount / 2}/8</span></div>
            `;
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="memory-grid-container">
                <div class="memory-grid">
                    ${this.items.map((emoji, index) => `
                        <div class="memory-card" data-index="${index}" data-emoji="${emoji}">
                            <div class="memory-card-inner">
                                <div class="memory-card-front">
                                    <svg viewBox="0 0 100 100" class="card-back-logo">
                                        <circle cx="50" cy="50" r="45" fill="#4a157d" stroke="#ffab40" stroke-width="4"/>
                                        <path d="M 35,45 L 65,45 L 60,75 C 60,80 40,80 40,75 Z" fill="#ffffff" />
                                        <path d="M 62,50 C 70,50 70,65 62,65" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
                                        <path d="M 42,38 Q 45,30 42,25" stroke="#ffab40" stroke-width="3" fill="none" stroke-linecap="round"/>
                                        <path d="M 50,38 Q 53,30 50,25" stroke="#ffab40" stroke-width="3" fill="none" stroke-linecap="round"/>
                                        <path d="M 58,38 Q 61,30 58,25" stroke="#ffab40" stroke-width="3" fill="none" stroke-linecap="round"/>
                                    </svg>
                                </div>
                                <div class="memory-card-back">
                                    <span class="card-emoji">${emoji}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        this.container.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
        });
    }

    flipCard(card) {
        if (!this.canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        soundEngine.play('pop');
        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStatus();
            this.checkMatch();
        }
    }

    checkMatch() {
        this.canFlip = false;
        const [card1, card2] = this.flippedCards;
        const emoji1 = card1.getAttribute('data-emoji');
        const emoji2 = card2.getAttribute('data-emoji');

        if (emoji1 === emoji2) {
            // Match found
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                this.matchedCount += 2;
                this.flippedCards = [];
                this.canFlip = true;
                this.updateStatus();
                
                soundEngine.play('eat'); // custom match sound

                // Win check
                if (this.matchedCount === this.items.length) {
                    setTimeout(() => {
                        triggerConfetti();
                        this.showWinScreen();
                    }, 500);
                }
            }, 300);
        } else {
            // No match
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                this.flippedCards = [];
                this.canFlip = true;
            }, 1000);
        }
    }

    showWinScreen() {
        this.container.innerHTML = `
            <div class="game-win-overlay">
                <h2>Tebrikler! 🎉</h2>
                <p>Tüm kartları eşleştirdin!</p>
                <div class="win-stats">
                    <div>Hamle Sayısı: <strong>${this.moves}</strong></div>
                </div>
                <button class="play-again-btn" onclick="state.activeGameInstance.start()">Tekrar Oyna</button>
            </div>
        `;
    }

    destroy() {
        // Cleanup state
        this.cards = [];
        this.flippedCards = [];
        this.container.innerHTML = '';
        const statusContainer = document.querySelector('.stage-status');
        if (statusContainer) statusContainer.innerHTML = '';
    }
}

// Register Game
gameRegistry['memory'] = MemoryGame;
