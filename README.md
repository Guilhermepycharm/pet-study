# Pet-Study

Companheiro de estudos para o ENEM com gamificação, flashcards, Pomodoro e pet virtual.

**Versão web (principal):** [pet-study.netlify.app](https://pet-study.netlify.app/)

**App Android (beta):** disponível como APK — instruções abaixo.

> **Não existe versão para iOS.** O app Android está em fase beta e pode conter bugs.

## Como instalar o app Android

### 1. Baixar o APK

Acesse a página de releases e baixe o arquivo `.apk` mais recente:

[GitHub Releases](https://github.com/Guilhermepycharm/pet-study/releases)

### 2. Play Protect bloqueou?

Se o Google Play Protect avisar que o app é perigoso:

1. Toque em **"Mais detalhes"**
2. Depois em **"Instalar mesmo assim"**

Isso acontece porque o app não está na Play Store. O Pet-Study é open source e seguro.

### 3. Permitir fontes desconhecidas

Se o celular pedir permissão para instalar apps de fontes desconhecidas:

- Vá em **Configurações → Segurança → Fontes desconhecidas**
- Ative a opção
- Ou toque em **"Permitir"** quando o navegador pedir

### 4. Instalar e abrir

Abra o arquivo APK baixado, toque em **"Instalar"** e pronto!

## Rodar localmente

**Pré-requisito:** Node.js

1. Instale as dependências:
   `npm install`
2. Inicie o servidor de desenvolvimento:
   `npm run dev`

O app abre por padrão em `http://localhost:3000/`.

## Tecnologias

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- PWA (instalação offline)
- localStorage (sem backend)

## Licença

Open source — código disponível no GitHub.
