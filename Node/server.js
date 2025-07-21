import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const sessions = {};

function generateSessionCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

wss.on('connection', (ws) => {
  console.log("user connected");
  ws.sessionCode = null;
  ws.username = null;

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    switch (message.type) {
      case 'create_session':
        handleCreateSession(ws, message);
        break;

      case 'join_session':
        handleJoinSession(ws, message);
        break;

      case 'chat_message':
        handleChatMessage(ws, message);
        break;
    }
  });

  ws.on('close', () => {
    if (ws.sessionCode && sessions[ws.sessionCode]) {
      sessions[ws.sessionCode].clients = sessions[ws.sessionCode].clients.filter(client => client !== ws);

      if (sessions[ws.sessionCode].clients.length === 0) {
        delete sessions[ws.sessionCode];
        console.log(`🗑️  Session ${ws.sessionCode} gelöscht (leer)`);
      } else {
        broadcastToSession(ws.sessionCode, {
          type: 'user_left',
          username: ws.username
        });
      }
    }
  });
});

function handleCreateSession(ws, message) {
  const sessionCode = generateSessionCode();
  const username = message.username || 'Anonym';

  sessions[sessionCode] = {
    code: sessionCode,
    clients: [ws],
    messages: [] 
  };

  ws.sessionCode = sessionCode;
  ws.username = username;

  ws.send(JSON.stringify({
    type: 'session_created',
    code: sessionCode,
    username: username
  }));

  console.log(`✅ Session ${sessionCode} erstellt von ${username}`);
}

function handleJoinSession(ws, message) {
  const sessionCode = message.code;
  const username = message.username || 'Anonym';

  if (!sessions[sessionCode]) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Session nicht gefunden!'
    }));
    return;
  }

  sessions[sessionCode].clients.push(ws);
  ws.sessionCode = sessionCode;
  ws.username = username;

  ws.send(JSON.stringify({
    type: 'session_joined',
    code: sessionCode,
    username: username,
    messages: sessions[sessionCode].messages
  }));

  broadcastToSession(sessionCode, {
    type: 'user_joined',
    username: username
  }, ws);

  console.log(`✅ ${username} ist Session ${sessionCode} beigetreten`);
}



function handleChatMessage(ws, message) {
  const sessionCode = ws.sessionCode;

  if (!sessionCode || !sessions[sessionCode]) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Du bist in keiner Session!'
    }));
    return;
  }

  const chatMessage = {
    type: 'chat_message',
    username: ws.username,
    message: message.message,
    timestamp: new Date().toISOString()
  };

  sessions[sessionCode].messages.push(chatMessage);

  broadcastToSession(sessionCode, chatMessage);

  console.log(`💬 ${ws.username} in ${sessionCode}: ${message.message}`);
}

function broadcastToSession(sessionCode, message, excludeClient = null) {
  if (!sessions[sessionCode]) return;

  sessions[sessionCode].clients.forEach(client => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}