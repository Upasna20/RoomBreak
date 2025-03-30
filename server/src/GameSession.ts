import { WebSocket } from 'ws'; 

interface Player {
    username: string;
    ws: WebSocket;
    serialNumber: number;
    position: { x: number; y: number; z: number }; // Player's starting position
}

export class GameSession {
    id: string;
    players: Player[];
    maxPlayers: number = 5;
    isLocked: boolean = false;
    private nextSerialNumber: number = 1;  // Tracks next serial number

    // Predefined starting positions
    private startingPositions: { x: number; y: number; z: number }[] = [
        { x: 5, y: 0, z: 5 },
        { x: -5, y: 0, z: 5 },
        { x: 5, y: 0, z: -5 },
        { x: -5, y: 0, z: -5 },
        { x: 0, y: 0, z: 0 }
    ];

    constructor(id: string) {
        this.id = id;
        this.players = [];
    }

    addPlayer(username: string, ws: WebSocket): { serialNumber: number, position: { x: number; y: number; z: number } } | null {
        if (this.isLocked || this.players.length >= this.maxPlayers) {
            return null; // Room is full or locked
        }

        const position = this.startingPositions[this.players.length]; // Assign position based on index
        const player: Player = { 
            username, 
            ws, 
            serialNumber: this.nextSerialNumber++, 
            position
        };

        this.players.push(player);

        return { serialNumber: player.serialNumber, position };
    }

    lockGame() {
        this.isLocked = true;
        console.log("Game Locked!")
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
