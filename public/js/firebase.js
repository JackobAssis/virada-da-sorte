/**
 * Configuração do Firebase
 * 
 * IMPORTANTE: Substitua as credenciais abaixo pelas suas credenciais do Firebase
 * Você pode obter essas informações em: Firebase Console > Project Settings > General > Your apps
 */

const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências globais
const auth = firebase.auth();
const database = firebase.database();

// Configurar persistência de sessão
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Referências úteis do banco de dados
const dbRef = {
    users: () => database.ref('users'),
    user: (uid) => database.ref(`users/${uid}`),
    rooms: () => database.ref('rooms'),
    room: (roomId) => database.ref(`rooms/${roomId}`),
    gameState: (roomId) => database.ref(`rooms/${roomId}/gameState`),
    players: (roomId) => database.ref(`rooms/${roomId}/players`)
};

console.log('✅ Firebase inicializado');
