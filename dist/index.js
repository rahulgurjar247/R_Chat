import { WebSocketServer, WebSocket } from "ws";
const wss = new WebSocketServer({ port: 8080 });
let userCount = 0;
const allsocket = {};
// Handle new connections
wss.on("connection", (ws) => {
    userCount++;
    console.log("Client connected #" + userCount);
    ws.send(JSON.stringify({ type: "welcome", message: "Welcome to the WebSocket" }));
    ws.on("message", (rawMessage) => {
        try {
            const data = JSON.parse(rawMessage.toString());
            // Handle different message types
            if (data.type === "join") {
                const roomCode = data.roomCode;
                // Initialize the room if it doesn't exist
                if (!allsocket[roomCode]) {
                    allsocket[roomCode] = [];
                }
                // Add the WebSocket to the room
                allsocket[roomCode].push(ws);
                console.log(`Client joined room: ${roomCode}`);
            }
            else if (data.type === "chat") {
                const roomCode = data.roomCode;
                const message = data.message;
                // Broadcast message to all sockets in the room
                if (allsocket[roomCode]) {
                    allsocket[roomCode].forEach((socket) => {
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify({
                                type: "chat",
                                roomCode,
                                content: message,
                            }));
                        }
                    });
                }
            }
            else if (data.type === "leave") {
                const roomCode = data.roomCode;
                // Remove the WebSocket from the room
                if (allsocket[roomCode]) {
                    const index = allsocket[roomCode].indexOf(ws);
                    if (index > -1) {
                        allsocket[roomCode].splice(index, 1);
                        console.log(`Client left room: ${roomCode}`);
                    }
                }
            }
        }
        catch (error) {
            console.error("Error parsing message:", error);
            ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
        }
    });
    // Handle disconnection
    ws.on("close", () => {
        console.log("Client disconnected");
        for (const roomCode in allsocket) {
            const index = allsocket[roomCode].indexOf(ws);
            if (index > -1) {
                allsocket[roomCode].splice(index, 1);
                console.log(`Removed client from room: ${roomCode}`);
            }
        }
    });
});
