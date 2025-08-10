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
      case 'active_tab_id':
        handleChangeActiveTab(ws,message);
        break;
      case 'mouse_move':
        handleMouseMovementOfSession(ws,message);
        break;
      case 'url_changed':
        ChangeSharedUrl(ws,message);
        break;
      case 'cursor_changed':
        ShareCursor(ws,message);
        break;
      case 'enableWatchTogether':
        enableWatchTogether(ws,message);
        break;
      case 'youtube_play':
        youtube_play(ws,message);
        break;
      case 'youtube_pause':
        youtube_pause(ws,message);
        break;
      case 'skipped_forward':
        youtube_skipped_forward(ws,message)
        break;
      case 'skipped_backward':
        youtube_skipped_backward(ws,message)
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

function youtube_skipped_forward(ws,message){
    const sessionCode = ws.sessionCode;
    if (!sessionCode || !sessions[sessionCode]) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Du bist in keiner Session!'
      }));
      return;
    } 

    const skippedMessage = {
      type: "skipped_forward",
      time: message.time
    }

    broadcastToSession(sessionCode,skippedMessage,ws)
}

function youtube_skipped_backward(ws,message){
   const sessionCode = ws.sessionCode;
    if (!sessionCode || !sessions[sessionCode]) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Du bist in keiner Session!'
      }));
      return;
    } 

    const skippedMessage = {
      type: "skipped_backward",
      time: message.time
    }

    broadcastToSession(sessionCode,skippedMessage,ws)
}



function youtube_play(ws, message){
      console.log("CALLED PLAY")

  const sessionCode = ws.sessionCode;
    if (!sessionCode || !sessions[sessionCode]) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Du bist in keiner Session!'
      }));
      return;
    } 
    const playMessage = {
      type: "youtube_play"
    }

    broadcastToSession(sessionCode,playMessage,ws)
}

function youtube_pause(ws, message){
  const sessionCode = ws.sessionCode;
    if (!sessionCode || !sessions[sessionCode]) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Du bist in keiner Session!'
      }));
      return;
    } 
    console.log("CALLED PAUSE")

    const pauseMessage = {
      type: "youtube_pause"
    }

    broadcastToSession(sessionCode,pauseMessage,ws)
}
function enableWatchTogether(ws, message){
    const sessionCode = ws.sessionCode;
    if (!sessionCode || !sessions[sessionCode]) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Du bist in keiner Session!'
      }));
      return;
    } 
  
    const watchTogetherMessage = {
      type: "enableWatchTogether",
      watchTogether: message.watchTogether,
      embedUrl: message.embedUrl
    }

    broadcastToSession(sessionCode,watchTogetherMessage,ws)
}

function ShareCursor(ws, message){
    const sessionCode = ws.sessionCode;
  if (!sessionCode || !sessions[sessionCode]) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Du bist in keiner Session!'
    }));
    return;
  } 
  const SharedCursorMessage = {
    type: "cursor_changed",
    cursorEnabled: message.cursorEnabled
  }
  broadcastToSession(sessionCode,SharedCursorMessage,ws)
}

function handleMouseMovementOfSession(ws, message){
  const sessionCode = ws.sessionCode;
  if (!sessionCode || !sessions[sessionCode]) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Du bist in keiner Session!'
    }));
    return;
  } 
  sessions[sessionCode].X = message.data.x
  sessions[sessionCode].Y = message.data.y

  const broadcastMessage = {
    type: "mouse_update",     
    x: message.data.x,
    y: message.data.y
  };
  broadcastToSession(sessionCode, broadcastMessage,ws); 
}


function handleChangeActiveTab(ws, message){
   const sessionCode = ws.sessionCode;
  if (!sessionCode || !sessions[sessionCode]) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Du bist in keiner Session!'
    }));
    return;
  } 
  sessions[sessionCode].activeTabId = message.activeTabId

  // ws.send(JSON.stringify({
  //   type: "activeTab_changed",
  //   activeTabId: sessions[sessionCode].useractiveTabId   // was error because i was sending it to myself
  // }))

  const broadcastMessage = {
    type: "activeTab_changed",      // but this is the correct way for sending to the clients
    activeTabId: message.activeTabId
  };
  broadcastToSession(sessionCode, broadcastMessage,ws);  // the ws is neccessary because we only want to update to all the clients and not to broadcast it to our selfs
}

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
    activeTabId: message.activeTabId,
    X: 0,
    Y: 0
    
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
    activeTabId: sessions[sessionCode].activeTabId,
    X: sessions[sessionCode].X || 0, 
    Y: sessions[sessionCode].Y || 0
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

function ChangeSharedUrl(ws, message){
  const sessionCode = ws.sessionCode;
  if (!sessionCode || !sessions[sessionCode]) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Du bist in keiner Session!'
    }));
    return;
  }

  const tabID = message.tabId;
  const newUrl = message.newUrl;
  const favIcon = message.favIcon;

  const tabIndex = sessions[sessionCode].tabs.findIndex((tab) => tab.id == tabID);

  sessions[sessionCode].tabs[tabIndex].url = newUrl;
  sessions[sessionCode].tabs[tabIndex].favIcon = favIcon;

  const typeMessage = {
    type: "url_changed",
    tab: {
      id: sessions[sessionCode].tabs[tabIndex].id,
      url: sessions[sessionCode].tabs[tabIndex].url,
      favIcon: sessions[sessionCode].tabs[tabIndex].favIcon
    },
    activeTabId: sessions[sessionCode].activeTabId
  };

  broadcastToSession(sessionCode, typeMessage, ws);

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
  broadcastToSession(sessionCode,browserTab,ws);
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