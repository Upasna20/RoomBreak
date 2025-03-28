import { WebSocket } from 'ws'; 

export class Game {
    id: string;
    players: Set<WebSocket>;
    maxPlayers: number = 5;
    isLocked: boolean = false;

    constructor(id: string) {
        this.id = id;
        this.players = new Set();
    }

    addPlayer(player: WebSocket): boolean {
        if (this.isLocked || this.players.size >= this.maxPlayers) {
            return false; // Room is full or locked
        }
        this.players.add(player);
        return true;
    }

    lockGame() {
        this.isLocked = true;
    }

    broadcast(message: object) {
        const data = JSON.stringify(message);
        console.log("Total players", this.players)
        this.players.forEach(player => player.send(data));
    }

    getPlayerCount(): number {
        return this.players.size;
    }
}
