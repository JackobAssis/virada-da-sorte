/**
 * Lógica do Jogo - Virada da Sorte
 * Jogo de Posse de Cartas - Coletar todas as cartas do seu estilo
 * 
 * MECÂNICA:
 * - Cada jogador tem um estilo de carta (neon-circuit, arcane-sigil, etc)
 * - Cartas são distribuídas em pilhas para cada jogador
 * - Apenas a carta do TOPO pode ser revelada
 * - Se revelar carta do SEU estilo: mantém turno e carta
 * - Se revelar carta do OPONENTE: passa turno, carta vai para o dono, você recebe uma aleatória
 * - Vitória: Primeiro a coletar TODAS as cartas do seu estilo
 */

let currentUser = null;
let roomId = null;
let roomData = null;
let gameStateListener = null;
let playersListener = null;
let myStyle = 'neon-circuit';
let myPlayerId = null;
let opponentId = null;
let isMyTurn = false;
let canReveal = true;
let turnTimer = null;
const TURN_TIMEOUT = 30; // 30 segundos por turno

// Símbolos disponíveis para as cartas
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
        myStyle = roomData.players[currentUser.uid].style || 'neon-circuit';

        // Exibir nome da sala
        document.getElementById('roomNameDisplay').textContent = roomData.name;

        // Verificar se precisa adicionar bot
        const playerCount = Object.keys(roomData.players || {}).length;
        console.log('👥 Contagem de jogadores:', {
            playerCount,
            isHost: roomData.host === currentUser.uid,
            players: Object.keys(roomData.players || {})
        });
        
        if (playerCount === 1 && roomData.host === currentUser.uid) {
            console.log('⚙️ Apenas 1 jogador detectado, adicionando bot...');
            await addBotPlayer();
            
            // Aguardar um momento e recarregar dados da sala
            console.log('🔄 Recarregando dados da sala após adicionar bot...');
            await new Promise(resolve => setTimeout(resolve, 500));
            const roomSnapshot = await dbRef.room(roomId).once('value');
            roomData = roomSnapshot.val();
            console.log('✅ Dados da sala recarregados');
        } else {
            console.log('ℹ️ Bot não necessário:', {
                reason: playerCount > 1 ? 'Mais de 1 jogador' : 'Não é host'
            });
        }

        // Recalcular contagem de jogadores após possível adição do bot
        const currentPlayerCount = Object.keys(roomData.players || {}).length;
        console.log('👥 Contagem atual de jogadores:', currentPlayerCount);

        // Configurar event listeners ANTES de inicializar o jogo
        setupEventListeners();
        
        // Configurar listeners do Firebase ANTES de inicializar
        setupGameListeners();
        
        // Configurar sistema de presença
        setupPresenceSystem();
        
        // Monitorar conexão do oponente
        monitorOpponentConnection();

        // Verificar se gameState já existe
        console.log('🔍 Verificando se gameState já existe...');
        const gameStateSnapshot = await dbRef.room(roomId).child('gameState').once('value');
        const existingGameState = gameStateSnapshot.val();
        
        if (existingGameState) {
            console.log('✅ GameState já existe, carregando...');
            handleGameStateUpdate(existingGameState);
        } else {
            // Inicializar jogo se for host e tiver 2 jogadores
            if (roomData.host === currentUser.uid && currentPlayerCount >= 2) {
                console.log('🎮 Iniciando novo jogo como host...');
                await initializeGameState();
            } else {
                console.log('⏳ Aguardando inicialização do jogo:', {
                    isHost: roomData.host === currentUser.uid,
                    playerCount: currentPlayerCount
                });
            }
        }

        console.log('✅ Jogo inicializado');
        
        // Teste de botões
        console.log('🔘 Testando botões:');
        console.log('  - leaveGameBtn existe?', !!document.getElementById('leaveGameBtn'));
        console.log('  - leaveGame função existe?', typeof window.leaveGame);
        
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
    console.log('🔧 Configurando event listeners...');
    
    // Garantir que o DOM está pronto
    const setup = () => {
        const leaveBtn = document.getElementById('leaveGameBtn');
        const returnBtn = document.getElementById('returnToLobby');
        
        console.log('🔍 Procurando botões:', {
            leaveBtn: !!leaveBtn,
            returnBtn: !!returnBtn
        });
        
        if (leaveBtn) {
            // Remover listener antigo se existir
            leaveBtn.removeEventListener('click', leaveGame);
            // Adicionar novo listener
            leaveBtn.addEventListener('click', leaveGame);
            console.log('✅ Listener do botão Sair configurado');
        } else {
            console.error('❌ Botão leaveGameBtn não encontrado');
        }
        
        if (returnBtn) {
            returnBtn.removeEventListener('click', returnToLobby);
            returnBtn.addEventListener('click', returnToLobby);
            console.log('✅ Listener do botão Retornar configurado');
        } else {
            console.log('⚠️ Botão returnToLobby não encontrado (esperado no modal)');
        }
    };
    
    // Executar imediatamente ou após DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
}

/**
 * Adicionar jogador bot
 */
async function addBotPlayer() {
    console.log('🤖 Função addBotPlayer() chamada');
    
    try {
        console.log('📊 Verificando sala:', {
            roomId,
            currentUser: currentUser?.uid
        });
        
        const botId = 'bot_' + Date.now();
        const botStyles = ['neon-circuit', 'arcane-sigil', 'minimal-prime', 'flux-ember'];
        const randomStyle = botStyles[Math.floor(Math.random() * botStyles.length)];
        
        console.log('⚙️ Criando bot:', {
            botId,
            style: randomStyle
        });
        
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

        // Atualizar status da sala
        await dbRef.room(roomId).update({
            status: 'full'
        });

        console.log('✅ Bot adicionado à sala');
        
        // Recarregar dados da sala
        const roomSnapshot = await dbRef.room(roomId).once('value');
        roomData = roomSnapshot.val();
        
    } catch (error) {
        console.error('❌ Erro ao adicionar bot:', error);
    }
}

/**
 * Configurar listeners do Firebase
 */
function setupGameListeners() {
    console.log('🔧 Configurando listeners do Firebase...');
    
    // Listener para mudanças nos jogadores
    playersListener = dbRef.room(roomId).child('players').on('value', (snapshot) => {
        const players = snapshot.val();
        console.log('👥 Players atualizado:', players);
        updatePlayersDisplay(players);
    });

    // Listener para mudanças no estado do jogo
    gameStateListener = dbRef.room(roomId).child('gameState').on('value', (snapshot) => {
        const gameState = snapshot.val();
        console.log('🎮 GameState atualizado via listener:', gameState);
        handleGameStateUpdate(gameState);
    });
    
    console.log('✅ Listeners configurados');
}

/**
 * Inicializar estado do jogo
 */
async function initializeGameState() {
    console.log('🎮 Iniciando estado do jogo...');
    
    try {
        // Verificar se gameState já existe para evitar duplicação
        const gameStateCheck = await dbRef.room(roomId).child('gameState').once('value');
        if (gameStateCheck.val()) {
            console.log('⚠️ GameState já existe, não será recriado');
            return;
        }
        
        console.log('📊 Dados da sala:', {
            roomData,
            players: roomData?.players
        });
        
        const playerIds = Object.keys(roomData.players);
        console.log('👥 IDs dos jogadores:', playerIds);
        
        if (playerIds.length < 2) {
            console.error('❌ Menos de 2 jogadores na sala!');
            return;
        }
        
        const player1Id = playerIds[0];
        const player2Id = playerIds[1];
        
        const player1Style = roomData.players[player1Id].style;
        const player2Style = roomData.players[player2Id].style;
        
        console.log('🎨 Estilos dos jogadores:', {
            player1: player1Style,
            player2: player2Style
        });

        // Gerar cartas com estilos de cada jogador (10 cartas de cada = 20 total)
        console.log('🃏 Gerando cartas...');
        const cards = generateCardsWithOwnership(player1Style, player2Style, 10);
        console.log('✅ Cartas geradas:', cards.length);

        // Definir primeiro jogador aleatoriamente
        const firstPlayer = playerIds[Math.floor(Math.random() * playerIds.length)];
        console.log('🎲 Primeiro jogador:', firstPlayer);

        // Criar pilhas iniciais para cada jogador (distribuir cartas aleatoriamente)
        console.log('🔀 Embaralhando cartas...');
        const shuffled = shuffleArray(cards);
        const halfPoint = Math.floor(shuffled.length / 2);
        
        const player1Pile = shuffled.slice(0, halfPoint).map((card, index) => ({
            ...card,
            dono_atual: player1Id,
            posicao_pilha: index
        }));
        
        const player2Pile = shuffled.slice(halfPoint).map((card, index) => ({
            ...card,
            dono_atual: player2Id,
            posicao_pilha: index
        }));

        console.log('📚 Pilhas criadas:', {
            player1Pile: player1Pile.length,
            player2Pile: player2Pile.length
        });

        const gameState = {
            status: 'playing',
            players: {
                [player1Id]: {
                    pile: player1Pile,
                    collectedStyles: []
                },
                [player2Id]: {
                    pile: player2Pile,
                    collectedStyles: []
                }
            },
            currentTurn: firstPlayer,
            lastRevealedCard: null,
            lastAction: firebase.database.ServerValue.TIMESTAMP,
            turnStartTime: firebase.database.ServerValue.TIMESTAMP
        };

        console.log('💾 Salvando estado no Firebase...');
        await dbRef.room(roomId).child('gameState').set(gameState);

        // Atualizar status da sala para 'playing'
        await dbRef.room(roomId).update({
            status: 'playing',
            gameStartedAt: firebase.database.ServerValue.TIMESTAMP
        });

        console.log('✅ Estado do jogo inicializado com sucesso!');
        
        // Forçar atualização da interface
        console.log('🔄 Disparando atualização inicial da interface...');
        handleGameStateUpdate(gameState);
        
    } catch (error) {
        console.error('❌ Erro ao inicializar estado:', error);
        console.error('Stack trace:', error.stack);
    }
}

/**
 * Gerar cartas com propriedade (estilo real)
 * @param {string} style1 - Estilo do jogador 1
 * @param {string} style2 - Estilo do jogador 2
 * @param {number} cardsPerPlayer - Quantas cartas de cada estilo
 */
function generateCardsWithOwnership(style1, style2, cardsPerPlayer) {
    const cards = [];
    let cardId = 0;
    
    // Criar cartas do estilo do jogador 1
    for (let i = 0; i < cardsPerPlayer; i++) {
        const symbol = SYMBOLS[i % SYMBOLS.length];
        cards.push({
            id: cardId++,
            symbol: symbol,
            estilo_real: style1, // Dono verdadeiro (imutável)
            dono_atual: null, // Será definido ao distribuir
            estado: 'oculta', // oculta | revelada
            posicao_pilha: 0 // Posição na pilha do dono atual
        });
    }
    
    // Criar cartas do estilo do jogador 2
    for (let i = 0; i < cardsPerPlayer; i++) {
        const symbol = SYMBOLS[i % SYMBOLS.length];
        cards.push({
            id: cardId++,
            symbol: symbol,
            estilo_real: style2,
            dono_atual: null,
            estado: 'oculta',
            posicao_pilha: 0
        });
    }
    
    return cards;
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
    console.log('🔄 handleGameStateUpdate chamado:', gameState);
    
    if (!gameState || !gameState.players) {
        console.log('⚠️ GameState inválido ou sem jogadores');
        return;
    }

    console.log('✅ GameState válido, atualizando interface...');

    // Atualizar turno
    isMyTurn = gameState.currentTurn === currentUser.uid;
    const turnIndicator = document.getElementById('turnIndicator');
    
    console.log('🎯 Turno:', {
        currentTurn: gameState.currentTurn,
        isMyTurn,
        myId: currentUser.uid
    });
    
    if (turnIndicator) {
        turnIndicator.textContent = isMyTurn ? '🎯 Sua vez!' : '⏳ Vez do oponente';
        turnIndicator.style.background = isMyTurn ? 'var(--primary)' : 'var(--bg-light)';
    }

    // Marcar jogador ativo
    document.querySelectorAll('.player-info').forEach(info => {
        info.classList.remove('active');
    });
    
    const playerIndex = Object.keys(gameState.players).indexOf(gameState.currentTurn);
    document.getElementById(`player${playerIndex + 1}Info`)?.classList.add('active');

    // Renderizar pilhas de cartas
    renderPlayerPiles(gameState);

    // Verificar condição de vitória
    checkVictoryCondition(gameState);
    
    // Iniciar timer de turno se for minha vez
    if (isMyTurn) {
        startTurnTimer();
    } else {
        clearTurnTimer();
        
        // Se for turno do bot, jogar automaticamente
        checkBotTurn(gameState);
    }
}

/**
 * Iniciar timer do turno (30 segundos)
 */
function startTurnTimer() {
    // Limpar timer existente
    clearTurnTimer();

    let timeLeft = TURN_TIMEOUT;
    updateTimerDisplay(timeLeft);

    turnTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);

        if (timeLeft <= 0) {
            clearTurnTimer();
            if (isMyTurn) {
                // Tempo esgotado, revelar carta automaticamente
                autoRevealCard();
            }
        }
    }, 1000);
}

/**
 * Limpar timer do turno
 */
function clearTurnTimer() {
    if (turnTimer) {
        clearInterval(turnTimer);
        turnTimer = null;
    }
}

/**
 * Atualizar display do timer
 */
function updateTimerDisplay(seconds) {
    const timerElement = document.getElementById('turn-timer');
    if (timerElement) {
        timerElement.textContent = `⏱️ ${seconds}s`;
        
        // Adicionar alerta visual quando tempo estiver acabando
        if (seconds <= 5) {
            timerElement.classList.add('timer-warning');
        } else {
            timerElement.classList.remove('timer-warning');
        }
    }
}

/**
 * Revelar carta automaticamente quando tempo acabar
 */
async function autoRevealCard() {
    if (!isMyTurn) return;
    
    showMessage('⏰ Tempo esgotado! Revelando carta automaticamente...');
    
    // Aguardar 1 segundo e revelar
    setTimeout(() => {
        revealTopCard();
    }, 1000);
}

/**
 * Verificar se é turno do bot e jogar automaticamente
 */
async function checkBotTurn(gameState) {
    const currentTurnPlayer = gameState.currentTurn;
    
    // Verificar se há jogadores na sala
    if (!roomData || !roomData.players) return;
    
    // Verificar se o jogador atual é um bot
    const currentPlayer = roomData.players[currentTurnPlayer];
    if (!currentPlayer || !currentPlayer.isBot) return;
    
    // Bot detectado, jogar automaticamente após delay (simular pensamento)
    const thinkingTime = 1500 + Math.random() * 1500; // 1.5s a 3s
    
    console.log('🤖 Bot detectado, jogando em', Math.round(thinkingTime / 1000), 'segundos...');
    
    setTimeout(async () => {
        await botPlayTurn(currentTurnPlayer, gameState);
    }, thinkingTime);
}

/**
 * Bot joga seu turno
 */
async function botPlayTurn(botId, gameState) {
    try {
        // Usar transação para garantir consistência
        await dbRef.room(roomId).child('gameState').transaction((currentState) => {
            if (!currentState || !currentState.players) return;
            
            // Verificar se ainda é turno do bot
            if (currentState.currentTurn !== botId) {
                return; // Abortar se não for mais o turno do bot
            }

            const botPile = currentState.players[botId].pile;
            
            if (!botPile || botPile.length === 0) {
                return; // Sem cartas para revelar
            }

            // Pegar carta do topo
            const topCard = botPile[botPile.length - 1];
            
            // Revelar carta
            topCard.estado = 'revelada';
            
            // Obter estilo do bot
            const botStyle = roomData.players[botId].style;
            const isMyStyle = topCard.estilo_real === botStyle;
            
            if (isMyStyle) {
                // ✅ Carta é do bot! Manter turno e coletar
                botPile.pop();
                
                if (!currentState.players[botId].collectedStyles) {
                    currentState.players[botId].collectedStyles = [];
                }
                currentState.players[botId].collectedStyles.push(topCard);
                
                currentState.lastRevealedCard = {
                    ...topCard,
                    action: 'collected',
                    by: botId
                };
                
                // MANTÉM O TURNO
                console.log('🤖 Bot coletou carta do seu estilo');
                
            } else {
                // ❌ Carta é do oponente! Transferir e passar turno
                const playerIds = Object.keys(currentState.players);
                const opponentId = playerIds.find(id => id !== botId);
                
                botPile.pop();
                
                if (!currentState.players[opponentId].collectedStyles) {
                    currentState.players[opponentId].collectedStyles = [];
                }
                currentState.players[opponentId].collectedStyles.push(topCard);
                
                // Transferir carta aleatória
                const opponentPile = currentState.players[opponentId].pile;
                
                if (opponentPile && opponentPile.length > 0) {
                    const randomIndex = Math.floor(Math.random() * opponentPile.length);
                    const transferredCard = opponentPile.splice(randomIndex, 1)[0];
                    
                    transferredCard.dono_atual = botId;
                    transferredCard.estado = 'oculta';
                    transferredCard.posicao_pilha = botPile.length;
                    botPile.push(transferredCard);
                }
                
                currentState.lastRevealedCard = {
                    ...topCard,
                    action: 'transferred',
                    from: botId,
                    to: opponentId
                };
                
                // PASSAR TURNO
                currentState.currentTurn = opponentId;
                currentState.turnStartTime = firebase.database.ServerValue.TIMESTAMP;
                
                console.log('🤖 Bot revelou carta do oponente, turno passado');
            }
            
            currentState.lastAction = firebase.database.ServerValue.TIMESTAMP;
            
            return currentState;
        });

    } catch (error) {
        console.error('❌ Erro no turno do bot:', error);
    }
}

/**
 * Renderizar pilhas dos jogadores
 */
function renderPlayerPiles(gameState) {
    console.log('🎨 Renderizando pilhas dos jogadores...');
    
    const gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) {
        console.error('❌ gameBoard não encontrado!');
        return;
    }

    gameBoard.innerHTML = '';
    gameBoard.className = 'game-board piles-layout';

    const playerIds = Object.keys(gameState.players);
    console.log('👥 Renderizando para jogadores:', playerIds);
    
    playerIds.forEach((playerId, index) => {
        const playerState = gameState.players[playerId];
        const pile = playerState.pile || [];
        const isMe = playerId === currentUser.uid;
        
        console.log(`📚 Pilha de ${isMe ? 'você' : 'oponente'}:`, {
            cartas: pile.length,
            coletadas: playerState.collectedStyles?.length || 0,
            topCard: pile.length > 0 ? pile[pile.length - 1] : null
        });
        
        // Container da pilha do jogador
        const pileContainer = document.createElement('div');
        pileContainer.className = `player-pile ${isMe ? 'my-pile' : 'opponent-pile'}`;
        
        // Título da pilha
        const pileTitle = document.createElement('div');
        pileTitle.className = 'pile-title';
        pileTitle.textContent = isMe ? '🎴 Sua Pilha' : '🎴 Pilha do Oponente';
        pileContainer.appendChild(pileTitle);
        
        // Info da pilha
        const pileInfo = document.createElement('div');
        pileInfo.className = 'pile-info';
        pileInfo.innerHTML = `
            <span>Cartas: ${pile.length}</span>
            <span>Coletadas: ${playerState.collectedStyles?.length || 0}</span>
        `;
        pileContainer.appendChild(pileInfo);
        
        // Stack de cartas
        const cardsStack = document.createElement('div');
        cardsStack.className = 'cards-stack';
        
        if (pile.length > 0) {
            // Mostrar apenas carta do topo
            const topCard = pile[pile.length - 1];
            const cardElement = createPileCardElement(topCard, isMe, isMyTurn && isMe);
            cardsStack.appendChild(cardElement);
            
            console.log(`✅ Carta do topo renderizada para ${isMe ? 'você' : 'oponente'}`);
        } else {
            // Pilha vazia
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-pile';
            emptyMsg.textContent = 'Pilha vazia';
            cardsStack.appendChild(emptyMsg);
            
            console.log(`⚠️ Pilha vazia para ${isMe ? 'você' : 'oponente'}`);
        }
        
        pileContainer.appendChild(cardsStack);
        gameBoard.appendChild(pileContainer);
    });
    
    console.log('✅ Renderização de pilhas concluída');
}

/**
 * Criar elemento de carta na pilha
 */
function createPileCardElement(card, isMyPile, canInteract) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card pile-card';
    cardElement.setAttribute('data-card-id', card.id);
    
    if (card.estado === 'revelada') {
        cardElement.classList.add('revealed');
    }
    
    if (!canInteract) {
        cardElement.classList.add('disabled');
    }

    cardElement.innerHTML = `
        <div class="card-inner">
            <div class="card-back ${card.estado === 'oculta' ? 'visible' : ''}">
                <div class="card-back-pattern"></div>
            </div>
            <div class="card-front ${card.estado === 'revelada' ? 'visible' : ''}">
                <div class="card-symbol">${getSymbolIcon(card.symbol)}</div>
                <div class="card-style-indicator">${card.estilo_real}</div>
            </div>
        </div>
    `;

    // Aplicar estilo visual
    StylesManager.applyStyleToCard(cardElement, card.estilo_real, card.id);

    // Event listener apenas para carta do topo da minha pilha
    if (isMyPile && canInteract && card.estado === 'oculta') {
        cardElement.addEventListener('click', () => revealTopCard());
        cardElement.classList.add('clickable');
    }

    return cardElement;
}

/**
 * Obter ícone do símbolo
 */
function getSymbolIcon(symbol) {
    const icons = {
        'heart': '❤️',
        'star': '⭐',
        'diamond': '💎',
        'clover': '🍀',
        'crown': '👑',
        'moon': '🌙',
        'sun': '☀️',
        'lightning': '⚡',
        'fire': '🔥',
        'water': '💧'
    };
    return icons[symbol] || '❓';
}

/**
 * Revelar carta do topo (ação principal do jogo)
 */
async function revealTopCard() {
    if (!isMyTurn || !canReveal) {
        showMessage('⚠️ Aguarde sua vez!');
        return;
    }

    canReveal = false;

    try {
        // Usar transação para evitar race conditions
        await dbRef.room(roomId).child('gameState').transaction((currentState) => {
            if (!currentState || !currentState.players) return;
            
            // Verificar se ainda é meu turno
            if (currentState.currentTurn !== currentUser.uid) {
                return; // Abortar transação
            }

            const myPile = currentState.players[currentUser.uid].pile;
            
            if (!myPile || myPile.length === 0) {
                return; // Sem cartas para revelar
            }

            // Pegar carta do topo
            const topCard = myPile[myPile.length - 1];
            
            // Revelar carta
            topCard.estado = 'revelada';
            
            // Verificar se a carta pertence ao meu estilo
            const isMyStyle = topCard.estilo_real === myStyle;
            
            if (isMyStyle) {
                // ✅ Carta é minha! Manter turno e coletar
                
                // Remover da pilha
                myPile.pop();
                
                // Adicionar às cartas coletadas
                if (!currentState.players[currentUser.uid].collectedStyles) {
                    currentState.players[currentUser.uid].collectedStyles = [];
                }
                currentState.players[currentUser.uid].collectedStyles.push(topCard);
                
                // Incrementar pontuação
                const playersSnapshot = roomData.players;
                const currentScore = playersSnapshot[currentUser.uid]?.score || 0;
                
                // Atualizar score no Firebase (fora da transação)
                setTimeout(() => {
                    dbRef.room(roomId).child('players').child(currentUser.uid).update({
                        score: currentScore + 1
                    });
                }, 100);
                
                currentState.lastRevealedCard = {
                    ...topCard,
                    action: 'collected',
                    by: currentUser.uid
                };
                
                // MANTÉM O TURNO (não muda currentTurn)
                showMessage('✅ Carta sua! Continue jogando');
                
            } else {
                // ❌ Carta é do oponente! Transferir e passar turno
                
                // Identificar oponente
                const playerIds = Object.keys(currentState.players);
                const opponentId = playerIds.find(id => id !== currentUser.uid);
                
                // Remover da minha pilha
                myPile.pop();
                
                // Adicionar às cartas coletadas do oponente
                if (!currentState.players[opponentId].collectedStyles) {
                    currentState.players[opponentId].collectedStyles = [];
                }
                currentState.players[opponentId].collectedStyles.push(topCard);
                
                // Transferir uma carta aleatória do oponente para mim
                const opponentPile = currentState.players[opponentId].pile;
                
                if (opponentPile && opponentPile.length > 0) {
                    // Pegar carta aleatória (não necessariamente do topo)
                    const randomIndex = Math.floor(Math.random() * opponentPile.length);
                    const transferredCard = opponentPile.splice(randomIndex, 1)[0];
                    
                    // Adicionar à minha pilha
                    transferredCard.dono_atual = currentUser.uid;
                    transferredCard.estado = 'oculta'; // Resetar para oculta
                    transferredCard.posicao_pilha = myPile.length;
                    myPile.push(transferredCard);
                }
                
                currentState.lastRevealedCard = {
                    ...topCard,
                    action: 'transferred',
                    from: currentUser.uid,
                    to: opponentId
                };
                
                // PASSAR TURNO para o oponente
                currentState.currentTurn = opponentId;
                currentState.turnStartTime = firebase.database.ServerValue.TIMESTAMP;
                
                showMessage('📤 Carta do oponente! Turno passado');
            }
            
            // Atualizar timestamp
            currentState.lastAction = firebase.database.ServerValue.TIMESTAMP;
            
            return currentState;
        });

        // Após transação, habilitar novamente após delay
        setTimeout(() => {
            canReveal = true;
        }, 1500);

    } catch (error) {
        console.error('❌ Erro ao revelar carta:', error);
        canReveal = true;
        showMessage('❌ Erro ao revelar carta');
    }
}

/**
 * Verificar condição de vitória
 * Vence quem coletar todas as 10 cartas do seu estilo primeiro
 */
function checkVictoryCondition(gameState) {
    if (!gameState || !gameState.players) return;
    
    // Verificar se algum jogador coletou 10 cartas do seu estilo
    for (const playerId of Object.keys(gameState.players)) {
        const playerData = gameState.players[playerId];
        const collectedStyles = playerData.collectedStyles || [];
        
        // Vitória = 10 cartas coletadas
        if (collectedStyles.length >= 10) {
            endGame(playerId);
            return;
        }
    }
}

/**
 * Finalizar jogo
 */
async function endGame(winnerId) {
    try {
        const playersSnapshot = await dbRef.room(roomId).child('players').once('value');
        const players = playersSnapshot.val();

        const isWinner = winnerId === currentUser.uid;
        const winnerName = players[winnerId]?.displayName || players[winnerId]?.name || 'Jogador';

        // Atualizar estado do jogo
        await dbRef.room(roomId).child('gameState').update({
            status: 'finished',
            winner: winnerId,
            endTime: firebase.database.ServerValue.TIMESTAMP
        });

        // Atualizar estatísticas
        const currentStats = players[currentUser.uid].stats || {};
        const gamesPlayed = (currentStats.gamesPlayed || 0) + 1;
        const gamesWon = (currentStats.gamesWon || 0) + (isWinner ? 1 : 0);
        const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

        await dbRef.room(roomId).child('players').child(currentUser.uid).update({
            stats: {
                gamesPlayed,
                gamesWon,
                winRate
            }
        });

        // Também atualizar no perfil global
        await db.ref(`users/${currentUser.uid}`).update({
            'stats/gamesPlayed': gamesPlayed,
            'stats/gamesWon': gamesWon,
            'stats/winRate': winRate
        });

        showMessage(isWinner ? `🎉 ${winnerName} venceu!` : `😔 ${winnerName} venceu!`);

        // Mostrar modal de fim de jogo
        setTimeout(() => {
            if (confirm(isWinner ? '🎉 Parabéns! Você coletou todas as cartas do seu estilo! Jogar novamente?' : '😔 Fim de jogo. Tentar novamente?')) {
                window.location.href = 'lobby.html';
            }
        }, 2000);

    } catch (error) {
        console.error('❌ Erro ao finalizar jogo:', error);
    }
}

/**
 * Sair do jogo
 */
async function leaveGame() {
    console.log('🚪 Tentando sair da sala...');
    
    try {
        if (!roomId || !currentUser) {
            console.log('⚠️ Sem roomId ou currentUser, redirecionando...');
            window.location.href = 'lobby.html';
            return;
        }

        console.log('📤 Removendo jogador da sala:', currentUser.uid);
        
        // Remover jogador da sala
        await dbRef.room(roomId).child('players').child(currentUser.uid).remove();

        console.log('✅ Jogador removido');

        // Verificar se sala ficou vazia
        const playersSnapshot = await dbRef.room(roomId).child('players').once('value');
        const players = playersSnapshot.val();

        if (!players || Object.keys(players).length === 0) {
            console.log('🗑️ Sala vazia, deletando...');
            // Deletar sala se estiver vazia
            await dbRef.room(roomId).remove();
        } else {
            console.log('⚙️ Atualizando status da sala...');
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

        console.log('✅ Saindo para o lobby...');
        // Voltar ao lobby
        window.location.href = 'lobby.html';
    } catch (error) {
        console.error('❌ Erro ao sair do jogo:', error);
        alert('Erro ao sair da sala: ' + error.message);
        // Mesmo com erro, tentar voltar ao lobby
        window.location.href = 'lobby.html';
    }
}

// Tornar função global para teste
window.leaveGame = leaveGame;

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
    
    // Marcar jogador como desconectado
    if (roomId && currentUser) {
        dbRef.room(roomId).child('players').child(currentUser.uid).update({
            connected: false,
            disconnectedAt: firebase.database.ServerValue.TIMESTAMP
        });
    }
});

/**
 * Monitorar presença do jogador usando Firebase Presence
 */
function setupPresenceSystem() {
    if (!roomId || !currentUser) return;

    const playerRef = dbRef.room(roomId).child('players').child(currentUser.uid);
    const presenceRef = db.ref('.info/connected');

    presenceRef.on('value', (snapshot) => {
        if (snapshot.val() === true) {
            // Conectado
            playerRef.update({
                connected: true,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });

            // Configurar onDisconnect para quando desconectar
            playerRef.onDisconnect().update({
                connected: false,
                disconnectedAt: firebase.database.ServerValue.TIMESTAMP
            });
        }
    });
}

/**
 * Monitorar desconexão do oponente
 */
function monitorOpponentConnection() {
    if (!roomId || !roomData || !roomData.players) return;

    const playerIds = Object.keys(roomData.players);
    opponentId = playerIds.find(id => id !== currentUser.uid);

    if (!opponentId) return;

    // Listener para status de conexão do oponente
    dbRef.room(roomId).child('players').child(opponentId).child('connected').on('value', (snapshot) => {
        const isConnected = snapshot.val();
        
        if (isConnected === false) {
            showMessage('⚠️ Oponente desconectado. Aguardando...');
            
            // Pausar jogo temporariamente
            canReveal = false;
            clearTurnTimer();
            
            // Se ficar desconectado por mais de 30 segundos, oferecer vitória por W.O.
            setTimeout(async () => {
                const connSnapshot = await dbRef.room(roomId).child('players').child(opponentId).child('connected').once('value');
                if (connSnapshot.val() === false) {
                    if (confirm('Oponente desconectado há muito tempo. Deseja reivindicar vitória por W.O.?')) {
                        await endGame(currentUser.uid);
                    }
                }
            }, 30000); // 30 segundos
        } else {
            showMessage('✅ Oponente reconectado!');
            canReveal = isMyTurn;
        }
    });
}

