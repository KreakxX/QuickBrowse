import { act, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  ChevronsLeftRight,
  X,
  MessageCircle,
  ArrowBigLeft,
  ArrowBigRight,
  Bolt,
  Link,
  MousePointer2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "./components/ui/scroll-area";

declare global {
  interface Window {
    electronAPI?: {
      getCookies: (partition: string) => Promise<any>;
      sendLog?: (msg: string) => void;
    };
  }
}

export default function BrowserLayout() {
  const [url, setUrl] = useState("https://google.com/");
  const [currentUrl, setCurrentUrl] = useState<string>("https://google.com/");
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [nextId, setNextId] = useState(1);
  const [activeTabId, setActiveTabId] = useState<number>(0);
  const [activeTabIdSession, setActiveTabIdSession] = useState<number>(0);
  const [shared, setShared] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("KreakxX");
  const [cookes, setCookies] = useState<any[]>([]);
  const [shareCursor, setShareCursor] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);

  interface ChatMessage {
    username?: string;
    message?: string;
  }

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sessionCode, setSessionCode] = useState<string>("");

  const [messageInput, setMessageInput] = useState<string>("");
  const [xSession, setXSession] = useState<number>(0);
  const [ySession, setYSession] = useState<number>(0);
  const [savedTabs, setSavedTabs] = useState<savedTab[]>([
    { url: "https://youtube.com", favIcon: "https://youtube.com/favicon.ico" },
    { url: "https://github.com", favIcon: "https://github.com/favicon.ico" },
    { url: "https://chatgpt.com", favIcon: "https://chatgpt.com/favicon.ico" },
    { url: "https://x.com", favIcon: "https://x.com/favicon.ico" },
    { url: "https://google.com", favIcon: "https://google.com/favicon.ico" },
    { url: "https://claude.ai", favIcon: "https://claude.ai/favicon.ico" },
    { url: "https://web.de", favIcon: "https://web.de/favicon.ico" },
    { url: "https://canva.com", favIcon: "https://canva.com/favicon.ico" },
  ]);

  const webviewRefs = useRef<{ [key: number]: HTMLElement | null }>({});
  interface savedTab {
    url: string;
    favIcon?: string;
  }

  interface tab {
    id: number;
    url: string;
    title?: string;
    favIcon?: string;
  }

  // if you navigate you should also update the tab path
  const [tabs, setTabs] = useState<tab[]>([
    {
      id: 0,
      url: "https://google.com",
      favIcon: "https://google.com/favicon.ico",
    },
  ]);

  // just connection useEffect
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // connect to the websockket and update the ref
        const ws = new WebSocket("ws://localhost:8080");
        wsRef.current = ws;
        getMouseMovement();

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        }; // if new message like if created active the Shared bool

        ws.onclose = () => {
          setShared(false);
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error("Failed to connect WebSocket:", error);
      }
    };
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // gucken was man alles easy sharen kann
  useEffect(() => {
    const handleWebViewEvents = () => {
      const activeWebView = webviewRefs.current[activeTabId];
      if (!activeWebView) return;

      const handleNavigate = (event: any) => {
        const newUrl = event.url;

        setCurrentUrl(newUrl);
        setUrl(newUrl);
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === activeTabId
              ? {
                  ...tab,
                  url: newUrl,
                  favIcon: new URL(newUrl).origin + "/favicon.ico",
                }
              : tab
          )
        );

        if (shared && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "url_changed",
              tabId: activeTabId,
              newUrl: newUrl,
              favicon: new URL(newUrl).origin + "/favicon.ico",
            })
          );
        }
      };

      // const handleInPageNavigate = (event: any) => {
      //   const newUrl = event.url;
      //   if (newUrl.includes("/auth") || newUrl.includes("/login")) {
      //     return;
      //   }

      //   setCurrentUrl(newUrl);
      //   setUrl(newUrl);
      //   setTabs((prev) =>
      //     prev.map((tab) =>
      //       tab.id === activeTabId
      //         ? {
      //             ...tab,
      //             url: newUrl,
      //             favIcon: new URL(newUrl).origin + "/favicon.ico",
      //           }
      //         : tab
      //     )
      //   );

      //   if (shared && wsRef.current?.readyState === WebSocket.OPEN) {
      //     wsRef.current.send(
      //       JSON.stringify({
      //         type: "url_changed",
      //         tabId: activeTabId,
      //         newUrl: newUrl,
      //         favicon: new URL(newUrl).origin + "/favicon.ico",
      //       })
      //     );
      //   }
      // };

      activeWebView.addEventListener("did-navigate", handleNavigate);
      // activeWebView.addEventListener(
      //   "did-navigate-in-page",
      //   handleInPageNavigate
      // );

      // Cleanup function to remove event listeners
      return () => {
        activeWebView.removeEventListener("did-navigate", handleNavigate);
        // activeWebView.removeEventListener(
        //   "did-navigate-in-page",
        //   handleInPageNavigate
        // );
      };
    };

    const cleanup = handleWebViewEvents();
    return () => {
      if (cleanup) cleanup();
    };
  }, [activeTabId]);

  // method for chaning bools and if chat_message than update the Chatmessages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "session_created":
        setSessionCode(data.code);
        setShared(true);
        break;
      case "mouse_update":
        setXSession(data.x);
        setYSession(data.y);
        break;
      case "url_changed":
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === data.tab.id
              ? {
                  ...tab,
                  url: data.tab.url,
                  favIcon: new URL(data.tab.url).origin + "/favicon.ico",
                }
              : tab
          )
        );
        // if (data.tab.id == activeTabId) {
        //   setCurrentUrl(data.tab.url);
        //   setUrl(data.tab.url);
        // }
        break;

      case "activeTab_changed":
        setActiveTabIdSession(data.activeTabId);

        break;
      case "browser_tab_new":
        setTabs((prev) => [
          ...prev,
          {
            id: data.id,
            url: data.url,
            favIcon: data.favicon,
          },
        ]);
        setNextId(data.nextId);
        setActiveTabIdSession(data.activeTabId);
        break;

      case "browser_tab_old":
        setTabs((prev) => prev.filter((tab) => tab.id !== data.id));
        setNextId(data.nextId);
        setActiveTabId(data.activeTabId);
        break;

      case "session_joined":
        setSessionCode(data.code);
        setShared(true);
        setTabs(data.tabs);
        setChatMessages(data.messages || []);
        setNextId(data.nextId);
        setActiveTabId(data.activeTabId);
        setXSession(data.X);
        setYSession(data.Y);

        break;

      case "chat_message":
        setChatMessages((prev) => [
          ...prev,
          {
            username: data.username,
            message: data.message,
            timestamp: data.timestamp,
          },
        ]);
        break;
    }
  };
  // add tab recognition and methods for adding and removing tabs

  // same for here
  const createSession = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Not connected to server");
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "create_session",
        username: username,
        currentTabs: tabs,
        nextId: nextId,
        activeTabId: activeTabId,
      })
    );
  };

  // sending the specific type to the server and it handles it via the MessageHandler and updates makes the client joins the session
  const joinSession = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Not connected to server");
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        type: "join_session",
        code: sessionCode,
        username: username,
        activeTabId: activeTabId,
      })
    );
  };

  // send Message to host and other clients
  const sendChatMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Not connected to server");
      return;
    }

    if (!messageInput.trim()) return;

    // send the Message to the host, the websocket which gets also displayed than for all other clients
    wsRef.current.send(
      JSON.stringify({
        type: "chat_message",
        message: messageInput,
      })
    );

    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setUrl(currentUrl);

      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTabId
            ? { ...tab, url: currentUrl, favIcon: currentUrl + "/favicon.ico" }
            : tab
        )
      );
    }
  };

  const switchToTab = (tabId: number) => {
    setActiveTabId(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      setUrl(tab.url);
      setCurrentUrl(tab.url);
    }
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Not connected to server");
      return;
    }
    console.log("sending");
    wsRef.current.send(
      JSON.stringify({
        type: "active_tab_id",
        activeTabId: tabId,
      })
    );
  };
  const navigateBack = () => {
    const activeWebview = webviewRefs.current[activeTabId] as any;
    activeWebview?.goBack();
  };

  const navigateForward = () => {
    const activeWebview = webviewRefs.current[activeTabId] as any;
    activeWebview?.goForward();
  };

  const refresh = () => {
    const activeWebview = webviewRefs.current[activeTabId] as any;
    activeWebview?.reload();
  };

  const addNewTab = (url: string) => {
    const origin = new URL(url).origin;
    const newTab = {
      id: nextId,
      url: url,
      favIcon: origin + "/favicon.ico",
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(nextId);
    const newNextId = nextId + 1;
    setNextId(newNextId);
    setUrl(url);
    setCurrentUrl(url);

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Not connected to server");
      return;
    }
    // if (!messageInput.trim()) return;   // this caused the error
    // send the Message to the host, the websocket which gets also displayed than for all other clients
    {
      shared
        ? wsRef.current.send(
            JSON.stringify({
              type: "add_browser_tab",
              tab: newTab,
              nextId: newNextId,
              activeTabId: nextId,
            })
          )
        : null;
    }
  };

  const closeTab = (id: number) => {
    const remainingTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(remainingTabs);
    const tabToDelete = tabs.find((tab) => tab.id === id);

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Not connected to server");
      return;
    }

    if (shared) {
      wsRef.current.send(
        JSON.stringify({
          type: "remove_browser_tab",
          tab: tabToDelete,
          nextId: nextId,
          activeTabId: remainingTabs.length > 0 ? activeTabId - 1 : 0,
        })
      );
    }
  };
  const GetCookesForDebug = async () => {
    const partition = "persist:QuickBrowse";
    if (window.electronAPI?.getCookies) {
      const result = await window.electronAPI.getCookies(partition);
      setCookies(result);
    }
  };

  const getMouseMovement = () => {
    let lastSent = 0;
    const THROTTLE_MS = 35; // Send mouse updates every 50ms max

    document.addEventListener("mousemove", (e) => {
      const now = Date.now();

      if (now - lastSent < THROTTLE_MS) {
        return;
      }
      lastSent = now;

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return;
      }

      wsRef.current.send(
        JSON.stringify({
          type: "mouse_move",
          data: {
            x: e.clientX,
            y: e.clientY,
          },
        })
      );
    });
  };

  return (
    <div className="h-screen bg-zinc-800 text-white flex flex-col ">
      <div className="flex h-full w-full overflow-hidden justify-between">
        {showSidebar ? (
          <div className="w-64 bg-zinc-800 border-r border-gray-700 flex flex-col">
            <div className="flex items-center space-x-2 ml-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={() => {
                  navigateBack();
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={() => {
                  navigateForward();
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={() => {
                  refresh();
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3">
              <div className="relative">
                <Input
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-zinc-700 border-gray-600 text-white placeholder-gray-400 h-8 "
                  placeholder="Enter URL..."
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    className={` w-1/2 rounded-lg  mt-2 ${
                      shareCursor
                        ? "bg-green-600 hover:bg-green-600"
                        : "bg-zinc-700 hover:bg-zinc-700"
                    }`}
                    onClick={() => {
                      setShareCursor(!shareCursor);
                    }}
                  >
                    <MousePointer2></MousePointer2>
                  </Button>
                  <Dialog>
                    <form className="w-1/2">
                      <DialogTrigger asChild>
                        <Button
                          className={`rounded-lg  w-full mt-2 ${
                            shared
                              ? "bg-green-600 hover:bg-green-600"
                              : "bg-zinc-700 hover:bg-zinc-700"
                          }`}
                        >
                          <Link></Link>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] top-20 left-3 translate-x-0 translate-y-0 bg-zinc-800 border-none">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            Session Settings
                          </DialogTitle>
                          <DialogDescription>
                            Join or Create a Session
                          </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="join" className="w-full">
                          <TabsList className="w-full bg-zinc-700">
                            <TabsTrigger
                              className="bg-zinc-700 text-white data-[state=active]:bg-zinc-900 data-[state=active]:text-white"
                              value="join"
                            >
                              Join
                            </TabsTrigger>
                            <TabsTrigger
                              className="bg-zinc-700 text-white data-[state=active]:bg-zinc-900 data-[state=active]:text-white"
                              value="create"
                            >
                              Create
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="join">
                            <Input
                              onChange={(e) => {
                                setSessionCode(e.target.value);
                              }}
                              placeholder="Enter Code"
                              value={sessionCode}
                              className="mb-2 mt-2 text-white "
                            ></Input>
                            <Input
                              onChange={(e) => {
                                setUsername(e.target.value);
                              }}
                              value={username}
                              placeholder="Enter Username"
                              className="mb-3 mt-2 text-white"
                            ></Input>
                            <Button
                              onClick={() => {
                                joinSession();
                              }}
                              className="w-full"
                            >
                              Enter Session
                            </Button>
                          </TabsContent>

                          <TabsContent value="create">
                            <Input
                              value={sessionCode}
                              placeholder="Create Code"
                              className="mb-2 mt-2 text-white"
                            ></Input>
                            <Input
                              onChange={(e) => {
                                setUsername(e.target.value);
                              }}
                              value={username}
                              placeholder="Enter Username"
                              className="mb-3 mt-2 text-white"
                            ></Input>
                            <Button
                              onClick={() => {
                                createSession();
                              }}
                              className="w-full"
                            >
                              Create Session
                            </Button>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </form>
                  </Dialog>{" "}
                </div>
              </div>
            </div>

            <div className="px-3 mb-4">
              <div className="grid grid-cols-4 gap-4 mt-3">
                {savedTabs.map((tab, index) => (
                  <Button
                    onClick={() => {
                      addNewTab(tab.url);
                    }}
                    key={index}
                    variant="ghost"
                    className="w-12 h-12 rounded-lg bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 p-0 flex items-center justify-center transition-colors"
                  >
                    {tab.favIcon ? (
                      <img
                        src={tab.favIcon || "/placeholder.svg"}
                        className="w-7 h-7 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-zinc-500 rounded flex items-center justify-center text-xs"></div>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1 p-3 mt-5">
              <div className="mb-3 ">
                <Button
                  onClick={() => {
                    addNewTab(currentUrl);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-zinc-700 "
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New tab
                </Button>
              </div>

              {tabs.map((tab) => {
                return (
                  <div key={tab.id} className="mb-2 relative group">
                    <button
                      onClick={() => switchToTab(tab.id)}
                      className={`w-full h-10 flex items-center justify-start text-left pr-8 px-3 rounded 
  ${
    tab.id === activeTabIdSession && shared
      ? "bg-zinc-600 border border-green-500"
      : tab.id === activeTabId
      ? "bg-zinc-600 border border-blue-500"
      : "bg-zinc-700 border-none hover:bg-zinc-600"
  } rounded-lg`}
                    >
                      {tab.favIcon && (
                        <img
                          src={tab.favIcon}
                          alt="favicon"
                          className="w-5 h-5 mr-2"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      )}
                      <div className="truncate flex-1 text-sm">
                        {tab.title || tab.url}
                      </div>
                      <Button
                        onClick={() => {
                          closeTab(tab.id);
                        }}
                        className="bg-transparent relative hover:text-gray-400 left-8 hover:bg-transparent"
                      >
                        <X></X>
                      </Button>
                    </button>
                  </div>
                );
              })}
            </div>

            {shared ? (
              <Dialog>
                <form>
                  <DialogTrigger asChild>
                    <Button className="rounded-lg mb-3 ml-3">
                      <MessageCircle></MessageCircle>
                    </Button>
                  </DialogTrigger>
                  <DialogTrigger asChild></DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] left-3 top-[44%] translate-x-0 translate-y-0 bg-zinc-800 border-none">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Session Chat
                      </DialogTitle>
                      <DialogDescription>
                        Communicate with your fellas in Quick Browse
                      </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[600px]">
                      {chatMessages.map((message, index) => {
                        const isCurrentUser = message.username === username;
                        return (
                          <div
                            key={index}
                            className={`flex ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            } mt-5 mb-5`}
                          >
                            <div className="flex gap-2 items-start">
                              {!isCurrentUser && (
                                <Avatar>
                                  <AvatarFallback className="bg-zinc-700 text-white">
                                    {message.username
                                      ?.slice(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              {isCurrentUser ? (
                                <p className="text-white bg-zinc-500 rounded-lg p-3 max-w-[200px] break-words">
                                  {message.message}
                                </p>
                              ) : (
                                <p className="text-white bg-zinc-700 rounded-lg p-3 max-w-[200px] break-words">
                                  {message.message}
                                </p>
                              )}
                              {isCurrentUser && (
                                <Avatar>
                                  <AvatarFallback className="bg-zinc-700 text-white">
                                    {username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </ScrollArea>
                    <div className="flex justify-between gap-3">
                      <Input
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                        }}
                        placeholder="Enter Chat Message"
                        className="text-white"
                      ></Input>
                      <Button
                        onClick={() => {
                          sendChatMessage();
                        }}
                      >
                        <ArrowBigRight></ArrowBigRight>
                      </Button>
                    </div>
                  </DialogContent>
                </form>
              </Dialog>
            ) : null}
            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button
                    className="rounded-lg mb-3 ml-3"
                    onClick={GetCookesForDebug}
                  >
                    <Bolt></Bolt>
                  </Button>
                </DialogTrigger>
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent className="sm:max-w-[425px] left-3 top-[44%] translate-x-0 translate-y-0 bg-zinc-800 border-none">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Debug Console
                    </DialogTitle>
                    <DialogDescription>
                      <pre className="max-w-[300px] w-[200px] overflow-auto whitespace-pre-wrap break-words">
                        {JSON.stringify(cookes, null, 2)}
                      </pre>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </form>
            </Dialog>
          </div>
        ) : null}

        <div className="flex-1 bg-zinc-900 relative min-h-screen">
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
            {/* <button
              className="absolute left-[0%] top-[3%] hover:bg-zinc-500 bg-zinc-600 h-8 w-8 border-none rounded flex items-center justify-center text-white z-10"
              onClick={() => {
                setShowSidebar(!showSidebar);
              }}
            >
              {!showSidebar ? (
                <ChevronRight></ChevronRight>
              ) : (
                <ChevronLeft></ChevronLeft>
              )}
            </button> */}
            {activeTabId === activeTabIdSession && shared ? (
              <div
                style={{
                  position: "absolute",
                  top: ySession,
                  left: xSession,
                  width: 16,
                  height: 16,
                  backgroundColor: "limegreen",
                  borderRadius: "50%",
                  pointerEvents: "none",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1000,
                }}
              />
            ) : null}

            {tabs.map((tab) => (
              <webview
                ref={(el) => {
                  webviewRefs.current[tab.id] = el;
                }}
                src={tab.id === activeTabId ? url : tab.url}
                className={`absolute top-0 left-0 w-full h-full z-10 ${
                  tab.id === activeTabId ? "flex" : "hidden"
                }`}
                partition="persist:QuickBrowse"
                allowpopups={false}
                style={{
                  pointerEvents: shareCursor ? "none" : "auto",
                }}
                webpreferences="contextIsolation,sandbox"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
