# 🔥 COMANDOS FIREBASE CLI - REFERÊNCIA RÁPIDA

## 📦 Instalação

```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Verificar versão instalada
firebase --version
```

---

## 🔐 Autenticação

```bash
# Fazer login no Firebase
firebase login

# Fazer login com navegador específico
firebase login --no-localhost

# Logout
firebase logout

# Verificar usuário atual
firebase login:list
```

---

## 🚀 Inicialização de Projeto

```bash
# Inicializar Firebase no projeto atual
firebase init

# Inicializar apenas serviços específicos
firebase init hosting
firebase init database
firebase init storage
firebase init functions

# Listar projetos disponíveis
firebase projects:list

# Usar projeto específico
firebase use seu-projeto-id

# Adicionar novo projeto
firebase projects:create
```

---

## 🚢 Deploy (Publicação)

```bash
# Deploy completo (tudo)
firebase deploy

# Deploy apenas Hosting
firebase deploy --only hosting

# Deploy apenas Database Rules
firebase deploy --only database

# Deploy apenas Storage Rules
firebase deploy --only storage

# Deploy múltiplos serviços
firebase deploy --only hosting,database,storage

# Ver mudanças antes de fazer deploy
firebase deploy --dry-run
```

---

## 🔥 Emuladores (Teste Local)

```bash
# Iniciar todos os emuladores
firebase emulators:start

# Iniciar emuladores específicos
firebase emulators:start --only hosting
firebase emulators:start --only database
firebase emulators:start --only auth

# Iniciar com seed data (dados de teste)
firebase emulators:start --import=./firebase-data

# Exportar dados dos emuladores
firebase emulators:export ./firebase-data

# Interface dos emuladores
# Hosting: http://localhost:5000
# Emulator UI: http://localhost:4000
# Database: http://localhost:9000
# Auth: http://localhost:9099
```

---

## 💾 Realtime Database

```bash
# Obter dados do banco
firebase database:get /

# Obter dados de um caminho específico
firebase database:get /users

# Definir dados
firebase database:set /test "Hello World"

# Atualizar dados
firebase database:update /users/user123 '{"name":"João"}'

# Remover dados
firebase database:remove /test

# Deploy apenas das rules
firebase deploy --only database

# Obter regras atuais
firebase database:get --shallow
```

---

## 📦 Storage

```bash
# Deploy apenas das regras do Storage
firebase deploy --only storage

# Listar arquivos no Storage
firebase storage:list

# Baixar arquivo do Storage
firebase storage:download path/to/file.jpg

# Fazer upload de arquivo
firebase storage:upload local-file.jpg path/to/file.jpg
```

---

## 🌐 Hosting

```bash
# Deploy do site
firebase deploy --only hosting

# Servir site localmente
firebase serve

# Servir em porta específica
firebase serve --port 8080

# Servir apenas hosting
firebase serve --only hosting

# Ver domínios configurados
firebase hosting:sites:list

# Adicionar domínio customizado
firebase hosting:sites:create

# Ver histórico de deploys
firebase hosting:channel:list
```

---

## 📊 Logs e Debugging

```bash
# Ver logs de funções
firebase functions:log

# Ver logs em tempo real
firebase functions:log --follow

# Debug mode
firebase --debug deploy
```

---

## 👥 Gerenciamento de Usuários (Auth)

```bash
# Listar usuários (primeiro é necessário ter firebase-admin)
# Use Firebase Console para gerenciar usuários:
# https://console.firebase.google.com/project/SEU_PROJETO/authentication/users
```

---

## 🔧 Configuração

```bash
# Ver configuração atual
firebase list

# Ver informações do projeto
firebase apps:list

# Adicionar configuração do projeto ao código
firebase apps:sdkconfig

# Obter configuração web
firebase apps:sdkconfig web
```

---

## 📁 Estrutura de Arquivos do Projeto

```
virada-da-sorte/
├── .firebaserc          # Configuração de projetos
├── firebase.json        # Configuração geral
├── database.rules.json  # Regras do Realtime Database
├── storage.rules        # Regras do Storage
├── .firebase/           # Cache (não commitar)
└── public/              # Arquivos para hosting
    ├── index.html
    ├── game.html
    ├── lobby.html
    └── ...
```

---

## 🚨 Comandos de Emergência

```bash
# Parar todos os emuladores
Ctrl + C (terminal)

# Limpar cache do Firebase
rm -rf .firebase/

# Reinstalar Firebase CLI
npm uninstall -g firebase-tools
npm install -g firebase-tools

# Forçar reinstalação de dependências
npm cache clean --force
npm install -g firebase-tools --force
```

---

## 🎯 Comandos Mais Usados (Workflow Comum)

```bash
# 1. Login
firebase login

# 2. Selecionar projeto
firebase use seu-projeto

# 3. Testar localmente
firebase emulators:start

# 4. Deploy das regras
firebase deploy --only database,storage

# 5. Deploy do site
firebase deploy --only hosting

# 6. Deploy completo
firebase deploy
```

---

## 📝 Exemplos Práticos

### Teste Local Completo
```bash
# Terminal 1 - Iniciar emuladores
firebase emulators:start

# Terminal 2 - Servir hosting
firebase serve
```

### Deploy Passo a Passo
```bash
# 1. Testar regras localmente
firebase emulators:start --only database,storage

# 2. Deploy das regras
firebase deploy --only database
firebase deploy --only storage

# 3. Testar hosting localmente
firebase serve --only hosting

# 4. Deploy do hosting
firebase deploy --only hosting
```

### Atualizar Regras Rapidamente
```bash
# Editar database.rules.json
# Depois:
firebase deploy --only database
```

---

## 🔗 URLs Úteis

```bash
# Console do Firebase
https://console.firebase.google.com/

# Documentação
https://firebase.google.com/docs

# Status do Firebase
https://status.firebase.google.com/

# Seu Hosting URL
https://SEU-PROJETO.web.app
https://SEU-PROJETO.firebaseapp.com
```

---

## 💡 Dicas

1. **Use emuladores** para testar antes de fazer deploy
2. **Sempre faça backup** dos dados antes de modificar rules
3. **Use `--dry-run`** para ver o que será deployado
4. **Versione suas rules** no Git
5. **Teste rules localmente** antes de publicar
6. **Use `firebase serve`** para desenvolvimento local
7. **Configure CI/CD** para deploys automáticos

---

## 🆘 Ajuda

```bash
# Ver comandos disponíveis
firebase --help

# Ajuda para comando específico
firebase deploy --help
firebase init --help

# Versão detalhada (debug)
firebase --version --debug
```

---

**🎉 Salve este arquivo para referência rápida!**
