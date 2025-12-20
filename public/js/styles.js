/**
 * Gerenciador de Estilos
 * Define e gerencia os 5 estilos com imagens disponíveis
 */

const STYLES_CONFIG = {
    // Estilos Gratuitos com Imagens
    'personagens': {
        id: 'personagens',
        name: 'Personagens',
        type: 'free',
        className: 'style-personagens',
        description: 'Cartas com personagens únicos',
        folder: 'Personagens',
        unlocked: true
    },
    'animais': {
        id: 'animais',
        name: 'Animais',
        type: 'free',
        className: 'style-animais',
        description: 'Cartas com animais diversos',
        folder: 'Animais',
        unlocked: true
    },
    'simbolos': {
        id: 'simbolos',
        name: 'Símbolos',
        type: 'free',
        className: 'style-simbolos',
        description: 'Cartas com símbolos místicos',
        folder: 'Simbolos',
        unlocked: true
    },
    'cyber': {
        id: 'cyber',
        name: 'Cyber',
        type: 'free',
        className: 'style-cyber',
        description: 'Cartas futuristas cyberpunk',
        folder: 'Cyber',
        unlocked: true
    },
    'dark': {
        id: 'dark',
        name: 'Dark',
        type: 'free',
        className: 'style-dark',
        description: 'Cartas com tema dark',
        folder: 'Dark',
        unlocked: true
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
