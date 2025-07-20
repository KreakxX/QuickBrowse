const WebSocket = require('ws');

// new websocket server
const wss = new WebSocket.Server({ port: 8080 });

// on connection
wss.on('connection', ws => {
  // a broadcast to all clients for example sharing all tabs etc
  ws.on('message', msg => {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });
});


server.listen(8080, () => {
  console.log('🚀 Server läuft auf ws://localhost:8080');
});


// document.innerhtml, cursor position etc new links 