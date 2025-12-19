/**
 * Sistema de Autenticação
 * Gerencia login, registro e sessão de usuários
 */

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

// Inputs
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');

/**
 * Verificar se usuário já está autenticado
 */
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('✅ Usuário autenticado:', user.email);
        // Redirecionar para o lobby
        window.location.href = 'lobby.html';
    }
});

/**
 * Alternar entre formulários de login e registro
 */
showRegisterLink?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    clearError();
});

showLoginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearError();
});

/**
 * Login de usuário
 */
loginBtn?.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showError('Por favor, preencha todos os campos');
        return;
    }

    setLoading(true);
    clearError();

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Login realizado:', userCredential.user.email);
        // O redirecionamento será feito pelo onAuthStateChanged
    } catch (error) {
        console.error('❌ Erro no login:', error);
        showError(getErrorMessage(error.code));
    } finally {
        setLoading(false);
    }
});

/**
 * Registro de novo usuário
 */
registerBtn?.addEventListener('click', async () => {
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    if (!name || !email || !password) {
        showError('Por favor, preencha todos os campos');
        return;
    }

    if (password.length < 6) {
        showError('A senha deve ter no mínimo 6 caracteres');
        return;
    }

    if (name.length < 3) {
        showError('O nome deve ter no mínimo 3 caracteres');
        return;
    }

    setLoading(true);
    clearError();

    try {
        // Criar conta
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Atualizar perfil com nome
        await user.updateProfile({
            displayName: name
        });

        // Criar dados iniciais do usuário no banco
        await dbRef.user(user.uid).set({
            uid: user.uid,
            displayName: name,
            email: email,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            selectedStyle: 'neon-circuit', // Estilo padrão
            unlockedStyles: ['neon-circuit', 'arcane-sigil', 'minimal-prime', 'flux-ember'], // Estilos gratuitos
            stats: {
                gamesPlayed: 0,
                gamesWon: 0,
                gamesLost: 0
            }
        });

        console.log('✅ Conta criada:', user.email);
        // O redirecionamento será feito pelo onAuthStateChanged
    } catch (error) {
        console.error('❌ Erro no registro:', error);
        showError(getErrorMessage(error.code));
    } finally {
        setLoading(false);
    }
});

/**
 * Permitir login com Enter
 */
loginPassword?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

registerPassword?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        registerBtn.click();
    }
});

/**
 * Funções auxiliares
 */

function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
}

function clearError() {
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    }
}

function setLoading(loading) {
    if (loadingSpinner) {
        loadingSpinner.classList.toggle('hidden', !loading);
    }
    if (loginBtn) loginBtn.disabled = loading;
    if (registerBtn) registerBtn.disabled = loading;
}

function getErrorMessage(errorCode) {
    const messages = {
        'auth/email-already-in-use': 'Este e-mail já está em uso',
        'auth/invalid-email': 'E-mail inválido',
        'auth/operation-not-allowed': 'Operação não permitida',
        'auth/weak-password': 'Senha muito fraca',
        'auth/user-disabled': 'Usuário desabilitado',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet'
    };

    return messages[errorCode] || 'Erro ao processar solicitação';
}
