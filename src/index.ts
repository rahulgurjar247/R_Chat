import { WebSocketServer ,WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let clients: WebSocket[] = [];

wss.on("connection", (ws) => {
    console.log("Client connected");
    clients.push(ws);
    ws.on("message", (message) => {
        console.log(`Received message: ${message}`);
        clients.forEach((client) => {
            if (client !== ws) {
                client.send(message);
            }
        });
    });
    ws.on("close", () => {
        console.log("Client disconnected");
        clients = clients.filter((client) => client !== ws);
    });
    ws.on("error", (error) => {
        console.error("Error:", error);
    });

    // Simulate some data being received from the client
    ws.send("Hello from the server!");
});