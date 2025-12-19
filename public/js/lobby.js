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
    GAME_MODE: 'gameModeSection',
    STYLES: 'stylesSection',
    ROOMS: 'roomsSection'
};

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

        // Carregar estilos do usuário
        userUnlockedStyles = await StylesManager.getUserUnlockedStyles(currentUser.uid);
        
        // Se não tem estilos, adicionar os gratuitos
        if (!userUnlockedStyles || userUnlockedStyles.length === 0) {
            userUnlockedStyles = ['neon-circuit', 'arcane-sigil', 'minimal-prime', 'flux-ember'];
            await dbRef.user(currentUser.uid).update({
                unlockedStyles: userUnlockedStyles
            });
        }
        
        userSelectedStyle = await StylesManager.getUserSelectedStyle(currentUser.uid);
        
        // Se estilo selecionado não existe mais, usar o primeiro gratuito
        if (!userSelectedStyle || !userUnlockedStyles.includes(userSelectedStyle)) {
            userSelectedStyle = 'neon-circuit';
            await StylesManager.saveUserSelectedStyle(currentUser.uid, userSelectedStyle);
        }

        // Preparar grade de estilos (mas não renderizar ainda)
        // Apenas quando usuário escolher modo

        // Mostrar primeira tela: Modos de Jogo
        showSection(SECTIONS.GAME_MODE);

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

    // Botões de modo de jogo
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

    // Botão de voltar (estilos → modos)
    document.getElementById('backToModes')?.addEventListener('click', () => {
        showSection(SECTIONS.GAME_MODE);
    });

    // Botão de voltar (salas → estilos)
    document.getElementById('backToStyles')?.addEventListener('click', () => {
        // Parar de ouvir salas
        if (roomsListener) {
            dbRef.rooms().off('value', roomsListener);
            roomsListener = null;
        }
        showSection(SECTIONS.STYLES);
    });

    // Botão confirmar estilo
    document.getElementById('confirmStyleBtn')?.addEventListener('click', () => {
        handleStyleConfirm();
    });

    // Botão de criar sala
    document.getElementById('createRoomBtn')?.addEventListener('click', showCreateRoomModal);

    // Botão de atualizar salas
    document.getElementById('refreshRoomsBtn')?.addEventListener('click', loadRooms);

    // Modal de criar sala
    document.getElementById('confirmCreateRoom')?.addEventListener('click', createRoom);
    document.getElementById('cancelCreateRoom')?.addEventListener('click', hideCreateRoomModal);

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
 * Confirmar seleção de estilo e ir para salas
 */
function handleStyleConfirm() {
    if (!userSelectedStyle) {
        showMessage('⚠️ Selecione um estilo primeiro!');
        return;
    }
    
    console.log('🎨 Estilo confirmado:', userSelectedStyle);
    
    // Ir para tela de salas
    loadRooms();
    showSection(SECTIONS.ROOMS);
}

/**
 * Renderizar grade de estilos
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
        styleItem.className = 'style-item';
        if (isSelected) styleItem.classList.add('selected');
        if (!isUnlocked) styleItem.classList.add('locked');

        // Criar mini preview
        const previewMini = document.createElement('div');
        previewMini.className = 'preview-mini';
        
        // Aplicar estilo ao preview
        const previewCard = document.createElement('div');
        previewCard.style.width = '100%';
        previewCard.style.height = '100%';
        previewCard.style.borderRadius = '8px';
        
        if (style.type === 'free') {
            // Para estilos gratuitos, aplicar classe CSS
            previewCard.className = style.className.replace('style-', '');
            previewCard.style.background = getStylePreviewGradient(style.id);
        } else {
            // Para premium, mostrar gradiente genérico
            previewCard.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
        
        previewMini.appendChild(previewCard);

        const styleName = document.createElement('span');
        styleName.className = 'style-name';
        styleName.textContent = style.name;

        const styleType = document.createElement('span');
        styleType.className = 'style-type';
        styleType.textContent = style.type === 'free' ? 'Gratuito' : 'Premium';

        styleItem.appendChild(previewMini);
        styleItem.appendChild(styleName);
        styleItem.appendChild(styleType);

        // Badge premium
        if (style.type === 'premium') {
            const premiumBadge = document.createElement('div');
            premiumBadge.className = 'premium-badge';
            premiumBadge.textContent = '⭐ PREMIUM';
            styleItem.appendChild(premiumBadge);
        }

        // Click handler
        if (isUnlocked) {
            styleItem.addEventListener('click', () => showStylePreview(style.id));
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
function loadRooms() {
    const roomsList = document.getElementById('roomsList');
    if (!roomsList) return;

    // Remover listener anterior se existir
    if (roomsListener) {
        dbRef.rooms().off('value', roomsListener);
    }

    // Ouvir mudanças nas salas
    roomsListener = dbRef.rooms().on('value', (snapshot) => {
        roomsList.innerHTML = '';

        const rooms = snapshot.val();

        if (!rooms) {
            roomsList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhuma sala disponível</p>';
            return;
        }

        Object.entries(rooms).forEach(([roomId, room]) => {
            // Não mostrar salas cheias ou em andamento
            if (room.status === 'full' || room.status === 'playing') return;

            const roomItem = document.createElement('div');
            roomItem.className = 'room-item';

            const roomInfo = document.createElement('div');
            roomInfo.className = 'room-info';

            const roomName = document.createElement('h3');
            roomName.textContent = room.name || 'Sala sem nome';

            const roomPlayers = document.createElement('div');
            roomPlayers.className = 'room-players';
            const playerCount = Object.keys(room.players || {}).length;
            roomPlayers.textContent = `Jogadores: ${playerCount}/2`;

            roomInfo.appendChild(roomName);
            roomInfo.appendChild(roomPlayers);

            const joinBtn = document.createElement('button');
            joinBtn.className = 'btn btn-primary';
            joinBtn.textContent = 'Entrar';
            joinBtn.addEventListener('click', () => joinRoom(roomId));

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

    if (!roomName) {
        alert('Por favor, digite um nome para a sala');
        return;
    }

    try {
        // Criar sala no Firebase
        const roomRef = dbRef.rooms().push();
        const roomId = roomRef.key;

        await roomRef.set({
            id: roomId,
            name: roomName,
            host: currentUser.uid,
            gameMode: selectedGameMode || 'casual',
            status: 'waiting',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            maxPlayers: 2,
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
            gameState: null // Será criado quando o segundo jogador entrar
        });

        console.log('✅ Sala criada:', roomId);
        hideCreateRoomModal();

        // Redirecionar para sala
        window.location.href = `game.html?room=${roomId}`;
    } catch (error) {
        console.error('❌ Erro ao criar sala:', error);
        alert('Erro ao criar sala. Tente novamente.');
    }
}

/**
 * Entrar em sala existente
 */
async function joinRoom(roomId) {
    try {
        // Verificar se sala ainda está disponível
        const roomSnapshot = await dbRef.room(roomId).once('value');
        const room = roomSnapshot.val();

        if (!room) {
            alert('Sala não encontrada');
            return;
        }

        if (room.status !== 'waiting') {
            alert('Sala não está mais disponível');
            return;
        }

        const playerCount = Object.keys(room.players || {}).length;
        if (playerCount >= 2) {
            alert('Sala está cheia');
            return;
        }

        // Adicionar jogador à sala
        await dbRef.room(roomId).child('players').child(currentUser.uid).set({
            uid: currentUser.uid,
            name: currentUser.displayName || 'Jogador',
            email: currentUser.email,
            style: userSelectedStyle,
            score: 0,
            ready: true,
            connected: true
        });

        // Atualizar status da sala
        await dbRef.room(roomId).update({
            status: 'full'
        });

        console.log('✅ Entrou na sala:', roomId);

        // Redirecionar para sala
        window.location.href = `game.html?room=${roomId}`;
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
        }

        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
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
