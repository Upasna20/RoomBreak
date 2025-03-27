import { WebSocketServer, WebSocket } from 'ws';

// Create a WebSocket server listening on port 8080
const wss = new WebSocketServer({ port: 8080 });

console.log('✅ WebSocket server started on ws://localhost:8080');

wss.on('connection', (ws: WebSocket) => {
    console.log('🔗 A client connected.');

    // Send a welcome message to the client
    ws.send('👋 Hello from WebSocket server!');

    // Handle incoming messages from the client
    ws.on('message', (message) => {
        console.log(`📩 Received message: ${message}`);
        ws.send(`📬 Server received: ${message}`);
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('❌ A client disconnected.');
    });

    // Handle errors
    ws.on('error', (err) => {
        console.error('🚨 WebSocket error:', err);
    });
});
