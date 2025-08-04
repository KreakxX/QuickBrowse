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
  Download,
  History,
  Navigation,
  Palette,
  Youtube,
  Play,
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
      historysave: (url: string, favicon: string) => void;
      historyload: () => Promise<
        Array<{
          id: number;
          url: string;
          favicon: string;
          timestamp: number;
        }>
      >;
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
  const [shared, setShared] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("KreakxX");
  const [shareCursor, setShareCursor] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [watchTogether, setWatchTogether] = useState<boolean>(false);
  const [watchTogetherURL, setWatchTogetherURL] = useState<string>("");
  const [watchTogetherCurrentURL, setWatchTogetherCurrentURL] =
    useState<string>("");

  interface ChatMessage {
    username?: string;
    message?: string;
  }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sessionCode, setSessionCode] = useState<string>("");
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>("");
  const [history, setHistory] = useState<
    { id: number; url: string; favicon: string; timestamp: number }[]
  >([]);
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

  interface color {
    name: string;
    hex: string;
    secondary: string;
  }

  const [activeTheme, setActiveTheme] = useState<color>({
    name: "default",
    hex: "#27272a",
    secondary: "#3f3f46",
  });

  const colors = [
    { name: "default", hex: "#27272a", secondary: "#3f3f46" },
    { name: "pastelBlue", hex: "#AEC6CF", secondary: "#90ACB7" },
    { name: "pastelGreen", hex: "#B2F2BB", secondary: "#91D4A0" },
    { name: "pastelPink", hex: "#FFD1DC", secondary: "#E6AAB8" },
    { name: "pastelPurple", hex: "#CBAACB", secondary: "#A98AA9" },
    { name: "pastelYellow", hex: "#FFF5BA", secondary: "#E6D998" },
    { name: "mint", hex: "#AAF0D1", secondary: "#8BD3B6" },
    { name: "babyBlue", hex: "#BFEFFF", secondary: "#9ACDDC" },
    { name: "lavender", hex: "#E6E6FA", secondary: "#CFCFE3" },
    { name: "peach", hex: "#FFDAB9", secondary: "#E6BB93" },
    { name: "lightCoral", hex: "#F08080", secondary: "#CC6666" },
    { name: "seafoam", hex: "#9FE2BF", secondary: "#7FC1A1" },
    { name: "lightLilac", hex: "#D8B7DD", secondary: "#B995BD" },
    { name: "blush", hex: "#F9C6C9", secondary: "#DAA5A9" },
    { name: "softTeal", hex: "#B2DFDB", secondary: "#8FC0BE" },
    { name: "paleOrange", hex: "#FFD8B1", secondary: "#E6B48C" },
    { name: "pastelCyan", hex: "#B2FFFF", secondary: "#90DCDC" },
    { name: "lightRose", hex: "#FADADD", secondary: "#DCB8BB" },
    { name: "honeydew", hex: "#F0FFF0", secondary: "#D1E6D1" },
    { name: "powderBlue", hex: "#B0E0E6", secondary: "#8FC2C7" },
    { name: "mist", hex: "#D6EAF8", secondary: "#B6C9D6" },
  ];

  const activeTabIdRef = useRef(activeTabId);
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

  const [suggestions, setSuggestions] = useState<string[]>([]);

  function extractYouTubeVideoID(url: string): string | null {
    try {
      const parsedUrl = new URL(url);

      // Check for standard YouTube URL with 'v' param
      if (
        parsedUrl.hostname.includes("youtube.com") &&
        parsedUrl.searchParams.has("v")
      ) {
        return parsedUrl.searchParams.get("v");
      }

      // Check for youtu.be short URL, e.g. https://youtu.be/VIDEO_ID
      if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.slice(1); // remove leading '/'
      }

      // Optionally: check for embed URLs or other formats

      return null; // no valid video ID found
    } catch {
      return null; // invalid URL
    }
  }

  // checking sometimes gets called multiple times like registering again and agai => no clean moving back
  // Browsing history, watch together, leave Session or close Session sqlite DB
  // if you navigate you should also update the tab path
  const [tabs, setTabs] = useState<tab[]>([
    {
      id: 0,
      url: "https://google.com",
      favIcon: "https://google.com/favicon.ico",
    },
  ]);

  useEffect(() => {
    if (!currentUrl.trim()) {
      setSuggestions([]);
      return;
    }
    const matches = history
      .filter((item) =>
        item.url.toLowerCase().includes(currentUrl.toLowerCase())
      )
      .map((item) => item.url)
      .slice(0, 5);
    setSuggestions(matches);
  }, [currentUrl, history]);

  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

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

  const loadHistory = async () => {
    if (!window.electronAPI?.historyload) return;
    const history = await window.electronAPI.historyload();
    const fixedHistory = history.map(({ id, url, favicon, timestamp }) => ({
      id,
      url,
      favicon,
      timestamp: timestamp,
    }));

    setHistory(fixedHistory);
  };
  // gucken was man alles easy sharen kann
  useEffect(() => {
    const handleWebViewEvents = () => {
      const activeWebView = webviewRefs.current[activeTabId];
      if (!activeWebView) return;

      const handleNavigate = (event: any) => {
        console.log("Navigation detected:", event.url); // Add this line
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

        window.electronAPI?.historysave(
          newUrl,
          new URL(newUrl).origin + "/favicon.ico"
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

      activeWebView.addEventListener("did-navigate", handleNavigate);
      activeWebView.addEventListener("did-navigate-in-page", handleNavigate);

      // Cleanup function to remove event listeners
      return () => {
        activeWebView.removeEventListener("did-navigate", handleNavigate);
        activeWebView.removeEventListener(
          "did-navigate-in-page",
          handleNavigate
        );
      };
    };

    const cleanup = handleWebViewEvents();
    return () => {
      if (cleanup) cleanup();
    };
  }, [activeTabId, shared]);

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
        // problem is activeTabId and SessionId wont update correctly when adding a new Tab and switching to it
        // it needs to be checking the locally thing
        if (data.tab.id === activeTabIdRef.current) {
          setCurrentUrl(data.tab.url);
          setUrl(data.tab.url);
          const webview = webviewRefs.current[data.tab.id] as any;
          if (webview && webview.src !== data.tab.url) {
            console.log("Navigating webview to:", data.tab.url);
            webview.src = data.tab.url;
          }
        } else {
          console.log(data.tab.id);
          console.log(activeTabId);
          console.log(activeTabIdSession);
        }
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
        setActiveTabIdSession(data.activeTabId);
        break;

      case "enableWatchTogether":
        setWatchTogether(data.watchTogether);
        setWatchTogetherURL(data.embedUrl);
        break;

      case "youtube_play":
        playvideo();
        break;
      case "youtube_pause":
        pausevideo();
        break;
      case "session_joined":
        setSessionCode(data.code);
        setShared(true);
        setTabs(data.tabs);
        setChatMessages(data.messages || []);
        setNextId(data.nextId);
        setActiveTabId(data.activeTabId);
        setActiveTabIdSession(data.activeTabId);
        setXSession(data.X);
        setYSession(data.Y);

        const activeTab = data.tabs.find(
          (tab: tab) => tab.id === data.activeTabId
        );
        if (activeTab) {
          setUrl(activeTab.url);
          setCurrentUrl(activeTab.url);
        }
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

  // Watch Together Logic
  const playvideo = () => {
    console.log("CALLED");

    const iframe = document.getElementById(
      "youtube-iframe"
    ) as HTMLIFrameElement;
    iframe?.contentWindow?.postMessage(
      '{"event":"command","func":"playVideo","args":[]}',
      "*"
    );
  };

  const pausevideo = () => {
    console.log("CALLED");
    const iframe = document.getElementById(
      "youtube-iframe"
    ) as HTMLIFrameElement;
    iframe?.contentWindow?.postMessage(
      '{"event":"command","func":"pauseVideo","args":[]}',
      "*"
    );
  };
  // capturing play and pause
  useEffect(() => {
    if (!watchTogether) return;
    const handleMessage = (event: any) => {
      console.log("HERE");
      if (!event.origin.includes("youtube.com")) return;
      try {
        const data = JSON.parse(event.data);
        console.log("IN THE USEEFFECT");
        if (data.event === "onStateChange") {
          console.log("STATE CHANGED");
          if (data.info === 1) {
            wsRef.current?.send(
              JSON.stringify({
                type: "youtube_play",
              })
            );
          } else if (data.info === 2) {
            wsRef.current?.send(
              JSON.stringify({
                type: "youtube_pause",
              })
            );
          }
        }
      } catch (e) {}
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [watchTogether]);

  const EnableWatchTogether = () => {
    setWatchTogether(true);
    const videoID = extractYouTubeVideoID(watchTogetherCurrentURL);
    let embedURL = "";
    if (videoID) {
      embedURL = `https://www.youtube.com/embed/${videoID}?enablejsapi=1&origin=${window.location.origin}`;
      setWatchTogetherURL(embedURL);
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Not connected to server");
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "enableWatchTogether",
        watchTogether: true,
        embedUrl: embedURL,
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
    if (shared) {
      wsRef.current.send(
        JSON.stringify({
          type: "active_tab_id",
          activeTabId: tabId,
        })
      );
    }
  };
  const navigateBack = () => {
    const activeWebview = webviewRefs.current[activeTabId] as any;
    activeWebview?.goBack();
  };

  const navigateForward = () => {
    const activeWebview = webviewRefs.current[activeTabId] as any;
    activeWebview?.goForward();
  };

  // also via websockets so everything happends
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

  const getMouseMovement = () => {
    let lastSent = 0;
    const THROTTLE_MS = 35;

    document.addEventListener("mousemove", (e) => {
      const now = Date.now();

      if (now - lastSent < THROTTLE_MS) {
        return;
      }
      lastSent = now;

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return;
      }

      const webviewContainer = document.querySelector(
        ".flex-1.bg-zinc-900.relative"
      );
      if (webviewContainer) {
        const rect = webviewContainer.getBoundingClientRect();

        // calculate and use relative px
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        // boundary checks
        if (
          relativeX >= 0 &&
          relativeY >= 0 &&
          relativeX <= rect.width &&
          relativeY <= rect.height
        ) {
          wsRef.current.send(
            JSON.stringify({
              type: "mouse_move",
              data: {
                x: relativeX,
                y: relativeY,
              },
            })
          );
        }
      }
    });
  };

  return (
    <div className="h-screen bg-zinc-800 text-white flex flex-col ">
      <div className="flex h-full w-full overflow-hidden justify-between">
        {showSidebar ? (
          <div
            style={{ backgroundColor: activeTheme?.hex }}
            className="w-64  border-r border-gray-700 flex flex-col"
          >
            <div className="flex items-center space-x-2 ml-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-transparent "
                onClick={() => {
                  navigateBack();
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-transparent"
                onClick={() => {
                  navigateForward();
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-transparent "
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
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setTimeout(() => setInputFocused(false), 100)}
                  onKeyDown={handleKeyDown}
                  style={{
                    backgroundColor: activeTheme?.secondary,
                    borderColor: activeTheme?.secondary,
                  }}
                  className=" text-white placeholder-gray-400 h-8 "
                  placeholder="Enter URL..."
                />
                {suggestions.length > 0 && inputFocused && (
                  <div
                    style={{
                      backgroundColor: activeTheme?.secondary,
                      borderColor: activeTheme?.secondary,
                    }}
                    className=" rounded-lg "
                  >
                    {suggestions.map((suggestion) => (
                      <Button
                        onClick={(e) => {
                          setUrl(suggestion);
                          setCurrentUrl(suggestion);
                        }}
                        style={{
                          backgroundColor: activeTheme?.secondary,
                          borderColor: activeTheme?.secondary,
                        }}
                        className=" mt-2 p-2 ml-2 flex"
                      >
                        <img
                          src={new URL(suggestion).origin + "/favicon.ico"}
                          alt="favicon"
                          className="w-5 h-5 mr-2  mt-0.5"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        <div className="truncate"> {suggestion} </div>
                      </Button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <Button
                    style={{
                      backgroundColor: !shareCursor
                        ? activeTheme?.secondary
                        : undefined,
                    }}
                    className={` w-1/2 rounded-lg  mt-2 ${
                      shareCursor ? "bg-green-600 hover:bg-green-600" : ""
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
                          style={{
                            backgroundColor: !shared
                              ? activeTheme?.secondary
                              : undefined,
                          }}
                          className={` w-full rounded-lg  mt-2 ${
                            shared ? "bg-green-600 hover:bg-green-600" : ""
                          }`}
                        >
                          <Link></Link>
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        style={{ backgroundColor: activeTheme?.secondary }}
                        className="sm:max-w-[425px] top-20 left-3 translate-x-0 translate-y-0  border-none"
                      >
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            Session Settings
                          </DialogTitle>
                          <DialogDescription>
                            Join or Create a Session
                          </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="join" className="w-full">
                          <TabsList
                            style={{ backgroundColor: activeTheme?.hex }}
                            className="w-full bg-zinc-700"
                          >
                            <TabsTrigger
                              style={
                                {
                                  "--tab-bg": activeTheme?.hex,
                                  "--tab-bg-active": activeTheme?.secondary, // fallback oder deine aktive Farbe
                                } as React.CSSProperties
                              }
                              className="
      text-white
      bg-[var(--tab-bg)]
      data-[state=active]:bg-[var(--tab-bg-active)]
    "
                              value="join"
                            >
                              Join
                            </TabsTrigger>

                            <TabsTrigger
                              style={
                                {
                                  "--tab-bg": activeTheme?.hex,
                                  "--tab-bg-active": activeTheme?.secondary,
                                } as React.CSSProperties
                              }
                              className="
      text-white
      bg-[var(--tab-bg)]
      data-[state=active]:bg-[var(--tab-bg-active)]
    "
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
                              style={{
                                backgroundColor: activeTheme?.hex,
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
                              style={{
                                backgroundColor: activeTheme?.hex,
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
                    style={{ backgroundColor: activeTheme?.secondary }}
                    className={`w-12 h-12 rounded-lg   p-0 flex items-center justify-center transition-colors`}
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

            <div className="flex-1 p-3 mt-5 ">
              <div className="mb-3 ">
                <Button
                  onClick={() => {
                    addNewTab(currentUrl);
                  }}
                  variant="ghost"
                  size="sm"
                  className=" w-full justify-start text-gray-400 hover:bg-transparent hover:text-gray-500  "
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New tab
                </Button>
              </div>

              <div className="overflow-y-auto max-h-[65vh] scrollbar-hide">
                {tabs.map((tab) => {
                  return (
                    <div key={tab.id} className="mb-2  relative group">
                      <button
                        onClick={() => switchToTab(tab.id)}
                        className={`w-full h-10 flex items-center justify-start text-left pr-8 px-3 rounded 
  ${
    tab.id === activeTabIdSession && shared
      ? " border border-green-500"
      : tab.id === activeTabId
      ? " border border-blue-500"
      : " border-none hover:bg-zinc-600"
  } rounded-lg`}
                        style={{ backgroundColor: activeTheme?.secondary }}
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
            </div>
            <div className="flex justify-between w-[20%]">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      loadHistory();
                    }}
                    style={{ backgroundColor: activeTheme?.secondary }}
                    className="rounded-lg mb-3 ml-3 w-12 h-12 "
                  >
                    <History></History>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  style={{ backgroundColor: activeTheme?.hex }}
                  className="max-w-[425px]   border-none"
                >
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Search History
                    </DialogTitle>
                    <DialogDescription>
                      View your search history
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[600px] max-w-[400px] ">
                    {history.map((history) => (
                      <div className="flex justify-between mb-3">
                        {history.favicon && (
                          <img
                            src={history.favicon}
                            alt="favicon"
                            className="w-5 h-5 mr-2 mt-2"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        )}

                        <Button
                          onClick={() => {
                            setUrl(history.url);
                            setCurrentUrl(history.url);
                          }}
                          className="flex-1 text-sm text-white bg-transparent hover:bg-transparent"
                        >
                          <span className="truncate block w-full text-left">
                            {history.url}
                          </span>
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      loadHistory();
                    }}
                    style={{ backgroundColor: activeTheme?.secondary }}
                    className="rounded-lg mb-3 ml-3 w-12 h-12 "
                  >
                    <Youtube></Youtube>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  style={{ backgroundColor: activeTheme?.hex }}
                  className="max-w-[425px] border-none"
                >
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Watch Together
                    </DialogTitle>
                    <DialogDescription>
                      Choose a Youtube Video for watching together
                    </DialogDescription>
                  </DialogHeader>
                  {watchTogether ? (
                    <div>
                      <Button
                        onClick={() => {
                          setWatchTogether(false);
                        }}
                      >
                        End Session <X></X>
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Input
                        onChange={(e) => {
                          setWatchTogetherCurrentURL(e.target.value);
                        }}
                        className="text-white placeholder:text-white"
                        placeholder="Enter Youtube URL"
                      ></Input>
                      <Button
                        className="w-full mt-2"
                        onClick={() => {
                          EnableWatchTogether();
                        }}
                      >
                        <Play></Play>
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>{" "}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      loadHistory();
                    }}
                    style={{ backgroundColor: activeTheme?.secondary }}
                    className="rounded-lg mb-3 ml-3 w-12 h-12 "
                  >
                    <Palette></Palette>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  style={{ backgroundColor: activeTheme?.hex }}
                  className="max-w-[425px] border-none"
                >
                  <DialogHeader>
                    <DialogTitle className="text-white">Themes</DialogTitle>
                    <DialogDescription>Choose your Theme</DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <Button
                        onClick={() => {
                          setActiveTheme(color);
                        }}
                        style={{ backgroundColor: color.hex }}
                        className="rounded-full w-8 h-8"
                      ></Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>{" "}
              {shared ? (
                <Dialog>
                  <form>
                    <DialogTrigger asChild>
                      <Button
                        style={{ backgroundColor: activeTheme?.secondary }}
                        className="rounded-lg mb-3 ml-3 w-12 h-12"
                      >
                        <MessageCircle></MessageCircle>
                      </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild></DialogTrigger>
                    <DialogContent
                      style={{ backgroundColor: activeTheme?.hex }}
                      className="max-w-[425px]   border-none"
                    >
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          Session Chat
                        </DialogTitle>
                        <DialogDescription>
                          Communicate with your fellas in Quick Browse
                        </DialogDescription>
                      </DialogHeader>

                      <ScrollArea className="max-h-[600px] ">
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
                                    <AvatarFallback
                                      style={{
                                        backgroundColor: activeTheme?.secondary,
                                      }}
                                      className="text-white"
                                    >
                                      {message.username
                                        ?.slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                {isCurrentUser ? (
                                  <p
                                    style={{
                                      backgroundColor: activeTheme?.secondary,
                                    }}
                                    className="text-white  rounded-lg p-3 max-w-[200px] break-words"
                                  >
                                    {message.message}
                                  </p>
                                ) : (
                                  <p
                                    style={{
                                      backgroundColor: activeTheme?.secondary,
                                    }}
                                    className="text-white rounded-lg p-3 max-w-[200px] break-words"
                                  >
                                    {message.message}
                                  </p>
                                )}
                                {isCurrentUser && (
                                  <Avatar>
                                    <AvatarFallback
                                      style={{
                                        backgroundColor: activeTheme?.secondary,
                                      }}
                                      className=" text-white"
                                    >
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
                          style={{
                            backgroundColor: activeTheme?.secondary,
                          }}
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
            </div>
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
              <MousePointer2
                color="limegreen"
                fill="limegreen"
                style={{
                  position: "absolute",
                  top: ySession,
                  left: xSession,
                  width: 25,
                  height: 25,
                  borderRadius: "50%",
                  pointerEvents: "none",
                  transform: "translate(-12.5px, -12.5px)",
                  zIndex: 1000,
                }}
              />
            ) : null}

            {!watchTogether ? (
              tabs.map((tab) => (
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
              ))
            ) : (
              <iframe
                src={watchTogetherURL}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
                id="youtube-iframe"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
