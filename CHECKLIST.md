# 🚀 CHECKLIST DE CONFIGURAÇÃO

Use este checklist para configurar o projeto passo a passo.

---

## ⬜ FASE 1: PRÉ-REQUISITOS

### 1.1 Instalar Node.js
- [ ] Baixar de: https://nodejs.org/ (versão LTS)
- [ ] Executar instalador
- [ ] Reiniciar terminal
- [ ] Testar: `node --version` e `npm --version`

---

## ⬜ FASE 2: FIREBASE CONSOLE

### 2.1 Criar Projeto
- [ ] Acessar: https://console.firebase.google.com/
- [ ] Criar novo projeto: "virada-da-sorte"
- [ ] Desabilitar Analytics (opcional)

### 2.2 Authentication
- [ ] Ir em Authentication > Get started
- [ ] Ativar método: E-mail/Senha
- [ ] Salvar

### 2.3 Realtime Database
- [ ] Ir em Realtime Database > Create database
- [ ] Escolher localização (us-central1)
- [ ] Modo: Teste (temporário)
- [ ] Ativar

### 2.4 Aplicar Regras de Segurança
- [ ] Na aba Rules do Database
- [ ] Copiar conteúdo de `database.rules.json`
- [ ] Colar no editor
- [ ] Publicar

### 2.5 Obter Credenciais
- [ ] Ir em Project Settings (ícone engrenagem)
- [ ] Rolar até "Your apps"
- [ ] Clicar em ícone Web `</>`
- [ ] Nome: "virada-da-sorte-web"
- [ ] Copiar objeto `firebaseConfig`

### 2.6 Inserir Credenciais
- [ ] Abrir `public/js/firebase.js`
- [ ] Colar suas credenciais
- [ ] Salvar arquivo

---

## ⬜ FASE 3: INSTALAÇÃO LOCAL

### 3.1 Instalar Firebase CLI
```powershell
npm install -g firebase-tools
```
- [ ] Comando executado
- [ ] Verificar: `firebase --version`

### 3.2 Login no Firebase
```powershell
firebase login
```
- [ ] Login realizado no navegador
- [ ] Autorização concedida

---

## ⬜ FASE 4: CONFIGURAR PROJETO

### 4.1 Inicializar Firebase
```powershell
cd "D:\Arquivos DEV\virada-da-sorte"
firebase init
```

- [ ] Selecionar: Hosting e Realtime Database
- [ ] Usar projeto existente: virada-da-sorte
- [ ] Database rules file: `database.rules.json`
- [ ] Public directory: `public`
- [ ] Single-page app: NO
- [ ] GitHub: NO
- [ ] Overwrite index.html: NO

---

## ⬜ FASE 5: TESTAR LOCALMENTE

### 5.1 Servir Local
```powershell
firebase serve
```
- [ ] Abrir: http://localhost:5000
- [ ] Criar conta de teste
- [ ] Fazer login
- [ ] Selecionar estilo
- [ ] Criar sala
- [ ] Testar jogo

### 5.2 Verificar Firebase Console
- [ ] Ver usuário em Authentication
- [ ] Ver dados em Realtime Database

---

## ⬜ FASE 6: DEPLOY FIREBASE

### 6.1 Deploy
```powershell
firebase deploy
```
- [ ] Deploy completo
- [ ] Copiar URL fornecido

### 6.2 Autorizar Domínio
- [ ] Authentication > Settings > Authorized domains
- [ ] Adicionar: seu-projeto.web.app
- [ ] Salvar

### 6.3 Testar Online
- [ ] Acessar URL do hosting
- [ ] Testar todas funcionalidades

---

## ⬜ FASE 7: DEPLOY VERCEL (OPCIONAL)

### 7.1 Instalar Vercel CLI
```powershell
npm install -g vercel
```
- [ ] Instalado

### 7.2 Login
```powershell
vercel login
```
- [ ] Login realizado

### 7.3 Deploy
```powershell
vercel
```
- [ ] Projeto configurado
- [ ] Deploy completo

```powershell
vercel --prod
```
- [ ] Deploy em produção
- [ ] URL obtido

### 7.4 Autorizar Domínio Vercel
- [ ] Adicionar domínio Vercel em Firebase Auth
- [ ] Testar URL do Vercel

---

## ✅ CONFIGURAÇÃO COMPLETA!

### URLs Importantes:
- **Firebase Console**: https://console.firebase.google.com/
- **Seu App**: ___________________________
- **Docs**: Ver `CONFIGURACAO_PASSO_A_PASSO.md`

### Comandos Úteis:
```powershell
# Testar local
firebase serve

# Deploy
firebase deploy

# Logs
firebase serve --debug

# Ver projetos
firebase projects:list
```

---

## 🆘 PRECISA DE AJUDA?

1. ❌ **Erro no Node**: Reinstale Node.js
2. ❌ **Permission denied no DB**: Verifique rules
3. ❌ **Domain not authorized**: Adicione em Auth settings
4. ❌ **Deploy falha**: `firebase login --reauth`
5. ❌ **Estilos não carregam**: Ctrl+Shift+R (hard refresh)

Ver guia completo: `CONFIGURACAO_PASSO_A_PASSO.md`

---

**Data da configuração**: ___/___/______
**Configurado por**: _________________
