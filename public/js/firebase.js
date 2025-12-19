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
const storage = firebase.storage();

// Configurar persistência de sessão
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Referências úteis do banco de dados
const dbRef = {
    users: () => database.ref('users'),
    user: (uid) => database.ref(`users/${uid}`),
    userStats: (uid) => database.ref(`users/${uid}/stats`),
    userPurchases: (uid) => database.ref(`users/${uid}/purchasedPacks`),
    stylePacks: () => database.ref('style-packs'),
    stylePack: (packId) => database.ref(`style-packs/${packId}`),
    rooms: () => database.ref('rooms'),
    room: (roomId) => database.ref(`rooms/${roomId}`),
    gameState: (roomId) => database.ref(`rooms/${roomId}/gameState`),
    players: (roomId) => database.ref(`rooms/${roomId}/players`)
};

// Referências úteis do Storage
const storageRef = {
    stylePackImages: (packId, imageName) => storage.ref(`style-packs/${packId}/${imageName}`),
    profilePicture: (uid, fileName) => storage.ref(`profile-pictures/${uid}/${fileName}`),
    gameScreenshot: (uid, fileName) => storage.ref(`game-screenshots/${uid}/${fileName}`)
};

console.log('✅ Firebase inicializado');
