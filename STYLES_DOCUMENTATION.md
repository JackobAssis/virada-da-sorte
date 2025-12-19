# 🎨 Documentação dos Estilos Gratuitos

Este documento detalha os 4 estilos visuais gratuitos implementados no jogo **Virada da Sorte**.

## 📐 Especificações Técnicas Globais

Todos os estilos seguem o mesmo padrão:

- **Dimensões**: 96x136px
- **Border-radius**: 12px
- **Box-shadow base**: `0 8px 20px rgba(0,0,0,0.35)`
- **Estrutura HTML**: Idêntica para todos
- **Animação de flip**: 3D compartilhada
- **Performance**: Otimizado com `will-change`

## 🟢 ESTILO 01: Neon Circuit

### Conceito
Visual futurista, tecnológico e vibrante, inspirado em circuitos digitais, HUDs e neon cyberpunk.

### Paleta de Cores
- **Verde neon**: `#00ff9c`
- **Ciano**: `#00cfff`
- **Fundo escuro**: `#020b0f`
- **Acento escuro-verde**: `#0a2e2e`

### Elementos Visuais

#### Card Back (Verso)
- Gradiente radial do centro superior esquerdo
- Linhas diagonais translúcidas simulando circuitos
- Glow neon central pulsante
- Borda com brilho ciano sutil

#### Card Front (Frente)
- Gradiente radial vibrante (ciano → verde neon)
- Borda verde neon sólida
- Glow externo em ciano

### Animações
1. **neonCircuitMove**: Movimento diagonal das linhas de circuito (20s)
2. **neonPulseGlow**: Pulsação do glow central (2s)

### Classe CSS
```css
.card.style-neon-circuit
```

---

## 🟣 ESTILO 02: Arcane Sigil

### Conceito
Estilo místico e arcano, inspirado em runas, magia antiga e símbolos ocultos.

### Paleta de Cores
- **Roxo profundo**: `#2b0a3d`
- **Roxo escuro**: `#1a0526`
- **Lilás**: `#b57cff`
- **Dourado fosco**: `#d4af37`

### Elementos Visuais

#### Card Back (Verso)
- Gradiente linear diagonal (roxo profundo → roxo escuro)
- Esferas de luz translúcidas nos cantos
- Símbolo geométrico central com gradiente cônico
- Aura mágica pulsante ao redor do símbolo

#### Card Front (Frente)
- Gradiente radial (lilás → roxo)
- Borda dourada
- Glow roxo místico

### Animações
1. **arcaneRotate**: Rotação contínua do símbolo central (8s)
2. **arcaneAuraPulse**: Expansão e contração da aura (3s)

### Classe CSS
```css
.card.style-arcane-sigil
```

---

## 🔵 ESTILO 03: Minimal Prime

### Conceito
Minimalista, limpo e funcional, focado em legibilidade e elegância.

### Paleta de Cores
- **Branco gelo**: `#eaeaea`
- **Branco puro**: `#ffffff`
- **Cinza médio**: `#8a8a8a`
- **Preto**: `#111111`

### Elementos Visuais

#### Card Back (Verso)
- Fundo sólido branco gelo
- Dois círculos concêntricos centrais (sutis)
- Borda cinza fina
- Sem glow ou efeitos especiais

#### Card Front (Frente)
- Fundo branco puro
- Borda preta fina e sólida
- Símbolos em preto sem sombra
- Sombra leve e discreta

### Animações
Nenhuma (estilo estático)

### Classe CSS
```css
.card.style-minimal-prime
```

---

## 🔴 ESTILO 04: Flux Ember

### Conceito
Estilo energético e abstrato, com sensação de movimento e intensidade.

### Paleta de Cores
- **Vermelho intenso**: `#ff3b3b`
- **Laranja quente**: `#ff9f1c`
- **Preto profundo**: `#0a0a0a`

### Elementos Visuais

#### Card Back (Verso)
- Gradientes angulares assimétricos (27deg)
- Blend mode: screen
- Duas formas orgânicas abstratas se movendo
- Glow quente em laranja

#### Card Front (Frente)
- Gradiente diagonal (laranja → vermelho → preto)
- Borda vermelha
- Glow vermelho intenso

### Animações
1. **fluxEmberMove1**: Movimento orgânico da forma 1 (6s, alternate)
2. **fluxEmberMove2**: Movimento orgânico da forma 2 (7s, alternate-reverse)

### Classe CSS
```css
.card.style-flux-ember
```

---

## 🎯 Implementação no Jogo

### Estrutura HTML Base
```html
<div class="card style-[nome-do-estilo]">
  <div class="card-inner">
    <div class="card-front"></div>
    <div class="card-back"></div>
  </div>
</div>
```

### Aplicação via JavaScript
```javascript
// Aplicar estilo ao card
StylesManager.applyStyleToCard(cardElement, 'neon-circuit', cardIndex);
```

### Configuração no Sistema
Os estilos são definidos em `js/styles.js`:

```javascript
const STYLES_CONFIG = {
    'neon-circuit': {
        id: 'neon-circuit',
        name: 'Neon Circuit',
        type: 'free',
        className: 'style-neon-circuit',
        description: 'Futurista com circuitos neon e cyberpunk',
        unlocked: true
    },
    // ... outros estilos
};
```

---

## ♿ Acessibilidade

### Prefers Reduced Motion
Para usuários que preferem menos animações:

```css
@media (prefers-reduced-motion: reduce) {
    /* Animações são desabilitadas ou reduzidas */
    .card.style-neon-circuit .card-back::before {
        animation: none;
    }
}
```

---

## 📱 Responsividade

Os estilos se adaptam para dispositivos móveis:

- Cards mantêm tamanho fixo
- Elementos internos se ajustam proporcionalmente
- Animações otimizadas para performance mobile

---

## 🚀 Performance

### Otimizações Implementadas

1. **will-change**: Aplicado em elementos animados
2. **transform & opacity**: Usados para animações (GPU-accelerated)
3. **Animações otimizadas**: Duração equilibrada para fluidez
4. **Blend modes**: Usados com moderação

### Custo de Performance

| Estilo | Impacto | Observações |
|--------|---------|-------------|
| Neon Circuit | Médio | Animações contínuas |
| Arcane Sigil | Médio | Rotação e pulsação |
| Minimal Prime | Baixo | Sem animações |
| Flux Ember | Alto | Múltiplas animações orgânicas |

---

## 🎨 Guia de Uso

### Quando Usar Cada Estilo

**Neon Circuit**
- Jogadores que gostam de tecnologia
- Temas futuristas
- Preferência por cores frias vibrantes

**Arcane Sigil**
- Jogadores que gostam de fantasia
- Temas místicos
- Preferência por roxo e dourado

**Minimal Prime**
- Jogadores focados em jogabilidade
- Preferência por clareza visual
- Dispositivos com baixa performance

**Flux Ember**
- Jogadores que gostam de energia
- Temas intensos
- Preferência por cores quentes

---

## 🔧 Manutenção

### Adicionar Novo Estilo

1. Crie as classes CSS em `cards-free-styles.css`
2. Adicione ao `STYLES_CONFIG` em `styles.js`
3. Adicione o gradiente de preview em `lobby.js`
4. Teste em todos os browsers

### Modificar Estilo Existente

1. Edite apenas o CSS específico do estilo
2. Mantenha o padrão global intocado
3. Teste animações em dispositivos móveis
4. Verifique acessibilidade

---

## 📊 Estatísticas de Uso (Sugeridas)

Para futura análise, trackear:
- Estilo mais escolhido
- Tempo médio em cada estilo
- Taxa de troca de estilos
- Preferência por tipo de jogador

---

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento.

### Reportar Problemas

Se encontrar bugs:
1. Descreva o comportamento esperado
2. Descreva o comportamento observado
3. Informe browser e dispositivo
4. Anexe screenshot se possível

---

**Documentação criada em: Dezembro 2025**  
**Versão: 1.0.0**
