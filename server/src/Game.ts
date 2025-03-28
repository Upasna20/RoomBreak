import { WebSocket } from 'ws'; 

interface Player {
    username: string;
    ws: WebSocket;
    serialNumber: number;
}

export class Game {
    id: string;
    players: Player[];
    maxPlayers: number = 5;
    isLocked: boolean = false;
    private nextSerialNumber: number = 0;  // Tracks next serial number

    constructor(id: string) {
        this.id = id;
        this.players = [];
    }

    addPlayer(username: string, ws: WebSocket): boolean {
        if (this.isLocked || this.players.length >= this.maxPlayers) {
            return false; // Room is full or locked
        }
        const player: Player = { 
            username, 
            ws, 
            serialNumber: this.nextSerialNumber++ // Assign and increment serial number
        };
        this.players.push(player);
        return true;
    }

    lockGame() {
        this.isLocked = true;
    }

    broadcast(message: object) {
        const data = JSON.stringify(message);
        this.players.forEach(player => player.ws.send(data));
    }

    getPlayerCount(): number {
        return this.players.length;
    }

    getPlayers(): Player[] {
        return this.players;
    }
}
