import WebSocket, { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: 8080 });

const sessions = {}; // global variable to save all Sessions

// function to generate a 6 number Code for a Session
function generateSessionCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// if someone new joins the websocket
wss.on('connection', (ws) => {
  // Message handler gets a message from Frontend for example create_session and than handles the function
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
      case 'add_browser_tab':
        addNewSharedTab(ws, message);
        break;
      case 'remove_browser_tab':
        removeSharedTab(ws, message);
        break;
    }
  });

  // Removes all Clients from the Session
  ws.on('close', () => {
    if (ws.sessionCode && sessions[ws.sessionCode]) {
      sessions[ws.sessionCode].clients = sessions[ws.sessionCode].clients.filter(client => client !== ws);

      if (sessions[ws.sessionCode].clients.length === 0) {
        delete sessions[ws.sessionCode];
      }
      // could make for joining and leaving the session with broadcasting but not neccessary
    }
  });
});


// Function for creating a Session
function handleCreateSession(ws, message) {
  const sessionCode = generateSessionCode();   // generate a new Session Code
  const username = message.username || 'Anonym';

  const initialTabs = message.currentTabs && message.currentTabs.length > 0 
    ? message.currentTabs 
    : [{
        id: 0,
        url: "https://google.com",
        favIcon: "https://google.com/favicon.ico"
      }];

  sessions[sessionCode] = {
    code: sessionCode,
    clients: [ws],
    messages: [],
    tabs: initialTabs, 
    nextId: message.nextId ,
    activeTabId: message.activeTabId
  }; // generates a new Session with the code the clients and no messages

  ws.sessionCode = sessionCode;  // client belongs to this session the host in this case
  ws.username = username; // and the username also

  ws.send(JSON.stringify({
    type: 'session_created',
    code: sessionCode,    // response to client  that its done
    username: username
  }));

  console.log(`✅ Session ${sessionCode} erstellt von ${username}`);
}


// function for joing a Session
function handleJoinSession(ws, message) {
  const sessionCode = message.code;
  const username = message.username || 'Anonym';


  // if no Session with this code youre cooked brotha
  if (!sessions[sessionCode]) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Session nicht gefunden!'
    }));
    return;
  }

  // else add the client to the clients of the session from the code
  sessions[sessionCode].clients.push(ws);  
  ws.sessionCode = sessionCode;    // and make the client username belong ot the session
  ws.username = username;

  ws.send(JSON.stringify({
    type: 'session_joined',     // this is only neccessary because we update the status in the frontend
    code: sessionCode,     // give response to cleints that its done connection
    username: username,
    messages: sessions[sessionCode].messages,
    tabs: sessions[sessionCode].tabs,
    nextId: sessions[sessionCode].nextId,
    activeTabId: sessions[sessionCode].activeTabId
  }));

  
  console.log(`✅ ${username} ist Session ${sessionCode} beigetreten`);
}


  // function for handling messages from a clint
function handleChatMessage(ws, message) {
  const sessionCode = ws.sessionCode;

  if (!sessionCode || !sessions[sessionCode]) {
    ws.send(JSON.stringify({
      type: 'error',                    // No Session == youre cooked brotha
      message: 'Du bist in keiner Session!'
    }));
    return;
  }

  const chatMessage = {
    type: 'chat_message', 
    username: ws.username,       // else create new ChatMessage
    message: message.message,
    timestamp: new Date().toISOString()
  };

  sessions[sessionCode].messages.push(chatMessage);    // and add it to the messages of the Session

  broadcastToSession(sessionCode, chatMessage); // and send it to the Chat

  console.log(`💬 ${ws.username} in ${sessionCode}: ${message.message}`);
}

function broadcastToSession(sessionCode, message, excludeClient = null) {
  if (!sessions[sessionCode]) return;

  // send the Messages to all clients if the websocket of the client is open (connected)
  sessions[sessionCode].clients.forEach(client => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// here we add the message in the frontend
function addNewSharedTab(ws, message) {
  const sessionCode = ws.sessionCode;
  if (!sessionCode || !sessions[sessionCode]) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Du bist in keiner Session!'
    }));
    return;
  }

  // Store tab in session
  const newTab = {
    id: message.tab.id,
    url: message.tab.url,
    favIcon: message.tab.favIcon
  };
  
  sessions[sessionCode].tabs.push(newTab);
  sessions[sessionCode].nextId = message.nextId;
  sessions[sessionCode].activeTabId = message.activeTabId
  // Broadcast to other clients
  const browserTab = {
    type: 'browser_tab_new', 
    id: message.tab.id,
    url: message.tab.url,
    favicon: message.tab.favIcon,
    nextId: message.nextId,
    activeTabId: message.activeTabId
  };

  broadcastToSession(sessionCode, browserTab, ws);
}


// here we remove the message in the frontend
function removeSharedTab(ws, message){
    const sessionCode = ws.sessionCode;
  if (!sessionCode || !sessions[sessionCode]) {
    ws.send(JSON.stringify({
      type: 'error',                    // No Session == youre cooked brotha
      message: 'Du bist in keiner Session!'
    }));
    return;
  }

    const newTab = {
    id: message.tab.id,
    url: message.tab.url,
    favIcon: message.tab.favIcon
  };

  sessions[sessionCode].tabs = sessions[sessionCode].tabs.filter(
  (tab) => tab.id !== newTab.id
  );  

  sessions[sessionCode].nextId = message.nextId;
  sessions[sessionCode].activeTabId = message.activeTabId

    const browserTab = {
    type: 'browser_tab_old', 
    id: message.tab.id,
    url: message.tab.url,
    favicon: message.tab.favIcon,
    nextId: message.nextId,
    activeTabId: message.activeTabId
  };
  broadcastToSession(sessionCode,browserTab);
}

// add the listening in the frontend

// Syntax playground to learn faster code Done but learning is important

// basic Syntax to make a WebSocketServer
// import WebSocket, { WebSocketServer } from 'ws';
// const wsServer = new WebSocketServer({ port: 8080 });

// // if someone connects execute this 

// wsServer.on('connection', (ws)=>{
//   // if we get a message from the frontend (send) like create_session we handle and redirect to the specific url
//   ws.on("message" , (data)=>{
//     const message = JSON.parse(data.toString());     // we get teh message 
//     switch (message.type) {   // and the type and than we call the function
//       case 'create_session':
//         handleCreateSession(ws, message);
//         break; 

//       case 'join_session':
//         handleJoinSession(ws, message);
//         break;

//       case 'chat_message':
//         handleChatMessage(ws, message);
//         break;
//     }
//   })
// })


// basically how it works we have a message handler for server and client side and if the case than we do this else we do this
// Concept on both sides handlers and we send data to handlers and they process them