# 🔥 CONFIGURAÇÃO DO FIREBASE - GUIA COMPLETO

## 📋 Pré-requisitos
- Conta Google/Gmail
- Projeto Firebase criado no [Firebase Console](https://console.firebase.google.com/)

---

## 🚀 PASSO 1: Criar/Configurar Projeto no Firebase Console

### 1.1 Criar Novo Projeto
1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Nome do projeto: `virada-da-sorte` (ou nome de sua preferência)
4. (Opcional) Habilite Google Analytics
5. Clique em **"Criar projeto"**

### 1.2 Adicionar Aplicativo Web
1. No painel do projeto, clique no ícone **Web** `</>`
2. Apelido do app: `Virada da Sorte Web`
3. Marque: ☑️ **"Configure Firebase Hosting"**
4. Clique em **"Registrar app"**
5. **COPIE as credenciais** que aparecem na tela (você vai precisar delas!)

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 🔐 PASSO 2: Configurar Authentication (Autenticação)

### 2.1 Habilitar E-mail/Senha
1. No menu lateral, clique em **"Authentication"** (Autenticação)
2. Clique na aba **"Sign-in method"**
3. Clique em **"Email/Password"** (E-mail/Senha)
4. Habilite: ☑️ **"Email/Password"**
5. Clique em **"Save"**

### 2.2 (Opcional) Configurar Domínios Autorizados
1. Na aba **"Settings"** > **"Authorized domains"**
2. Adicione seus domínios (localhost já vem habilitado)
3. Se usar Vercel/outro host, adicione: `seu-app.vercel.app`

---

## 💾 PASSO 3: Configurar Realtime Database

### 3.1 Criar Database
1. No menu lateral, clique em **"Realtime Database"**
2. Clique em **"Create Database"** (Criar banco de dados)
3. Escolha localização: **United States** ou **Europe** (mais próximo de você)
4. Modo inicial: **"Start in test mode"** (trocaremos depois)
5. Clique em **"Enable"**

### 3.2 Aplicar Regras de Segurança
1. Clique na aba **"Rules"** (Regras)
2. **SUBSTITUA** todo o conteúdo pelo arquivo `database.rules.json` do projeto
3. Clique em **"Publish"** (Publicar)

**⚠️ IMPORTANTE:** As regras em `database.rules.json` do projeto já estão configuradas corretamente!

---

## 📦 PASSO 4: Configurar Storage (Armazenamento)

### 4.1 Criar Storage
1. No menu lateral, clique em **"Storage"**
2. Clique em **"Get started"** (Começar)
3. Modo inicial: **"Start in test mode"**
4. Escolha localização: mesma do Realtime Database
5. Clique em **"Done"**

### 4.2 Criar Estrutura de Pastas
Crie as seguintes pastas no Storage:
```
📁 style-packs/          (imagens dos pacotes de estilos)
📁 profile-pictures/     (fotos de perfil dos usuários)
📁 game-screenshots/     (capturas de tela de jogos)
```

### 4.3 Aplicar Regras de Segurança
1. Clique na aba **"Rules"** (Regras)
2. **SUBSTITUA** todo o conteúdo pelo arquivo `storage.rules` do projeto
3. Clique em **"Publish"**

---

## 🎨 PASSO 5: Popular Pacotes de Estilos (Opcional)

### 5.1 Adicionar Dados de Teste
Você pode adicionar dados manualmente via Firebase Console:

1. Vá em **"Realtime Database"**
2. Clique em ➕ ao lado da raiz
3. Nome do campo: `style-packs`
4. Use a estrutura de `FIREBASE_DATABASE_STRUCTURE.js` como referência

### 5.2 Exemplo de Pacote Gratuito
```json
{
  "style-packs": {
    "free-pack-01": {
      "id": "free-pack-01",
      "name": "Pacote Inicial",
      "description": "Estilos gratuitos para começar",
      "price": 0,
      "category": "free",
      "featured": false,
      "styles": {
        "neon-circuit": {
          "id": "neon-circuit",
          "name": "Neon Circuit"
        },
        "arcane-sigil": {
          "id": "arcane-sigil",
          "name": "Arcane Sigil"
        },
        "minimal-prime": {
          "id": "minimal-prime",
          "name": "Minimal Prime"
        },
        "flux-ember": {
          "id": "flux-ember",
          "name": "Flux Ember"
        }
      }
    }
  }
}
```

---

## 🔧 PASSO 6: Configurar Código do Projeto

### 6.1 Atualizar firebase.js
Edite o arquivo: `public/js/firebase.js`

**SUBSTITUA as credenciais de exemplo pelas suas:**
```javascript
const firebaseConfig = {
    apiKey: "COLE_SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

---

## 🚢 PASSO 7: Deploy (Opcional)

### 7.1 Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 7.2 Login no Firebase
```bash
firebase login
```

### 7.3 Inicializar Projeto
```bash
firebase init
```
- Selecione: Hosting, Database, Storage
- Use os arquivos existentes quando perguntado
- Public directory: `public`
- Single-page app: **Yes**

### 7.4 Deploy das Regras
```bash
firebase deploy --only database
firebase deploy --only storage
```

### 7.5 Deploy do Site
```bash
firebase deploy --only hosting
```

---

## ✅ PASSO 8: Testar Configuração

### 8.1 Teste Local
1. Abra o projeto localmente
2. Abra `index.html` no navegador
3. Tente criar uma conta
4. Verifique se aparece no Firebase Console > Authentication > Users

### 8.2 Verificar Console
- ✅ Authentication com usuários criados
- ✅ Realtime Database com dados de usuários em `/users`
- ✅ Storage com pastas criadas
- ✅ Regras publicadas e ativas

---

## 📊 ESTRUTURA FINAL DO FIREBASE

```
Firebase Project: virada-da-sorte
│
├── 🔐 Authentication
│   └── Email/Password habilitado
│
├── 💾 Realtime Database
│   ├── /users/{uid}
│   │   ├── uid, displayName, email
│   │   ├── selectedStyle
│   │   ├── unlockedStyles[]
│   │   ├── purchasedPacks/{}
│   │   └── stats/{}
│   │
│   ├── /style-packs/{packId}
│   │   ├── id, name, description
│   │   ├── price, category
│   │   └── styles/{}
│   │
│   └── /rooms/{roomId}
│       ├── id, name, host, status
│       ├── players/{}
│       └── gameState/{}
│
└── 📦 Storage
    ├── /style-packs/{packId}/
    ├── /profile-pictures/{uid}/
    └── /game-screenshots/{uid}/
```

---

## 🆘 Resolução de Problemas

### ❌ Erro: "Permission denied"
- Verifique se as regras foram publicadas corretamente
- Confirme que o usuário está autenticado

### ❌ Erro: "Firebase not defined"
- Verifique se os scripts do Firebase foram carregados no HTML
- Ordem correta: firebase-app.js → firebase-auth.js → firebase-database.js → firebase-storage.js

### ❌ Erro: "Network error"
- Verifique conexão com internet
- Confirme credenciais do firebaseConfig

### ❌ Dados não aparecem
- Verifique se as regras permitem leitura
- Use o Firebase Console para verificar se os dados existem
- Abra o DevTools Console para ver erros

---

## 📚 Recursos Úteis

- [Documentação Firebase](https://firebase.google.com/docs)
- [Console Firebase](https://console.firebase.google.com/)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Realtime Database Docs](https://firebase.google.com/docs/database)
- [Storage Docs](https://firebase.google.com/docs/storage)

---

## 🎯 Próximos Passos

Após configurar o Firebase:
1. ✅ Adicionar pacotes de estilos premium no database
2. ✅ Fazer upload das imagens no Storage
3. ✅ Implementar sistema de compras (se necessário)
4. ✅ Testar multiplayer com amigos
5. ✅ Configurar Analytics para métricas

**Pronto! Seu Firebase está configurado! 🎉**
