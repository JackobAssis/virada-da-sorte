# ✅ Checklist de Teste - Responsividade dos Botões

## 📱 Página: index.html (Login/Registro)

### Formulário de Login
- [ ] **Campo Email** - aceita input
- [ ] **Campo Senha** - aceita input
- [ ] **Botão "Entrar"** - executa login
- [ ] **Enter no campo senha** - submete formulário
- [ ] **Link "Registrar"** - muda para formulário de registro
- [ ] **Loading spinner** - aparece durante requisição
- [ ] **Mensagem de erro** - exibe erros de autenticação

### Formulário de Registro
- [ ] **Campo Nome** - aceita input (min 3 caracteres)
- [ ] **Campo Email** - aceita input (formato válido)
- [ ] **Campo Senha** - aceita input (min 6 caracteres)
- [ ] **Botão "Criar Conta"** - cria nova conta
- [ ] **Enter no campo senha** - submete formulário
- [ ] **Link "Entrar"** - volta para formulário de login
- [ ] **Validação** - impede campos vazios

---

## 🎮 Página: lobby.html (Lobby)

### Seção: Modos de Jogo
- [ ] **Card "Casual"** - vai para seleção de estilo
- [ ] **Card "Ranqueado"** - exibe "Em breve"
- [ ] **Card "Sala Privada"** - vai para seleção de estilo
- [ ] **Card "Treino"** - exibe "Em breve"
- [ ] **Hover nos cards** - animação visual
- [ ] **Cards bloqueados** - não são clicáveis

### Seção: Seleção de Estilo
- [ ] **Botão "← Voltar"** - retorna aos modos
- [ ] **Grid de estilos** - renderiza 4 estilos gratuitos
- [ ] **Click em estilo desbloqueado** - abre preview
- [ ] **Click em estilo bloqueado** - exibe alerta de preço
- [ ] **Estilo selecionado** - tem borda destacada
- [ ] **Botão "Continuar"** - vai para lista de salas

### Modal: Preview de Estilo
- [ ] **Card de preview** - mostra estilo aplicado
- [ ] **Nome do estilo** - exibe corretamente
- [ ] **Botão "Selecionar"** - salva estilo no Firebase
- [ ] **Botão "Fechar"** - fecha modal
- [ ] **Click fora do modal** - não fecha (segurança)

### Seção: Lista de Salas
- [ ] **Botão "← Voltar"** - retorna aos estilos
- [ ] **Botão "Criar Sala"** - abre modal de criação
- [ ] **Botão "Atualizar"** - recarrega lista
- [ ] **Lista de salas** - atualiza em tempo real
- [ ] **Botão "Entrar" em sala** - adiciona jogador e redireciona
- [ ] **Salas cheias** - não aparecem na lista

### Modal: Criar Sala
- [ ] **Campo nome da sala** - aceita até 20 caracteres
- [ ] **Botão "Criar"** - cria sala no Firebase
- [ ] **Botão "Cancelar"** - fecha modal sem criar
- [ ] **Enter no campo** - NÃO submete (opcional)
- [ ] **Validação** - impede nome vazio

### Header do Lobby
- [ ] **Nome do usuário** - exibe displayName
- [ ] **Botão "Sair"** - faz logout e volta para login

---

## 🎯 Página: game.html (Jogo)

### Header do Jogo
- [ ] **Botão "Sair da Sala"** - remove jogador e volta ao lobby
- [ ] **Nome da sala** - exibe corretamente
- [ ] **Indicador de turno** - mostra "Sua vez" ou "Vez do oponente"
- [ ] **Timer** - conta de 30 a 0
- [ ] **Timer < 5s** - fica vermelho e pulsa

### Área de Jogadores
- [ ] **Player 1 Info** - nome e pontuação
- [ ] **Player 2 Info** - nome e pontuação
- [ ] **Jogador ativo** - tem borda destacada
- [ ] **Atualização em tempo real** - via Firebase

### Tabuleiro
- [ ] **Pilha do jogador** - renderiza corretamente
- [ ] **Pilha do oponente** - renderiza corretamente
- [ ] **Carta do topo** - pode ser clicada (se for seu turno)
- [ ] **Hover na carta** - efeito visual de elevação
- [ ] **Click na carta** - executa `revealTopCard()`
- [ ] **Carta revelada** - mostra símbolo e estilo
- [ ] **Contador de cartas** - atualiza corretamente

### Mensagens
- [ ] **"Carta sua!"** - aparece ao coletar
- [ ] **"Carta do oponente!"** - aparece ao transferir
- [ ] **"Aguarde sua vez"** - aparece ao clicar fora do turno
- [ ] **"Tempo esgotado"** - aparece quando timer zera
- [ ] **"Oponente desconectado"** - aparece ao detectar desconexão
- [ ] **Mensagem desaparece** - após 2 segundos

### Modal: Fim de Jogo
- [ ] **Título** - "Você venceu!" ou "Você perdeu"
- [ ] **Mensagem** - nome do vencedor
- [ ] **Scores finais** - exibidos corretamente
- [ ] **Botão "Voltar ao Lobby"** - redireciona
- [ ] **Estatísticas** - atualizadas no Firebase

---

## 🔥 Testes de Integração

### Fluxo Completo: Novo Usuário
1. [ ] Abrir index.html
2. [ ] Clicar "Registrar"
3. [ ] Preencher dados
4. [ ] Criar conta → redireciona para lobby
5. [ ] Ver tela de modos de jogo
6. [ ] Clicar "Casual"
7. [ ] Ver grid de estilos gratuitos
8. [ ] Selecionar "Neon Circuit"
9. [ ] Clicar "Continuar"
10. [ ] Ver lista de salas vazia
11. [ ] Clicar "Criar Sala"
12. [ ] Digitar nome
13. [ ] Criar sala → redireciona para game.html
14. [ ] Ver "Aguardando oponente..."

### Fluxo Completo: Segundo Jogador
1. [ ] Login com outra conta
2. [ ] Escolher modo "Casual"
3. [ ] Escolher estilo diferente
4. [ ] Ver sala criada na lista
5. [ ] Clicar "Entrar"
6. [ ] Jogo inicia automaticamente
7. [ ] Ver pilhas distribuídas
8. [ ] Ver indicador de turno

### Fluxo Completo: Partida
1. [ ] Jogador 1 revela carta
2. [ ] Se for sua: mantém turno
3. [ ] Se for do oponente: passa turno
4. [ ] Timer funciona
5. [ ] Cartas transferem corretamente
6. [ ] Pontuação atualiza
7. [ ] Primeiro a 10 cartas vence
8. [ ] Modal de vitória aparece
9. [ ] Voltar ao lobby funciona

---

## 🐛 Testes de Erro

### Tratamento de Erros
- [ ] **Login com credenciais erradas** - exibe erro
- [ ] **Registro com email existente** - exibe erro
- [ ] **Criar sala sem nome** - exibe alerta
- [ ] **Entrar em sala cheia** - exibe alerta
- [ ] **Click em estilo bloqueado** - exibe preço
- [ ] **Revelar carta fora do turno** - exibe mensagem
- [ ] **Desconexão do Firebase** - não quebra aplicação
- [ ] **F5 durante jogo** - reconecta corretamente

### Casos Extremos
- [ ] **Nenhuma sala disponível** - exibe mensagem
- [ ] **Pilha vazia** - exibe "Pilha vazia"
- [ ] **Tempo de timer zerado** - auto-revela
- [ ] **Ambos jogadores revelam simultaneamente** - transaction resolve
- [ ] **Jogador sai durante partida** - outro jogador notificado
- [ ] **Modal aberto + F5** - não quebra

---

## 📱 Testes de Responsividade (Visual)

### Desktop (> 1200px)
- [ ] Layout de 2 colunas funciona
- [ ] Cards de modo em grid 2x2
- [ ] Pilhas lado a lado

### Tablet (768px - 1200px)
- [ ] Grid adaptativo funciona
- [ ] Botões têm tamanho adequado
- [ ] Texto legível

### Mobile (< 768px)
- [ ] Cards empilhados verticalmente
- [ ] Botões touch-friendly (min 44px)
- [ ] Inputs fáceis de digitar
- [ ] Modals ocupam 90% da largura

---

## ⚡ Testes de Performance

### Tempo de Resposta
- [ ] Login < 2s
- [ ] Carregar salas < 1s
- [ ] Revelar carta < 500ms
- [ ] Atualização em tempo real < 200ms

### Firebase
- [ ] Listeners conectam corretamente
- [ ] Desconexão limpa listeners
- [ ] Transactions funcionam sem conflito
- [ ] Presence system detecta desconexão

---

## 🎯 Resultado Final

### Estatísticas
- **Total de testes:** ~100
- **Aprovados:** ___
- **Falhos:** ___
- **Não aplicável:** ___

### Status Geral
- [ ] ✅ APROVADO - Pronto para produção
- [ ] ⚠️ ATENÇÃO - Correções menores necessárias
- [ ] ❌ REPROVADO - Problemas críticos encontrados

### Notas Adicionais
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

**Data do Teste:** ___/___/______  
**Testador:** _____________________  
**Navegador:** _____________________  
**Dispositivo:** _____________________
