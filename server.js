const WebSocket = require('ws');

const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: port });

let silaSocket = null;
let akashSocket = null;

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type === 'register') {
                if (data.name === 'sila') {
                    silaSocket = ws;
                    console.log('Phone sila connect ho gaya');
                } else if (data.name === 'akash') {
                    akashSocket = ws;
                    console.log('Viewer akash connect ho gaya');
                }
                return;
            }

            // Sila se message aaya to Akash ko bhejo
            if (ws === silaSocket && akashSocket && akashSocket.readyState === WebSocket.OPEN) {
                akashSocket.send(JSON.stringify(data));
            }

            // Akash se message aaya to Sila ko bhejo
            if (ws === akashSocket && silaSocket && silaSocket.readyState === WebSocket.OPEN) {
                silaSocket.send(JSON.stringify(data));
            }

        } catch (e) {
            console.error('Error:', e);
        }
    });

    ws.on('close', () => {
        if (ws === silaSocket) {
            console.log('Phone sila disconnect hua');
            silaSocket = null;
            if (akashSocket && akashSocket.readyState === WebSocket.OPEN) {
                akashSocket.send(JSON.stringify({ type: 'stream_stopped' }));
            }
        } else if (ws === akashSocket) {
            console.log('Viewer akash disconnect hua');
            akashSocket = null;
        }
    });
});

console.log(`AK STAR Signaling Server running on port ${port}`);
