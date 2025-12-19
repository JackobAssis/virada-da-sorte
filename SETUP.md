# Virada da Sorte - Setup Firebase

## Instruções Detalhadas de Configuração

### 1️⃣ Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `virada-da-sorte` (ou o nome que preferir)
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2️⃣ Configurar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em "Vamos começar"
3. Selecione **E-mail/Senha**
4. Ative a opção
5. Clique em "Salvar"

### 3️⃣ Configurar Realtime Database

1. No menu lateral, clique em **Realtime Database**
2. Clique em "Criar banco de dados"
3. Escolha localização: **Estados Unidos (us-central1)** ou mais próximo
4. Modo de segurança: **Modo de teste** (temporário)
5. Clique em "Ativar"

### 4️⃣ Aplicar Regras de Segurança

1. Na aba **Regras** do Realtime Database
2. Copie o conteúdo do arquivo `database.rules.json`
3. Cole no editor de regras
4. Clique em "Publicar"

### 5️⃣ Obter Credenciais

1. No menu lateral, clique no ícone de **engrenagem** > Configurações do projeto
2. Role até "Seus apps"
3. Clique no ícone **</>** (Web)
4. Apelido do app: `virada-da-sorte-web`
5. **NÃO** marque Firebase Hosting ainda
6. Clique em "Registrar app"
7. **COPIE** o objeto `firebaseConfig`

### 6️⃣ Inserir Credenciais no Projeto

1. Abra o arquivo: `public/js/firebase.js`
2. Substitua o objeto `firebaseConfig` pelas suas credenciais
3. Exemplo:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyB...",
    authDomain: "virada-da-sorte.firebaseapp.com",
    databaseURL: "https://virada-da-sorte-default-rtdb.firebaseio.com",
    projectId: "virada-da-sorte",
    storageBucket: "virada-da-sorte.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

4. Salve o arquivo

### 7️⃣ Configurar Domínios Autorizados

1. No Firebase Console, vá em **Authentication** > **Settings**
2. Aba **Authorized domains**
3. Por padrão já vem `localhost`
4. Se for fazer deploy, adicione seu domínio aqui depois

### 8️⃣ Testar Localmente

#### Opção A: Firebase Hosting (Recomendado)

```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Login no Firebase
firebase login

# Inicializar projeto (na pasta raiz)
firebase init

# Selecione:
# - Hosting
# - Realtime Database
# - Use existing project: virada-da-sorte
# - Public directory: public
# - Single-page app: No
# - Database rules: database.rules.json

# Testar localmente
firebase serve
# Acesse: http://localhost:5000
```

#### Opção B: Servidor HTTP Simples

```bash
# Usando Python (se tiver instalado)
cd public
python -m http.server 8080

# OU usando Node.js
npx http-server public -p 8080

# Acesse: http://localhost:8080
```

### 9️⃣ Testar Funcionalidades

1. **Criar conta**: Teste o registro de novo usuário
2. **Login**: Faça login com a conta criada
3. **Lobby**: Verifique se estilos aparecem
4. **Criar sala**: Crie uma sala de teste
5. **Abra em outra aba**: Simule segundo jogador
6. **Entre na sala**: Jogue uma partida completa

### 🔟 Deploy em Produção

#### Firebase Hosting

```bash
# Na pasta raiz do projeto
firebase deploy

# Apenas hosting
firebase deploy --only hosting

# Hosting + Database rules
firebase deploy --only hosting,database
```

Após deploy, seu app estará em:
`https://virada-da-sorte.web.app`

#### Vercel (Alternativa)

1. Instale Vercel CLI: `npm i -g vercel`
2. Na pasta raiz: `vercel`
3. Siga as instruções
4. Configure `public` como diretório público

### 🔒 Segurança em Produção

1. **Nunca** deixe database em "modo de teste"
2. Use as regras do arquivo `database.rules.json`
3. Adicione domínio de produção em "Authorized domains"
4. Monitore uso no Firebase Console

### 📊 Monitoramento

No Firebase Console você pode ver:

- **Authentication**: Usuários cadastrados
- **Realtime Database**: Dados em tempo real
- **Usage**: Uso de leitura/escrita
- **Hosting**: Tráfego (se usar Firebase Hosting)

### ⚠️ Limites Gratuitos (Spark Plan)

- **Authentication**: Ilimitado
- **Realtime Database**: 
  - 1 GB armazenamento
  - 10 GB/mês download
  - 100 conexões simultâneas
- **Hosting**: 10 GB/mês transfer

Para mais: Upgrade para Blaze Plan (pay-as-you-go)

### 🐛 Problemas Comuns

#### "Permission denied" no Database
- Verifique se aplicou as regras corretamente
- Confirme que usuário está autenticado

#### "Domain not authorized"
- Adicione o domínio em Authentication > Authorized domains

#### Estilos não carregam
- Verifique caminhos dos arquivos CSS
- Limpe cache: Ctrl+Shift+R

#### Firebase não inicializa
- Verifique credenciais em `firebase.js`
- Abra Console do navegador (F12) para ver erros

### 📞 Suporte

- [Documentação Firebase](https://firebase.google.com/docs)
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Status](https://status.firebase.google.com/)

---

**Pronto! Seu jogo está configurado e funcionando! 🎮✨**
