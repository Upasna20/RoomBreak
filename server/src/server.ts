import { WebSocketServer, WebSocket } from 'ws';
import { Game } from './Game.js';

const wss = new WebSocketServer({ port: 8080 });
const games = new Map<string, Game>();

function generateRoomCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 5 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
}

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'CREATE_GAME') {
            const gameCode = generateRoomCode();
            const game = new Game(gameCode);
            games.set(gameCode, game);
            game.addPlayer(ws);
            ws.send(JSON.stringify({ type: 'GAME_CREATED', gameCode }));
        }

        if (message.type === 'JOIN_GAME') {
            const game = games.get(message.gameCode);
            if (game) {
                game.addPlayer(ws);
                ws.send(JSON.stringify({ type: 'GAME_JOIN_SUCCESS', gameCode: message.gameCode }));
            } else {
                ws.send(JSON.stringify({ type: 'GAME_JOIN_FAILURE' }));
            }
        }

        if (message.type === 'START_GAME') {
            const game = games.get(message.gameCode);
            if (game) {
                game.lockGame();
                game.broadcast({ type: 'GAME_LOCKED', playerCount: game.getPlayerCount() });
            }
        }
    });
});

console.log('WebSocket server running on ws://localhost:8080');
