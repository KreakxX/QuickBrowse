import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  X,
  MessageCircle,
  ArrowBigRight,
  Link,
  MousePointer2,
  History,
  Palette,
  Youtube,
  Play,
  Scaling,
  Search,
  BookMarked,
  Bookmark,
  Group,
  ExternalLink,
  GroupIcon,
  AppWindow,
  Scale,
  PlayIcon,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "./components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Separator } from "./components/ui/separator";
import { Badge } from "./components/ui/badge";
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
      addNewBookmark: (url: string, favicon: string) => void;
      loadAllBookmarks: () => Promise<
        Array<{
          id: number;
          url: string;
          favicon: string;
          timestamp: number;
        }>
      >;
      addNewSavedtab: (url: string, favicon: string, id: number) => void;
      loadSavedTab: () => Promise<
        Array<{
          id: number;
          url: string;
          favicon: string;
          timestamp: number;
        }>
      >;
      deleteSavedTab: (id: number) => void;
    };
  }
}

export default function BrowserLayout() {
  const [url, setUrl] = useState("https://quickbrowse.vercel.app/");
  const [currentUrl, setCurrentUrl] = useState<string>(
    "https://quickbrowse.vercel.app"
  );
  const [showSidebar] = useState<boolean>(true);
  const [nextId, setNextId] = useState(1);
  const [isResizing, setIsResizing] = useState<boolean>(false);
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
  interface SplitView {
    baseTabId: number;
    splitViewTabId: number;
  }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>("");
  const [splitViewTabs, setSplitViewTabs] = useState<SplitView[]>([]);
  const [addNewTabSearchBar, setAddNewTabSearchBar] = useState<boolean>(false);
  const [history, setHistory] = useState<
    { id: number; url: string; favicon: string; timestamp: number }[]
  >([]);
  const [xSession, setXSession] = useState<number>(0);
  const [ySession, setYSession] = useState<number>(0);
  const [savedTabs, setSavedTabs] = useState<savedTab[]>([]);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const [TabGroupOpen, setTabGroupOpen] = useState<boolean>(false);
  interface color {
    name: string;
    hex: string;
    secondary: string;
    secondary2: string;
    acsent: string;
  }
  // good #3f3f4666
  const [activeTheme, setActiveTheme] = useState<color>({
    name: "dark",
    hex: "#09090b",
    secondary: "#18181b",
    secondary2: "#27272a",
    acsent: "#6366f1",
  });

  const colors = [
    {
      name: "dark",
      hex: "#09090b",
      secondary: "#18181b",
      secondary2: "#27272a",
      acsent: "#6366f1",
    },
    {
      name: "default",
      hex: "#27272a",
      secondary: "#3f3f4666",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "pastelBlue",
      hex: "#AEC6CF",
      secondary: "#90ACB7",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "pastelGreen",
      hex: "#B2F2BB",
      secondary: "#91D4A0",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "pastelPink",
      hex: "#FFD1DC",
      secondary: "#E6AAB8",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "pastelPurple",
      hex: "#CBAACB",
      secondary: "#A98AA9",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "pastelYellow",
      hex: "#FFF5BA",
      secondary: "#E6D998",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "mint",
      hex: "#AAF0D1",
      secondary: "#8BD3B6",
      secondary2: "#27272a",
      acsent: "#6366f1",
    },
    {
      name: "babyBlue",
      hex: "#BFEFFF",
      secondary: "#9ACDDC",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "lavender",
      hex: "#E6E6FA",
      secondary: "#CFCFE3",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "peach",
      hex: "#FFDAB9",
      secondary: "#E6BB93",
      secondary2: "#27272a",
      acsent: "#6366f1",
    },
    {
      name: "lightCoral",
      hex: "#F08080",
      secondary: "#CC6666",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "seafoam",
      hex: "#9FE2BF",
      secondary: "#7FC1A1",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "lightLilac",
      hex: "#D8B7DD",
      secondary: "#B995BD",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "blush",
      hex: "#F9C6C9",
      secondary: "#DAA5A9",
      secondary2: "#27272a",
      acsent: "#6366f1",
    },
    {
      name: "softTeal",
      hex: "#B2DFDB",
      secondary: "#8FC0BE",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "paleOrange",
      hex: "#FFD8B1",
      secondary: "#E6B48C",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "pastelCyan",
      hex: "#B2FFFF",
      secondary: "#90DCDC",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "lightRose",
      hex: "#FADADD",
      secondary: "#DCB8BB",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "honeydew",
      hex: "#F0FFF0",
      secondary: "#D1E6D1",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "powderBlue",
      hex: "#B0E0E6",
      secondary: "#8FC2C7",
      secondary2: "#27272a",

      acsent: "#6366f1",
    },
    {
      name: "mist",
      hex: "#D6EAF8",
      secondary: "#B6C9D6",
      secondary2: "#27272a",
      acsent: "#6366f1",
    },
  ];
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [bookMarkTabs, setBookMarkTabs] = useState<
    { id: number; url: string; favicon: string; timestamp: number }[]
  >([]);

  const [oldCurrentTime, setOldCurrentTime] = useState<number>(0);
  const [skipped, setSkipped] = useState<boolean>(false);
  const [skipForwardbool, setSkipForwardsbool] = useState<boolean>(false);
  const [skipBackwardsbool, setSkipBackwardsbool] = useState<boolean>(false);
  const [savedTabId, setSavedTabId] = useState<number>(0);
  const activeTabIdRef = useRef(activeTabId);
  const watchTogetherUrlRef = useRef(watchTogetherURL);
  const currentTimeRef = useRef(currentTime);
  const webviewRefs = useRef<{ [key: number]: HTMLElement | null }>({});
  const [tabGroups, setTabGroups] = useState<tabGroup[]>([]);
  const [tabGroupId, setTabGroupId] = useState<number>(1);
  const [activeTabGroup, setActiveTabGroup] = useState<number>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [addNewTabSearchBarWorkspace, setAddNewTabSearchBarWorkspace] =
    useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  interface savedTab {
    id: number;
    url: string;
    favicon?: string;
  }

  interface tabGroup {
    id: number;
    title: string;
    tabs: tab[];
  }

  interface tab {
    id: number;
    url: string;
    title?: string;
    favIcon?: string;
  }

  const createNewTabGroup = () => {
    const newTabGroup = {
      id: tabGroupId,
      title: title,
      tabs: [],
    };
    setTabGroupId(tabGroupId + 1);
    setTabGroups((prev) => [...prev, newTabGroup]);
  };

  const deleteTabGroup = (id: number) => {
    const filteredTabs = tabGroups.filter((group) => group.id + 1 == id);
    setTabGroupId(tabGroupId - 1);
    setTabGroups(filteredTabs);
  };

  const addTabToTabGroup = (url: string) => {
    const origin = new URL(url).origin;
    const newTab = {
      id: nextId,
      url: url,
      favIcon: origin + "/favicon.ico",
    };

    setTabGroups((prevgroup) =>
      prevgroup.map((group) =>
        group.id == activeTabGroup
          ? {
              ...group,

              tabs: [...group.tabs, newTab],
            }
          : group
      )
    );
    setActiveTabId(nextId);
    setUrl(url);
    setCurrentUrl(url);

    setNextId((prev) => prev + 1);
  };

  const removeFromTabGroup = (id: number) => {
    setTabGroups((prevgroup) =>
      prevgroup.map((group) =>
        group.id == activeTabGroup
          ? {
              ...group,

              tabs: group.tabs.filter((tab) => tab.id !== id),
            }
          : group
      )
    );
  };
  const getAllTabs = () => {
    const normalTabs = tabs;
    const groupTabs = tabGroups.flatMap((group) => group.tabs);
    return [...normalTabs, ...groupTabs];
  };

  const getAllTabGroups = () => {
    const baseTabGroup = {
      id: 0,
      title: "Base",
      tabs: tabs,
    };

    return [baseTabGroup, ...tabGroups];
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const groupWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;

      const newActiveGroup = Math.floor(
        (scrollLeft + groupWidth / 2) / groupWidth
      );

      const clampedActiveGroup = Math.max(
        0,
        Math.min(newActiveGroup, getAllTabGroups().length - 1)
      );

      if (clampedActiveGroup !== activeTabGroup) {
        console.log(`Switching to tab group: ${clampedActiveGroup}`);
        setActiveTabGroup(clampedActiveGroup);
      }
    }
  };

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
      url: "https://quickbrowse.vercel.app/",
      favIcon: "https://quickbrowse.vercel.app/favicon.ico",
    },
  ]);

  const suggestions = useMemo(() => {
    if (!currentUrl.trim()) return [];
    if (!currentUrl.trim() || currentUrl.length < 3) return [];
    return history
      .filter((item) =>
        item.url.toLowerCase().includes(currentUrl.toLowerCase())
      )
      .slice(0, 4)
      .map((item) => item.url);
  }, [currentUrl, history]);

  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  useEffect(() => {
    watchTogetherUrlRef.current = watchTogetherURL;
  }, [watchTogetherURL]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

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

  // UI loading with bookmarks like yellow color and the savedTab

  const loadHistory = async () => {
    if (!window.electronAPI?.historyload) return;
    const history = (await window.electronAPI.historyload()).slice(0, 50);
    const fixedHistory = history
      .map(({ id, url, favicon, timestamp }) => ({
        id,
        url,
        favicon,
        timestamp: timestamp,
      }))
      .slice(0, 50);

    const sortedHistory = fixedHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);

    setHistory(sortedHistory);
  };

  // gucken was man alles easy sharen kann
  useEffect(() => {
    const handleWebViewEvents = () => {
      const activeWebView = webviewRefs.current[activeTabId] as any;
      if (!activeWebView) return;
      let lastUrl = "";
      let count = 0;
      const handleNavigate = (event: any, id: number) => {
        let newUrl = event.url;
        count++;
        if (newUrl == lastUrl) return;
        if (count % 2 == 0) {
          lastUrl = event.url;
        }
        try {
          const url = new URL(newUrl);
          url.searchParams.delete("zx");
          url.searchParams.delete("no_sw_cr");
          url.searchParams.delete("_");
          newUrl = url.toString();
        } catch (e) {
          newUrl = event.url;
        }

        if (id === activeTabId) {
          setCurrentUrl(newUrl);
        }

        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === id
              ? {
                  ...tab,
                  url: newUrl,
                  favIcon: new URL(newUrl).origin + "/favicon.ico",
                }
              : tab
          )
        );

        setTabGroups((groups) =>
          groups.map((group) => ({
            ...group,
            tabs: group.tabs.map((tab) =>
              tab.id === activeTabId
                ? {
                    ...tab,
                    url: newUrl,
                    favIcon: new URL(newUrl).origin + "/favicon.ico",
                  }
                : tab
            ),
          }))
        );

        window.electronAPI?.historysave(
          newUrl,
          new URL(newUrl).origin + "/favicon.ico"
        );
        if (shared && wsRef.current?.readyState === WebSocket.OPEN) {
          if (tabGroups.length == 0) {
            wsRef.current.send(
              JSON.stringify({
                type: "url_changed",
                tabId: id,
                newUrl: newUrl,
                favicon: new URL(newUrl).origin + "/favicon.ico",
              })
            );
          } else {
            if (activeTabGroup == 0) {
              wsRef.current.send(
                JSON.stringify({
                  type: "url_changed",
                  tabId: id,
                  newUrl: newUrl,
                  favicon: new URL(newUrl).origin + "/favicon.ico",
                })
              );
            }
          }
        }
      };

      const handleTitleUpdate = (event: any) => {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === activeTabId
              ? {
                  ...tab,
                  title: event.title || tab.title,
                }
              : tab
          )
        );

        setTabGroups((groups) =>
          groups.map((group) => ({
            ...group,
            tabs: group.tabs.map((tab) =>
              tab.id === activeTabId
                ? { ...tab, title: event.title || tab.title }
                : tab
            ),
          }))
        );
      };
      const handleNavigateActive = (e: any) => handleNavigate(e, activeTabId);
      let splitNavigateHandler: ((e: any) => void) | null = null;
      const splitViewActive = splitViewTabs.find(
        (tab) => tab.baseTabId == activeTabId
      );
      if (splitViewActive) {
        const splitViewWebView =
          webviewRefs.current[splitViewActive.splitViewTabId];
        if (splitViewWebView) {
          splitNavigateHandler = (e: any) =>
            handleNavigate(e, splitViewActive.splitViewTabId);
          splitViewWebView.addEventListener(
            "did-navigate",
            splitNavigateHandler
          );
          splitViewWebView.addEventListener(
            "did-navigate-in-page",
            splitNavigateHandler
          );
        }
      }
      activeWebView.addEventListener("page-title-updated", handleTitleUpdate);
      activeWebView.addEventListener("did-navigate", handleNavigateActive);
      activeWebView.addEventListener(
        "did-navigate-in-page",
        handleNavigateActive
      );

      const handleScrollTracking = () => {
        setTimeout(() => {
          activeWebView
            .executeJavaScript(
              `
        try {
        
          if (typeof window === 'undefined' || typeof document === 'undefined') {
            throw new Error('Window or document not available');
          }
          
          const throttle = (func, delay) => {
            let timeoutId;
            return (...args) => {
              clearTimeout(timeoutId);
              timeoutId = setTimeout(() => func.apply(null, args), delay);
            };
          };

          const scrollHandler = throttle(() => {
            const scrollData = {
              scrollTop: window.pageYOffset || document.documentElement.scrollTop,
              scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
              scrollHeight: document.documentElement.scrollHeight,
              clientHeight: window.innerHeight
            };
            
            console.log('SCROLL_DATA:', JSON.stringify(scrollData));
          }, 40);

          window.addEventListener('scroll', scrollHandler, { passive: true });
          document.addEventListener('scroll', scrollHandler, { passive: true });
          
        } catch (error) {
          console.error('Error in scroll tracking:', error.message);
        }
      `
            )
            .catch((err: any) =>
              console.error("Failed to inject scroll tracking:", err)
            );
        }, 1000);
      };

      activeWebView.addEventListener("did-finish-load", handleScrollTracking);
      activeWebView.addEventListener("dom-ready", handleScrollTracking);

      const handleConsoleMessage = (e: any) => {
        if (e.message.includes("SCROLL_DATA:")) {
          const scrollData = JSON.parse(e.message.replace("SCROLL_DATA:", ""));
          console.log("Scroll detected:", scrollData);
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            alert("Not connected to server");
            return;
          }

          wsRef.current.send(
            JSON.stringify({
              type: "scrolled",
              newYScrolled: scrollData.scrollTop,
              newXScrolled: scrollData.scrollLeft,
              TabId: activeTabId,
            })
          );

          // websocket logic
        }
      };

      activeWebView.addEventListener("console-message", handleConsoleMessage);

      return () => {
        const splitViewActive = splitViewTabs.find(
          (tab) => tab.baseTabId == activeTabId
        );
        if (splitViewActive?.splitViewTabId && splitNavigateHandler) {
          const splitViewWebView =
            webviewRefs.current[splitViewActive.splitViewTabId];
          if (splitViewWebView) {
            splitViewWebView.removeEventListener(
              "did-navigate",
              splitNavigateHandler
            );
            splitViewWebView.removeEventListener(
              "did-navigate-in-page",
              splitNavigateHandler
            );
          }
        }
        activeWebView.removeEventListener("did-navigate", handleNavigateActive);
        activeWebView.removeEventListener(
          "page-title-updated",
          handleTitleUpdate
        );
        activeWebView.removeEventListener(
          "did-navigate-in-page",
          handleNavigateActive
        );
      };
    };

    const cleanup = handleWebViewEvents();
    return cleanup;
  }, [activeTabId, activeTabGroup, splitViewTabs, shared]);

  const [sessionCreated, setSessionCreated] = useState<boolean>(false);
  const [sessionJoined, setSessionJoined] = useState<boolean>(false);
  const [sessionCode, setSessionCode] = useState<string>("");

  const sessionCodeRef = useRef(sessionCode);

  useEffect(() => {
    sessionCodeRef.current = sessionCode;
  }, [sessionCode]);

  // method for chaning bools and if chat_message than update the Chatmessages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "session_created":
        setSessionCode(data.code);
        setSessionCreated(true);
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
      case "scrolled":
        const activeWebView = webviewRefs.current[data.TabId] as any;
        activeWebView.executeJavaScript(`
        window.scrollTo({
        top: ${data.newYScrolled},
        behavior: 'smooth'
        });
        `);
        break;
      case "skipped_forward":
        skipForward(data.time);
        break;
      case "skipped_backward":
        skipBackward(data.time);
        break;
      case "delete_session":
        setShared(false);
        setSessionJoined(false);
        setSessionCode("");
        break;
      case "session_joined":
        setSessionCode(data.code);
        setSessionJoined(true);
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
      case "join_watchtogether":
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          alert("Not connected to server");
          return;
        }

        console.log(watchTogetherUrlRef.current);
        console.log(currentTimeRef.current);

        wsRef.current.send(
          JSON.stringify({
            type: "join_info",
            time: currentTimeRef.current,
            url: watchTogetherUrlRef.current,
          })
        );
        break;
      case "join_info_client":
        if (data.url == "") {
          setWatchTogether(false);
        } else {
          setWatchTogether(true);
          setWatchTogetherURL(data.url);
          setTimeout(() => {
            skipForward(data.time);
          }, 2000);
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

  const closeSession = () => {
    if (sessionCreated && shared) {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        alert("Not connected to server");
        return;
      }

      wsRef.current.send(
        JSON.stringify({
          type: "delete_session",
          sessionCode: sessionCode,
        })
      );

      setShared(false);
      setSessionCode("");
      setSessionCreated(false);
    }
  };

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
    const iframe = document.getElementById(
      "youtube-iframe"
    ) as HTMLIFrameElement;
    iframe?.contentWindow?.postMessage(
      '{"event":"command","func":"playVideo","args":[]}',
      "*"
    );
  };

  const pausevideo = () => {
    const iframe = document.getElementById(
      "youtube-iframe"
    ) as HTMLIFrameElement;
    iframe?.contentWindow?.postMessage(
      '{"event":"command","func":"pauseVideo","args":[]}',
      "*"
    );
  };

  useEffect(() => {
    if (currentTime - 5 > oldCurrentTime) {
      setSkipped(true);
      setSkipForwardsbool(true);
      setSkipBackwardsbool(false);
    } else if (currentTime + 3 < oldCurrentTime) {
      setSkipped(true);
      setSkipBackwardsbool(true);
      setSkipForwardsbool(false);
    } else {
      setSkipped(false);
    }
    setOldCurrentTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    if (shared) {
      const interval = setInterval(() => {
        const iframe = document.getElementById(
          "youtube-iframe"
        ) as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            JSON.stringify({
              event: "command",
              func: "getCurrentTime",
              args: [],
            }),
            "https://www.youtube.com"
          );
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [shared]);

  useEffect(() => {
    if (!skipped) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Not connected to server");
      return;
    }

    if (shared) {
      if (skipForwardbool) {
        wsRef.current.send(
          JSON.stringify({ type: "skipped_forward", time: currentTime })
        );
      } else if (skipBackwardsbool) {
        wsRef.current.send(
          JSON.stringify({ type: "skipped_backward", time: currentTime })
        );
      }
    }
  }, [skipped]);

  const skipForward = (time: number) => {
    const difference = time - currentTime;
    const iframe = document.getElementById(
      "youtube-iframe"
    ) as HTMLIFrameElement;
    iframe.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: "seekTo",
        args: [currentTime + difference, true],
      }),
      "https://www.youtube.com"
    );
  };

  const skipBackward = (time: number) => {
    const difference = currentTime - time;
    const iframe = document.getElementById(
      "youtube-iframe"
    ) as HTMLIFrameElement;
    iframe.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: "seekTo",
        args: [Math.max(0, currentTime - difference), true],
      }),
      "https://www.youtube.com"
    );
  };

  // capturing play and pause
  useEffect(() => {
    const handleMessage = (event: any) => {
      try {
        let data;
        if (typeof event.data === "string") {
          data = JSON.parse(event.data);
        } else {
          data = event.data;
        }

        if (data.event === "onReady") {
          setupEventListeners();
        } else if (data.event === "onStateChange") {
          if (shared && wsRef.current?.readyState === WebSocket.OPEN) {
            if (data.info === 1) {
              wsRef.current.send(
                JSON.stringify({
                  type: "youtube_play",
                })
              );
            } else if (data.info === 2) {
              wsRef.current.send(
                JSON.stringify({
                  type: "youtube_pause",
                })
              );
            }
          }
        } else if (data.event === "infoDelivery" && data.info) {
          setCurrentTime(data.info.currentTime);
        } else {
          console.log("Unknown event:", data.event, data);
        }
      } catch (e) {
        console.log(e);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [watchTogether, shared]);

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

  const handleJoingWatchTogetherSession = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Not connected to server");
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        type: "join_watchtogether",
      })
    );
  };

  const setupEventListeners = () => {
    const iframe = document.getElementById(
      "youtube-iframe"
    ) as HTMLIFrameElement;
    if (!iframe) {
      return;
    }
    setTimeout(() => {
      try {
        iframe.contentWindow?.postMessage(
          JSON.stringify({
            event: "command",
            func: "addEventListener",
            args: ["onStateChange"],
          }),
          "https://www.youtube.com"
        );

        iframe.contentWindow?.postMessage(
          JSON.stringify({
            event: "command",
            func: "getPlayerState",
            args: [],
          }),
          "https://www.youtube.com"
        );
      } catch (error) {}
    }, 1000);
  };

  const handleIframeLoad = () => {
    setTimeout(() => {
      const iframe = document.getElementById(
        "youtube-iframe"
      ) as HTMLIFrameElement;
      if (iframe) {
        try {
          iframe.contentWindow?.postMessage(
            '{"event":"listening","id":"youtube-iframe"}',
            "*"
          );
        } catch (error) {
          console.log("Error sending listening message:", error);
        }
      }
    }, 1000);
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

      if (activeTabGroup == 0) {
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === activeTabId
              ? {
                  ...tab,
                  url: currentUrl,
                  favIcon: currentUrl + "/favicon.ico",
                }
              : tab
          )
        );
      }
    }
  };

  const switchToTab = (tabId: number) => {
    const activeSplitView = splitViewTabs.find(
      (sv) => sv.baseTabId === activeTabId
    );
    if (activeSplitView && tabId == activeSplitView.splitViewTabId) return;
    setActiveTabId(tabId);
    const allTabs = getAllTabs();
    const tab = allTabs.find((t) => t.id === tabId);
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
  const saveNewBookmark = (id: number) => {
    const tab = tabs.find((tab) => tab.id == id);
    if (!tab) return;
    window.electronAPI?.addNewBookmark(
      tab.url,
      new URL(tab.url).origin + "/favicon.ico"
    );
  };

  const saveNewLongTermTab = (id: number) => {
    if (savedTabs.length >= 9) return;
    const tab = tabs.find((tab) => tab.id == id);
    if (!tab) return;
    window.electronAPI?.addNewSavedtab(
      tab.url,
      new URL(tab.url).origin + "/favicon.ico",
      savedTabId
    );
    const savedTab = {
      id: savedTabId,
      url: tab.url,
      favicon: tab.favIcon,
    };
    const newSavedTabId = savedTabId + 1;
    setSavedTabs((prev) => [...prev, savedTab]);
    setSavedTabId(newSavedTabId);
  };

  const deleteLongTermTab = (id: number) => {
    const filteredTabs = savedTabs.filter((tab) => tab.id !== id);
    setSavedTabs(filteredTabs);
    window.electronAPI?.deleteSavedTab(id);
  };

  useEffect(() => {
    const findSavedTabs = async () => {
      const Savedtabs = await window.electronAPI?.loadSavedTab();
      console.log(Savedtabs);
      if (!Savedtabs || Savedtabs.length === 0) return;
      const fixedSavedTabs = Savedtabs.map(
        ({ id, url, favicon, timestamp }) => ({
          id,
          url,
          favicon,
          timestamp: timestamp,
        })
      );
      console.log(fixedSavedTabs);
      setSavedTabs(fixedSavedTabs);

      const lastElement = Savedtabs[Savedtabs?.length - 1];
      setSavedTabId(lastElement.id + 1);
    };
    findSavedTabs();
  }, []);

  const loadBookMarks = async () => {
    const bookmarks = await window.electronAPI?.loadAllBookmarks();
    if (!bookmarks) return;

    const fixedBookmarks = bookmarks.map(({ id, url, favicon, timestamp }) => ({
      id,
      url,
      favicon,
      timestamp: timestamp,
    }));

    setBookMarkTabs(fixedBookmarks);
  };

  const closeTab = (id: number) => {
    if (id == activeTabId) {
      const nextTab = tabs.find((tab) => tab.id == id - 1);
      if (nextTab) {
        setActiveTabId(nextTab.id);
        setCurrentUrl(nextTab?.url);
        setUrl(nextTab.url);
      }
    }

    const remainingTabs = tabs.filter((tab) => tab.id !== id);
    const tabToDelete = tabs.find((tab) => tab.id === id);
    setTabs(remainingTabs);
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

        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

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

  const getGridColumns = () => {
    const tabCount = savedTabs.length;
    if (tabCount === 0) return "1fr";
    const cols = Math.min(tabCount, 3);
    return `repeat(${cols}, 1fr)`;
  };

  const ActiveTabCurrentUrl = tabs.find((tab) => tab.id == activeTabId);

  return (
    <div className="h-screen bg-zinc-800   text-white flex flex-col ">
      <div className="flex h-full w-full overflow-hidden justify-between">
        {showSidebar ? (
          <div
            style={{ backgroundColor: activeTheme?.hex }}
            className="w-64 border-none flex flex-col"
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

              <div className="ml-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-transparent  "
                  onClick={() => {
                    saveNewBookmark(activeTabId);
                  }}
                >
                  <Bookmark></Bookmark>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-transparent  "
                  onClick={() => {
                    saveNewLongTermTab(activeTabId);
                  }}
                >
                  <Group></Group>
                </Button>
              </div>
            </div>
            <div className="p-3">
              <div className="relative">
                <div
                  style={{ borderColor: activeTheme.secondary }}
                  className="flex items-center gap-3 px-4 border-b "
                >
                  <div className="flex ">
                    <img
                      className="h-5 w-5 mt-2"
                      src={
                        ActiveTabCurrentUrl?.favIcon?.includes("google")
                          ? "https://google.com/favicon.ico"
                          : ActiveTabCurrentUrl?.favIcon
                      }
                      alt=""
                    />
                    <Input
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      onKeyDown={handleKeyDown}
                      value={currentUrl}
                      onChange={(e) => {
                        setCurrentUrl(e.target.value);
                      }}
                      className="bg-transparent border-none text-white placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                      placeholder="Search..."
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {suggestions.length > 0 && inputFocused ? (
                    <div className="p-2">
                      {suggestions.map((suggestion, index) => {
                        const url = new URL(suggestion);
                        const domain = url.hostname.replace("www.", "");
                        const serviceName = domain.split(".")[0];

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer group"
                            onClick={() => addNewTab(suggestion)}
                          >
                            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                              <img
                                src={`${url.origin}/favicon.ico`}
                                alt={`${serviceName} favicon`}
                                className="w-5 h-5 rounded-sm"
                              />
                              <div className="w-5 h-5 bg-zinc-700 rounded-sm items-center justify-center text-xs text-zinc-400 hidden">
                                {serviceName.charAt(0).toUpperCase()}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium capitalize text-sm">
                                {serviceName}
                              </div>
                              <div className="text-zinc-400 text-xs truncate">
                                {suggestion}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    style={{
                      backgroundColor: !shareCursor
                        ? activeTheme?.secondary
                        : activeTheme.acsent,
                    }}
                    className={` w-1/2 rounded-lg  mt-2 `}
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
                              : activeTheme.acsent,
                          }}
                          className={` w-full rounded-lg  mt-2`}
                        >
                          <Link></Link>
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        style={{ backgroundColor: activeTheme?.hex }}
                        className="sm:max-w-[425px] top-20 left-3 translate-x-0 translate-y-0  border-none"
                      >
                        <DialogClose asChild>
                          <Button className="w-8 h-8">
                            <X></X>
                          </Button>
                        </DialogClose>
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
                            style={{ backgroundColor: activeTheme?.secondary }}
                            className="w-full bg-zinc-700"
                          >
                            <TabsTrigger
                              style={
                                {
                                  "--tab-bg": activeTheme?.secondary,
                                  "--tab-bg-active": activeTheme?.hex, // fallback oder deine aktive Farbe
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
                                  "--tab-bg": activeTheme?.secondary,
                                  "--tab-bg-active": activeTheme?.hex,
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

                            {shared ? (
                              <TabsTrigger
                                style={
                                  {
                                    "--tab-bg": activeTheme?.secondary,
                                    "--tab-bg-active": activeTheme?.hex,
                                  } as React.CSSProperties
                                }
                                className="
      text-white
      bg-[var(--tab-bg)]
      data-[state=active]:bg-[var(--tab-bg-active)]
    "
                                value="Leave"
                              >
                                Leave
                              </TabsTrigger>
                            ) : null}
                          </TabsList>

                          <TabsContent value="join">
                            <Input
                              onChange={(e) => {
                                setSessionCode(e.target.value);
                              }}
                              placeholder="Enter Code"
                              value={sessionCode}
                              className="mb-2 mt-2 text-white border border-zinc-500 "
                            ></Input>
                            <Input
                              onChange={(e) => {
                                setUsername(e.target.value);
                              }}
                              value={username}
                              placeholder="Enter Username"
                              className="mb-3 mt-2 text-white border border-zinc-500"
                            ></Input>
                            <Button
                              onClick={() => {
                                joinSession();
                              }}
                              style={{
                                backgroundColor: activeTheme?.secondary,
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
                              className="mb-2 mt-2 text-white border border-zinc-500"
                            ></Input>
                            <Input
                              onChange={(e) => {
                                setUsername(e.target.value);
                              }}
                              value={username}
                              placeholder="Enter Username"
                              className="mb-3 mt-2 text-white border border-zinc-500"
                            ></Input>
                            <Button
                              onClick={() => {
                                createSession();
                              }}
                              style={{
                                backgroundColor: activeTheme?.secondary,
                              }}
                              className="w-full"
                            >
                              Create Session
                            </Button>
                          </TabsContent>

                          <TabsContent value="Leave">
                            <Button
                              onClick={() => {
                                closeSession();
                              }}
                              style={{
                                backgroundColor: activeTheme?.secondary,
                              }}
                              className="w-full mt-10"
                            >
                              Leave active Session
                            </Button>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </form>
                  </Dialog>{" "}
                </div>
              </div>
              {/* <>
                {(() => {
                  const youtubePlaying = tabs.some(
                    (tab) =>
                      tab.url.includes("youtube") &&
                      !tab.url.includes("google.com")
                  );
                  const youtubeTab = tabs.find(
                    (tab) =>
                      tab.url.includes("youtube") &&
                      !tab.url.includes("google.com")
                  );
                  if (!youtubeTab) return;
                  return youtubePlaying ? (
                    <div
                      style={{ backgroundColor: activeTheme.secondary }}
                      className="px-3 w-full flex mt-4 rounded-lg py-2 gap-3  "
                    >
                      <img
                        src="https://youtube.com/favicon.ico"
                        className="h-4 w-4 mt-0.5"
                        alt=""
                      />
                      <h1 className="text-sm truncate w-[60%]">
                        {youtubeTab.title}
                      </h1>

                      <PlayIcon
                        onClick={() => {}}
                        className="h-4 w-4 mt-0.5"
                      ></PlayIcon>
                    </div>
                  ) : null;
                })()}
              </> */}
            </div>

            <div className="px-3 mb-4 w-full">
              <div className="mt-6">
                <div
                  className="grid  gap-2 w-full"
                  style={{
                    gridTemplateColumns: getGridColumns(),
                  }}
                >
                  {savedTabs.map((tab) => (
                    <Button
                      key={`grid-${tab.id}`}
                      onClick={() => addNewTab(tab.url)}
                      variant="ghost"
                      style={{ backgroundColor: activeTheme?.secondary }}
                      className="h-12 rounded-lg p-2 flex items-center justify-center transition-colors min-w-0"
                    >
                      <ContextMenu>
                        <ContextMenuTrigger>
                          <>
                            {tab.favicon ? (
                              <img
                                src={tab.favicon || "/placeholder.svg"}
                                className="w-6 h-6 rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-6 h-6 bg-zinc-500 rounded flex items-center justify-center text-xs"></div>
                            )}
                          </>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLongTermTab(tab.id);
                            }}
                          >
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 p-3  ">
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
                style={{
                  maxHeight: "65vh",
                  minHeight: "65vh",
                  overflowY: "scroll",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                onScroll={handleScroll}
              >
                {getAllTabGroups().map((tabGroup, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="flex-shrink-0 w-full snap-start mb-2"
                  >
                    <ContextMenu>
                      <ContextMenuTrigger>
                        <h2 className="text-gray-400 font-semibold text-sm mb-5 ml-2">
                          {tabGroup.title}
                        </h2>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTabGroup(tabGroup.id);
                          }}
                        >
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                    <div className="  mb-3 ">
                      <Button
                        onClick={() => {
                          if (tabGroup.title == "Base") {
                            setAddNewTabSearchBar(true);
                          } else {
                            setAddNewTabSearchBarWorkspace(true);
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        className=" w-full justify-start text-gray-400 hover:bg-transparent hover:text-gray-500  "
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New tab
                      </Button>
                    </div>
                    <div className="overflow-y-auto max-h-[65vh] scrollbar-hide px-2">
                      {tabGroup.tabs.map((tab) => {
                        const activeSplitView = splitViewTabs.find(
                          (sv) => sv.baseTabId === tab.id
                        );
                        return activeSplitView ? (
                          <>
                            {(() => {
                              return (
                                <div
                                  key={tab.id}
                                  className="mb-2 relative group"
                                >
                                  <button
                                    style={{
                                      backgroundColor: activeTheme.secondary,
                                      borderColor:
                                        tab.id === activeTabIdSession && shared
                                          ? activeTheme.acsent
                                          : tab.id === activeTabId
                                          ? "#52525b"
                                          : undefined,
                                    }}
                                    className={`w-full h-10 ${
                                      tab.id === activeTabIdSession && shared
                                        ? "border"
                                        : tab.id === activeTabId
                                        ? "border"
                                        : "border-0"
                                    }    flex items-center justify-start text-left px-3 rounded  rounded-lg`}
                                    onClick={() => switchToTab(tab.id)}
                                  >
                                    <div className="flex w-full gap-1">
                                      <div
                                        onMouseEnter={() =>
                                          setHoveredTab(tab.id)
                                        }
                                        onMouseLeave={() => setHoveredTab(null)}
                                        style={{
                                          background: activeTheme.secondary2,
                                        }}
                                        className="flex items-center flex-1 rounded px-2 py-1"
                                      >
                                        {tab.favIcon && (
                                          <img
                                            src={
                                              tab.favIcon || "/placeholder.svg"
                                            }
                                            alt="favicon"
                                            className="w-4 h-4 mr-2"
                                            onError={(e) =>
                                              (e.currentTarget.style.display =
                                                "none")
                                            }
                                          />
                                        )}
                                        <p className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap max-w-[5ch]">
                                          {tab.title}
                                        </p>
                                        {hoveredTab === tab.id && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (tabGroup.title == "Base") {
                                                closeTab(tab.id);
                                              } else {
                                                removeFromTabGroup(tab.id);
                                              }
                                            }}
                                            className="h-5 w-5 hover:bg-zinc-600 bg-transparent rounded-sm ml-1 flex items-center justify-center"
                                          >
                                            <X className="h-3 w-3 text-zinc-400" />
                                          </button>
                                        )}
                                      </div>

                                      {(() => {
                                        const baseTab = splitViewTabs.find(
                                          (tab) =>
                                            tab.baseTabId ==
                                            activeSplitView.baseTabId
                                        );
                                        if (!baseTab) return;
                                        const splitTab = getAllTabs().find(
                                          (t) => t.id === baseTab.splitViewTabId
                                        );
                                        if (!splitTab) return null;
                                        return (
                                          <div
                                            onMouseEnter={() =>
                                              setHoveredTab(
                                                baseTab.splitViewTabId
                                              )
                                            }
                                            onMouseLeave={() =>
                                              setHoveredTab(null)
                                            }
                                            style={{
                                              background:
                                                activeTheme.secondary2,
                                            }}
                                            className="flex items-center flex-1  rounded px-2 py-1"
                                          >
                                            <img
                                              src={
                                                splitTab.favIcon ||
                                                "/placeholder.svg?height=16&width=16"
                                              }
                                              alt="favicon"
                                              className="w-4 h-4 mr-2"
                                              onError={(e) =>
                                                (e.currentTarget.style.display =
                                                  "none")
                                              }
                                            />
                                            <p className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap max-w-[5ch]">
                                              {splitTab.title}
                                            </p>
                                            {hoveredTab ===
                                              baseTab.splitViewTabId && (
                                              <div className="flex gap-1">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (
                                                      tabGroup.title == "Base"
                                                    ) {
                                                      closeTab(tab.id);
                                                    } else {
                                                      removeFromTabGroup(
                                                        tab.id
                                                      );
                                                    }
                                                  }}
                                                  className="h-5 w-5 hover:bg-zinc-600 bg-transparent rounded-sm ml-1 flex items-center justify-center"
                                                >
                                                  <X className="h-3 w-3 text-zinc-400" />
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();

                                                    const existingSplitView =
                                                      splitViewTabs.find(
                                                        (splitView) =>
                                                          splitView.baseTabId ===
                                                          tab.id
                                                      );
                                                    if (existingSplitView) {
                                                      setSplitViewTabs((prev) =>
                                                        prev.filter(
                                                          (splitView) =>
                                                            splitView.baseTabId !==
                                                            tab.id
                                                        )
                                                      );
                                                    } else {
                                                      setSplitViewTabs(
                                                        (prev) => [
                                                          ...prev,
                                                          {
                                                            baseTabId:
                                                              activeTabId,
                                                            splitViewTabId:
                                                              tab.id,
                                                          },
                                                        ]
                                                      );
                                                    }
                                                  }}
                                                  className="h-6 w-6 bg-transparent hover:bg-zinc-600 rounded flex items-center justify-center"
                                                >
                                                  <Scaling
                                                    style={{
                                                      color: splitViewTabs.some(
                                                        (splitView) =>
                                                          splitView.baseTabId ===
                                                          tab.id
                                                      )
                                                        ? activeTheme.acsent
                                                        : "#a1a1aa",
                                                    }}
                                                    className="h-4 w-4"
                                                  />
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </button>
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <>
                            {(() => {
                              const activeSplitTab = splitViewTabs.find(
                                (splitTab) => splitTab.splitViewTabId == tab.id
                              );

                              return activeSplitTab ? null : (
                                <div
                                  key={tab.id}
                                  className="mb-2 relative group"
                                >
                                  <button
                                    onClick={() => switchToTab(tab.id)}
                                    style={{
                                      backgroundColor: activeTheme.secondary,
                                      borderColor:
                                        tab.id === activeTabIdSession && shared
                                          ? activeTheme.acsent
                                          : tab.id === activeTabId
                                          ? "#52525b"
                                          : undefined,
                                    }}
                                    className={`w-full h-10 ${
                                      tab.id === activeTabIdSession && shared
                                        ? "border"
                                        : tab.id === activeTabId
                                        ? "border"
                                        : "border-0"
                                    } flex items-center justify-start text-left px-3 rounded-lg`}
                                  >
                                    {tab.favIcon && (
                                      <img
                                        src={tab.favIcon || "/placeholder.svg"}
                                        alt="favicon"
                                        className="w-5 h-5 mr-2"
                                        onError={(e) =>
                                          (e.currentTarget.style.display =
                                            "none")
                                        }
                                      />
                                    )}
                                    <div className="truncate flex-1 text-sm mr-2 text-white">
                                      {tab.title || tab.url}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (tabGroup.title == "Base") {
                                            closeTab(tab.id);
                                          } else {
                                            removeFromTabGroup(tab.id);
                                          }
                                        }}
                                        className="h-6 w-6 bg-transparent hover:bg-zinc-600 rounded flex items-center justify-center"
                                      >
                                        <X className="h-4 w-4 text-zinc-400" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (activeTabId !== tab.id) {
                                            const existingSplitView =
                                              splitViewTabs.find(
                                                (splitView) =>
                                                  splitView.splitViewTabId ===
                                                  tab.id
                                              );
                                            if (existingSplitView) {
                                              setSplitViewTabs((prev) =>
                                                prev.filter(
                                                  (splitView) =>
                                                    splitView.splitViewTabId !==
                                                    tab.id
                                                )
                                              );
                                            } else {
                                              setSplitViewTabs((prev) => [
                                                ...prev,
                                                {
                                                  baseTabId: activeTabId,
                                                  splitViewTabId: tab.id,
                                                },
                                              ]);
                                            }
                                          }
                                        }}
                                        className="h-6 w-6 bg-transparent hover:bg-zinc-600 rounded flex items-center justify-center"
                                      >
                                        <Scaling
                                          style={{
                                            color:
                                              splitViewTabs.some(
                                                (splitView) =>
                                                  splitView.splitViewTabId ===
                                                  tab.id
                                              ) && activeTabId !== tab.id
                                                ? activeTheme.acsent
                                                : "#a1a1aa",
                                          }}
                                          className="h-4 w-4"
                                        />
                                      </button>
                                    </div>
                                  </button>
                                </div>
                              );
                            })()}
                          </>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {getAllTabGroups().length >= 2 ? (
              <div className="flex justify-center gap-2 mb-2 ">
                {getAllTabGroups().map((tabgroup) => (
                  <div
                    onClick={() => {
                      if (activeTabGroup > tabgroup.id) {
                        scrollContainerRef.current?.scrollBy({
                          left: -200,
                          behavior: "smooth",
                        });
                      } else {
                        scrollContainerRef.current?.scrollBy({
                          left: 200,
                          behavior: "smooth",
                        });
                      }
                    }}
                    className="p-3 rounded-md bg-transparent hover:bg-zinc-700/50"
                  >
                    {" "}
                    <div
                      key={tabgroup.id}
                      style={{
                        backgroundColor:
                          tabgroup.id == activeTabGroup
                            ? activeTheme.acsent
                            : activeTheme.secondary,
                      }}
                      className={`h-2 w-2 rounded-full `}
                    ></div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex justify-between w-[20%]">
              <Dialog
                open={TabGroupOpen}
                onOpenChange={() => {
                  setTabGroupOpen(!TabGroupOpen);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setTabGroupOpen(true);
                    }}
                    style={{ backgroundColor: activeTheme?.secondary }}
                    className="rounded-lg mb-3 ml-2 w-8 h-10 "
                  >
                    <AppWindow></AppWindow>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-[425px] border-zinc-800"
                  style={{ background: activeTheme.hex }}
                >
                  <DialogClose asChild>
                    <Button className="w-8 h-8">
                      <X></X>
                    </Button>
                  </DialogClose>
                  <DialogHeader>
                    <DialogTitle className="text-white">Tab Group</DialogTitle>
                    <DialogDescription>
                      Create a new Tab Group
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                    className="text-white border-zinc-800"
                    placeholder="Title"
                  ></Input>

                  <Button
                    onClick={() => {
                      setTabGroupOpen(false);
                      createNewTabGroup();
                    }}
                    className="bg-zinc-800"
                  >
                    Create new Tab Group
                  </Button>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    style={{ backgroundColor: activeTheme?.secondary }}
                    className="rounded-lg mb-3 ml-2 w-8 h-10 "
                    onClick={() => {
                      loadBookMarks();
                    }}
                  >
                    <Bookmark></Bookmark>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  style={{ backgroundColor: activeTheme.hex }}
                  className="max-w-[425px]  border-zinc-800"
                >
                  <DialogClose asChild>
                    <Button className="w-8 h-8">
                      <X></X>
                    </Button>
                  </DialogClose>
                  <DialogHeader>
                    <DialogTitle className="text-white">Bookmarks</DialogTitle>
                    <DialogDescription>View your Bookmarks</DialogDescription>
                  </DialogHeader>

                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {bookMarkTabs.map((bookmark, index) => {
                        const url = new URL(bookmark.url);
                        const domain = url.hostname.replace("www.", "");
                        const serviceName = domain.split(".")[0];
                        return (
                          <div
                            key={index}
                            className=" relative  rounded-lg border-none mb-3"
                          >
                            <Button
                              onClick={() => addNewTab(bookmark.url)}
                              style={{ backgroundColor: activeTheme.secondary }}
                              className="w-full h-auto p-4 justify-start   rounded-lg"
                            >
                              <div className="flex items-center gap-3 w-full min-w-0">
                                {/* Favicon */}
                                <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center overflow-hidden">
                                  {bookmark.favicon ? (
                                    <img
                                      src={
                                        bookmark.favicon || "/placeholder.svg"
                                      }
                                      alt=""
                                      className="w-5 h-5"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.nextElementSibling?.classList.remove(
                                          "hidden"
                                        );
                                      }}
                                    />
                                  ) : null}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="font-medium text-white truncate">
                                    {serviceName}
                                  </div>
                                  <div className="text-xs text-gray-400 dark:text-gray-400 truncate">
                                    {bookmark.url}
                                  </div>
                                </div>

                                {/* External link icon */}
                                <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                              </div>
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {bookMarkTabs.length === 0 && (
                      <div className="text-center py-12">
                        <Bookmark className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No bookmarks yet
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Save your favorite sites to see them here
                        </p>
                      </div>
                    )}
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
                    className="rounded-lg mb-3 ml-2 w-8 h-10 "
                  >
                    <History></History>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  style={{ backgroundColor: activeTheme.hex }}
                  className="max-w-[425px] border-zinc-800"
                >
                  <DialogClose asChild>
                    <Button className="w-8 h-8">
                      <X></X>
                    </Button>
                  </DialogClose>
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Search History
                    </DialogTitle>
                    <DialogDescription>
                      View your search history
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[600px] max-w-[400px] ">
                    {history.map((history, index) => {
                      const url = new URL(history.url);
                      const domain = url.hostname.replace("www.", "");
                      const serviceName = domain.split(".")[0];
                      return (
                        <div
                          key={index}
                          className=" relative  rounded-lg border-none mb-3"
                        >
                          <Button
                            style={{ backgroundColor: activeTheme.secondary }}
                            onClick={() => addNewTab(history.url)}
                            className="w-full h-auto p-4 justify-start   rounded-lg"
                          >
                            <div className="flex items-center gap-3 w-full min-w-0">
                              {/* Favicon */}
                              <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center overflow-hidden">
                                {history.favicon ? (
                                  <img
                                    src={history.favicon || "/placeholder.svg"}
                                    alt=""
                                    className="w-5 h-5"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      e.currentTarget.nextElementSibling?.classList.remove(
                                        "hidden"
                                      );
                                    }}
                                  />
                                ) : null}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 text-left">
                                <div className="font-medium text-white truncate">
                                  {serviceName}
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-400 truncate">
                                  {history.url}
                                </div>
                              </div>

                              {/* External link icon */}
                              <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                            </div>
                          </Button>
                        </div>
                      );
                    })}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              {shared ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        loadHistory();
                      }}
                      style={{ backgroundColor: activeTheme?.secondary }}
                      className="rounded-lg mb-3 ml-2 w-8 h-10 "
                    >
                      <Youtube size={30}></Youtube>
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    style={{ backgroundColor: activeTheme?.hex }}
                    className="max-w-[425px] border-zinc-800"
                  >
                    <DialogClose asChild>
                      <Button className="w-8 h-8">
                        <X></X>
                      </Button>
                    </DialogClose>
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
                            setWatchTogetherURL("");
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
                          className="text-white placeholder:text-white mt-2 mb-2"
                          placeholder="Enter Youtube URL"
                        ></Input>
                        <Button
                          className="w-full mt-2 mb-2"
                          onClick={() => {
                            EnableWatchTogether();
                          }}
                        >
                          <Play></Play>
                        </Button>
                        <Button
                          onClick={() => {
                            handleJoingWatchTogetherSession();
                          }}
                          className="w-full mt-2"
                        >
                          Join active Session
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              ) : null}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    style={{ backgroundColor: activeTheme?.secondary }}
                    className="rounded-lg mb-3 ml-2 w-9 h-10 "
                  >
                    <Palette></Palette>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  style={{ backgroundColor: activeTheme?.hex }}
                  className="max-w-[425px] border-zinc-800"
                >
                  <DialogClose asChild>
                    <Button className="w-8 h-8">
                      <X></X>
                    </Button>
                  </DialogClose>
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
              </Dialog>
              <Dialog
                open={addNewTabSearchBarWorkspace}
                onOpenChange={() => {
                  setAddNewTabSearchBarWorkspace(false);
                }}
              >
                <DialogContent
                  style={{ backgroundColor: activeTheme.hex }}
                  className="border-zinc-800 max-w-[500px] p-0 gap-0"
                >
                  <div className="flex items-center gap-3 p-4 border-b border-zinc-700">
                    <Search className="text-zinc-400 w-5 h-5 flex-shrink-0" />
                    <Input
                      value={currentUrl}
                      onChange={(e) => {
                        setCurrentUrl(e.target.value);
                      }}
                      className="bg-transparent border-none text-white placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                      placeholder="Search..."
                      autoFocus
                    />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {suggestions.length > 0 ? (
                      <div className="p-2">
                        {suggestions.map((suggestion, index) => {
                          const url = new URL(suggestion);
                          const domain = url.hostname.replace("www.", "");
                          const serviceName = domain.split(".")[0];

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer group"
                              onClick={() => {
                                addTabToTabGroup(suggestion);
                                setAddNewTabSearchBarWorkspace(false);
                              }}
                            >
                              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                                <img
                                  src={`${url.origin}/favicon.ico`}
                                  alt={`${serviceName} favicon`}
                                  className="w-5 h-5 rounded-sm"
                                />
                                <div className="w-5 h-5 bg-zinc-700 rounded-sm items-center justify-center text-xs text-zinc-400 hidden">
                                  {serviceName.charAt(0).toUpperCase()}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="text-white font-medium capitalize text-sm">
                                  {serviceName}
                                </div>
                                <div className="text-zinc-400 text-xs truncate">
                                  {suggestion}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        {currentUrl.length > 0 ? (
                          <div className="w-full px-3 overflow-hidden">
                            <Button
                              onClick={() => {
                                addTabToTabGroup(
                                  `https://www.google.com/search?q=${encodeURIComponent(
                                    currentUrl
                                  )}`
                                );
                                setAddNewTabSearchBarWorkspace(false);
                              }}
                              className="bg-zinc-900 hover:bg-zinc-800 p-6 rounded-lg mt-2 mb-2 w-full truncate"
                            >
                              <Search></Search>
                              {currentUrl} — Search with Google
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 px-4">
                            <Search className="w-12 h-12 text-zinc-600 mb-3" />
                            <h3 className="text-zinc-400 font-medium text-sm">
                              No Results Found
                            </h3>
                            <p className="text-zinc-500 text-xs mt-1 text-center">
                              Try searching for a different term
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog
                open={addNewTabSearchBar}
                onOpenChange={() => {
                  setAddNewTabSearchBar(false);
                }}
              >
                <DialogContent
                  style={{ backgroundColor: activeTheme.hex }}
                  className=" border-zinc-800 max-w-[500px] p-0 gap-0"
                >
                  <div className="flex items-center gap-3 p-4 border-b border-zinc-700">
                    <Search className="text-zinc-400 w-5 h-5 flex-shrink-0" />
                    <Input
                      value={currentUrl}
                      onChange={(e) => {
                        setCurrentUrl(e.target.value);
                      }}
                      className="bg-transparent border-none text-white placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                      placeholder="Search..."
                      autoFocus
                    />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {suggestions.length > 0 ? (
                      <div className="p-2">
                        {suggestions.map((suggestion, index) => {
                          const url = new URL(suggestion);
                          const domain = url.hostname.replace("www.", "");
                          const serviceName = domain.split(".")[0];

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer group"
                              onClick={() => {
                                addNewTab(suggestion);
                                setAddNewTabSearchBar(false);
                              }}
                            >
                              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                                <img
                                  src={`${url.origin}/favicon.ico`}
                                  alt={`${serviceName} favicon`}
                                  className="w-5 h-5 rounded-sm"
                                />
                                <div className="w-5 h-5 bg-zinc-700 rounded-sm items-center justify-center text-xs text-zinc-400 hidden">
                                  {serviceName.charAt(0).toUpperCase()}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="text-white font-medium capitalize text-sm">
                                  {serviceName}
                                </div>
                                <div className="text-zinc-400 text-xs truncate">
                                  {suggestion}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        {currentUrl.length > 0 ? (
                          <div className="w-full px-3 overflow-hidden">
                            <Button
                              onClick={() => {
                                addNewTab(
                                  `https://www.google.com/search?q=${encodeURIComponent(
                                    currentUrl
                                  )}`
                                );
                                setAddNewTabSearchBar(false);
                              }}
                              className="bg-zinc-900 hover:bg-zinc-800 p-6 rounded-lg mt-2 mb-2 w-full truncate"
                            >
                              <Search></Search>
                              {currentUrl} — Search with Google
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 px-4">
                            <Search className="w-12 h-12 text-zinc-600 mb-3" />
                            <h3 className="text-zinc-400 font-medium text-sm">
                              No Results Found
                            </h3>
                            <p className="text-zinc-500 text-xs mt-1 text-center">
                              Try searching for a different term
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              {shared ? (
                <Dialog>
                  <form>
                    <DialogTrigger asChild>
                      <Button
                        style={{ backgroundColor: activeTheme?.secondary }}
                        className="rounded-lg mb-3 ml-2 w-8 h-10 "
                      >
                        <MessageCircle></MessageCircle>
                      </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild></DialogTrigger>
                    <DialogContent
                      style={{ backgroundColor: activeTheme?.hex }}
                      className="max-w-[425px]   border-none"
                    >
                      <DialogClose asChild>
                        <Button className="w-8 h-8">
                          <X></X>
                        </Button>
                      </DialogClose>
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
                          let messageParts: string[] = [];
                          const urlRegex = /(https?:\/\/[^\s]+)/gi;
                          if (message.message) {
                            messageParts = message.message.split(urlRegex);
                          }

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
                                    {messageParts.map((message) => {
                                      if (
                                        urlRegex.test(message) &&
                                        message
                                          .toLowerCase()
                                          .includes("youtube")
                                      ) {
                                        const videoId =
                                          extractYouTubeVideoID(message);
                                        const embedURL = `https://www.youtube.com/embed/${videoId}`;
                                        return (
                                          <iframe
                                            className="h-20 w-40 mt-2 mb-2 rounded-lg"
                                            style={{ pointerEvents: "none" }}
                                            src={embedURL}
                                          ></iframe>
                                        );
                                      }
                                      return null;
                                    })}
                                    {messageParts.map((message) =>
                                      urlRegex.test(message) ? (
                                        <a
                                          onClick={() => {
                                            addNewTab(message);
                                          }}
                                          className="text-blue-500 hover:cursor-pointer"
                                        >
                                          {message}
                                        </a>
                                      ) : (
                                        <p>{message} </p>
                                      )
                                    )}
                                  </p>
                                ) : (
                                  <p
                                    style={{
                                      backgroundColor: activeTheme?.secondary,
                                    }}
                                    className="text-white rounded-lg p-3 max-w-[200px] break-words"
                                  >
                                    {messageParts.map((message) => {
                                      if (
                                        urlRegex.test(message) &&
                                        message
                                          .toLowerCase()
                                          .includes("youtube")
                                      ) {
                                        const videoId =
                                          extractYouTubeVideoID(message);
                                        const embedURL = `https://www.youtube.com/embed/${videoId}`;
                                        return (
                                          <iframe
                                            className="h-20 w-40 mt-2 mb-2 rounded-lg"
                                            style={{ pointerEvents: "none" }}
                                            src={embedURL}
                                          ></iframe>
                                        );
                                      }
                                      return null;
                                    })}

                                    {messageParts.map((message) =>
                                      urlRegex.test(message) ? (
                                        <a
                                          onClick={() => {
                                            addNewTab(message);
                                          }}
                                          className="text-blue-500 hover:cursor-pointer"
                                        >
                                          {message}
                                        </a>
                                      ) : (
                                        <p>{message} </p>
                                      )
                                    )}
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
            {activeTabId === activeTabIdSession && shared ? (
              <MousePointer2
                color="#6366f1"
                fill="#6366f1"
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
              <ResizablePanelGroup
                direction="horizontal"
                className="w-full h-full"
              >
                {(() => {
                  const activeSplitView = splitViewTabs.find(
                    (sv) => sv.baseTabId === activeTabId
                  );
                  const allTabs = getAllTabs();

                  return (
                    <>
                      <ResizablePanel
                        className={!activeSplitView ? "w-full" : "w-1/2"}
                      >
                        <div className="relative w-full h-full">
                          {allTabs.map((tab) => (
                            <webview
                              key={`primary-${tab.id}`}
                              ref={(el) => {
                                webviewRefs.current[tab.id] = el;
                              }}
                              src={tab.id === activeTabId ? url : tab.url}
                              className={`absolute inset-0 w-full h-full ${
                                tab.id === activeTabId ? "flex" : "hidden"
                              }`}
                              partition="persist:QuickBrowse"
                              allowpopups={false}
                              style={{
                                pointerEvents:
                                  shareCursor || isResizing ? "none" : "auto",
                              }}
                              webpreferences="contextIsolation,sandbox"
                            />
                          ))}
                        </div>
                      </ResizablePanel>
                      <ResizableHandle
                        style={{ borderColor: activeTheme.secondary }}
                        className="border"
                        onDragging={(isDragging) => {
                          setIsResizing(isDragging);
                        }}
                      />
                      {activeSplitView && (
                        <ResizablePanel className="w-1/2">
                          <div className="relative w-full h-full">
                            <webview
                              key={`split-${activeSplitView.splitViewTabId}`}
                              ref={(el) => {
                                webviewRefs.current[
                                  activeSplitView.splitViewTabId
                                ] = el;
                              }}
                              src={
                                allTabs.find(
                                  (t) => t.id === activeSplitView.splitViewTabId
                                )?.url || "about:blank"
                              }
                              className="absolute inset-0 w-full h-full flex"
                              partition="persist:QuickBrowse"
                              allowpopups={false}
                              style={{
                                pointerEvents:
                                  shareCursor || isResizing ? "none" : "auto",
                              }}
                              webpreferences="contextIsolation,sandbox"
                            />
                          </div>
                        </ResizablePanel>
                      )}
                    </>
                  );
                })()}
              </ResizablePanelGroup>
            ) : null}
            {watchTogether ? (
              <iframe
                src={watchTogetherURL}
                allow="autoplay; encrypted-media"
                allowFullScreen
                onLoad={handleIframeLoad}
                className="absolute top-0 left-0 w-full h-full"
                id="youtube-iframe"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
