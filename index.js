const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const WebSocket = require("ws");

app.use(express.static(path.join(__dirname, 'Client')));
const connectedClients = [];

const wss = new WebSocket.Server({ server: http });

wss.on('connection', (ws) => {
    console.log("New client connected");
    connectedClients.push(ws);

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        console.log("Received:", parsedMessage.message);

        switch (parsedMessage.target) {
            case 'self':
                ws.send(JSON.stringify({ from: 'server', message: parsedMessage.message }));
                break;
            case 'others':
                connectedClients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ from: 'server', message: parsedMessage.message }));
                    }
                });
                break;
            case 'all':
                connectedClients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ from: 'server', message: parsedMessage.message }));
                    }
                });
                break;
        }
    });

    ws.on('close', () => {
        console.log("Client disconnected");
        const index = connectedClients.indexOf(ws);
        if (index !== -1) {
            connectedClients.splice(index, 1);
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});

http.listen(1300, () => {
    console.log('Server is running on port 1300');
});
