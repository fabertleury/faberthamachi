# 🎮 Fabert Hamachi v1.0

Uma solução completa e moderna para jogar **Warcraft 3** em LAN através da internet. Esqueça sistemas pesados e lentos; o Fabert Hamachi é leve, bonito e focado na comunidade.

## 🚀 Tecnologias
- **Frontend:** React + Tailwind CSS + Lucide Icons
- **Backend:** Node.js + Socket.io (WebSocket)
- **Estética:** Gaming Dark Theme (Estilo Discord/Razer)

## 📦 Estrutura do Projeto
- `/web`: Interface web para os jogadores.
- `/server`: Servidor de sinalização para coordenar as salas.

## 🛠️ Como Executar

### 1. Backend (Servidor)
```bash
cd server
npm install
npm start
```

### 2. Frontend (Web)
```bash
cd web
npm install
npm run dev
```

## 🎮 Como Funciona
1. **O HOST** entra no site e cria uma sala.
2. Ele recebe um código único de 6 dígitos.
3. **OS AMIGOS** entram no site, digitam o código e seus nomes.
4. O sistema conecta todos via WebSockets.
5. Todos abrem o **Warcraft III**, vão em **Multiplayer -> LAN** e a partida aparecerá automaticamente.

---
Criado por **Fabert** | [@fabertleury](https://twitter.com/fabertleury)
*Feito com ❤️ para a comunidade WC3*
