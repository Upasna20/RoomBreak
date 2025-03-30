import { WebSocketServer, WebSocket } from 'ws';
import { GameSession } from './GameSession.js';

const wss = new WebSocketServer({ port: 8080 });
const games = new Map<string, GameSession>();

function generateRoomCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 5 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
}

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'CREATE_GAME') {
            const { username } = message;
            if (!username) return;
            const gameCode = generateRoomCode();
            const game = new GameSession(gameCode);
            games.set(gameCode, game);
            const playerData = game.addPlayer(username, ws);
            if (playerData) {
                ws.send(JSON.stringify({
                    type: 'GAME_CREATED', gameCode, serialNumber: playerData.serialNumber,
                    position: playerData.position
                }));
            }
        }

        if (message.type === 'JOIN_GAME') {
            const { gameCode, username } = message;
            if (!username || !gameCode) return;

            const game = games.get(gameCode);
            if (game) {
                const playerData = game.addPlayer(username, ws);
                if (playerData) {
                    ws.send(JSON.stringify({
                        type: 'GAME_JOIN_SUCCESS',
                        gameCode,
                        serialNumber: playerData.serialNumber,
                        position: playerData.position
                    }));
                } else {
                    ws.send(JSON.stringify({ type: 'GAME_JOIN_FAILURE', reason: "Room full or locked" }));
                }
            } else {
                ws.send(JSON.stringify({ type: 'GAME_JOIN_FAILURE', reason: "Game not found" }));
            }
        }


        if (message.type === 'START_GAME') {
            const game = games.get(message.gameCode);
            if (game) {
                game.lockGame();
                game.broadcast({
                    type: 'GAME_LOCKED',
                    players: game.getPlayers().map(p => ({
                        username: p.username,
                        serialNumber: p.serialNumber,
                        position: p.position
                    }))
                });
            }
        }

        if (message.type === 'POSITION_CHANGE_REQUEST') {
            const game = games.get(message.gameCode);
            if (game) {
                game.broadcast({
                    type: 'POSITION_UPDATE',
                    serialNumber: message.serialNumber,
                    newPos: message.newPos
                })
            }
        }

    });
});

console.log('WebSocket server running on ws://localhost:8080');
