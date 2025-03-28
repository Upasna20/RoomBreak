// src/network/wsClient.ts
export class WSClient {
    private ws: WebSocket;
    private messageHandlers: ((message: any) => void)[] = [];

    constructor(url: string) {
        this.ws = new WebSocket(url);
        console.log("connected");
        this.ws.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            console.log("Received message:", message);

            console.log("handlers here", this.messageHandlers)
            this.messageHandlers.forEach(handler => {
                handler(message)
            });
        });
    }

    send(data: object) {
        this.ws.send(JSON.stringify(data));
    }

    onMessage(handler: (message: any) => void) {
        this.messageHandlers.push(handler);
    }
}

// Create a single instance and export it
export const wsClient = new WSClient('ws://localhost:8080');
