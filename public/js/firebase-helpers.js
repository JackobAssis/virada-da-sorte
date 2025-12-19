/**
 * EXEMPLOS PRÁTICOS - FIREBASE
 * 
 * Funções úteis para manipular dados do Firebase no projeto
 * Copie e cole essas funções conforme necessário
 */

// ============================================================
// GERENCIAMENTO DE USUÁRIOS
// ============================================================

/**
 * Obter dados completos do usuário atual
 */
async function getCurrentUserData() {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    const snapshot = await dbRef.user(user.uid).once('value');
    return snapshot.val();
}

/**
 * Atualizar foto de perfil
 */
async function updateProfilePicture(file) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    // Upload para Storage
    const fileRef = storageRef.profilePicture(user.uid, 'avatar.jpg');
    await fileRef.put(file);
    
    // Obter URL
    const photoURL = await fileRef.getDownloadURL();
    
    // Atualizar perfil
    await user.updateProfile({ photoURL });
    await dbRef.user(user.uid).update({ photoURL });
    
    return photoURL;
}

/**
 * Atualizar nome de exibição
 */
async function updateDisplayName(newName) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    if (newName.length < 3 || newName.length > 30) {
        throw new Error('Nome deve ter entre 3 e 30 caracteres');
    }
    
    await user.updateProfile({ displayName: newName });
    await dbRef.user(user.uid).update({ displayName: newName });
    
    return newName;
}

/**
 * Obter estatísticas do usuário
 */
async function getUserStats(userId = null) {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) throw new Error('Usuário não especificado');
    
    const snapshot = await dbRef.userStats(uid).once('value');
    return snapshot.val() || {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        totalScore: 0,
        bestScore: 0,
        winStreak: 0,
        bestWinStreak: 0
    };
}

// ============================================================
// GERENCIAMENTO DE ESTILOS
// ============================================================

/**
 * Obter estilos desbloqueados do usuário
 */
async function getUnlockedStyles() {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    const snapshot = await dbRef.user(user.uid).child('unlockedStyles').once('value');
    return snapshot.val() || [];
}

/**
 * Selecionar estilo ativo
 */
async function selectStyle(styleId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    // Verificar se o estilo está desbloqueado
    const unlockedStyles = await getUnlockedStyles();
    if (!unlockedStyles.includes(styleId)) {
        throw new Error('Estilo não desbloqueado');
    }
    
    await dbRef.user(user.uid).update({ selectedStyle: styleId });
    return styleId;
}

/**
 * Verificar se usuário possui estilo
 */
async function hasStyle(styleId) {
    const unlockedStyles = await getUnlockedStyles();
    return unlockedStyles.includes(styleId);
}

// ============================================================
// PACOTES DE ESTILOS
// ============================================================

/**
 * Obter todos os pacotes de estilos
 */
async function getAllStylePacks() {
    const snapshot = await dbRef.stylePacks().once('value');
    const packs = snapshot.val() || {};
    return Object.values(packs);
}

/**
 * Obter pacotes por categoria
 */
async function getPacksByCategory(category) {
    const snapshot = await dbRef.stylePacks()
        .orderByChild('category')
        .equalTo(category)
        .once('value');
    const packs = snapshot.val() || {};
    return Object.values(packs);
}

/**
 * Obter pacotes gratuitos
 */
async function getFreePacks() {
    return getPacksByCategory('free');
}

/**
 * Obter pacotes premium
 */
async function getPremiumPacks() {
    return getPacksByCategory('premium');
}

/**
 * Obter pacotes em destaque
 */
async function getFeaturedPacks() {
    const allPacks = await getAllStylePacks();
    return allPacks.filter(pack => pack.featured === true);
}

/**
 * Verificar se usuário já comprou um pacote
 */
async function hasPurchasedPack(packId) {
    const user = auth.currentUser;
    if (!user) return false;
    
    const snapshot = await dbRef.user(user.uid)
        .child('purchasedPacks')
        .child(packId)
        .once('value');
    
    return snapshot.exists();
}

/**
 * Comprar pacote de estilos (desbloquear estilos)
 */
async function purchaseStylePack(packId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    // Verificar se já comprou
    const alreadyPurchased = await hasPurchasedPack(packId);
    if (alreadyPurchased) {
        throw new Error('Pacote já comprado');
    }
    
    // Obter dados do pacote
    const packSnapshot = await dbRef.stylePack(packId).once('value');
    const pack = packSnapshot.val();
    
    if (!pack) throw new Error('Pacote não encontrado');
    
    // Obter estilos do pacote
    const styles = Object.keys(pack.styles || {});
    
    // Obter estilos já desbloqueados
    const currentStyles = await getUnlockedStyles();
    const newStyles = [...new Set([...currentStyles, ...styles])];
    
    // Atualizar banco de dados
    const updates = {};
    updates[`purchasedPacks/${packId}`] = {
        packId: packId,
        purchasedAt: firebase.database.ServerValue.TIMESTAMP,
        price: pack.price
    };
    updates['unlockedStyles'] = newStyles;
    
    await dbRef.user(user.uid).update(updates);
    
    return {
        pack: pack,
        unlockedStyles: styles
    };
}

// ============================================================
// ESTATÍSTICAS E CONQUISTAS
// ============================================================

/**
 * Registrar vitória
 */
async function recordWin(score) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    const stats = await getUserStats();
    
    const updates = {
        gamesPlayed: (stats.gamesPlayed || 0) + 1,
        gamesWon: (stats.gamesWon || 0) + 1,
        totalScore: (stats.totalScore || 0) + score,
        bestScore: Math.max(stats.bestScore || 0, score),
        winStreak: (stats.winStreak || 0) + 1
    };
    
    updates.bestWinStreak = Math.max(stats.bestWinStreak || 0, updates.winStreak);
    
    await dbRef.userStats(user.uid).update(updates);
    return updates;
}

/**
 * Registrar derrota
 */
async function recordLoss(score) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    const stats = await getUserStats();
    
    const updates = {
        gamesPlayed: (stats.gamesPlayed || 0) + 1,
        gamesLost: (stats.gamesLost || 0) + 1,
        totalScore: (stats.totalScore || 0) + score,
        bestScore: Math.max(stats.bestScore || 0, score),
        winStreak: 0
    };
    
    await dbRef.userStats(user.uid).update(updates);
    return updates;
}

/**
 * Calcular taxa de vitória
 */
function calculateWinRate(stats) {
    if (!stats.gamesPlayed) return 0;
    return ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1);
}

/**
 * Calcular média de pontos
 */
function calculateAverageScore(stats) {
    if (!stats.gamesPlayed) return 0;
    return Math.round(stats.totalScore / stats.gamesPlayed);
}

// ============================================================
// SALAS MULTIPLAYER
// ============================================================

/**
 * Criar nova sala
 */
async function createRoom(roomName) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    const userData = await getCurrentUserData();
    const roomId = database.ref('rooms').push().key;
    
    const roomData = {
        id: roomId,
        name: roomName,
        host: user.uid,
        status: 'waiting',
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        players: {
            [user.uid]: {
                uid: user.uid,
                name: userData.displayName,
                style: userData.selectedStyle,
                score: 0,
                ready: false
            }
        }
    };
    
    await dbRef.room(roomId).set(roomData);
    return roomId;
}

/**
 * Entrar em sala existente
 */
async function joinRoom(roomId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    const userData = await getCurrentUserData();
    
    // Verificar se sala existe
    const roomSnapshot = await dbRef.room(roomId).once('value');
    if (!roomSnapshot.exists()) {
        throw new Error('Sala não encontrada');
    }
    
    const room = roomSnapshot.val();
    
    // Verificar se sala está cheia (máx 2 jogadores)
    const playerCount = Object.keys(room.players || {}).length;
    if (playerCount >= 2) {
        throw new Error('Sala cheia');
    }
    
    // Verificar se jogo já começou
    if (room.status !== 'waiting') {
        throw new Error('Jogo já começou');
    }
    
    // Adicionar jogador
    await dbRef.room(roomId).child('players').child(user.uid).set({
        uid: user.uid,
        name: userData.displayName,
        style: userData.selectedStyle,
        score: 0,
        ready: false
    });
    
    // Atualizar status se sala ficou cheia
    if (playerCount + 1 >= 2) {
        await dbRef.room(roomId).update({ status: 'full' });
    }
}

/**
 * Sair da sala
 */
async function leaveRoom(roomId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    const roomSnapshot = await dbRef.room(roomId).once('value');
    const room = roomSnapshot.val();
    
    if (!room) return;
    
    // Se for o host e o jogo não começou, deletar sala
    if (room.host === user.uid && room.status === 'waiting') {
        await dbRef.room(roomId).remove();
    } else {
        // Apenas remover jogador
        await dbRef.room(roomId).child('players').child(user.uid).remove();
        
        // Atualizar status
        const playersSnapshot = await dbRef.room(roomId).child('players').once('value');
        const playerCount = playersSnapshot.numChildren();
        
        if (playerCount < 2) {
            await dbRef.room(roomId).update({ status: 'waiting' });
        }
    }
}

/**
 * Marcar jogador como pronto
 */
async function setPlayerReady(roomId, ready = true) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    await dbRef.room(roomId).child('players').child(user.uid).update({ ready });
}

/**
 * Listar salas disponíveis
 */
async function listAvailableRooms() {
    const snapshot = await dbRef.rooms()
        .orderByChild('status')
        .equalTo('waiting')
        .once('value');
    
    const rooms = snapshot.val() || {};
    return Object.values(rooms);
}

// ============================================================
// LISTENERS EM TEMPO REAL
// ============================================================

/**
 * Escutar mudanças nas estatísticas do usuário
 */
function listenToUserStats(userId, callback) {
    const ref = dbRef.userStats(userId);
    ref.on('value', (snapshot) => {
        callback(snapshot.val());
    });
    
    // Retornar função para parar de escutar
    return () => ref.off('value');
}

/**
 * Escutar mudanças em uma sala
 */
function listenToRoom(roomId, callback) {
    const ref = dbRef.room(roomId);
    ref.on('value', (snapshot) => {
        callback(snapshot.val());
    });
    
    return () => ref.off('value');
}

/**
 * Escutar mudanças nos jogadores da sala
 */
function listenToPlayers(roomId, callback) {
    const ref = dbRef.players(roomId);
    ref.on('value', (snapshot) => {
        callback(snapshot.val());
    });
    
    return () => ref.off('value');
}

/**
 * Escutar estado do jogo
 */
function listenToGameState(roomId, callback) {
    const ref = dbRef.gameState(roomId);
    ref.on('value', (snapshot) => {
        callback(snapshot.val());
    });
    
    return () => ref.off('value');
}

// ============================================================
// STORAGE - UPLOAD DE IMAGENS
// ============================================================

/**
 * Upload de foto de perfil com preview
 */
async function uploadProfilePicture(file) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande (máx 5MB)');
    }
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
    }
    
    // Upload
    const fileRef = storageRef.profilePicture(user.uid, 'avatar.jpg');
    const uploadTask = fileRef.put(file);
    
    // Retornar promise com progresso
    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload:', progress.toFixed(0) + '%');
            },
            (error) => {
                reject(error);
            },
            async () => {
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                
                // Atualizar perfil
                await user.updateProfile({ photoURL: downloadURL });
                await dbRef.user(user.uid).update({ photoURL: downloadURL });
                
                resolve(downloadURL);
            }
        );
    });
}

/**
 * Capturar screenshot do jogo
 */
async function saveGameScreenshot(canvas) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            try {
                const timestamp = Date.now();
                const fileName = `screenshot-${timestamp}.jpg`;
                const fileRef = storageRef.gameScreenshot(user.uid, fileName);
                
                await fileRef.put(blob);
                const url = await fileRef.getDownloadURL();
                
                resolve(url);
            } catch (error) {
                reject(error);
            }
        }, 'image/jpeg', 0.9);
    });
}

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Formatar timestamp
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
}

/**
 * Calcular tempo desde
 */
function timeSince(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    const intervals = {
        ano: 31536000,
        mês: 2592000,
        semana: 604800,
        dia: 86400,
        hora: 3600,
        minuto: 60
    };
    
    for (let [name, secondsInInterval] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInInterval);
        if (interval >= 1) {
            return `${interval} ${name}${interval > 1 ? 's' : ''} atrás`;
        }
    }
    
    return 'agora';
}

/**
 * Gerar ID único
 */
function generateId() {
    return database.ref().push().key;
}

// ============================================================
// EXEMPLOS DE USO
// ============================================================

/*

// Exemplo 1: Login e obter dados
async function example1() {
    await auth.signInWithEmailAndPassword('user@example.com', 'password');
    const userData = await getCurrentUserData();
    console.log('Dados do usuário:', userData);
}

// Exemplo 2: Comprar pacote
async function example2() {
    const result = await purchaseStylePack('retro-pack-01');
    console.log('Pacote comprado:', result);
}

// Exemplo 3: Registrar vitória
async function example3() {
    const stats = await recordWin(150);
    console.log('Estatísticas atualizadas:', stats);
}

// Exemplo 4: Criar e monitorar sala
async function example4() {
    const roomId = await createRoom('Sala do João');
    
    const unsubscribe = listenToRoom(roomId, (room) => {
        console.log('Sala atualizada:', room);
        
        // Verificar se todos estão prontos
        const players = Object.values(room.players || {});
        const allReady = players.every(p => p.ready);
        
        if (allReady && players.length === 2) {
            console.log('Todos prontos! Iniciar jogo');
        }
    });
    
    // Parar de escutar quando necessário
    // unsubscribe();
}

// Exemplo 5: Upload de foto
async function example5() {
    const input = document.querySelector('input[type="file"]');
    const file = input.files[0];
    
    const url = await uploadProfilePicture(file);
    console.log('Foto enviada:', url);
}

*/

console.log('✅ Funções auxiliares do Firebase carregadas');
