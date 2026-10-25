# 🎮 Riot Games Login Screen & Auth Portal

[![Deploy Status](https://img.shields.io/badge/Deploy-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://github.com)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Synthesized-blueviolet?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Web Crypto API](https://img.shields.io/badge/Web_Crypto_API-SHA--256-green?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![PWA Ready](https://img.shields.io/badge/PWA-Service_Worker-orange?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

> **Recriação ultra-fiel, moderna e imersiva do cliente de autenticação da Riot Games (League of Legends, Valorant, TFT), integrando Canvas Particle VFX 60fps, Web Cryptography API (SHA-256), Web Audio API sintetizada, PWA instalável, internacionalização completa em 5 idiomas, fluxo de 2FA e atalhos de teclado.**

---

## 📌 Sumário
- [Tecnologias & APIs Integradas](#-tecnologias--apis-integradas)
- [Recursos Principais](#-recursos-principais)
- [Temas Dinâmicos & Efeitos Visuais](#-temas-dinâmicos--efeitos-visuais)
- [Áudio Sintetizado (Web Audio API)](#-áudio-sintetizado-web-audio-api)
- [Internacionalização (i18n)](#-internacionalização-i18n)
- [Atalhos de Teclado & Modo Imersivo](#-atalhos-de-teclado--modo-imersivo)
- [Arquitetura do Repositório](#-arquitetura-do-repositório)
- [Como Executar](#-como-executar)
- [Projeto Separado: Bodyfit](#-projeto-separado-bodyfit)

---

## ⚡ Tecnologias & APIs Integradas

1. **HTML5 Canvas 2D API (`js/particles.js`)**:
   * Motor de partículas a 60fps rodando no wallpaper que se adapta dinamicamente às cores e física de cada jogo selecionado (brasas da Riot, faíscas táticas do Valorant, runas douradas de LoL).
2. **Web Cryptography API (`crypto.subtle`) em `js/mock-auth.js`**:
   * Hashing seguro de senhas via SHA-256 no client-side com sal criptográfico.
3. **Web Audio API (`js/audio.js`)**:
   * Síntese procedural de áudio (senoidais e ondas quadradas com envelope ADSR) para feedbacks táteis sem uso de arquivos pesados de áudio.
4. **Progressive Web App (PWA)**:
   * `manifest.json` e `sw.js` (Service Worker) para cache offline, instalação em desktop e mobile.
5. **Fullscreen API (`document.documentElement.requestFullscreen`)**:
   * Experiência idêntica ao client nativo em tela cheia com botão e suporte a F11.
6. **Canvas Confetti Generator (`js/confetti.js`)**:
   * Disparo procedural de confetes ao concluir login ou criar conta.

---

## ✨ Recursos Principais

* **Design Fiel ao Riot Client**: Inputs flutuantes (*floating labels*), validação em tempo real e botão de submit reativo.
* **Vetores SVG Puros**: Logos oficiais da Riot Games, Google, Apple, Facebook, Xbox e PlayStation diretamente embutidos.
* **Segurança e Validação**:
  * Detecção em tempo real de tecla **Caps Lock** ativada com alerta visual.
  * Alternador de visibilidade de senha (*show/hide password*).
  * Modal interativo de **Verificação em Duas Etapas (2FA)** com código OTP de 6 dígitos e auto-foco sequencial.
  * Modal de **Recuperação de Conta** e **Criação de Riot ID**.
* **Persistência de Sessão**: Suporte completo a *"Manter login"* via `localStorage` e eventos customizados (`auth:success`, `auth:error`, `auth:2fa_required`).

---

## 🎨 Temas Dinâmicos & Efeitos Visuais

Alterne instantaneamente entre os universos da Riot através do seletor superior ou pelo atalho `Alt + T`:
* **Riot Games (Padrão)**: Fundo escuro minimalista com detalhes em vermelho rubi (`#EB0029`).
* **Valorant**: Atmosfera tática em preto espacial e vermelho de combate (`#FF4655`).
* **League of Legends**: Estética Hextech em tons de azul profundo e ouro rúnico (`#C4B998`).
* **Teamfight Tactics (TFT)**: Tons cósmicos e místicos com realces mágicos.

---

## 🔊 Áudio Sintetizado (Web Audio API)

Sintetizador nativo sem arquivos de áudio externos em [`js/audio.js`](js/audio.js):
* Frequências e envelopes ADSR sintetizados em tempo real no navegador.
* Feedback sonoro para: foco em campos, clique de botões, sucesso de login e alerta de erro.
* Botão de mute/unmute acessível no topo (`Ctrl + M`), com preferência salva no navegador.

---

## 🌐 Internacionalização (i18n)

Suporte a troca dinâmica de idiomas sem recarregar a página ([`js/i18n.js`](js/i18n.js)) ou pelo atalho `Alt + L`:
* 🇧🇷 Português (pt-BR)
* 🇺🇸 English (en-US)
* 🇪🇸 Español (es-ES)
* 🇯🇵 日本語 (ja-JP)
* 🇰🇷 한국어 (ko-KR)

---

## ⌨️ Atalhos de Teclado & Modo Imersivo

* `Alt + T`: Alterna ciclicamente entre os temas dos jogos com notificação HUD Toast.
* `Alt + L`: Alterna ciclicamente entre os idiomas suportados.
* `Ctrl + M` / `Cmd + M`: Ativa / desativa o sintetizador sonoro.
* `Esc`: Fecha imediatamente qualquer modal aberto.
* `F11` ou Botão `⛶`: Alterna para tela cheia imersiva.

---

## 📂 Arquitetura do Repositório

```text
Tela-login-Riot/
├── index.html                  # Portal principal com todas as funcionalidades e modais
├── trembolona.html             # Interface minimalista com compatibilidade retroativa
├── manifest.json               # Manifesto PWA para instalação no dispositivo
├── sw.js                       # Service Worker para cache e suporte offline
├── GH.css                      # Estilização base do cliente Riot Games
├── Durateston.js               # Controlador legado de compatibilidade
├── assets/
│   └── icons.js                # Biblioteca de vetores SVG (Riot, Redes Sociais, UI)
├── js/
│   ├── audio.js                # Sintetizador sonoro via Web Audio API
│   ├── auth.js                 # Validação de formulário, labels e Caps Lock
│   ├── confetti.js             # Gerador de partículas de confete em Canvas
│   ├── i18n.js                 # Sistema de tradução dinâmica em 5 idiomas
│   ├── mock-auth.js            # Autenticação criptográfica SHA-256 e 2FA
│   ├── particles.js            # Motor de partículas temáticas 60fps em Canvas
│   ├── shortcuts.js            # Atalhos de teclado, HUD Toast e Fullscreen API
│   └── theme-switcher.js       # Gerenciador de temas dinâmicos e persistência
├── styles/
│   ├── animations.css          # Animações de micro-interações, pulso e transições
│   └── themes.css              # Definições de variáveis e paletas dos jogos
├── bodyfit/                    # Projeto Fitness Isolado e Aprimorado
│   ├── index.html              # Landing page completa com calculadora de IMC
│   ├── Termogenico.css         # Estilização dark/neon da academia
│   ├── Creatina.js             # Lógica de cálculo de IMC e métricas corporais
│   └── Logo.png                # Logotipo da Bodyfit
└── .github/
    └── workflows/
        └── deploy.yml          # Pipeline limpo de CI e deploy no GitHub Pages
```

---

## 🚀 Como Executar

1. Abra o arquivo `index.html` em qualquer navegador moderno.
2. Ou inicie um servidor local leve (ex: Live Server no VS Code, ou `python -m http.server 8000`).

---

## 🏋️‍♂️ Projeto Separado: Bodyfit

O protótipo de academia anteriormente misturado na raiz foi isolado e expandido na pasta [`bodyfit/`](bodyfit/index.html):
* Landing page completa e responsiva.
* Calculadora de IMC interativa integrada.
* Planos de treino (Hipertrofia e Definição) com visual moderno em neon verde.