# 🚀 Guia Completo de Configuração - Firebase + Vercel

## ✅ PASSO 1: Instalar Node.js

### 1.1 Download
1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (recomendada)
3. Execute o instalador
4. Durante instalação, marque: "Automatically install necessary tools"
5. Reinicie o terminal após instalação

### 1.2 Verificar Instalação
Abra um novo PowerShell e execute:
```powershell
node --version
npm --version
```

Deve mostrar as versões instaladas (ex: v20.x.x e 10.x.x)

---

## 🔥 PASSO 2: Configurar Firebase

### 2.1 Criar Projeto no Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"** ou **"Add project"**
3. Nome do projeto: `virada-da-sorte` (ou nome de sua escolha)
4. Desabilite Google Analytics (opcional)
5. Clique em **"Criar projeto"**
6. Aguarde alguns segundos até o projeto ser criado

### 2.2 Ativar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Vamos começar"** ou **"Get started"**
3. Na aba **"Sign-in method"**:
   - Clique em **"E-mail/Senha"** ou **"Email/Password"**
   - **Ative** a opção "E-mail/Senha"
   - Deixe "Link de e-mail" desabilitado
   - Clique em **"Salvar"**

### 2.3 Ativar Realtime Database

1. No menu lateral, clique em **"Realtime Database"**
2. Clique em **"Criar banco de dados"** ou **"Create database"**
3. Localização: Escolha a mais próxima (ex: **us-central1**)
4. Regras de segurança: Selecione **"Modo de teste"** (temporário)
5. Clique em **"Ativar"**

### 2.4 Configurar Regras de Segurança

1. Na página do Realtime Database, clique na aba **"Regras"** ou **"Rules"**
2. **COPIE TODO** o conteúdo do arquivo `database.rules.json` do seu projeto
3. **COLE** no editor de regras do Firebase
4. Clique em **"Publicar"** ou **"Publish"**

⚠️ **IMPORTANTE**: Nunca deixe o database em "modo de teste" em produção!

### 2.5 Obter Credenciais do Firebase

1. No menu lateral, clique no **ícone de engrenagem** ⚙️
2. Clique em **"Configurações do projeto"** ou **"Project settings"**
3. Role até **"Seus apps"** ou **"Your apps"**
4. Clique no ícone **Web** `</>`
5. Apelido do app: `virada-da-sorte-web`
6. **NÃO** marque Firebase Hosting ainda
7. Clique em **"Registrar app"**
8. **COPIE** todo o objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "seu-projeto.firebaseapp.com",
  databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 2.6 Inserir Credenciais no Projeto

1. Abra o arquivo: `public/js/firebase.js`
2. Localize o objeto `firebaseConfig`
3. **SUBSTITUA** pelas credenciais que você copiou
4. **SALVE** o arquivo

---

## 📦 PASSO 3: Instalar Firebase CLI

### 3.1 Instalar Globalmente

No PowerShell (como Administrador se necessário):

```powershell
npm install -g firebase-tools
```

Aguarde a instalação completar (pode levar alguns minutos).

### 3.2 Verificar Instalação

```powershell
firebase --version
```

Deve mostrar a versão instalada (ex: 13.x.x)

### 3.3 Fazer Login no Firebase

```powershell
firebase login
```

- Isso abrirá seu navegador
- Faça login com sua conta Google
- Autorize o Firebase CLI
- Volte ao terminal

---

## 🎮 PASSO 4: Inicializar Firebase no Projeto

### 4.1 Navegar até a Pasta do Projeto

```powershell
cd "D:\Arquivos DEV\virada-da-sorte"
```

### 4.2 Inicializar Firebase

```powershell
firebase init
```

### 4.3 Responder as Perguntas

**"Which Firebase features do you want to set up?"**
- Use as setas ↑↓ para navegar
- Use ESPAÇO para selecionar
- Selecione:
  - ✅ **Hosting**
  - ✅ **Realtime Database**
- Pressione ENTER

**"Please select an option:"**
- Selecione: **"Use an existing project"**
- Pressione ENTER

**"Select a default Firebase project:"**
- Selecione: **virada-da-sorte** (ou o nome que você deu)
- Pressione ENTER

**"What file should be used for Realtime Database Rules?"**
- Digite: `database.rules.json`
- Pressione ENTER

**"What do you want to use as your public directory?"**
- Digite: `public`
- Pressione ENTER

**"Configure as a single-page app (rewrite all urls to /index.html)?"**
- Digite: `N` (não)
- Pressione ENTER

**"Set up automatic builds and deploys with GitHub?"**
- Digite: `N` (não)
- Pressione ENTER

**"File public/index.html already exists. Overwrite?"**
- Digite: `N` (não)
- Pressione ENTER

✅ Firebase initialization complete!

---

## 🧪 PASSO 5: Testar Localmente

### 5.1 Servir Localmente

```powershell
firebase serve
```

Ou, se preferir porta específica:

```powershell
firebase serve --port 5000
```

### 5.2 Acessar no Navegador

Abra: http://localhost:5000

### 5.3 Testar Funcionalidades

1. ✅ **Criar conta**: Registre um novo usuário
2. ✅ **Fazer login**: Entre com a conta criada
3. ✅ **Lobby**: Verifique se os estilos aparecem
4. ✅ **Criar sala**: Crie uma sala de teste
5. ✅ **Segundo jogador**: Abra em aba anônima e entre na sala
6. ✅ **Jogar**: Faça uma partida completa

### 5.4 Verificar no Firebase Console

1. Vá em **Authentication** > **Users**
   - Deve aparecer o usuário criado
2. Vá em **Realtime Database** > **Data**
   - Deve ter os dados de `users` e `rooms`

---

## 🚀 PASSO 6: Deploy no Firebase Hosting

### 6.1 Fazer Deploy

```powershell
firebase deploy
```

Ou apenas hosting:

```powershell
firebase deploy --only hosting
```

### 6.2 Aguardar Deploy

O processo leva 1-2 minutos. Você verá:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/virada-da-sorte
Hosting URL: https://virada-da-sorte.web.app
```

### 6.3 Configurar Domínio Autorizado

1. No Firebase Console, vá em **Authentication** > **Settings**
2. Aba **"Authorized domains"**
3. Clique em **"Add domain"**
4. Adicione: `virada-da-sorte.web.app` (ou seu domínio)
5. Salve

### 6.4 Testar Online

Acesse o URL fornecido (ex: https://virada-da-sorte.web.app)

---

## 🎨 PASSO 7: Deploy no Vercel (Alternativa)

### 7.1 Criar Conta no Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Faça login com GitHub, GitLab ou E-mail

### 7.2 Instalar Vercel CLI

```powershell
npm install -g vercel
```

### 7.3 Fazer Login

```powershell
vercel login
```

Siga as instruções no terminal.

### 7.4 Configurar Projeto

Crie o arquivo `vercel.json` na raiz (já vou criar para você)

### 7.5 Fazer Deploy

```powershell
vercel
```

Responda as perguntas:
- **Set up and deploy?** `Y`
- **Which scope?** Selecione sua conta
- **Link to existing project?** `N`
- **Project name:** `virada-da-sorte`
- **In which directory is your code located?** `./`
- **Want to override the settings?** `N`

### 7.6 Deploy em Produção

```powershell
vercel --prod
```

Você receberá um URL: https://virada-da-sorte.vercel.app

### 7.7 Configurar Domínio no Firebase

Adicione o domínio Vercel em **Authentication** > **Authorized domains**

---

## ⚙️ PASSO 8: Configurações Adicionais

### 8.1 Variáveis de Ambiente (Opcional)

Se quiser proteger suas credenciais Firebase:

1. Crie arquivo `.env` (não comitar)
2. Mova credenciais para lá
3. Use `dotenv` para carregar

### 8.2 Custom Domain (Opcional)

#### No Firebase:
1. Firebase Console > Hosting > Add custom domain
2. Siga instruções DNS

#### No Vercel:
1. Vercel Dashboard > Project > Settings > Domains
2. Adicione seu domínio
3. Configure DNS

---

## 🐛 Solução de Problemas

### Erro: "Permission denied"
- Verifique se aplicou as regras do `database.rules.json`
- Confirme que usuário está autenticado

### Erro: "Domain not authorized"
- Adicione o domínio em Authentication > Authorized domains

### Firebase serve não funciona
- Verifique se está na pasta correta
- Tente: `firebase serve --port 5001`

### Deploy falha
- Verifique conexão com internet
- Faça login novamente: `firebase login --reauth`

### Estilos não carregam
- Limpe cache do navegador (Ctrl+Shift+R)
- Verifique caminhos dos arquivos CSS

---

## 📊 Monitoramento

### Firebase Console
- **Authentication**: Ver usuários
- **Realtime Database**: Ver dados em tempo real
- **Hosting**: Ver métricas de tráfego
- **Usage**: Monitorar limites do plano gratuito

### Limites do Plano Gratuito (Spark)
- **Authentication**: Ilimitado
- **Realtime Database**: 
  - 1 GB armazenamento
  - 10 GB/mês download
  - 100 conexões simultâneas
- **Hosting**: 10 GB/mês transfer

Para mais: Upgrade para **Blaze Plan** (pay-as-you-go)

---

## 🎉 Pronto!

Seu jogo está online e funcionando!

### URLs importantes:
- **Firebase Console**: https://console.firebase.google.com/project/virada-da-sorte
- **Seu App (Firebase)**: https://virada-da-sorte.web.app
- **Seu App (Vercel)**: https://virada-da-sorte.vercel.app (se usar)

### Comandos úteis:

```powershell
# Ver logs do Firebase
firebase serve --debug

# Atualizar apenas regras do database
firebase deploy --only database

# Atualizar apenas hosting
firebase deploy --only hosting

# Ver projetos Firebase
firebase projects:list

# Trocar de projeto
firebase use [project-id]
```

---

## 📞 Suporte

- [Documentação Firebase](https://firebase.google.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)

---

**Boa sorte com seu projeto! 🎮✨**
