/**
 * ESTRUTURA DE DADOS DO FIREBASE
 * 
 * Este arquivo documenta a estrutura completa do banco de dados
 * e fornece exemplos de dados para testes
 */

// ============================================================
// ESTRUTURA DE USUÁRIOS
// ============================================================

const userExample = {
  "users": {
    "user123abc": {
      "uid": "user123abc",
      "displayName": "João Silva",
      "email": "joao@example.com",
      "photoURL": null, // URL da foto de perfil (opcional)
      "createdAt": 1702857600000, // Timestamp da criação
      "lastLogin": 1702857600000, // Último login
      "selectedStyle": "neon-circuit", // Estilo atualmente selecionado
      "unlockedStyles": [
        "neon-circuit",
        "arcane-sigil",
        "minimal-prime",
        "flux-ember",
        "pixel-legend" // Estilo comprado
      ],
      "purchasedPacks": {
        "retro-pack-01": {
          "packId": "retro-pack-01",
          "purchasedAt": 1702857600000,
          "price": 4.99
        }
      },
      "stats": {
        "gamesPlayed": 25,
        "gamesWon": 15,
        "gamesLost": 10,
        "totalScore": 1250,
        "bestScore": 180,
        "winStreak": 3, // Sequência atual de vitórias
        "bestWinStreak": 5 // Melhor sequência de vitórias
      }
    }
  }
};

// ============================================================
// ESTRUTURA DE PACOTES DE ESTILOS
// ============================================================

const stylePacksExample = {
  "style-packs": {
    // PACOTES GRATUITOS
    "free-pack-01": {
      "id": "free-pack-01",
      "name": "Pacote Inicial",
      "description": "Estilos gratuitos para começar sua jornada",
      "price": 0,
      "category": "free",
      "featured": false,
      "releaseDate": 1702857600000,
      "previewImage": "https://storage.googleapis.com/.../free-pack-preview.jpg",
      "styles": {
        "neon-circuit": {
          "id": "neon-circuit",
          "name": "Neon Circuit",
          "preview": "https://storage.googleapis.com/.../neon-circuit.jpg"
        },
        "arcane-sigil": {
          "id": "arcane-sigil",
          "name": "Arcane Sigil",
          "preview": "https://storage.googleapis.com/.../arcane-sigil.jpg"
        },
        "minimal-prime": {
          "id": "minimal-prime",
          "name": "Minimal Prime",
          "preview": "https://storage.googleapis.com/.../minimal-prime.jpg"
        },
        "flux-ember": {
          "id": "flux-ember",
          "name": "Flux Ember",
          "preview": "https://storage.googleapis.com/.../flux-ember.jpg"
        }
      }
    },

    // PACOTES PREMIUM
    "retro-pack-01": {
      "id": "retro-pack-01",
      "name": "Retro Games",
      "description": "Nostalgia dos jogos clássicos dos anos 80 e 90",
      "price": 4.99,
      "category": "premium",
      "featured": true,
      "releaseDate": 1702857600000,
      "previewImage": "https://storage.googleapis.com/.../retro-pack-preview.jpg",
      "styles": {
        "pixel-legend": {
          "id": "pixel-legend",
          "name": "Pixel Legend",
          "preview": "https://storage.googleapis.com/.../pixel-legend.jpg"
        },
        "arcade-neon": {
          "id": "arcade-neon",
          "name": "Arcade Neon",
          "preview": "https://storage.googleapis.com/.../arcade-neon.jpg"
        },
        "retro-wave": {
          "id": "retro-wave",
          "name": "Retro Wave",
          "preview": "https://storage.googleapis.com/.../retro-wave.jpg"
        }
      }
    },

    "nature-pack-01": {
      "id": "nature-pack-01",
      "name": "Natureza Mística",
      "description": "Elementos naturais e místicos para suas partidas",
      "price": 3.99,
      "category": "premium",
      "featured": true,
      "releaseDate": 1702857600000,
      "previewImage": "https://storage.googleapis.com/.../nature-pack-preview.jpg",
      "styles": {
        "forest-spirit": {
          "id": "forest-spirit",
          "name": "Forest Spirit",
          "preview": "https://storage.googleapis.com/.../forest-spirit.jpg"
        },
        "ocean-depths": {
          "id": "ocean-depths",
          "name": "Ocean Depths",
          "preview": "https://storage.googleapis.com/.../ocean-depths.jpg"
        },
        "crystal-cave": {
          "id": "crystal-cave",
          "name": "Crystal Cave",
          "preview": "https://storage.googleapis.com/.../crystal-cave.jpg"
        }
      }
    },

    // PACOTES EXCLUSIVOS
    "exclusive-pack-01": {
      "id": "exclusive-pack-01",
      "name": "Edição Limitada - Cosmos",
      "description": "Pacote exclusivo com tema espacial e galáxias",
      "price": 9.99,
      "category": "exclusive",
      "featured": true,
      "releaseDate": 1702857600000,
      "previewImage": "https://storage.googleapis.com/.../cosmos-pack-preview.jpg",
      "styles": {
        "galaxy-drift": {
          "id": "galaxy-drift",
          "name": "Galaxy Drift",
          "preview": "https://storage.googleapis.com/.../galaxy-drift.jpg"
        },
        "nebula-storm": {
          "id": "nebula-storm",
          "name": "Nebula Storm",
          "preview": "https://storage.googleapis.com/.../nebula-storm.jpg"
        },
        "stellar-void": {
          "id": "stellar-void",
          "name": "Stellar Void",
          "preview": "https://storage.googleapis.com/.../stellar-void.jpg"
        },
        "cosmic-pulse": {
          "id": "cosmic-pulse",
          "name": "Cosmic Pulse",
          "preview": "https://storage.googleapis.com/.../cosmic-pulse.jpg"
        }
      }
    },

    // PACOTES SAZONAIS
    "seasonal-winter-2025": {
      "id": "seasonal-winter-2025",
      "name": "Inverno 2025",
      "description": "Pacote especial de inverno - disponível por tempo limitado",
      "price": 5.99,
      "category": "seasonal",
      "featured": true,
      "releaseDate": 1702857600000,
      "previewImage": "https://storage.googleapis.com/.../winter-pack-preview.jpg",
      "styles": {
        "frost-bite": {
          "id": "frost-bite",
          "name": "Frost Bite",
          "preview": "https://storage.googleapis.com/.../frost-bite.jpg"
        },
        "aurora-lights": {
          "id": "aurora-lights",
          "name": "Aurora Lights",
          "preview": "https://storage.googleapis.com/.../aurora-lights.jpg"
        },
        "winter-wonder": {
          "id": "winter-wonder",
          "name": "Winter Wonder",
          "preview": "https://storage.googleapis.com/.../winter-wonder.jpg"
        }
      }
    }
  }
};

// ============================================================
// ESTRUTURA DE SALAS DE JOGO
// ============================================================

const roomExample = {
  "rooms": {
    "room-abc123": {
      "id": "room-abc123",
      "name": "Sala do João",
      "host": "user123abc",
      "status": "waiting", // waiting, full, playing, finished
      "createdAt": 1702857600000,
      "players": {
        "user123abc": {
          "uid": "user123abc",
          "name": "João Silva",
          "style": "neon-circuit",
          "score": 0,
          "ready": true
        },
        "user456def": {
          "uid": "user456def",
          "name": "Maria Santos",
          "style": "pixel-legend",
          "score": 0,
          "ready": false
        }
      },
      "gameState": {
        "cards": {
          // Array de cartas embaralhadas
        },
        "currentTurn": "user123abc",
        "flippedCards": null,
        "matchedPairs": {},
        "lastAction": 1702857600000
      }
    }
  }
};

// ============================================================
// FUNÇÕES AUXILIARES PARA MANIPULAÇÃO DE DADOS
// ============================================================

/**
 * Verificar se usuário possui um pacote específico
 */
function userHasPack(userId, packId) {
  return dbRef.user(userId).child('purchasedPacks').child(packId).once('value')
    .then(snapshot => snapshot.exists());
}

/**
 * Desbloquear estilos de um pacote para o usuário
 */
async function unlockStylePack(userId, packId, price) {
  const packSnapshot = await dbRef.stylePack(packId).once('value');
  const pack = packSnapshot.val();
  
  if (!pack) throw new Error('Pacote não encontrado');
  
  // Obter estilos do pacote
  const styles = Object.keys(pack.styles || {});
  
  // Atualizar dados do usuário
  const updates = {};
  
  // Adicionar compra
  updates[`purchasedPacks/${packId}`] = {
    packId: packId,
    purchasedAt: firebase.database.ServerValue.TIMESTAMP,
    price: price
  };
  
  // Adicionar estilos desbloqueados
  const currentStyles = await dbRef.user(userId).child('unlockedStyles').once('value');
  const unlockedStyles = currentStyles.val() || [];
  const newStyles = [...new Set([...unlockedStyles, ...styles])];
  
  updates['unlockedStyles'] = newStyles;
  
  // Aplicar atualizações
  return dbRef.user(userId).update(updates);
}

/**
 * Atualizar estatísticas após um jogo
 */
async function updateUserStats(userId, won, score) {
  const statsRef = dbRef.userStats(userId);
  const snapshot = await statsRef.once('value');
  const stats = snapshot.val() || {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalScore: 0,
    bestScore: 0,
    winStreak: 0,
    bestWinStreak: 0
  };
  
  const updates = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + (won ? 1 : 0),
    gamesLost: stats.gamesLost + (won ? 0 : 1),
    totalScore: stats.totalScore + score,
    bestScore: Math.max(stats.bestScore, score),
    winStreak: won ? stats.winStreak + 1 : 0
  };
  
  updates.bestWinStreak = Math.max(stats.bestWinStreak, updates.winStreak);
  
  return statsRef.update(updates);
}

/**
 * Obter todos os pacotes de estilos
 */
async function getAllStylePacks() {
  const snapshot = await dbRef.stylePacks().once('value');
  return snapshot.val() || {};
}

/**
 * Obter pacotes por categoria
 */
async function getPacksByCategory(category) {
  const snapshot = await dbRef.stylePacks()
    .orderByChild('category')
    .equalTo(category)
    .once('value');
  return snapshot.val() || {};
}

/**
 * Obter pacotes em destaque
 */
async function getFeaturedPacks() {
  const snapshot = await dbRef.stylePacks()
    .orderByChild('featured')
    .equalTo(true)
    .once('value');
  return snapshot.val() || {};
}

console.log('📋 Estrutura de dados documentada');
