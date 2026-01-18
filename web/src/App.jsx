import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { Copy, Users, Wifi, WifiOff, Crown, Sword, CheckCircle2, XCircle } from 'lucide-react'
import './App.css'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

function App() {
  const [socket, setSocket] = useState(null)
  const [mode, setMode] = useState(null)
  const [roomCode, setRoomCode] = useState('')
  const [userName, setUserName] = useState('')
  const [inputRoomCode, setInputRoomCode] = useState('')
  const [inputUserName, setInputUserName] = useState('')
  const [connected, setConnected] = useState(false)
  const [players, setPlayers] = useState([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    return () => newSocket.close()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('room-created', ({ roomCode, players }) => {
      setRoomCode(roomCode)
      setPlayers(players)
      setConnected(true)
    })

    socket.on('player-joined', ({ players }) => {
      setPlayers(players)
    })

    socket.on('player-left', ({ players }) => {
      setPlayers(players)
    })

    socket.on('error', ({ message }) => {
      alert(message)
    })

    return () => {
      socket.off('room-created')
      socket.off('player-joined')
      socket.off('player-left')
      socket.off('error')
    }
  }, [socket])

  const handleCreateRoom = () => {
    if (!inputUserName.trim()) {
      alert('Digite seu nome!')
      return
    }
    setUserName(inputUserName)
    setMode('host')
    socket.emit('create-room', { userName: inputUserName })
  }

  const handleJoinRoom = () => {
    if (!inputUserName.trim() || !inputRoomCode.trim()) {
      alert('Preencha todos os campos!')
      return
    }
    setUserName(inputUserName)
    setMode('client')
    socket.emit('join-room', { roomCode: inputRoomCode.toUpperCase(), userName: inputUserName })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDisconnect = () => {
    socket.disconnect()
    socket.connect()
    setMode(null)
    setConnected(false)
    setRoomCode('')
    setUserName('')
    setPlayers([])
    setInputRoomCode('')
    setInputUserName('')
  }

  const isHost = players.find(p => p.id === socket?.id)?.role === 'Host'

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Sword className="logo-icon" size={32} />
            <div>
              <h1>Fabert Hamachi</h1>
              <p className="subtitle">Warcraft III Virtual LAN</p>
            </div>
          </div>
          <div className="connection-status">
            {socket?.connected ? (
              <>
                <Wifi className="status-icon connected" size={20} />
                <span className="status-text">Conectado</span>
              </>
            ) : (
              <>
                <WifiOff className="status-icon disconnected" size={20} />
                <span className="status-text">Desconectado</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {!connected ? (
          <div className="menu-container">
            <div className="welcome-box">
              <h2 className="welcome-title">Conecte-se e Jogue</h2>
              <p className="welcome-desc">
                Crie uma sala ou entre em uma existente para jogar Warcraft 3 com seus amigos
              </p>
            </div>

            <div className="mode-grid">
              <div className="mode-card">
                <div className="mode-header">
                  <Crown className="mode-icon host" size={40} />
                  <h3>Criar Sala</h3>
                  <p>Seja o host da partida</p>
                </div>
                <div className="mode-body">
                  <input
                    type="text"
                    placeholder="Seu nome de guerreiro"
                    className="input-field"
                    value={inputUserName}
                    onChange={(e) => setInputUserName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                    maxLength={20}
                  />
                  <button className="btn btn-primary" onClick={handleCreateRoom}>
                    <Crown size={18} />
                    Criar Sala de Batalha
                  </button>
                </div>
              </div>

              <div className="mode-card">
                <div className="mode-header">
                  <Sword className="mode-icon client" size={40} />
                  <h3>Entrar na Sala</h3>
                  <p>Junte-se aos seus aliados</p>
                </div>
                <div className="mode-body">
                  <input
                    type="text"
                    placeholder="Seu nome de guerreiro"
                    className="input-field"
                    value={inputUserName}
                    onChange={(e) => setInputUserName(e.target.value)}
                    maxLength={20}
                  />
                  <input
                    type="text"
                    placeholder="Código da Sala (ex: ABC123)"
                    className="input-field"
                    value={inputRoomCode}
                    onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                    maxLength={6}
                  />
                  <button className="btn btn-secondary" onClick={handleJoinRoom}>
                    <Sword size={18} />
                    Entrar na Batalha
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="room-container">
            <div className="room-header">
              <div className="room-info">
                <div className={`status-pulse ${players.length >= 2 ? 'active' : ''}`} />
                <div>
                  <h2>{isHost ? 'Você é o Host' : 'Conectado à Sala'}</h2>
                  <p>Código: <strong>{roomCode}</strong></p>
                </div>
              </div>
              <button className="btn btn-danger" onClick={handleDisconnect}>
                <XCircle size={18} />
                Sair da Sala
              </button>
            </div>

            {isHost && (
              <div className="share-box">
                <div className="share-header">
                  <Copy size={20} />
                  <h3>Compartilhe o código com seus amigos</h3>
                </div>
                <div className="code-display">
                  <code className="room-code-big">{roomCode}</code>
                  <button
                    className={`btn-copy ${copied ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(roomCode)}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={18} />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copiar Código
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="players-box">
              <div className="players-header">
                <Users size={24} />
                <h3>Jogadores na Sala ({players.length}/4)</h3>
              </div>
              <div className="players-grid">
                {players.map((player, index) => (
                  <div key={player.id} className={`player-card ${player.role.toLowerCase()}`}>
                    <div className="player-avatar">
                      {player.role === 'Host' ? <Crown size={24} /> : <Sword size={24} />}
                    </div>
                    <div className="player-info">
                      <div className="player-name">{player.name}</div>
                      <div className="player-badge">{player.role}</div>
                    </div>
                    {socket?.id === player.id && (
                      <div className="you-badge">Você</div>
                    )}
                  </div>
                ))}
                {[...Array(4 - players.length)].map((_, i) => (
                  <div key={`empty-${i}`} className="player-card empty">
                    <div className="player-avatar empty-slot">
                      ?
                    </div>
                    <div className="player-info">
                      <div className="player-name">Aguardando...</div>
                      <div className="player-badge">Vazio</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="instructions-box">
              <h3>🎮 Como Jogar</h3>
              <ol className="steps">
                <li>
                  <strong>Aguarde todos os jogadores</strong>
                  <p>Certifique-se que todos entraram na sala</p>
                </li>
                <li>
                  <strong>Abra o Warcraft III</strong>
                  <p>Inicie o jogo normalmente</p>
                </li>
                <li>
                  <strong>Vá em Multiplayer → Local Area Network</strong>
                  <p>Navegue até o modo LAN do jogo</p>
                </li>
                <li>
                  <strong>{isHost ? 'Crie um jogo customizado' : 'Procure por jogos disponíveis'}</strong>
                  <p>{isHost ? 'Configure e inicie sua partida' : 'O jogo do host aparecerá na lista'}</p>
                </li>
                <li>
                  <strong>Boa batalha! ⚔️</strong>
                  <p>Divirta-se com seus amigos</p>
                </li>
              </ol>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Fabert Hamachi v1.0 | Criado por <strong>Fabert</strong> | <a href="https://twitter.com/fabertleury" target="_blank" rel="noopener">@fabertleury</a></p>
        <p className="footer-sub">Feito com ❤️ para a comunidade Warcraft III</p>
      </footer>
    </div>
  )
}

export default App
