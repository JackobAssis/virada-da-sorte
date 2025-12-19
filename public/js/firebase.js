/**
 * Configuração do Firebase
 * 
 * Credenciais do projeto: virada-da-sorte
 * Configurado em: 18 de dezembro de 2025
 */

const firebaseConfig = {
    apiKey: "AIzaSyCg2uRjKPzMwdxAbYnQJ1tOhFRk5zwcxRM",
    authDomain: "virada-da-sorte.firebaseapp.com",
    databaseURL: "https://virada-da-sorte-default-rtdb.firebaseio.com",
    projectId: "virada-da-sorte",
    storageBucket: "virada-da-sorte.firebasestorage.app",
    messagingSenderId: "737424831264",
    appId: "1:737424831264:web:f3f0e7f7b01c46d1c1dd45",
    measurementId: "G-QYYQ78PCEC"
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
