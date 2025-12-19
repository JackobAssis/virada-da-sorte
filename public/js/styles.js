/**
 * Gerenciador de Estilos
 * Define e gerencia todos os estilos disponíveis (gratuitos e premium)
 */

const STYLES_CONFIG = {
    // Estilos Gratuitos (CSS puro)
    'neon-circuit': {
        id: 'neon-circuit',
        name: 'Neon Circuit',
        type: 'free',
        className: 'style-neon-circuit',
        description: 'Futurista com circuitos neon e cyberpunk',
        unlocked: true
    },
    'arcane-sigil': {
        id: 'arcane-sigil',
        name: 'Arcane Sigil',
        type: 'free',
        className: 'style-arcane-sigil',
        description: 'Místico com runas e magia arcana',
        unlocked: true
    },
    'minimal-prime': {
        id: 'minimal-prime',
        name: 'Minimal Prime',
        type: 'free',
        className: 'style-minimal-prime',
        description: 'Minimalista clean e elegante',
        unlocked: true
    },
    'flux-ember': {
        id: 'flux-ember',
        name: 'Flux Ember',
        type: 'free',
        className: 'style-flux-ember',
        description: 'Energético com movimento e intensidade',
        unlocked: true
    },

    // Estilos Premium (com imagens)
    'premium-cosmos': {
        id: 'premium-cosmos',
        name: 'Cosmos Premium',
        type: 'premium',
        className: 'style-premium-cosmos',
        description: 'Pacote premium com imagens do cosmos',
        packPath: 'packs/cosmos',
        price: 9.99,
        unlocked: false
    },
    'premium-nature': {
        id: 'premium-nature',
        name: 'Nature Premium',
        type: 'premium',
        className: 'style-premium-nature',
        description: 'Pacote premium com elementos naturais',
        packPath: 'packs/nature',
        price: 9.99,
        unlocked: false
    },
    'premium-fantasy': {
        id: 'premium-fantasy',
        name: 'Fantasy Premium',
        type: 'premium',
        className: 'style-premium-fantasy',
        description: 'Pacote premium temático de fantasia',
        packPath: 'packs/fantasy',
        price: 12.99,
        unlocked: false
    },
    'premium-cyberpunk': {
        id: 'premium-cyberpunk',
        name: 'Cyberpunk Premium',
        type: 'premium',
        className: 'style-premium-cyberpunk',
        description: 'Pacote premium futurista cyberpunk',
        packPath: 'packs/cyberpunk',
        price: 12.99,
        unlocked: false
    },
    'premium-ocean': {
        id: 'premium-ocean',
        name: 'Ocean Premium',
        type: 'premium',
        className: 'style-premium-ocean',
        description: 'Pacote premium com tema oceânico',
        packPath: 'packs/ocean',
        price: 9.99,
        unlocked: false
    }
};

/**
 * Obter todos os estilos disponíveis
 */
function getAllStyles() {
    return Object.values(STYLES_CONFIG);
}

/**
 * Obter apenas estilos gratuitos
 */
function getFreeStyles() {
    return getAllStyles().filter(style => style.type === 'free');
}

/**
 * Obter apenas estilos premium
 */
function getPremiumStyles() {
    return getAllStyles().filter(style => style.type === 'premium');
}

/**
 * Obter configuração de um estilo específico
 */
function getStyle(styleId) {
    return STYLES_CONFIG[styleId] || STYLES_CONFIG.neon;
}

/**
 * Aplicar estilo a um elemento card
 * @param {HTMLElement} cardElement - Elemento do card
 * @param {string} styleId - ID do estilo
 * @param {number} cardIndex - Índice do card (para estilos premium)
 */
function applyStyleToCard(cardElement, styleId, cardIndex = 0) {
    const style = getStyle(styleId);
    
    // Remove classes de estilo anteriores
    cardElement.className = cardElement.className
        .split(' ')
        .filter(cls => !cls.startsWith('style-'))
        .join(' ');
    
    // Adiciona nova classe de estilo
    cardElement.classList.add(style.className);
    
    // Se for premium, aplica imagem de fundo
    if (style.type === 'premium' && style.packPath) {
        applyPremiumImages(cardElement, style, cardIndex);
    }
}

/**
 * Aplicar imagens premium ao card
 * @param {HTMLElement} cardElement - Elemento do card
 * @param {object} style - Configuração do estilo
 * @param {number} cardIndex - Índice do card (1-20)
 */
function applyPremiumImages(cardElement, style, cardIndex) {
    const cardBack = cardElement.querySelector('.card-back');
    const cardFront = cardElement.querySelector('.card-front');
    
    // Número do arquivo (1-20)
    const fileNumber = String(cardIndex + 1).padStart(2, '0');
    
    // Aplicar imagens
    if (cardBack) {
        cardBack.style.backgroundImage = `url('${style.packPath}/back.png')`;
    }
    
    if (cardFront) {
        cardFront.style.backgroundImage = `url('${style.packPath}/${fileNumber}.png')`;
    }
    
    // Marcar como premium
    cardElement.classList.add('premium');
}

/**
 * Verificar se um estilo está desbloqueado para o usuário
 * @param {string} styleId - ID do estilo
 * @param {Array} unlockedStyles - Array de estilos desbloqueados do usuário
 */
function isStyleUnlocked(styleId, unlockedStyles = []) {
    const style = getStyle(styleId);
    
    // Estilos gratuitos sempre desbloqueados
    if (style.type === 'free') {
        return true;
    }
    
    // Estilos premium verificar array
    return unlockedStyles.includes(styleId);
}

/**
 * Obter estilos desbloqueados do usuário
 * @param {string} uid - ID do usuário
 * @returns {Promise<Array>}
 */
async function getUserUnlockedStyles(uid) {
    try {
        const snapshot = await dbRef.user(uid).child('unlockedStyles').once('value');
        return snapshot.val() || [];
    } catch (error) {
        console.error('Erro ao obter estilos desbloqueados:', error);
        return [];
    }
}

/**
 * Obter estilo selecionado do usuário
 * @param {string} uid - ID do usuário
 * @returns {Promise<string>}
 */
async function getUserSelectedStyle(uid) {
    try {
        const snapshot = await dbRef.user(uid).child('selectedStyle').once('value');
        return snapshot.val() || 'neon';
    } catch (error) {
        console.error('Erro ao obter estilo selecionado:', error);
        return 'neon';
    }
}

/**
 * Salvar estilo selecionado do usuário
 * @param {string} uid - ID do usuário
 * @param {string} styleId - ID do estilo
 */
async function saveUserSelectedStyle(uid, styleId) {
    try {
        await dbRef.user(uid).update({
            selectedStyle: styleId
        });
        console.log('✅ Estilo salvo:', styleId);
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar estilo:', error);
        return false;
    }
}

/**
 * Criar elemento de preview de estilo
 * @param {string} styleId - ID do estilo
 * @returns {HTMLElement}
 */
function createStylePreviewElement(styleId) {
    const style = getStyle(styleId);
    
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.setAttribute('data-symbol', 'star');
    
    cardElement.innerHTML = `
        <div class="card-inner">
            <div class="card-back"></div>
            <div class="card-front"></div>
        </div>
    `;
    
    applyStyleToCard(cardElement, styleId, 0);
    
    return cardElement;
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
    window.StylesManager = {
        getAllStyles,
        getFreeStyles,
        getPremiumStyles,
        getStyle,
        applyStyleToCard,
        isStyleUnlocked,
        getUserUnlockedStyles,
        getUserSelectedStyle,
        saveUserSelectedStyle,
        createStylePreviewElement
    };
}
