# 🎴 VIRADA DA SORTE

Jogo de cartas multiplayer online com sistema de estilos customizáveis.

## 📋 Características

- ✅ Jogo de memória multiplayer em tempo real
- ✅ Sistema de autenticação (Firebase Auth)
- ✅ Salas privadas para até 2 jogadores
- ✅ 6 estilos gratuitos (CSS puro)
- ✅ 5 estilos premium (com imagens)
- ✅ Sincronização em tempo real
- ✅ Sistema de pontuação
- ✅ Estatísticas de jogador

## 🚀 Como Usar

### 1. Configurar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative **Authentication** (método E-mail/Senha)
3. Ative **Realtime Database**
4. Copie suas credenciais do Firebase
5. Edite `public/js/firebase.js` e substitua as credenciais:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

### 2. Configurar Regras de Segurança

No Firebase Console, vá em **Realtime Database > Rules** e copie o conteúdo de `database.rules.json`.

### 3. Deploy

#### Opção A: Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login

# Inicializar projeto
firebase init

# Deploy
firebase deploy
```

#### Opção B: Servidor Local

```bash
# Usar qualquer servidor HTTP simples
npx http-server public -p 8080
```

Acesse: `http://localhost:8080`

## 📁 Estrutura do Projeto

```
virada-da-sorte/
├── public/
│   ├── css/
│   │   ├── base.css           # Estilos base e layout
│   │   ├── cards.css          # Estrutura dos cards
│   │   ├── styles-free.css    # Estilos gratuitos
│   │   └── styles-premium.css # Estilos premium
│   ├── js/
│   │   ├── firebase.js        # Configuração Firebase
│   │   ├── auth.js            # Sistema de autenticação
│   │   ├── lobby.js           # Lógica do lobby
│   │   ├── game.js            # Lógica do jogo
│   │   └── styles.js          # Gerenciador de estilos
│   ├── packs/                 # Pacotes de imagens premium
│   │   ├── cosmos/
│   │   ├── nature/
│   │   ├── fantasy/
│   │   ├── cyberpunk/
│   │   └── ocean/
│   ├── index.html             # Página de login
│   ├── lobby.html             # Lobby e seleção
│   └── game.html              # Tela do jogo
├── firebase.json              # Configuração do Firebase
├── database.rules.json        # Regras de segurança
└── README.md
```

## 🎨 Estilos Disponíveis

### Gratuitos (CSS Puro)
1. **Neon Circuit** - Futurista com circuitos neon e cyberpunk
2. **Arcane Sigil** - Místico com runas e magia arcana
3. **Minimal Prime** - Minimalista clean e elegante
4. **Flux Ember** - Energético com movimento e intensidade

### Premium (Imagens)
1. **Cosmos Premium** - Imagens do cosmos ($9.99)
2. **Nature Premium** - Elementos naturais ($9.99)
3. **Fantasy Premium** - Temática de fantasia ($12.99)
4. **Cyberpunk Premium** - Futurista cyberpunk ($12.99)
5. **Ocean Premium** - Tema oceânico ($9.99)

## 🎮 Como Jogar

1. **Criar conta** ou fazer login
2. **Escolher estilo** de cartas no lobby
3. **Criar sala** ou entrar em uma existente
4. **Aguardar** segundo jogador
5. **Jogar**: vire duas cartas por vez para encontrar pares
6. O jogador que encontrar mais pares vence!

## 🔒 Segurança

- Autenticação obrigatória
- Regras de segurança no Firebase
- Usuários só podem modificar seus próprios dados
- Validação de dados no servidor
- Proteção contra manipulação de pontuação

## 📦 Adicionar Pacotes Premium

Para adicionar imagens aos pacotes premium:

1. Crie uma pasta em `public/packs/[nome-do-pacote]/`
2. Adicione:
   - `back.png` (verso das cartas)
   - `01.png` a `20.png` (frentes das cartas)
3. Configure em `js/styles.js`

Formato recomendado:
- Resolução: 400x600px
- Formato: PNG com transparência
- Tamanho: < 200KB por imagem

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase Realtime Database
- **Autenticação**: Firebase Authentication
- **Hosting**: Firebase Hosting / Vercel

## 📝 Futuras Melhorias

- [ ] Sistema de ranking global
- [ ] Chat entre jogadores
- [ ] Mais de 2 jogadores por sala
- [ ] Torneios
- [ ] Sistema de conquistas
- [ ] Modo offline vs IA
- [ ] Marketplace de estilos
- [ ] Criador de estilos customizados

## 🐛 Troubleshooting

### Erro de autenticação
- Verifique as credenciais do Firebase
- Confirme que Authentication está ativado
- Verifique o domínio autorizado

### Jogo não sincroniza
- Verifique as regras do Realtime Database
- Confirme conexão com internet
- Verifique console do navegador para erros

### Estilos não aparecem
- Limpe cache do navegador
- Verifique caminhos dos arquivos CSS
- Confirme que os arquivos foram carregados

## 📄 Licença

Este projeto é um MVP educacional. Sinta-se livre para usar e modificar.

## 👤 Autor

Desenvolvido como projeto de demonstração de jogo multiplayer com Firebase.

---

**Divirta-se jogando! 🎴✨**
