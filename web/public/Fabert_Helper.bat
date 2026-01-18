@echo off
setlocal
title Fabert Hamachi - AJUDANTE DE CONEXAO
color 0B
mode con: cols=70 lines=25

:START
cls
echo.
echo  ==============================================================
echo                FABERT HAMACHI - AJUDANTE DE CONEXAO
echo  ==============================================================
echo.
echo  Este script vai preparar seu computador para que o Warcraft 3
echo  enxergue as partidas criadas na internet.
echo.
echo  O QUE ELE FAZ:
echo  1. Abre as portas 6112-6119 no Firewall do Windows.
echo  2. Permite o trafego de rede do Warcraft 3.
echo.
echo  Deseja aplicar as configuracoes? (S/N)
set /p opt=^> 

if /i "%opt%"=="s" goto INSTALL
goto EXIT

:INSTALL
echo.
echo  [+] Solicitando permissao de Administrador...
echo.

REM Adiciona regras de Firewall para as portas do Warcraft 3
netsh advfirewall firewall add rule name="Fabert Hamachi (TCP)" dir=in action=allow protocol=TCP localport=6112-6119
netsh advfirewall firewall add rule name="Fabert Hamachi (UDP)" dir=in action=allow protocol=UDP localport=6112-6119
netsh advfirewall firewall add rule name="Fabert Hamachi (OUT-TCP)" dir=out action=allow protocol=TCP localport=6112-6119
netsh advfirewall firewall add rule name="Fabert Hamachi (OUT-UDP)" dir=out action=allow protocol=UDP localport=6112-6119

echo.
echo  ==============================================================
echo  [!] CONFIGURACAO CONCLUIDA COM SUCESSO!
echo  ==============================================================
echo.
echo  AVISO AO HOST (Quem cria o jogo):
echo  Para que seus amigos te vejam, voce AINDA precisa:
echo  1. Abrir a porta 6112 (TCP/UDP) no seu ROTEADOR.
echo  2. Ou habilitar a funcao DMZ para seu IP Local no roteador.
echo.
echo  Pode fechar esta janela e voltar para o site! Batalha aguarda!
echo.
pause
exit

:EXIT
echo Saindo sem alterar nada...
timeout /t 2 > nul
exit
