/**
 * Sistema de Lobby
 * Fluxo: Modo de Jogo → Escolha de Estilo → Salas
 */

let currentUser = null;
let userUnlockedStyles = [];
let userSelectedStyle = 'neon-circuit';
let selectedGameMode = null;
let roomsListener = null;

// Estados das seções
const SECTIONS = {
    MAIN_LOBBY: 'mainLobbySection',
    GAME_MODE: 'gameModeSection',
    STYLES: 'stylesSection',
    ROOMS: 'roomsSection',
    WAITING_ROOM: 'waitingRoomSection'
};

let currentRoomId = null;
let roomPasswordAttempt = null;
let waitingRoomListener = null;

/**
 * Inicialização
 */
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // Não autenticado, redirecionar para login
        window.location.href = 'index.html';
        return;
    }

    currentUser = user;
    await initializeLobby();
});

/**
 * Inicializar lobby
 */
async function initializeLobby() {
    try {
        // Exibir nome do usuário
        document.getElementById('userName').textContent = currentUser.displayName || 'Jogador';

        // Todos os 5 estilos com imagens estão sempre desbloqueados
        userUnlockedStyles = ['personagens', 'animais', 'simbolos', 'cyber', 'dark'];
        
        userSelectedStyle = await StylesManager.getUserSelectedStyle(currentUser.uid);
        
        // Se estilo selecionado não existe mais, usar o primeiro
        if (!userSelectedStyle || !userUnlockedStyles.includes(userSelectedStyle)) {
            userSelectedStyle = 'personagens';
            await StylesManager.saveUserSelectedStyle(currentUser.uid, userSelectedStyle);
        }

        // Preparar grade de estilos (mas não renderizar ainda)
        // Apenas quando usuário escolher modo

        // Mostrar primeira tela: LOBBY PRINCIPAL
        showSection(SECTIONS.MAIN_LOBBY);

        // Configurar event listeners
        setupEventListeners();

        console.log('✅ Lobby inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar lobby:', error);
    }
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Botão de logout
    document.getElementById('logoutBtn')?.addEventListener('click', logout);

    // ===== LOBBY PRINCIPAL =====
    document.getElementById('quickPlayBtn')?.addEventListener('click', showQuickPlayModal);
    document.getElementById('browseSalasBtn')?.addEventListener('click', () => {
        loadRooms();
        showSection(SECTIONS.ROOMS);
    });
    document.getElementById('createSalaBtn')?.addEventListener('click', () => {
        renderStylesGrid();
        showSection(SECTIONS.STYLES);
        selectedGameMode = 'casual'; // Default
    });
    document.getElementById('openGameModesBtn')?.addEventListener('click', () => {
        showSection(SECTIONS.GAME_MODE);
    });

    // ===== MODOS DE JOGO =====
    document.querySelectorAll('.game-mode-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            const comingSoon = card.querySelector('.coming-soon');
            
            if (comingSoon) {
                showMessage('⚠️ Este modo estará disponível em breve!');
                return;
            }
            
            handleGameModeSelection(mode);
        });
    });

    // Botão de voltar (estilos → lobby principal)
    document.getElementById('backToMainLobby')?.addEventListener('click', () => {
        showSection(SECTIONS.MAIN_LOBBY);
    });

    // Botão de voltar (salas → lobby principal)
    document.getElementById('backToMainLobbyFromRooms')?.addEventListener('click', () => {
        if (roomsListener) {
            dbRef.rooms().off('value', roomsListener);
            roomsListener = null;
        }
        showSection(SECTIONS.MAIN_LOBBY);
    });

    // Botão confirmar estilo
    document.getElementById('confirmStyleBtn')?.addEventListener('click', () => {
        handleStyleConfirm();
    });

    // Botão de criar sala (do painel)
    document.getElementById('createRoomFromPanelBtn')?.addEventListener('click', showCreateRoomModal);

    // Botão de atualizar salas
    document.getElementById('refreshRoomsBtn')?.addEventListener('click', loadRooms);

    // Modal de jogar rápido
    document.getElementById('cancelQuickPlay')?.addEventListener('click', hideQuickPlayModal);
    document.querySelectorAll('.quick-play-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const players = btn.dataset.players;
            if (players === '4') {
                showMessage('⚠️ Modo 4 jogadores em breve!');
                return;
            }
            startQuickPlay(parseInt(players));
        });
    });

    // Modal de criar sala
    document.getElementById('confirmCreateRoom')?.addEventListener('click', createRoom);
    document.getElementById('cancelCreateRoom')?.addEventListener('click', hideCreateRoomModal);
    document.getElementById('roomIsPrivate')?.addEventListener('change', (e) => {
        const passwordGroup = document.getElementById('passwordGroup');
        passwordGroup.style.display = e.target.checked ? 'block' : 'none';
    });

    // Modal de senha
    document.getElementById('confirmPassword')?.addEventListener('click', confirmRoomPassword);
    document.getElementById('cancelPassword')?.addEventListener('click', hidePasswordModal);

    // Sala de espera
    document.getElementById('leaveWaitingRoomBtn')?.addEventListener('click', leaveWaitingRoom);
    document.getElementById('readyBtn')?.addEventListener('click', toggleReady);
    document.getElementById('startGameBtn')?.addEventListener('click', startGame);

    // Modal de preview de estilo
    document.getElementById('selectStyleBtn')?.addEventListener('click', selectPreviewedStyle);
    document.getElementById('closePreviewBtn')?.addEventListener('click', hideStylePreviewModal);
}

/**
 * Mostrar seção específica
 */
function showSection(sectionId) {
    // Ocultar todas as seções
    Object.values(SECTIONS).forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
    });

    // Mostrar seção solicitada
    document.getElementById(sectionId)?.classList.remove('hidden');
}

/**
 * Gerenciar seleção de modo de jogo
 */
function handleGameModeSelection(mode) {
    selectedGameMode = mode;
    console.log('🎮 Modo selecionado:', mode);
    
    // Ir para seleção de estilo
    renderStylesGrid();
    showSection(SECTIONS.STYLES);
}

/**
 * Confirmar seleção de estilo e ir para criar sala
 */
function handleStyleConfirm() {
    if (!userSelectedStyle) {
        showMessage('⚠️ Selecione um estilo primeiro!');
        return;
    }
    
    console.log('🎨 Estilo confirmado:', userSelectedStyle);
    
    // Mostrar modal de criar sala
    showCreateRoomModal();
}

/**
 * Renderizar grade de estilos (SIMPLIFICADO)
 */
function renderStylesGrid() {
    const grid = document.getElementById('stylesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const allStyles = StylesManager.getAllStyles();

    allStyles.forEach(style => {
        const isUnlocked = StylesManager.isStyleUnlocked(style.id, userUnlockedStyles);
        const isSelected = style.id === userSelectedStyle;

        const styleItem = document.createElement('div');
        styleItem.className = 'style-item-simple';
        if (isSelected) styleItem.classList.add('selected');
        if (!isUnlocked) styleItem.classList.add('locked');

        // Nome do estilo
        const styleName = document.createElement('div');
        styleName.className = 'style-name-simple';
        styleName.textContent = style.name;

        // Badge de tipo (Gratuito/Premium) - pequeno
        const styleType = document.createElement('span');
        styleType.className = 'style-type-badge';
        styleType.textContent = style.type === 'free' ? 'Gratuito' : '⭐ Premium';
        
        styleItem.appendChild(styleName);
        styleItem.appendChild(styleType);

        // Click handler
        if (isUnlocked) {
            styleItem.addEventListener('click', () => {
                // Remover seleção anterior
                document.querySelectorAll('.style-item-simple').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Selecionar este
                styleItem.classList.add('selected');
                userSelectedStyle = style.id;
                
                // Feedback visual
                styleItem.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    styleItem.style.transform = '';
                }, 150);
            });
        } else {
            styleItem.addEventListener('click', () => {
                alert(`Este estilo está bloqueado.\nDesbloquear por: $${style.price}`);
            });
        }

        grid.appendChild(styleItem);
    });
}

/**
 * Obter gradiente de preview para estilo
 */
function getStylePreviewGradient(styleId) {
    const gradients = {
        'neon-circuit': 'radial-gradient(circle at 30% 40%, #0a2e2e 0%, #020b0f 70%)',
        'arcane-sigil': 'linear-gradient(135deg, #2b0a3d 0%, #1a0526 100%)',
        'minimal-prime': 'linear-gradient(135deg, #eaeaea 0%, #ffffff 100%)',
        'flux-ember': 'linear-gradient(27deg, #ff3b3b 0%, #ff9f1c 40%, #0a0a0a 100%)'
    };
    return gradients[styleId] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

/**
 * Mostrar preview de estilo
 */
function showStylePreview(styleId) {
    const modal = document.getElementById('stylePreviewModal');
    const previewCard = document.getElementById('previewCard');
    const styleName = document.getElementById('stylePreviewName');

    const style = StylesManager.getStyle(styleId);

    styleName.textContent = style.name;
    
    // Limpar classes anteriores
    previewCard.className = 'card';
    
    // Aplicar estilo
    StylesManager.applyStyleToCard(previewCard, styleId, 0);

    // Armazenar ID do estilo sendo previewed
    modal.dataset.previewingStyle = styleId;

    modal.classList.remove('hidden');
}

/**
 * Selecionar estilo sendo previewed
 */
async function selectPreviewedStyle() {
    const modal = document.getElementById('stylePreviewModal');
    const styleId = modal.dataset.previewingStyle;

    if (!styleId) return;

    // Salvar no Firebase
    const success = await StylesManager.saveUserSelectedStyle(currentUser.uid, styleId);

    if (success) {
        userSelectedStyle = styleId;
        renderStylesGrid();
        hideStylePreviewModal();
        showMessage('Estilo selecionado com sucesso!');
    } else {
        alert('Erro ao selecionar estilo. Tente novamente.');
    }
}

/**
 * Esconder modal de preview
 */
function hideStylePreviewModal() {
    document.getElementById('stylePreviewModal')?.classList.add('hidden');
}

/**
 * Carregar salas disponíveis
 */
async function loadRooms() {
    const roomsList = document.getElementById('roomsList');
    if (!roomsList) return;

    // Mostrar indicador de carregamento
    roomsList.innerHTML = '<p style="text-align: center; color: var(--text-muted);"><span class="loading-spinner">🔄</span> Carregando salas...</p>';

    // Remover listener anterior se existir
    if (roomsListener) {
        dbRef.rooms().off('value', roomsListener);
        roomsListener = null;
    }

    // Limpar salas antigas antes de carregar (aguardar conclusão)
    await cleanupAbandonedRooms();

    // Ouvir mudanças nas salas
    roomsListener = dbRef.rooms().on('value', (snapshot) => {
        roomsList.innerHTML = '';

        const rooms = snapshot.val();

        if (!rooms) {
            roomsList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhuma sala disponível</p>';
            return;
        }

        const roomsArray = Object.entries(rooms);
        const availableRooms = roomsArray.filter(([_, room]) => 
            room.status === 'waiting' || room.status === 'full'
        );

        if (availableRooms.length === 0) {
            roomsList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhuma sala disponível</p>';
            return;
        }

        // Ordenar salas: salas com jogadores primeiro, depois por data de criação
        availableRooms.sort(([, a], [, b]) => {
            const aPlayers = Object.keys(a.players || {}).length;
            const bPlayers = Object.keys(b.players || {}).length;
            
            // Priorizar salas com jogadores
            if (aPlayers > 0 && bPlayers === 0) return -1;
            if (aPlayers === 0 && bPlayers > 0) return 1;
            
            // Se ambas têm jogadores ou ambas vazias, ordenar por data (mais recente primeiro)
            return (b.createdAt || 0) - (a.createdAt || 0);
        });

        availableRooms.forEach(([roomId, room]) => {
            const roomItem = document.createElement('div');
            roomItem.className = 'room-item';
            if (room.status === 'playing') roomItem.classList.add('room-playing');

            const roomInfo = document.createElement('div');
            roomInfo.className = 'room-info';

            const roomName = document.createElement('h3');
            roomName.textContent = room.name || 'Sala sem nome';
            if (room.isPrivate) {
                roomName.innerHTML += ' 🔒';
            }
            if (room.quickPlay) {
                roomName.innerHTML += ' ⚡';
            }

            const roomDetails = document.createElement('div');
            roomDetails.className = 'room-details';
            
            // Contar jogadores reais e bots
            const allPlayers = room.players || {};
            const playerCount = Object.keys(allPlayers).length;
            const botCount = Object.values(allPlayers).filter(p => p.isBot).length;
            const realPlayerCount = playerCount - botCount;
            const maxPlayers = room.maxPlayers || 2;
            
            const playersSpan = document.createElement('span');
            playersSpan.className = 'room-players';
            
            // Mostrar contagem detalhada
            if (botCount > 0) {
                playersSpan.textContent = `👥 ${realPlayerCount}+${botCount}🤖/${maxPlayers}`;
            } else {
                playersSpan.textContent = `👥 ${playerCount}/${maxPlayers}`;
            }

            const statusSpan = document.createElement('span');
            statusSpan.className = 'room-status';
            if (room.status === 'waiting') {
                statusSpan.textContent = '⏳ Aguardando';
                statusSpan.style.color = '#f59e0b';
            } else if (room.status === 'playing') {
                statusSpan.textContent = '🎮 Jogando';
                statusSpan.style.color = '#10b981';
            } else if (room.status === 'full') {
                statusSpan.textContent = '✓ Cheia';
                statusSpan.style.color = '#3b82f6';
            }

            roomDetails.appendChild(playersSpan);
            roomDetails.appendChild(statusSpan);

            roomInfo.appendChild(roomName);
            roomInfo.appendChild(roomDetails);

            const joinBtn = document.createElement('button');
            joinBtn.className = 'btn btn-primary';
            
            if (room.status === 'playing') {
                joinBtn.textContent = '🔒';
                joinBtn.disabled = true;
                joinBtn.classList.add('disabled');
            } else if (playerCount >= maxPlayers) {
                joinBtn.textContent = 'Cheia';
                joinBtn.disabled = true;
                joinBtn.classList.add('disabled');
            } else {
                joinBtn.textContent = 'Entrar';
                joinBtn.addEventListener('click', () => joinRoom(roomId, room.isPrivate));
            }

            roomItem.appendChild(roomInfo);
            roomItem.appendChild(joinBtn);

            roomsList.appendChild(roomItem);
        });
    });
}

/**
 * Mostrar modal de criar sala
 */
function showCreateRoomModal() {
    document.getElementById('createRoomModal')?.classList.remove('hidden');
    document.getElementById('roomName').value = '';
    document.getElementById('roomName')?.focus();
}

/**
 * Esconder modal de criar sala
 */
function hideCreateRoomModal() {
    document.getElementById('createRoomModal')?.classList.add('hidden');
}

/**
 * Criar nova sala
 */
async function createRoom() {
    const roomNameInput = document.getElementById('roomName');
    const roomName = roomNameInput?.value.trim();
    const isPrivate = document.getElementById('roomIsPrivate')?.checked;
    const password = document.getElementById('roomPassword')?.value.trim();
    const maxPlayers = parseInt(document.getElementById('roomMaxPlayers')?.value) || 2;
    const autoBot = document.getElementById('roomAutoBot')?.checked;

    if (!roomName) {
        alert('Por favor, digite um nome para a sala');
        return;
    }

    if (isPrivate && !password) {
        alert('Por favor, digite uma senha para a sala privada');
        return;
    }

    if (!userSelectedStyle) {
        alert('Por favor, selecione um estilo primeiro');
        return;
    }

    try {
        // Criar sala no Firebase
        const roomRef = dbRef.rooms().push();
        const roomId = roomRef.key;

        const roomData = {
            id: roomId,
            name: roomName,
            host: currentUser.uid,
            gameMode: selectedGameMode || 'casual',
            status: 'waiting',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            maxPlayers: maxPlayers,
            isPrivate: isPrivate || false,
            autoBot: autoBot !== false,
            players: {
                [currentUser.uid]: {
                    uid: currentUser.uid,
                    name: currentUser.displayName || 'Jogador',
                    email: currentUser.email,
                    style: userSelectedStyle,
                    score: 0,
                    ready: false,
                    connected: true
                }
            },
            gameState: null
        };

        // Se sala privada, armazenar hash da senha
        if (isPrivate) {
            roomData.passwordHash = btoa(password); // Base64 simples (pode melhorar com hash real)
        }

        await roomRef.set(roomData);

        console.log('✅ Sala criada:', roomId);
        hideCreateRoomModal();

        // Entrar na sala de espera
        currentRoomId = roomId;
        enterWaitingRoom(roomId);
    } catch (error) {
        console.error('❌ Erro ao criar sala:', error);
        alert('Erro ao criar sala. Tente novamente.');
    }
}

/**
 * Entrar em sala existente
 */
async function joinRoom(roomId, isPrivate) {
    if (isPrivate) {
        // Mostrar modal de senha
        roomPasswordAttempt = roomId;
        showPasswordModal();
        return;
    }

    await attemptJoinRoom(roomId);
}

/**
 * Tentar entrar na sala
 */
async function attemptJoinRoom(roomId, password = null) {
    try {
        // Verificar conexão
        if (!currentUser || !currentUser.uid) {
            alert('❌ Você precisa estar conectado para entrar em uma sala');
            return;
        }

        // Verificar se sala ainda está disponível
        const roomSnapshot = await dbRef.room(roomId).once('value');
        const room = roomSnapshot.val();

        if (!room) {
            alert('❌ Sala não encontrada ou foi removida');
            return;
        }

        // Verificar senha se necessário
        if (room.isPrivate && password) {
            const passwordHash = btoa(password);
            if (passwordHash !== room.passwordHash) {
                alert('❌ Senha incorreta!');
                return;
            }
        }

        if (room.status === 'playing') {
            alert('❌ Sala já está em jogo');
            return;
        }

        // Contar todos os jogadores (reais + bots)
        const allPlayers = room.players || {};
        const playerCount = Object.keys(allPlayers).length;
        const maxPlayers = room.maxPlayers || 2;
        
        if (playerCount >= maxPlayers) {
            alert('❌ Sala está cheia');
            return;
        }

        // Verificar se usuário já está na sala
        if (room.players && room.players[currentUser.uid]) {
            console.log('⚠️ Já está na sala, apenas entrando...');
            currentRoomId = roomId;
            enterWaitingRoom(roomId);
            return;
        }

        // Adicionar jogador à sala
        await dbRef.room(roomId).child('players').child(currentUser.uid).set({
            uid: currentUser.uid,
            name: currentUser.displayName || 'Jogador',
            email: currentUser.email,
            style: userSelectedStyle,
            score: 0,
            ready: false,
            connected: true
        });

        // Atualizar status da sala se ficou cheia
        const newPlayerCount = playerCount + 1;
        if (newPlayerCount >= maxPlayers) {
            await dbRef.room(roomId).update({
                status: 'full'
            });
            console.log('📊 Sala ficou cheia:', roomId);
        }

        console.log('✅ Entrou na sala:', roomId, `(${newPlayerCount}/${maxPlayers})`);
        hidePasswordModal();

        // Entrar na sala de espera
        currentRoomId = roomId;
        enterWaitingRoom(roomId);
    } catch (error) {
        console.error('❌ Erro ao entrar na sala:', error);
        alert('Erro ao entrar na sala. Tente novamente.');
    }
}

/**
 * Logout
 */
async function logout() {
    try {
        // Remover listener de salas
        if (roomsListener) {
            dbRef.rooms().off('value', roomsListener);
            roomsListener = null;
        }
        
        // Remover listener de sala de espera
        if (waitingRoomListener && currentRoomId) {
            dbRef.room(currentRoomId).off('value', waitingRoomListener);
        }

        // Sair da sala se estiver em uma
        if (currentRoomId) {
            await leaveWaitingRoom();
        }

        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
    }
}

// ===== NOVAS FUNÇÕES =====

/**
 * Mostrar modal de jogar rápido
 */
function showQuickPlayModal() {
    document.getElementById('quickPlayModal')?.classList.remove('hidden');
}

/**
 * Esconder modal de jogar rápido
 */
function hideQuickPlayModal() {
    document.getElementById('quickPlayModal')?.classList.add('hidden');
}

/**
 * Iniciar jogo rápido
 */
async function startQuickPlay(playerCount) {
    if (!userSelectedStyle) {
        // Se não tem estilo, selecionar um padrão
        userSelectedStyle = 'neon-circuit';
        await StylesManager.saveUserSelectedStyle(currentUser.uid, userSelectedStyle);
    }

    hideQuickPlayModal();
    showMessage('⚡ Criando partida rápida...');

    try {
        // Criar sala automática
        const roomRef = dbRef.rooms().push();
        const roomId = roomRef.key;

        await roomRef.set({
            id: roomId,
            name: `Partida Rápida #${roomId.slice(-4)}`,
            host: currentUser.uid,
            gameMode: 'casual',
            status: 'waiting',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            maxPlayers: playerCount,
            isPrivate: false,
            autoBot: true,
            quickPlay: true,
            players: {
                [currentUser.uid]: {
                    uid: currentUser.uid,
                    name: currentUser.displayName || 'Jogador',
                    email: currentUser.email,
                    style: userSelectedStyle,
                    score: 0,
                    ready: true,
                    connected: true
                }
            },
            gameState: null
        });

        console.log('✅ Partida rápida criada:', roomId);

        // Redirecionar direto para o jogo
        window.location.href = `game.html?room=${roomId}`;
    } catch (error) {
        console.error('❌ Erro ao criar partida rápida:', error);
        alert('Erro ao criar partida. Tente novamente.');
    }
}

/**
 * Mostrar modal de senha
 */
function showPasswordModal() {
    document.getElementById('passwordModal')?.classList.remove('hidden');
    document.getElementById('enterRoomPassword').value = '';
    document.getElementById('enterRoomPassword')?.focus();
}

/**
 * Esconder modal de senha
 */
function hidePasswordModal() {
    document.getElementById('passwordModal')?.classList.add('hidden');
    roomPasswordAttempt = null;
}

/**
 * Confirmar senha da sala
 */
async function confirmRoomPassword() {
    const password = document.getElementById('enterRoomPassword')?.value.trim();
    
    if (!password) {
        alert('Digite a senha');
        return;
    }

    if (!roomPasswordAttempt) {
        hidePasswordModal();
        return;
    }

    await attemptJoinRoom(roomPasswordAttempt, password);
}

/**
 * Entrar na sala de espera
 */
function enterWaitingRoom(roomId) {
    showSection(SECTIONS.WAITING_ROOM);
    
    // Configurar desconexão automática
    const playerRef = dbRef.room(roomId).child('players').child(currentUser.uid);
    playerRef.onDisconnect().remove();
    console.log('🔌 Sistema de desconexão automática configurado (lobby)');

    // Configurar listener para mudanças na sala
    if (waitingRoomListener) {
        dbRef.room(roomId).off('value', waitingRoomListener);
    }

    waitingRoomListener = dbRef.room(roomId).on('value', (snapshot) => {
        const room = snapshot.val();
        
        if (!room) {
            showMessage('❌ Sala foi fechada');
            currentRoomId = null;
            showSection(SECTIONS.MAIN_LOBBY);
            return;
        }
        
        // Verificar se usuário ainda está na sala
        if (!room.players || !room.players[currentUser.uid]) {
            showMessage('⚠️ Você foi removido da sala');
            currentRoomId = null;
            showSection(SECTIONS.MAIN_LOBBY);
            return;
        }

        updateWaitingRoomDisplay(room);
    });
}

/**
 * Atualizar display da sala de espera
 */
function updateWaitingRoomDisplay(room) {
    // Nome da sala
    document.getElementById('waitingRoomName').textContent = room.name;
    
    // Mostrar painel de controle se for host
    const hostPanel = document.getElementById('hostControlPanel');
    if (hostPanel) {
        hostPanel.style.display = room.host === currentUser.uid ? 'block' : 'none';
    }

    // Info da sala
    if (room.isPrivate) {
        document.getElementById('roomPasswordInfo').style.display = 'block';
    }

    // Status
    const statusEl = document.getElementById('roomStatus');
    const isHost = room.host === currentUser.uid;
    
    if (room.status === 'waiting') {
        if (isHost && room.autoBot !== false) {
            const vacancies = maxPlayers - playerCount;
            statusEl.textContent = vacancies > 0 
                ? `Aguardando (${vacancies} bot${vacancies > 1 ? 's' : ''} será${vacancies > 1 ? 'ão' : ''} adicionado${vacancies > 1 ? 's' : ''})`
                : 'Sala cheia - Pronto para iniciar';
        } else {
            statusEl.textContent = 'Aguardando jogadores...';
        }
    } else if (room.status === 'full') {
        statusEl.textContent = 'Sala cheia - Aguardando início';
    } else if (room.status === 'playing') {
        statusEl.textContent = 'Jogo em andamento';
    }

    // Contagem de jogadores
    const playerCount = Object.keys(room.players || {}).length;
    const maxPlayers = room.maxPlayers || 2;
    document.getElementById('roomPlayersCount').textContent = `${playerCount}/${maxPlayers}`;

    // Lista de jogadores
    const playersList = document.getElementById('waitingRoomPlayers');
    playersList.innerHTML = '';

    Object.entries(room.players || {}).forEach(([playerId, player]) => {
        const playerItem = document.createElement('div');
        playerItem.className = 'waiting-player-item';
        if (player.ready) playerItem.classList.add('ready');

        const playerName = document.createElement('span');
        playerName.className = 'player-name';
        playerName.textContent = player.name + (playerId === currentUser.uid ? ' (Você)' : '');
        if (playerId === room.host) {
            playerName.textContent += ' 👑';
        }
        if (player.isBot) {
            playerName.textContent += ' 🤖';
        }

        const playerReady = document.createElement('span');
        playerReady.className = 'player-ready-status';
        playerReady.textContent = player.ready ? '✓ Pronto' : '⏳ Aguardando';

        playerItem.appendChild(playerName);
        playerItem.appendChild(playerReady);
        
        // Botão de remover (só para host e se não for ele mesmo)
        if (room.host === currentUser.uid && playerId !== currentUser.uid && !player.isBot) {
            const kickBtn = document.createElement('button');
            kickBtn.className = 'btn-kick';
            kickBtn.textContent = '❌';
            kickBtn.title = 'Remover jogador';
            kickBtn.onclick = () => kickPlayer(playerId, player.name);
            playerItem.appendChild(kickBtn);
        }
        
        playersList.appendChild(playerItem);
    });

    // Botões
    const myPlayer = room.players[currentUser.uid];
    const readyBtn = document.getElementById('readyBtn');
    const startBtn = document.getElementById('startGameBtn');

    if (myPlayer && readyBtn) {
        readyBtn.textContent = myPlayer.ready ? '↩ Cancelar' : '✓ Pronto';
        readyBtn.classList.toggle('active', myPlayer.ready);
    }

    // Botão de iniciar - Lógica melhorada para host
    if (startBtn) {
        if (room.host === currentUser.uid) {
            // Host pode ver o botão se:
            // 1. Todos estão prontos OU
            // 2. Pelo menos 1 jogador (o host) e tem autoBot
            const allReady = Object.values(room.players).every(p => p.ready);
            const canStartWithBot = playerCount >= 1 && room.autoBot !== false;
            const hostIsReady = myPlayer && myPlayer.ready;
            
            // Mostrar se todos prontos OU se host está pronto e pode adicionar bot
            const canStart = allReady || (hostIsReady && canStartWithBot);
            startBtn.style.display = canStart ? 'block' : 'none';
            
            // Atualizar texto do botão
            if (playerCount < maxPlayers && room.autoBot !== false) {
                const botsNeeded = maxPlayers - playerCount;
                startBtn.textContent = `🎮 Iniciar (+${botsNeeded}🤖)`;
            } else {
                startBtn.textContent = '🎮 Iniciar Partida';
            }
        } else {
            startBtn.style.display = 'none';
        }
    }
}

/**
 * Alternar estado de pronto
 */
async function toggleReady() {
    if (!currentRoomId) return;

    try {
        const playerSnapshot = await dbRef.room(currentRoomId).child('players').child(currentUser.uid).once('value');
        const player = playerSnapshot.val();

        if (!player) return;

        await dbRef.room(currentRoomId).child('players').child(currentUser.uid).update({
            ready: !player.ready
        });
    } catch (error) {
        console.error('❌ Erro ao alterar estado:', error);
    }
}

/**
 * Remover jogador da sala (host)
 */
async function kickPlayer(playerId, playerName) {
    if (!currentRoomId) return;
    
    const confirmed = confirm(`Remover ${playerName} da sala?`);
    if (!confirmed) return;
    
    try {
        const roomSnapshot = await dbRef.room(currentRoomId).once('value');
        const room = roomSnapshot.val();
        
        if (!room || room.host !== currentUser.uid) {
            alert('❌ Apenas o host pode remover jogadores');
            return;
        }
        
        // Remover jogador
        await dbRef.room(currentRoomId).child('players').child(playerId).remove();
        
        // Atualizar contagem
        const newPlayerCount = Object.keys(room.players).length - 1;
        const maxPlayers = room.maxPlayers || 2;
        
        // Se sala não está mais cheia, voltar para 'waiting'
        if (room.status === 'full' && newPlayerCount < maxPlayers) {
            await dbRef.room(currentRoomId).update({
                status: 'waiting'
            });
        }
        
        showMessage(`✅ ${playerName} foi removido da sala`);
        console.log('👋 Jogador removido:', playerId);
    } catch (error) {
        console.error('❌ Erro ao remover jogador:', error);
        alert('Erro ao remover jogador');
    }
}

/**
 * Iniciar jogo (host)
 */
async function startGame() {
    if (!currentRoomId) return;

    try {
        const roomSnapshot = await dbRef.room(currentRoomId).once('value');
        const room = roomSnapshot.val();

        if (!room || room.host !== currentUser.uid) {
            alert('Apenas o host pode iniciar o jogo');
            return;
        }

        const playerCount = Object.keys(room.players).length;
        const maxPlayers = room.maxPlayers || 2;

        // Informar sobre bot se necessário
        if (playerCount < maxPlayers && room.autoBot !== false) {
            showMessage('🤖 Bot será adicionado ao iniciar...');
        }

        // Atualizar status para 'starting'
        // O game.js detectará e adicionará bot se necessário
        await dbRef.room(currentRoomId).update({
            status: 'starting'
        });

        showMessage('🎮 Iniciando jogo...');

        // Redirecionar para o jogo
        setTimeout(() => {
            window.location.href = `game.html?room=${currentRoomId}`;
        }, 500);
    } catch (error) {
        console.error('❌ Erro ao iniciar jogo:', error);
        alert('Erro ao iniciar jogo');
    }
}

/**
 * Sair da sala de espera
 */
async function leaveWaitingRoom() {
    if (!currentRoomId) return;

    try {
        // Remover listener
        if (waitingRoomListener) {
            dbRef.room(currentRoomId).off('value', waitingRoomListener);
            waitingRoomListener = null;
        }

        // Remover jogador da sala
        await dbRef.room(currentRoomId).child('players').child(currentUser.uid).remove();

        // Verificar se sala ficou vazia
        const playersSnapshot = await dbRef.room(currentRoomId).child('players').once('value');
        const players = playersSnapshot.val();

        if (!players || Object.keys(players).length === 0) {
            // Deletar sala completamente se vazia
            await dbRef.room(currentRoomId).remove();
            console.log('🗑️ Sala vazia deletada do Firebase');
        } else {
            console.log('⚙️ Ainda há jogadores na sala:', Object.keys(players).length);
            
            // Verificar se só restaram bots
            const onlyBots = Object.values(players).every(p => p.isBot === true);
            
            if (onlyBots) {
                console.log('🤖 Apenas bots na sala, deletando...');
                await dbRef.room(currentRoomId).remove();
                console.log('✅ Sala com apenas bots removida');
            } else {
                // Atualizar status da sala para waiting
                await dbRef.room(currentRoomId).update({
                    status: 'waiting'
                });

                // Se era o host, transferir para outro jogador (não bot)
                const roomSnapshot = await dbRef.room(currentRoomId).once('value');
                const room = roomSnapshot.val();
                
                if (room && room.host === currentUser.uid) {
                    // Buscar jogador real (não bot) para ser host
                    const realPlayers = Object.keys(players).filter(id => !players[id].isBot);
                    
                    if (realPlayers.length > 0) {
                        const newHost = realPlayers[0];
                        await dbRef.room(currentRoomId).update({
                            host: newHost
                        });
                        console.log('👑 Host transferido para:', newHost);
                    } else {
                        // Se só tem bots, deletar sala
                        await dbRef.room(currentRoomId).remove();
                        console.log('🗑️ Sala deletada (apenas bots restantes)');
                    }
                }
            }
        }

        currentRoomId = null;
        showSection(SECTIONS.MAIN_LOBBY);
        showMessage('✓ Você saiu da sala');
    } catch (error) {
        console.error('❌ Erro ao sair da sala:', error);
    }
}

/**
 * Limpar salas abandonadas
 */
async function cleanupAbandonedRooms() {
    try {
        const roomsSnapshot = await dbRef.rooms().once('value');
        const rooms = roomsSnapshot.val();
        
        if (!rooms) return;
        
        const now = Date.now();
        const HOUR_IN_MS = 60 * 60 * 1000; // 1 hora
        
        for (const [roomId, room] of Object.entries(rooms)) {
            let shouldDelete = false;
            
            // Deletar salas vazias
            if (!room.players || Object.keys(room.players).length === 0) {
                shouldDelete = true;
                console.log('🧹 Limpando sala vazia:', roomId);
            }
            // Deletar salas apenas com bots
            else if (Object.values(room.players).every(p => p.isBot === true)) {
                shouldDelete = true;
                console.log('🧹 Limpando sala apenas com bots:', roomId);
            }
            // Deletar salas abandonadas há mais de 1 hora
            else if (room.status === 'abandoned' && room.abandonedAt) {
                const abandonedTime = now - room.abandonedAt;
                if (abandonedTime > HOUR_IN_MS) {
                    shouldDelete = true;
                    console.log('🧹 Limpando sala abandonada antiga:', roomId);
                }
            }
            // Deletar salas em "waiting" há mais de 2 horas sem atividade
            else if (room.status === 'waiting' && room.createdAt) {
                const age = now - room.createdAt;
                if (age > (2 * HOUR_IN_MS)) {
                    shouldDelete = true;
                    console.log('🧹 Limpando sala antiga sem atividade:', roomId);
                }
            }
            
            if (shouldDelete) {
                await dbRef.room(roomId).remove();
                console.log('✅ Sala', roomId, 'removida');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao limpar salas:', error);
    }
}

/**
 * Mostrar mensagem temporária
 */
function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'game-message';
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.zIndex = '9999';

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
