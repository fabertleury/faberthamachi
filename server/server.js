import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Armazena as salas ativas
const rooms = new Map();

// Gera código de sala único
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// API REST
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        rooms: rooms.size,
        players: Array.from(rooms.values()).reduce((acc, room) => acc + room.players.length, 0)
    });
});

app.get('/api/rooms/:code', (req, res) => {
    const room = rooms.get(req.params.code);
    if (!room) {
        return res.status(404).json({ error: 'Sala não encontrada' });
    }
    res.json({
        code: room.code,
        host: room.host,
        players: room.players.map(p => ({ name: p.name, role: p.role })),
        maxPlayers: 4
    });
});

// WebSocket para tempo real
io.on('connection', (socket) => {
    console.log(`[+] Cliente conectado: ${socket.id}`);

    // Criar nova sala
    socket.on('create-room', ({ userName }) => {
        const roomCode = generateRoomCode();

        const room = {
            code: roomCode,
            host: {
                id: socket.id,
                name: userName
            },
            players: [{
                id: socket.id,
                name: userName,
                role: 'Host',
                socketId: socket.id
            }],
            createdAt: new Date()
        };

        rooms.set(roomCode, room);
        socket.join(roomCode);
        socket.roomCode = roomCode;

        console.log(`[CREATE] Sala ${roomCode} criada por ${userName}`);

        socket.emit('room-created', {
            roomCode,
            players: room.players
        });
    });

    // Entrar em sala existente
    socket.on('join-room', ({ roomCode, userName }) => {
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', { message: 'Sala não encontrada' });
            return;
        }

        if (room.players.length >= 4) {
            socket.emit('error', { message: 'Sala cheia (máximo 4 jogadores)' });
            return;
        }

        const player = {
            id: socket.id,
            name: userName,
            role: 'Player',
            socketId: socket.id
        };

        room.players.push(player);
        socket.join(roomCode);
        socket.roomCode = roomCode;

        console.log(`[JOIN] ${userName} entrou na sala ${roomCode}`);

        // Notifica todos na sala
        io.to(roomCode).emit('player-joined', {
            players: room.players,
            newPlayer: player
        });
    });

    // Atualizar status do jogador
    socket.on('update-status', ({ status }) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.status = status;
            io.to(roomCode).emit('player-updated', { players: room.players });
        }
    });

    // Enviar mensagem no chat da sala
    socket.on('send-message', ({ message }) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        io.to(roomCode).emit('new-message', {
            playerName: player.name,
            message,
            timestamp: new Date()
        });
    });

    // Desconexão
    socket.on('disconnect', () => {
        console.log(`[-] Cliente desconectado: ${socket.id}`);

        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        // Remove jogador da sala
        room.players = room.players.filter(p => p.id !== socket.id);

        // Se a sala ficou vazia, remove ela
        if (room.players.length === 0) {
            rooms.delete(roomCode);
            console.log(`[DELETE] Sala ${roomCode} removida (vazia)`);
            return;
        }

        // Se o host saiu, promove o próximo jogador
        if (room.host.id === socket.id && room.players.length > 0) {
            room.host = {
                id: room.players[0].id,
                name: room.players[0].name
            };
            room.players[0].role = 'Host';
            console.log(`[PROMOTE] ${room.players[0].name} agora é o host da sala ${roomCode}`);
        }

        // Notifica todos na sala
        io.to(roomCode).emit('player-left', {
            players: room.players
        });
    });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║      FABERT HAMACHI SERVER v1.0                   ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📡 WebSocket pronto para conexões`);
    console.log(`👥 Aguardando jogadores...`);
    console.log('');
    console.log(`Criado por Fabert | @fabertleury`);
    console.log('');
});
