/**
 * Lógica do Jogo - Virada da Sorte
 * Gerencia a mecânica do jogo de memória multiplayer
 */

let currentUser = null;
let roomId = null;
let roomData = null;
let gameStateListener = null;
let playersListener = null;
let myStyle = 'neon';
let isMyTurn = false;
let flippedCards = [];
let canFlip = false;

// Símbolos disponíveis para o jogo
const SYMBOLS = ['heart', 'star', 'diamond', 'clover', 'crown', 'moon', 'sun', 'lightning', 'fire', 'water'];

/**
 * Inicialização
 */
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = user;

    // Obter ID da sala da URL
    const urlParams = new URLSearchParams(window.location.search);
    roomId = urlParams.get('room');

    if (!roomId) {
        alert('Sala não encontrada');
        window.location.href = 'lobby.html';
        return;
    }

    await initializeGame();
});

/**
 * Inicializar jogo
 */
async function initializeGame() {
    try {
        // Carregar dados da sala
        const roomSnapshot = await dbRef.room(roomId).once('value');
        roomData = roomSnapshot.val();

        if (!roomData) {
            alert('Sala não encontrada');
            window.location.href = 'lobby.html';
            return;
        }

        // Verificar se usuário está na sala
        if (!roomData.players || !roomData.players[currentUser.uid]) {
            alert('Você não está nesta sala');
            window.location.href = 'lobby.html';
            return;
        }

        // Obter estilo do jogador
        myStyle = roomData.players[currentUser.uid].style || 'neon';

        // Exibir nome da sala
        document.getElementById('roomNameDisplay').textContent = roomData.name;

        // Configurar listeners
        setupGameListeners();

        // Inicializar jogo se for host e sala estiver cheia
        if (roomData.host === currentUser.uid && roomData.status === 'full') {
            await initializeGameState();
        }

        // Configurar event listeners
        setupEventListeners();

        console.log('✅ Jogo inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar jogo:', error);
        alert('Erro ao carregar jogo');
        window.location.href = 'lobby.html';
    }
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    document.getElementById('leaveGameBtn')?.addEventListener('click', leaveGame);
    document.getElementById('returnToLobby')?.addEventListener('click', returnToLobby);
}

/**
 * Configurar listeners do Firebase
 */
function setupGameListeners() {
    // Listener para mudanças nos jogadores
    playersListener = dbRef.room(roomId).child('players').on('value', (snapshot) => {
        const players = snapshot.val();
        updatePlayersDisplay(players);
    });

    // Listener para mudanças no estado do jogo
    gameStateListener = dbRef.room(roomId).child('gameState').on('value', (snapshot) => {
        const gameState = snapshot.val();
        handleGameStateUpdate(gameState);
    });
}

/**
 * Inicializar estado do jogo
 */
async function initializeGameState() {
    try {
        // Gerar cartas (10 pares = 20 cartas)
        const cards = generateCards(10);

        // Definir primeiro jogador aleatoriamente
        const playerIds = Object.keys(roomData.players);
        const firstPlayer = playerIds[Math.floor(Math.random() * playerIds.length)];

        // Salvar estado inicial
        await dbRef.room(roomId).update({
            status: 'playing',
            gameState: {
                cards: cards,
                currentTurn: firstPlayer,
                flippedCards: [],
                matchedPairs: [],
                lastAction: firebase.database.ServerValue.TIMESTAMP
            }
        });

        console.log('✅ Estado do jogo inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar estado:', error);
    }
}

/**
 * Gerar cartas embaralhadas
 */
function generateCards(pairCount) {
    const cards = [];
    
    // Criar pares
    for (let i = 0; i < pairCount; i++) {
        const symbol = SYMBOLS[i % SYMBOLS.length];
        cards.push({ id: i * 2, symbol: symbol, flipped: false, matched: false });
        cards.push({ id: i * 2 + 1, symbol: symbol, flipped: false, matched: false });
    }

    // Embaralhar
    return shuffleArray(cards);
}

/**
 * Embaralhar array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Atualizar display dos jogadores
 */
function updatePlayersDisplay(players) {
    if (!players) return;

    const playerIds = Object.keys(players);
    
    playerIds.forEach((playerId, index) => {
        const player = players[playerId];
        const playerInfo = document.getElementById(`player${index + 1}Info`);
        
        if (playerInfo) {
            const isCurrentPlayer = playerId === currentUser.uid;
            const nameSpan = playerInfo.querySelector('.player-name');
            const scoreSpan = playerInfo.querySelector('.player-score');
            
            if (nameSpan) {
                nameSpan.textContent = player.name + (isCurrentPlayer ? ' (Você)' : '');
            }
            
            if (scoreSpan) {
                scoreSpan.textContent = `Pontos: ${player.score || 0}`;
            }
        }
    });
}

/**
 * Manipular atualização do estado do jogo
 */
function handleGameStateUpdate(gameState) {
    if (!gameState) return;

    // Atualizar turno
    isMyTurn = gameState.currentTurn === currentUser.uid;
    const turnIndicator = document.getElementById('turnIndicator');
    
    if (turnIndicator) {
        turnIndicator.textContent = isMyTurn ? 'Sua vez!' : 'Vez do oponente';
        turnIndicator.style.background = isMyTurn ? 'var(--primary)' : 'var(--bg-light)';
    }

    // Marcar jogador ativo
    document.querySelectorAll('.player-info').forEach(info => {
        info.classList.remove('active');
    });
    
    if (isMyTurn) {
        document.getElementById('player1Info')?.classList.add('active');
    } else {
        document.getElementById('player2Info')?.classList.add('active');
    }

    // Renderizar tabuleiro
    renderBoard(gameState.cards || []);

    // Verificar se jogo terminou
    if (gameState.matchedPairs && gameState.matchedPairs.length === (gameState.cards.length / 2)) {
        endGame();
    }
}

/**
 * Renderizar tabuleiro
 */
function renderBoard(cards) {
    const gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) return;

    // Criar cards apenas uma vez
    if (gameBoard.children.length === 0) {
        cards.forEach((card, index) => {
            const cardElement = createCardElement(card, index);
            gameBoard.appendChild(cardElement);
        });
    } else {
        // Atualizar estado dos cards existentes
        cards.forEach((card, index) => {
            const cardElement = gameBoard.children[index];
            if (cardElement) {
                updateCardElement(cardElement, card);
            }
        });
    }

    // Atualizar permissão para virar cards
    canFlip = isMyTurn && (!flippedCards || flippedCards.length < 2);
}

/**
 * Criar elemento de card
 */
function createCardElement(card, index) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.setAttribute('data-card-id', card.id);
    cardElement.setAttribute('data-symbol', card.symbol);
    cardElement.setAttribute('data-index', index);

    cardElement.innerHTML = `
        <div class="card-inner">
            <div class="card-back"></div>
            <div class="card-front"></div>
        </div>
    `;

    // Aplicar estilo do jogador
    StylesManager.applyStyleToCard(cardElement, myStyle, index);

    // Atualizar estado inicial
    updateCardElement(cardElement, card);

    // Event listener
    cardElement.addEventListener('click', () => handleCardClick(card, cardElement));

    return cardElement;
}

/**
 * Atualizar elemento de card
 */
function updateCardElement(cardElement, cardData) {
    // Atualizar classes
    cardElement.classList.toggle('flipped', cardData.flipped);
    cardElement.classList.toggle('matched', cardData.matched);
    cardElement.classList.toggle('disabled', cardData.matched);
}

/**
 * Manipular clique em card
 */
async function handleCardClick(card, cardElement) {
    // Verificações
    if (!canFlip) return;
    if (card.matched) return;
    if (card.flipped) return;
    if (!isMyTurn) return;

    try {
        // Virar card localmente
        cardElement.classList.add('flipped');

        // Obter estado atual
        const gameStateSnapshot = await dbRef.room(roomId).child('gameState').once('value');
        const gameState = gameStateSnapshot.val();

        const currentFlipped = gameState.flippedCards || [];

        // Se já há 2 cards virados, não permitir mais
        if (currentFlipped.length >= 2) return;

        // Adicionar card aos virados
        const newFlipped = [...currentFlipped, card.id];

        // Atualizar cards
        const updatedCards = gameState.cards.map(c => 
            c.id === card.id ? { ...c, flipped: true } : c
        );

        // Salvar no Firebase
        await dbRef.room(roomId).child('gameState').update({
            flippedCards: newFlipped,
            cards: updatedCards
        });

        // Se virou 2 cards, verificar match
        if (newFlipped.length === 2) {
            canFlip = false;
            setTimeout(() => checkMatch(newFlipped, updatedCards), 1000);
        }

    } catch (error) {
        console.error('❌ Erro ao virar card:', error);
    }
}

/**
 * Verificar se há match
 */
async function checkMatch(flippedIds, cards) {
    try {
        const card1 = cards.find(c => c.id === flippedIds[0]);
        const card2 = cards.find(c => c.id === flippedIds[1]);

        const isMatch = card1.symbol === card2.symbol;

        // Obter estado atual
        const gameStateSnapshot = await dbRef.room(roomId).child('gameState').once('value');
        const gameState = gameStateSnapshot.val();

        const playersSnapshot = await dbRef.room(roomId).child('players').once('value');
        const players = playersSnapshot.val();

        let updatedCards = [...cards];
        let nextTurn = gameState.currentTurn;
        let matchedPairs = gameState.matchedPairs || [];

        if (isMatch) {
            // Match! Marcar cards como matched
            updatedCards = updatedCards.map(c => 
                (c.id === flippedIds[0] || c.id === flippedIds[1]) 
                    ? { ...c, matched: true, flipped: true }
                    : c
            );

            // Adicionar pontos
            const currentPlayer = players[currentUser.uid];
            await dbRef.room(roomId).child('players').child(currentUser.uid).update({
                score: (currentPlayer.score || 0) + 1
            });

            matchedPairs.push(card1.symbol);

            showMessage('✅ Par encontrado!');

            // Jogador mantém o turno
        } else {
            // Não houve match, desvirar cards
            updatedCards = updatedCards.map(c => 
                (c.id === flippedIds[0] || c.id === flippedIds[1]) 
                    ? { ...c, flipped: false }
                    : c
            );

            showMessage('❌ Não foi dessa vez');

            // Passar turno para o próximo jogador
            const playerIds = Object.keys(players);
            const currentIndex = playerIds.indexOf(nextTurn);
            nextTurn = playerIds[(currentIndex + 1) % playerIds.length];
        }

        // Atualizar estado do jogo
        await dbRef.room(roomId).child('gameState').update({
            cards: updatedCards,
            flippedCards: [],
            currentTurn: nextTurn,
            matchedPairs: matchedPairs,
            lastAction: firebase.database.ServerValue.TIMESTAMP
        });

    } catch (error) {
        console.error('❌ Erro ao verificar match:', error);
    }
}

/**
 * Finalizar jogo
 */
async function endGame() {
    try {
        const playersSnapshot = await dbRef.room(roomId).child('players').once('value');
        const players = playersSnapshot.val();

        const playerIds = Object.keys(players);
        const scores = playerIds.map(id => ({
            name: players[id].name,
            score: players[id].score || 0,
            uid: id
        }));

        // Ordenar por pontuação
        scores.sort((a, b) => b.score - a.score);

        const winner = scores[0];
        const iWon = winner.uid === currentUser.uid;

        // Atualizar estatísticas
        const myStats = await dbRef.user(currentUser.uid).child('stats').once('value');
        const stats = myStats.val() || { gamesPlayed: 0, gamesWon: 0, gamesLost: 0 };

        await dbRef.user(currentUser.uid).child('stats').update({
            gamesPlayed: stats.gamesPlayed + 1,
            gamesWon: stats.gamesWon + (iWon ? 1 : 0),
            gamesLost: stats.gamesLost + (iWon ? 0 : 1)
        });

        // Mostrar modal
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        const finalScore1 = document.getElementById('finalScore1');
        const finalScore2 = document.getElementById('finalScore2');

        title.textContent = iWon ? '🎉 Você Venceu!' : '😔 Você Perdeu';
        message.textContent = `Vencedor: ${winner.name} com ${winner.score} pontos`;

        finalScore1.textContent = `${scores[0].name}: ${scores[0].score} pontos`;
        finalScore2.textContent = scores[1] ? `${scores[1].name}: ${scores[1].score} pontos` : '';

        modal.classList.remove('hidden');

    } catch (error) {
        console.error('❌ Erro ao finalizar jogo:', error);
    }
}

/**
 * Sair do jogo
 */
async function leaveGame() {
    try {
        // Remover jogador da sala
        await dbRef.room(roomId).child('players').child(currentUser.uid).remove();

        // Verificar se sala ficou vazia
        const playersSnapshot = await dbRef.room(roomId).child('players').once('value');
        const players = playersSnapshot.val();

        if (!players || Object.keys(players).length === 0) {
            // Deletar sala se estiver vazia
            await dbRef.room(roomId).remove();
        } else {
            // Atualizar status da sala
            await dbRef.room(roomId).update({
                status: 'waiting'
            });
        }

        // Remover listeners
        if (gameStateListener) {
            dbRef.room(roomId).child('gameState').off('value', gameStateListener);
        }
        if (playersListener) {
            dbRef.room(roomId).child('players').off('value', playersListener);
        }

        // Voltar ao lobby
        window.location.href = 'lobby.html';
    } catch (error) {
        console.error('❌ Erro ao sair do jogo:', error);
        window.location.href = 'lobby.html';
    }
}

/**
 * Voltar ao lobby
 */
function returnToLobby() {
    leaveGame();
}

/**
 * Mostrar mensagem
 */
function showMessage(text) {
    const messageDiv = document.getElementById('gameMessage');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.classList.remove('hidden');

        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 2000);
    }
}

/**
 * Limpar listeners ao sair
 */
window.addEventListener('beforeunload', () => {
    if (gameStateListener) {
        dbRef.room(roomId).child('gameState').off('value', gameStateListener);
    }
    if (playersListener) {
        dbRef.room(roomId).child('players').off('value', playersListener);
    }
});
