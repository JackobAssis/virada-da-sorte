/**
 * VIRADA DA SORTE - Sistema Completo de Jogo
 * Mecânica: Coletar todas as cartas do seu baralho
 */

// ========================================
// CONFIGURAÇÃO DAS IMAGENS POR ESTILO
// ========================================

const STYLE_IMAGES = {
    personagens: Array.from({length: 21}, (_, i) => 
        `/images/Personagens/personagem-card-${String(i + 1).padStart(2, '0')}.png`
    ),
    animais: Array.from({length: 21}, (_, i) => 
        `/images/Animais/animal-card-${String(i + 1).padStart(2, '0')}.png`
    ),
    simbolos: Array.from({length: 21}, (_, i) => 
        `/images/Simbolos/simbolo-card-${String(i + 1).padStart(2, '0')}.png`
    ),
    cyber: Array.from({length: 21}, (_, i) => 
        `/images/Cyber/cyber-card-${String(i + 1).padStart(2, '0')}.png`
    ),
    dark: Array.from({length: 21}, (_, i) => 
        `/images/Dark/dark-card-${String(i + 1).padStart(2, '0')}.png`
    )
};

// ========================================
// ESTADOS DO JOGO
// ========================================

const GAME_STATES = {
    SETUP: 'setup',
    SHUFFLING: 'embaralhando',
    DISTRIBUTING: 'distribuindo',
    WAITING_PLAY: 'aguardandoJogada',
    FLIPPING_CARD: 'virandoCarta',
    RESOLVING_CARD: 'resolvendoCarta',
    CHECKING_VICTORY: 'verificandoVitoria',
    GAME_OVER: 'fimDePartida'
};

const CARD_STATES = {
    FACE_DOWN: 'faceDown',
    FLIPPING: 'flipping',
    FACE_UP: 'faceUp',
    RESOLVED: 'resolved'
};

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

let currentUser = null;
let roomId = null;
let roomData = null;
let gameState = GAME_STATES.SETUP;
let gameStateListener = null;
let roomListener = null;

// Dados do jogo
let players = {};
let myPlayerId = null;
let currentTurnPlayerId = null;
let myStyle = '';
let cardsInGame = []; // Todas as cartas do jogo

// ========================================
// INICIALIZAÇÃO
// ========================================

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = user;

    const urlParams = new URLSearchParams(window.location.search);
    roomId = urlParams.get('room');

    if (!roomId) {
        alert('Sala não encontrada');
        window.location.href = 'lobby.html';
        return;
    }

    await initializeGame();
});

// ========================================
// SISTEMA DE DESCONEXÃO AUTOMÁTICA
// ========================================

/**
 * Configurar desconexão automática (quando fecha aba/navegador)
 */
function setupAutoDisconnect() {
    if (!roomId || !myPlayerId) return;
    
    // Firebase onDisconnect - remove jogador automaticamente
    const playerRef = dbRef.room(roomId).child('players').child(myPlayerId);
    playerRef.onDisconnect().remove();
    
    console.log('🔌 Sistema de desconexão automática configurado');
    
    // Listener para beforeunload (quando fecha aba)
    window.addEventListener('beforeunload', async (e) => {
        try {
            // Remover jogador imediatamente
            await playerRef.remove();
        } catch (error) {
            console.error('❌ Erro ao remover jogador:', error);
        }
    });
}

/**
 * Inicializar jogo
 */
async function initializeGame() {
    try {
        console.log('🎮 Iniciando jogo...');

        // Carregar sala
        const roomSnapshot = await dbRef.room(roomId).once('value');
        roomData = roomSnapshot.val();

        if (!roomData) {
            alert('❌ Sala não encontrada');
            window.location.href = 'lobby.html';
            return;
        }

        if (!roomData.players || !roomData.players[currentUser.uid]) {
            alert('❌ Você não está nesta sala');
            window.location.href = 'lobby.html';
            return;
        }

        myPlayerId = currentUser.uid;
        myStyle = roomData.players[myPlayerId].style || 'personagens';

        // Exibir nome da sala
        document.getElementById('roomNameDisplay').textContent = roomData.name;

        console.log('👤 Meu estilo:', myStyle);
        console.log('🎯 Status da sala:', roomData.status);

        // Setup listeners
        setupRoomListener();
        setupGameStateListener();
        
        // Configurar desconexão automática
        setupAutoDisconnect();

        // Verificar se já existe gameState
        const gameStateSnapshot = await dbRef.room(roomId).child('gameState').once('value');
        const existingGameState = gameStateSnapshot.val();

        if (existingGameState) {
            console.log('✅ GameState existe, carregando...');
            handleGameStateUpdate(existingGameState);
        } else {
            // Se é o host e status é 'starting', inicializar
            if (roomData.host === myPlayerId && (roomData.status === 'starting' || roomData.quickPlay)) {
                console.log('🎮 Sou host, iniciando gameState...');
                
                // Verificar se deve adicionar bot antes de iniciar
                if (roomData.autoBot === true) {
                    const playersSnapshot = await dbRef.room(roomId).child('players').once('value');
                    const players = playersSnapshot.val();
                    const playerCount = players ? Object.keys(players).length : 0;
                    
                    console.log(`👥 Jogadores na sala: ${playerCount}`);
                    
                    // Se tem apenas 1 jogador e autoBot está ativo, adicionar bot
                    if (playerCount === 1) {
                        console.log('🤖 Adicionando bot antes de iniciar...');
                        await addBotPlayer();
                        // Pequeno delay para garantir que o bot foi adicionado
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
                
                await initializeGameState();
            } else {
                console.log('⏳ Aguardando host iniciar o jogo...');
                showMessage('⏳ Aguardando início da partida...');
            }
        }

    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        alert('Erro ao carregar jogo');
    }
}

/**
 * Selecionar imagens aleatórias para um baralho
 */
function getRandomCardImages(style, count = 20) {
    const availableImages = [...STYLE_IMAGES[style]];
    const selected = [];
    
    for (let i = 0; i < count && availableImages.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        selected.push(availableImages.splice(randomIndex, 1)[0]);
    }
    
    return selected;
}

/**
 * Adicionar bot à sala
 */
async function addBotPlayer() {
    try {
        console.log('🤖 Adicionando bot...');
        
        // Verificar se já existe um bot na sala
        const playersSnapshot = await dbRef.room(roomId).child('players').once('value');
        const currentPlayers = playersSnapshot.val();
        
        if (currentPlayers) {
            const hasBot = Object.values(currentPlayers).some(p => p.isBot === true);
            if (hasBot) {
                console.log('⚠️ Bot já existe na sala');
                return;
            }
        }
        
        const botId = 'bot_' + Date.now();
        // Usar os 5 estilos com imagens
        const botStyles = ['personagens', 'animais', 'simbolos', 'cyber', 'dark'];
        const randomStyle = botStyles[Math.floor(Math.random() * botStyles.length)];
        
        // Adicionar bot aos jogadores
        await dbRef.room(roomId).child('players').child(botId).set({
            uid: botId,
            name: '🤖 Bot',
            email: 'bot@virada.game',
            style: randomStyle,
            score: 0,
            ready: true,
            connected: true,
            isBot: true
        });

        console.log('✅ Bot adicionado:', botId, 'com estilo:', randomStyle);
        
    } catch (error) {
        console.error('❌ Erro ao adicionar bot:', error);
    }
}

/**
 * Inicializar estado do jogo (criar baralhos, embaralhar, distribuir)
 */
async function initializeGameState() {
    try {
        console.log('🎲 Criando estado inicial do jogo...');

        // Estado inicial: SHUFFLING
        await dbRef.room(roomId).child('gameState').set({
            status: GAME_STATES.SHUFFLING,
            currentTurn: null,
            winner: null,
            players: {}
        });

        // Aguardar para mostrar animação
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Criar baralhos para cada jogador
        const playerIds = Object.keys(roomData.players);
        const allCards = [];

        playerIds.forEach(playerId => {
            const player = roomData.players[playerId];
            const playerStyle = player.style || 'personagens';
            const images = getRandomCardImages(playerStyle, 20);

            images.forEach((imagePath, index) => {
                allCards.push({
                    id: `${playerId}-${index}`,
                    ownerStyle: playerStyle,
                    ownerId: playerId,
                    imagePath: imagePath,
                    state: CARD_STATES.FACE_DOWN
                });
            });
        });

        // Embaralhar todas as cartas
        console.log('🔄 Embaralhando', allCards.length, 'cartas...');
        const shuffled = shuffleArray(allCards);

        // Estado: DISTRIBUTING
        await dbRef.room(roomId).child('gameState/status').set(GAME_STATES.DISTRIBUTING);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Distribuir cartas igualmente para cada jogador
        const cardsPerPlayer = 20;
        const playersState = {};

        playerIds.forEach((playerId, index) => {
            const start = index * cardsPerPlayer;
            const end = start + cardsPerPlayer;
            const playerDeck = shuffled.slice(start, end);

            playersState[playerId] = {
                deck: playerDeck,
                collected: []
            };
        });

        // Definir primeiro jogador (host)
        const firstPlayer = roomData.host;

        // Iniciar jogo
        await dbRef.room(roomId).child('gameState').update({
            status: GAME_STATES.WAITING_PLAY,
            currentTurn: firstPlayer,
            players: playersState
        });

        console.log('✅ Jogo iniciado!');

    } catch (error) {
        console.error('❌ Erro ao inicializar gameState:', error);
    }
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

// ========================================
// LISTENERS
// ========================================

/**
 * Listener da sala
 */
function setupRoomListener() {
    if (roomListener) {
        dbRef.room(roomId).off('value', roomListener);
    }

    roomListener = dbRef.room(roomId).on('value', (snapshot) => {
        const room = snapshot.val();
        
        if (!room) {
            console.log('❌ Sala foi removida');
            window.location.href = 'lobby.html';
            return;
        }

        roomData = room;
        players = room.players || {};
        
        updatePlayersDisplay();
    });
}

/**
 * Listener do estado do jogo
 */
function setupGameStateListener() {
    if (gameStateListener) {
        dbRef.room(roomId).child('gameState').off('value', gameStateListener);
    }

    gameStateListener = dbRef.room(roomId).child('gameState').on('value', (snapshot) => {
        const state = snapshot.val();
        
        if (state) {
            handleGameStateUpdate(state);
        }
    });
}

/**
 * Atualizar quando o estado do jogo mudar
 */
function handleGameStateUpdate(state) {
    console.log('📊 Estado atualizado:', state.status);

    gameState = state.status || GAME_STATES.SETUP;
    currentTurnPlayerId = state.currentTurn;
    
    // Atualizar cartas dos jogadores
    if (state.players) {
        Object.keys(state.players).forEach(playerId => {
            const playerState = state.players[playerId];
            
            // Renderizar monte do jogador
            renderPlayerDeck(playerId, playerState.deck || []);
            
            // Renderizar cartas coletadas
            renderPlayerCollected(playerId, playerState.collected || []);
            
            // Atualizar progresso
            updatePlayerProgress(playerId, playerState.collected?.length || 0);
        });
    }

    // Atualizar indicador de turno
    updateTurnIndicator();

    // Processar estado
    switch (gameState) {
        case GAME_STATES.SHUFFLING:
            showShuffleAnimation();
            break;
        case GAME_STATES.DISTRIBUTING:
            showMessage('📤 Distribuindo cartas...');
            break;
        case GAME_STATES.WAITING_PLAY:
            hideShuffleAnimation();
            showMessage(getTurnMessage());
            enableCardClicks();
            // Se é turno do bot, executar jogada automaticamente
            checkAndExecuteBotTurn(state);
            break;
        case GAME_STATES.FLIPPING_CARD:
            disableCardClicks();
            break;
        case GAME_STATES.GAME_OVER:
            handleGameOver(state);
            break;
    }
}

// ========================================
// RENDERIZAÇÃO DE CARTAS
// ========================================

/**
 * Renderizar monte de cartas do jogador
 */
function renderPlayerDeck(playerId, deck) {
    const isMe = playerId === myPlayerId;
    const deckElement = document.getElementById(isMe ? 'myDeck' : 'opponentDeck');
    const countElement = document.getElementById(isMe ? 'myDeckCount' : 'opponentDeckCount');
    
    if (!deckElement || !countElement) return;

    deckElement.innerHTML = '';
    countElement.textContent = deck.length;

    deck.forEach((card, index) => {
        const cardEl = createCardElement(card, index, playerId);
        deckElement.appendChild(cardEl);
    });
}

/**
 * Renderizar cartas coletadas do jogador
 */
function renderPlayerCollected(playerId, collected) {
    const isMe = playerId === myPlayerId;
    const collectedElement = document.getElementById(isMe ? 'myCollected' : 'opponentCollected');
    const countElement = document.getElementById(isMe ? 'myCollectedCount' : 'opponentCollectedCount');
    
    if (!collectedElement || !countElement) return;

    collectedElement.innerHTML = '';
    countElement.textContent = `${collected.length}/20`;

    collected.forEach((card, index) => {
        const cardEl = createCardElement(card, index, playerId, true);
        collectedElement.appendChild(cardEl);
    });
}

/**
 * Criar elemento de carta
 */
function createCardElement(card, index, playerId, isCollected = false) {
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.cardId = card.id;
    div.dataset.cardIndex = index;
    div.dataset.playerId = playerId;
    div.dataset.ownerStyle = card.ownerStyle;
    div.dataset.imagePath = card.imagePath; // ✅ ADICIONADO para flipCardAnimation
    
    if (card.state === CARD_STATES.FACE_UP || card.state === CARD_STATES.RESOLVED) {
        div.classList.add('flipping');
    }
    
    if (isCollected) {
        div.classList.add('card-collected', 'disabled');
    }

    // Se é meu turno e minha carta, permitir clique
    const isMyTurn = currentTurnPlayerId === myPlayerId;
    const isMyCard = playerId === myPlayerId;
    const canClick = isMyTurn && isMyCard && !isCollected && card.state === CARD_STATES.FACE_DOWN;
    
    if (canClick) {
        div.classList.add('clickable');
        
        // Click handler
        const clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCardClick(card, index, playerId, div);
        };
        
        // Mouse events
        div.addEventListener('click', clickHandler);
        
        // Touch events (otimizado para mobile)
        div.addEventListener('touchstart', (e) => {
            e.preventDefault();
            div.classList.add('card-pressing');
        }, { passive: false });
        
        div.addEventListener('touchend', (e) => {
            div.classList.remove('card-pressing');
            clickHandler(e);
        }, { passive: false });
        
        div.addEventListener('touchcancel', () => {
            div.classList.remove('card-pressing');
        });
        
        // Mouse press visual feedback
        div.addEventListener('mousedown', () => {
            div.classList.add('card-pressing');
        });
        
        div.addEventListener('mouseup', () => {
            div.classList.remove('card-pressing');
        });
        
        div.addEventListener('mouseleave', () => {
            div.classList.remove('card-pressing');
        });
    } else if (!isCollected) {
        div.classList.add('disabled');
    }

    // Inner container para flip
    const inner = document.createElement('div');
    inner.className = 'card-inner';

    // Verso
    const back = document.createElement('div');
    back.className = 'card-back';

    // Frente (só criar se a carta estiver virada ou coletada)
    const front = document.createElement('div');
    front.className = 'card-front';
    
    // CORRIGIDO: Só carregar imagem se carta estiver FACE_UP ou RESOLVED
    const shouldShowImage = card.state === CARD_STATES.FACE_UP || 
                           card.state === CARD_STATES.RESOLVED || 
                           isCollected;
    
    if (shouldShowImage) {
        const img = document.createElement('img');
        img.className = 'card-image';
        img.src = card.imagePath;
        img.alt = 'Carta';
        img.loading = 'lazy';
        front.appendChild(img);
    }

    inner.appendChild(back);
    inner.appendChild(front);
    div.appendChild(inner);

    return div;
}

// ========================================
// INTERAÇÃO COM CARTAS
// ========================================

/**
 * Click na carta
 */
async function handleCardClick(card, index, playerId, cardElement) {
    if (gameState !== GAME_STATES.WAITING_PLAY) {
        console.log('⚠️ Não é possível virar carta agora');
        showQuickMessage('⚠️ Aguarde...');
        return;
    }

    if (currentTurnPlayerId !== myPlayerId) {
        console.log('⚠️ Não é seu turno');
        showQuickMessage('⚠️ Não é seu turno');
        return;
    }

    console.log('🃏 Virando carta:', card.id);

    try {
        // Feedback visual imediato - animação de preparação
        cardElement.classList.add('card-preparing');
        await new Promise(resolve => setTimeout(resolve, 150));
        cardElement.classList.remove('card-preparing');
        
        // Atualizar estado para FLIPPING
        await dbRef.room(roomId).child('gameState').update({
            status: GAME_STATES.FLIPPING_CARD,
            lastFlippedCard: {
                cardId: card.id,
                cardIndex: index,
                playerId: playerId
            }
        });

        // Virar carta localmente com som (se disponível)
        flipCardAnimation(card.id);
        playFlipSound();

        // Aguardar animação completa
        await new Promise(resolve => setTimeout(resolve, 650));

        // Resolver carta
        await resolveCard(card, index, playerId);

    } catch (error) {
        console.error('❌ Erro ao virar carta:', error);
    }
}

/**
 * Animação de virar carta
 */
async function flipCardAnimation(cardId) {
    const cardEl = document.querySelector(`[data-card-id="${cardId}"]`);
    if (!cardEl) return;
    
    // IMPORTANTE: Carregar imagem AGORA, antes de virar
    const front = cardEl.querySelector('.card-front');
    
    if (front && !front.querySelector('img')) {
        // Buscar dados da carta do dataset
        const imagePath = cardEl.dataset.imagePath;
        
        if (imagePath) {
            const img = document.createElement('img');
            img.className = 'card-image';
            img.src = imagePath;
            img.alt = 'Carta';
            img.loading = 'eager'; // Carregar imediatamente
            front.appendChild(img);
        }
    }
    
    cardEl.classList.add('flipping');
    
    // Adicionar classe de animação extra para destaque
    cardEl.classList.add('card-flipping-active');
    setTimeout(() => {
        cardEl.classList.remove('card-flipping-active');
        }, 650);
    }
}

/**
 * Tocar som de flip (opcional, silencioso se não houver)
 */
function playFlipSound() {
    try {
        // Som suave de flip (Web Audio API)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        // Som não é crítico, apenas ignora se der erro
    }
}

/**
 * Mostrar mensagem rápida (toast)
 */
function showQuickMessage(text) {
    const toast = document.createElement('div');
    toast.className = 'quick-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remover após 2s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

/**
 * Resolver carta (verificar se pertence ao jogador)
 */
async function resolveCard(card, index, playerId) {
    try {
        console.log('🔍 Resolvendo carta...');
        console.log('Carta ownerStyle:', card.ownerStyle);
        console.log('Jogador style:', players[playerId]?.style);

        // Comparar estilos diretamente (sem conversão)
        const playerStyle = players[playerId]?.style || 'personagens';
        const belongsToCurrentPlayer = card.ownerStyle === playerStyle;
        
        console.log('Estilo do jogador:', playerStyle);
        console.log('Pertence ao jogador?', belongsToCurrentPlayer);

        // Atualizar estado
        await dbRef.room(roomId).child('gameState').update({
            status: GAME_STATES.RESOLVING_CARD
        });

        // Animação de resolução
        const cardEl = document.querySelector(`[data-card-id="${card.id}"]`);
        if (cardEl) {
            cardEl.classList.add(belongsToCurrentPlayer ? 'resolving-success' : 'resolving-transfer');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Atualizar Firebase
        if (belongsToCurrentPlayer) {
            // Carta pertence ao jogador - adicionar às coletadas
            await moveCardToCollected(playerId, index);
            showMessage(`✅ ${players[playerId].name} recuperou uma carta!`);
        } else {
            // Carta não pertence - transferir para o dono
            const ownerId = getCardOwnerId(card.ownerStyle);
            if (ownerId) {
                await transferCardToOwner(playerId, index, ownerId);
                showMessage(`↩️ Carta devolvida para ${players[ownerId].name}`);
            } else {
                console.error('❌ Dono da carta não encontrado!');
                // Se não encontrar dono, descartar carta
                await moveCardToCollected(playerId, index);
            }
        }

        // Verificar vitória
        await checkVictory();

        // Próximo turno
        await nextTurn();

    } catch (error) {
        console.error('❌ Erro ao resolver carta:', error);
    }
}

/**
 * Mover carta para coletadas
 */
async function moveCardToCollected(playerId, cardIndex) {
    const gameStateRef = dbRef.room(roomId).child('gameState');
    const snapshot = await gameStateRef.once('value');
    const state = snapshot.val();

    const playerDeck = state.players[playerId].deck;
    const card = playerDeck[cardIndex];

    // Remover do deck
    playerDeck.splice(cardIndex, 1);

    // Adicionar às coletadas
    const collected = state.players[playerId].collected || [];
    collected.push({...card, state: CARD_STATES.RESOLVED});

    await gameStateRef.child(`players/${playerId}`).update({
        deck: playerDeck,
        collected: collected
    });
}

/**
 * Transferir carta para o dono
 */
async function transferCardToOwner(fromPlayerId, cardIndex, toPlayerId) {
    const gameStateRef = dbRef.room(roomId).child('gameState');
    const snapshot = await gameStateRef.once('value');
    const state = snapshot.val();

    const fromDeck = state.players[fromPlayerId].deck;
    const card = fromDeck[cardIndex];

    // Remover do deck atual
    fromDeck.splice(cardIndex, 1);

    // CORRIGIDO: Adicionar ao FINAL do deck do dono (não em collected)
    const toDeck = state.players[toPlayerId].deck || [];
    card.state = CARD_STATES.FACE_DOWN; // Resetar estado
    toDeck.push(card);

    await gameStateRef.update({
        [`players/${fromPlayerId}/deck`]: fromDeck,
        [`players/${toPlayerId}/deck`]: toDeck
    });
}

/**
 * Obter ID do dono da carta pelo estilo
 */
function getCardOwnerId(ownerStyle) {
    for (const [playerId, player] of Object.entries(players)) {
        if (player.style === ownerStyle) {
            return playerId;
        }
    }
    return null;
}

/**
 * Próximo turno
 */
async function nextTurn() {
    const playerIds = Object.keys(players);
    const currentIndex = playerIds.indexOf(currentTurnPlayerId);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    const nextPlayerId = playerIds[nextIndex];

    await dbRef.room(roomId).child('gameState').update({
        currentTurn: nextPlayerId,
        status: GAME_STATES.WAITING_PLAY
    });
}

/**
 * Verificar vitória
 */
async function checkVictory() {
    const gameStateRef = dbRef.room(roomId).child('gameState');
    const snapshot = await gameStateRef.once('value');
    const state = snapshot.val();

    for (const [playerId, playerState] of Object.entries(state.players)) {
        if (playerState.collected && playerState.collected.length >= 20) {
            // Jogador venceu!
            await gameStateRef.update({
                status: GAME_STATES.GAME_OVER,
                winner: playerId
            });
            return true;
        }
    }

    return false;
}

// ========================================
// UI E ANIMAÇÕES
// ========================================

/**
 * Atualizar display dos jogadores
 */
function updatePlayersDisplay() {
    const playerIds = Object.keys(players);
    
    playerIds.forEach((playerId, index) => {
        const player = players[playerId];
        const isMe = playerId === myPlayerId;
        
        const nameEl = document.getElementById(isMe ? 'myName' : 'opponentName');
        if (nameEl) {
            nameEl.textContent = isMe ? `${player.name} (Você)` : player.name;
        }
    });
}

// ========================================
// LÓGICA DO BOT
// ========================================

/**
 * Verificar e executar turno do bot
 */
function checkAndExecuteBotTurn(state) {
    if (!state || !state.currentTurn) return;
    
    const currentPlayer = state.players?.[state.currentTurn];
    
    // Verificar se é turno do bot
    if (currentPlayer?.isBot === true) {
        console.log('🤖 É turno do bot, executando jogada...');
        
        // Delay para parecer mais natural (1-2 segundos)
        const delay = 1000 + Math.random() * 1000;
        setTimeout(() => {
            botPlayTurn(state.currentTurn, state);
        }, delay);
    }
}

/**
 * Bot executa sua jogada
 */
async function botPlayTurn(botId, state) {
    try {
        // Verificar se ainda é turno do bot
        const currentState = await dbRef.room(roomId).child('gameState').once('value');
        const latestState = currentState.val();
        
        if (latestState.currentTurn !== botId) {
            console.log('⚠️ Não é mais turno do bot');
            return;
        }
        
        if (latestState.status !== GAME_STATES.WAITING_PLAY) {
            console.log('⚠️ Estado não permite jogada');
            return;
        }
        
        const botDeck = latestState.players[botId].deck;
        
        if (!botDeck || botDeck.length === 0) {
            console.log('⚠️ Bot não tem cartas');
            await nextTurn();
            return;
        }
        
        console.log('🤖 Bot virando carta...');
        
        // Pegar primeira carta do deck
        const card = botDeck[0];
        const cardIndex = 0;
        
        // Atualizar estado para FLIPPING
        await dbRef.room(roomId).child('gameState').update({
            status: GAME_STATES.FLIPPING_CARD,
            currentFlippingCard: {
                playerId: botId,
                cardIndex: cardIndex,
                card: card
            }
        });
        
        // Aguardar animação
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // CORRIGIDO: Resolver carta passando objeto completo
        await resolveCard(card, cardIndex, botId);
        
    } catch (error) {
        console.error('❌ Erro no turno do bot:', error);
        // Em caso de erro, passar turno
        await nextTurn();
    }
}

/**
 * Atualizar progresso
 */
function updatePlayerProgress(playerId, collectedCount) {
    const isMe = playerId === myPlayerId;
    const progressEl = document.getElementById(isMe ? 'myProgress' : 'opponentProgress');
    
    if (progressEl) {
        const percentage = (collectedCount / 20) * 100;
        progressEl.style.width = `${percentage}%`;
    }
}

/**
 * Atualizar indicador de turno
 */
function updateTurnIndicator() {
    const indicator = document.getElementById('turnIndicator');
    if (!indicator) return;

    if (currentTurnPlayerId === myPlayerId) {
        indicator.textContent = '🎯 Sua vez!';
        indicator.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else {
        const opponentName = players[currentTurnPlayerId]?.name || 'Oponente';
        indicator.textContent = `⏳ Vez de ${opponentName}`;
        indicator.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
}

/**
 * Mensagem de turno
 */
function getTurnMessage() {
    if (currentTurnPlayerId === myPlayerId) {
        return '🎯 Sua vez! Clique em uma carta para virar';
    } else {
        return `⏳ Aguardando jogada de ${players[currentTurnPlayerId]?.name || 'oponente'}...`;
    }
}

/**
 * Mostrar mensagem
 */
function showMessage(text) {
    const messageEl = document.getElementById('gameMessage');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.style.display = 'block';
    }
}

/**
 * Mostrar animação de embaralhamento
 */
function showShuffleAnimation() {
    const animEl = document.getElementById('centralAnimation');
    const shuffleArea = document.getElementById('shuffleArea');
    
    if (!animEl || !shuffleArea) return;

    shuffleArea.innerHTML = '';
    
    // Criar cartas de embaralhamento
    for (let i = 0; i < 40; i++) {
        const card = document.createElement('div');
        card.className = 'shuffle-card';
        shuffleArea.appendChild(card);
    }

    animEl.classList.remove('hidden');
    showMessage('🔄 Embaralhando cartas...');
}

/**
 * Esconder animação de embaralhamento
 */
function hideShuffleAnimation() {
    const animEl = document.getElementById('centralAnimation');
    if (animEl) {
        animEl.classList.add('hidden');
    }
}

/**
 * Habilitar cliques nas cartas
 */
function enableCardClicks() {
    const myCards = document.querySelectorAll(`[data-player-id="${myPlayerId}"] .card:not(.flipping):not(.disabled)`);
    myCards.forEach(card => {
        card.classList.add('clickable');
        card.classList.remove('disabled');
    });
}

/**
 * Desabilitar cliques nas cartas
 */
function disableCardClicks() {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.remove('clickable');
        card.classList.add('disabled');
    });
}

/**
 * Fim de jogo
 */
function handleGameOver(state) {
    const winnerId = state.winner;
    const winner = players[winnerId];
    
    const modal = document.getElementById('gameOverModal');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');

    if (winnerId === myPlayerId) {
        title.textContent = '🎉 Você Venceu!';
        message.textContent = 'Parabéns! Você completou seu baralho!';
    } else {
        title.textContent = '😔 Fim de Jogo';
        message.textContent = `${winner.name} venceu a partida!`;
    }

    modal.classList.remove('hidden');
}

// ========================================
// SAIR DO JOGO
// ========================================

/**
 * Sair do jogo
 */
async function leaveGame() {
    try {
        console.log('🚪 Saindo do jogo...');
        
        // Remover listeners
        if (roomListener) dbRef.room(roomId).off('value', roomListener);
        if (gameStateListener) dbRef.room(roomId).child('gameState').off('value', gameStateListener);
        
        // Remover jogador da sala
        if (roomId && myPlayerId) {
            await dbRef.room(roomId).child('players').child(myPlayerId).remove();
            console.log('✅ Jogador removido da sala');
            
            // Verificar se sala ficou vazia
            const roomSnapshot = await dbRef.room(roomId).once('value');
            const roomData = roomSnapshot.val();
            
            if (roomData && roomData.players) {
                const remainingPlayers = Object.keys(roomData.players).length;
                
                if (remainingPlayers === 0) {
                    // Sala vazia, remover completamente
                    await dbRef.room(roomId).remove();
                    console.log('🗑️ Sala vazia removida');
                } else if (roomData.host === myPlayerId) {
                    // Se eu era o host, transferir para próximo jogador
                    const newHost = Object.keys(roomData.players)[0];
                    await dbRef.room(roomId).update({ host: newHost });
                    console.log('👑 Host transferido para:', newHost);
                }
            }
        }
        
        window.location.href = 'lobby.html';
    } catch (error) {
        console.error('❌ Erro ao sair:', error);
        window.location.href = 'lobby.html';
    }
}

window.leaveGame = leaveGame;

// Botão de voltar ao lobby
document.getElementById('returnToLobby')?.addEventListener('click', leaveGame);
