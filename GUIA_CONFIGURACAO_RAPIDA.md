# 🚀 GUIA DE CONFIGURAÇÃO RÁPIDA - FIREBASE

## 📍 VOCÊ ESTÁ AQUI
Seu Firebase precisa de credenciais para funcionar.

---

## OPÇÃO 1: JÁ TENHO PROJETO FIREBASE ✅

### PASSO 1: Abrir Console
```
1. Abra: https://console.firebase.google.com/
2. Faça login com sua conta Google
3. Você verá seus projetos (ou lista vazia)
```

### PASSO 2: Selecionar Projeto
```
Clique no projeto "virada-da-sorte" (ou o nome que você deu)
```

### PASSO 3: Ir em Configurações
```
1. Clique no ícone de ENGRENAGEM ⚙️ (canto superior esquerdo)
2. Clique em "Configurações do projeto"
3. Role até a seção "Seus apps" ou "Your apps"
```

### PASSO 4: Ver Credenciais

**Se você VÊ um app Web:**
```
1. Role até ver o código JavaScript
2. Copie TUDO dentro de firebaseConfig { ... }
```

**Se NÃO vê nenhum app:**
```
1. Clique em "</>" (ícone Web)
2. Digite um nome: "Virada da Sorte Web"
3. Marque ☑️ "Firebase Hosting"
4. Clique em "Registrar app"
5. COPIE as credenciais que aparecerem
```

### PASSO 5: Colar no Código

Abra o arquivo: `public/js/firebase.js`

**Procure estas linhas (cerca da linha 8-15):**
```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",          // ← SUBSTITUIR
    authDomain: "seu-projeto.firebaseapp.com",
    databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

**Cole suas credenciais reais do Firebase Console.**

### PASSO 6: Salvar e Testar
```
1. Salve o arquivo (Ctrl+S)
2. Recarregue a página no navegador (F5)
3. Tente criar uma conta
```

---

## OPÇÃO 2: NÃO TENHO PROJETO ❌

### PASSO 1: Criar Projeto
```
1. Abra: https://console.firebase.google.com/
2. Clique em "Adicionar projeto" ou "Add project"
3. Nome: virada-da-sorte
4. Continue
```

### PASSO 2: Google Analytics (Opcional)
```
1. Pode desabilitar se quiser mais rápido
2. Ou habilitar para ver estatísticas depois
3. Continue
```

### PASSO 3: Aguardar Criação
```
Aguarde ~30 segundos enquanto Firebase cria o projeto
```

### PASSO 4: Adicionar App Web
```
1. Na tela inicial do projeto, clique em "</>" (Web)
2. Nome do app: "Virada da Sorte Web"
3. Marque ☑️ "Firebase Hosting"
4. Clique em "Registrar app"
```

### PASSO 5: Copiar Credenciais
```
Você verá algo assim:

const firebaseConfig = {
  apiKey: "AIzaSyABC123XYZ789...",
  authDomain: "virada-da-sorte-abc123.firebaseapp.com",
  databaseURL: "https://virada-da-sorte-abc123-default-rtdb.firebaseio.com",
  projectId: "virada-da-sorte-abc123",
  storageBucket: "virada-da-sorte-abc123.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};

COPIE TODO ESTE BLOCO!
```

### PASSO 6: Colar no Código
```
1. Abra: public/js/firebase.js
2. Localize o firebaseConfig (linhas 8-15)
3. SUBSTITUA tudo dentro das { }
4. Salve (Ctrl+S)
```

### PASSO 7: Habilitar Serviços

#### 7.1 Authentication
```
1. No menu lateral, clique em "Authentication"
2. Clique em "Get started" ou "Começar"
3. Clique em "Email/Password"
4. Ative o primeiro switch (Email/Password)
5. Clique em "Save" ou "Salvar"
```

#### 7.2 Realtime Database
```
1. No menu lateral, clique em "Realtime Database"
2. Clique em "Create Database"
3. Localização: United States ou sua região
4. Modo: "Start in test mode" (trocaremos depois)
5. Clique em "Enable"
```

#### 7.3 Storage
```
1. No menu lateral, clique em "Storage"
2. Clique em "Get started"
3. Modo: "Start in test mode"
4. Mesma localização do Database
5. Clique em "Done"
```

### PASSO 8: Publicar Regras de Segurança

No terminal, execute:
```bash
# Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# Fazer login
firebase login

# Inicializar projeto
firebase init

# Selecione:
# - Hosting
# - Database
# - Storage

# Quando perguntar "What do you want to use as your public directory?"
# Responda: public

# Quando perguntar "Configure as a single-page app?"
# Responda: Yes

# Quando perguntar sobre sobrescrever arquivos
# Responda: No (para não perder seus arquivos)

# Deploy das regras
firebase deploy --only database,storage
```

---

## ✅ TESTE FINAL

### 1. Teste Visual
```
Abra no navegador: public/firebase-test.html

Deve mostrar:
✅ Inicialização do Firebase
✅ Firebase Authentication
✅ Realtime Database
✅ Firebase Storage
✅ Database Rules
```

### 2. Teste de Conta
```
1. Abra: public/index.html
2. Clique em "Registrar"
3. Preencha os campos:
   - Nome: Teste
   - Email: teste@teste.com
   - Senha: 123456
4. Clique em "Criar Conta"
5. Deve redirecionar para lobby.html
```

### 3. Verificar no Console
```
1. Volte ao Firebase Console
2. Clique em "Authentication" no menu lateral
3. Você deve ver o usuário "teste@teste.com" criado
```

---

## 🆘 PROBLEMAS COMUNS

### ❌ "api-key-not-valid"
**Causa:** Credenciais não foram coladas corretamente
**Solução:** Verifique se copiou TODO o firebaseConfig

### ❌ "Permission denied"
**Causa:** Regras não foram publicadas
**Solução:** Execute `firebase deploy --only database,storage`

### ❌ "firebase.storage is not a function"
**Causa:** Script do Storage não foi carregado
**Solução:** ✅ JÁ CORRIGIDO! Recarregue a página

### ❌ "Database not found"
**Causa:** Realtime Database não foi criado
**Solução:** Vá em Realtime Database no Console e crie

### ❌ "Storage bucket not found"
**Causa:** Storage não foi habilitado
**Solução:** Vá em Storage no Console e habilite

---

## 📞 PRECISA DE AJUDA?

**Qual é seu problema específico?**

1. "Não consigo encontrar as credenciais"
   → Verifique se está em "Configurações do projeto" > "Seus apps"

2. "Não sei se criei o projeto direito"
   → Liste seus projetos em: https://console.firebase.google.com/

3. "As credenciais não funcionam"
   → Copie TUDO de dentro do firebaseConfig, incluindo as aspas

4. "Não entendi o passo X"
   → Me diga qual passo e te explico melhor!

---

## 🎯 RESUMO - 3 PASSOS ESSENCIAIS

```
1. Firebase Console → Copiar credenciais
2. public/js/firebase.js → Colar credenciais
3. Recarregar página → Testar

⏱️ Tempo: 5-10 minutos
```

**🚀 Você está quase lá! Qual passo você está agora?**
