import { Fragment, use, useEffect, useMemo, useRef, useState } from "react";
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
  Bookmark,
  Group,
  ExternalLink,
  AppWindow,
  Settings,
  LayoutPanelLeft,
  LayoutPanelTop,
  PictureInPicture,
  GripVertical,
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
import colors from "./colors";
import { Switch } from "./components/ui/switch";
import { Separator } from "./components/ui/separator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
      addNewYoutubePopup: (url: string) => void;
      removeYoutubePopup: () => void;
    };
  }
}

export default function BrowserLayout() {
  // INTERFACES

  interface ChatMessage {
    username?: string;
    message?: string;
  }
  interface SplitView {
    baseTabId: number;
    splitViewTabId: number;
    layout: string;
  }
  interface color {
    name: string;
    hex: string;
    secondary: string;
    secondary2: string;
    acsent: string;
  }

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

  // USESTATES
  const [url, setUrl] = useState("https://quickbrowse.vercel.app/");
  const [currentUrl, setCurrentUrl] = useState<string>(
    "https://quickbrowse.vercel.app"
  );
  const [showSidebar, setShowSideBar] = useState<boolean>(true);
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

  const [activeTheme, setActiveTheme] = useState<color>({
    name: "dark",
    hex: "#09090b",
    secondary: "#18181b",
    secondary2: "#27272a",
    acsent: "#6366f1",
  });

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
  const [openSettings, setOpenSettings] = useState<boolean>(false);
  const [shareScrolling, setShareScrolling] = useState<boolean>(false);
  const [allowSharedScrolling, setAllowSharedScrolling] =
    useState<boolean>(false);
  const [addNewTabSearchBarWorkspace, setAddNewTabSearchBarWorkspace] =
    useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [tabs, setTabs] = useState<tab[]>([
    {
      id: 0,
      url: "https://quickbrowse.vercel.app/",
      favIcon: "https://quickbrowse.vercel.app/favicon.ico",
    },
  ]);
  const [sessionCreated, setSessionCreated] = useState<boolean>(false);
  const [sessionCode, setSessionCode] = useState<string>("");
  const [youtubePopUp, setYoutubePopUp] = useState<boolean>(false);
  const [youtubePopUpId, setYoutubePopUpId] = useState<number | null>(null);
  const sessionCodeRef = useRef(sessionCode);
  const allowSharedScrollingRef = useRef(allowSharedScrolling);
  const shareScrollingRef = useRef(shareScrolling);

  const [shareScreen, setShareScreen] = useState<boolean>(false);
  const [allowScreen, setAllowScreen] = useState<boolean>(false);

  const shareScreenRef = useRef(shareScreen);
  const allowScreenRef = useRef(allowScreen);
  // TAB GROUP

  const addOrRemoveYoutubePopUp = async (
    popUp: boolean,
    url: string,
    id: number
  ) => {
    if (popUp) {
      await window.electronAPI?.addNewYoutubePopup(url);
      setYoutubePopUpId(id);
    } else {
      await window.electronAPI?.removeYoutubePopup();
      setYoutubePopUpId(null);
    }
    setYoutubePopUp(popUp);
  };

  // method for creating new Tab Groups (Workspaces)
  const createNewTabGroup = () => {
    const newTabGroup = {
      id: tabGroupId,
      title: title,
      tabs: [],
    };
    setTabGroupId(tabGroupId + 1);
    setTabGroups((prev) => [...prev, newTabGroup]);
  };

  // method for deleting a Tab Group (Workspaces) by an Id
  const deleteTabGroup = (id: number) => {
    const filteredTabs = tabGroups.filter((group) => group.id + 1 == id);
    setTabGroupId(tabGroupId - 1);
    setTabGroups(filteredTabs);
  };

  // method for adding a Tab to a Tab Group (Workspace)
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

  // method for removing a Tab from a Tab Group (Workspace)
  const removeTabFromTabGroup = (id: number) => {
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

  // MAPPING

  // method for getting all the Tabs to map and prevent rerenders in the webview section
  const getAllTabs = () => {
    const normalTabs = tabs;

    const groupTabs = tabGroups.flatMap((group) => group.tabs);
    return [...normalTabs, ...groupTabs];
  };

  // method for getting all TabGroups (Workspaces) to map and display
  const getAllTabGroups = () => {
    const baseTabGroup = {
      id: 0,
      title: "Base",
      tabs: tabs,
    };

    return [baseTabGroup, ...tabGroups];
  };

  // method for handling scrolling through the workspaces and changing the workspace id
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

  // USEMEMO for loading search suggetions (auto search complete)
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

  // REFS updating refs to use in the Websocket useEffect
  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  useEffect(() => {
    watchTogetherUrlRef.current = watchTogetherURL;
  }, [watchTogetherURL]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    sessionCodeRef.current = sessionCode;
  }, [sessionCode]);

  useEffect(() => {
    allowSharedScrollingRef.current = allowSharedScrolling;
  }, [allowSharedScrolling]);

  useEffect(() => {
    shareScrollingRef.current = shareScrolling;
  }, [shareScrolling]);

  useEffect(() => {
    allowScreenRef.current = allowScreen;
  }, [allowScreen]);

  useEffect(() => {
    shareScreenRef.current = shareScreen;
  }, [shareScreen]);

  // UseEffect for handling connections with the websocket
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

  const blockedUrl = (url: string) => {
    const blockedHostnames = [
      "chatgpt.com",
      "chat.openai.com",
      "gemini.google.com",
      "claude.ai",
      "bard.google.com",
      "poe.com",
      "character.ai",
      "huggingface.co",
      "accounts.google.com",
      "oauth.googleusercontent.com",
      "googleapis.com",
      "accounts.youtube.com",
      "myaccount.google.com",
      "console.cloud.google.com",
      "console.developers.google.com",
      "developers.google.com",
      "firebase.google.com",
      "console.firebase.google.com",

      "login.microsoftonline.com",
      "account.microsoft.com",
      "login.live.com",
      "github.com/login",
      "api.github.com",
      "facebook.com/login",
      "graph.facebook.com",
      "twitter.com/oauth",
      "api.twitter.com",
      "linkedin.com/oauth",
      "api.linkedin.com",

      "drive.google.com",
      "docs.google.com",
      "sheets.google.com",
      "slides.google.com",
      "mail.google.com",
      "calendar.google.com",
      "photos.google.com",
      "contacts.google.com",
    ];
    const hostname = new URL(url).hostname;
    return blockedHostnames.some((blocked) => hostname.includes(blocked)); // also checks for subdomains basically maps through some(all) and checks if its included
  };

  // useEffect for sharing title changes, and url changes
  useEffect(() => {
    const handleWebViewEvents = () => {
      const activeWebView = webviewRefs.current[activeTabId] as any;
      if (!activeWebView) return;

      let lastUrl = "";
      let count = 0;
      const handleNavigate = (event: any, id: number, isInPage = false) => {
        if (isInPage && blockedUrl(url)) {
          return;
        }

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
          if (tabGroups.length == 0 && shareScreenRef.current) {
            wsRef.current.send(
              JSON.stringify({
                type: "url_changed",
                tabId: id,
                newUrl: newUrl,
                favicon: new URL(newUrl).origin + "/favicon.ico",
              })
            );
          } else {
            if (activeTabGroup == 0 && shareScreenRef.current) {
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
      const handleNavigateActive = (e: any) =>
        handleNavigate(e, activeTabId, false);
      const handleNavigateInPageActice = (e: any) =>
        handleNavigate(e, activeTabId, true);
      let splitNavigateHandler: ((e: any) => void) | null = null;
      let splitNaviagteHandlerInPage: ((e: any) => void) | null = null;
      const splitViewActive = splitViewTabs.find(
        (tab) => tab.baseTabId == activeTabId
      );
      if (splitViewActive) {
        const splitViewWebView =
          webviewRefs.current[splitViewActive.splitViewTabId];
        if (splitViewWebView) {
          splitNavigateHandler = (e: any) =>
            handleNavigate(e, splitViewActive.splitViewTabId, false);
          splitNaviagteHandlerInPage = (e: any) =>
            handleNavigate(e, splitViewActive.splitViewTabId, true);

          splitViewWebView.addEventListener(
            "did-navigate",
            splitNavigateHandler
          );
          splitViewWebView.addEventListener(
            "did-navigate-in-page",
            splitNaviagteHandlerInPage
          );
        }
      }
      activeWebView.addEventListener("page-title-updated", handleTitleUpdate);
      activeWebView.addEventListener("did-navigate", handleNavigateActive);
      activeWebView.addEventListener(
        "did-navigate-in-page",
        handleNavigateInPageActice
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

          if (shareScrollingRef.current) {
            wsRef.current.send(
              JSON.stringify({
                type: "scrolled",
                newYScrolled: scrollData.scrollTop,
                newXScrolled: scrollData.scrollLeft,
                TabId: activeTabId,
              })
            );
          }

          // websocket logic
        }
      };

      activeWebView.addEventListener("console-message", handleConsoleMessage);

      return () => {
        const splitViewActive = splitViewTabs.find(
          (tab) => tab.baseTabId == activeTabId
        );
        if (
          splitViewActive?.splitViewTabId &&
          splitNavigateHandler &&
          splitNaviagteHandlerInPage
        ) {
          const splitViewWebView =
            webviewRefs.current[splitViewActive.splitViewTabId];
          if (splitViewWebView) {
            splitViewWebView.removeEventListener(
              "did-navigate",
              splitNavigateHandler
            );
            splitViewWebView.removeEventListener(
              "did-navigate-in-page",
              splitNaviagteHandlerInPage
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
          handleNavigateInPageActice
        );
      };
    };

    const cleanup = handleWebViewEvents();
    return cleanup;
  }, [activeTabId, activeTabGroup, splitViewTabs, shared]);

  // Method for sharing Mouse movement
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

  // method for handling messages and updating the client via websockets
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
        if (allowScreenRef.current) {
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
        if (allowSharedScrollingRef.current) {
          const activeWebView = webviewRefs.current[data.TabId] as any;
          activeWebView.executeJavaScript(`
        window.scrollTo({
        top: ${data.newYScrolled},
        behavior: 'smooth'
        });
        `);
        }
        break;
      case "skipped_forward":
        skipForward(data.time);
        break;
      case "skipped_backward":
        skipBackward(data.time);
        break;
      case "delete_session":
        setShared(false);
        setSessionCode("");
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

  // SESSION

  // method for closing a Session
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

  // method for creating a Session
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

  // method for joining a Session
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

  // method for playing a video in a watch together envrioment
  const playvideo = () => {
    const iframe = document.getElementById(
      "youtube-iframe"
    ) as HTMLIFrameElement;
    iframe?.contentWindow?.postMessage(
      '{"event":"command","func":"playVideo","args":[]}',
      "*"
    );
  };

  // method for pausing a video in a watch togehter envrioment
  const pausevideo = () => {
    const iframe = document.getElementById(
      "youtube-iframe"
    ) as HTMLIFrameElement;
    iframe?.contentWindow?.postMessage(
      '{"event":"command","func":"pauseVideo","args":[]}',
      "*"
    );
  };

  // UseEffect for detecting skippings and updating the skipped bool
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

  // UseEffect for getting the currentTime when creating a Session
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

  // UseEffect for sending a skipped for or back wards event to sync all the clients
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

  // method for skipping forward in the client when getting message from websockets
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

  // method for skipping backwars in the client when getting message from websockets
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

  // UseEffect for detecting play and pause actions to sync clients
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

  // method for enabling watch together and creating a watch together session
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

  // method for joining a watch together and getting the currenTime from host (asking host for currenttime and then updating client)
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

  // method for extracting Youtube video Id for loading embeddings in Iframe, to work around CORS policy
  function extractYouTubeVideoID(url: string): string | null {
    try {
      const parsedUrl = new URL(url);

      if (
        parsedUrl.hostname.includes("youtube.com") &&
        parsedUrl.searchParams.has("v")
      ) {
        return parsedUrl.searchParams.get("v");
      }

      if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.slice(1);
      }

      return null;
    } catch {
      return null;
    }
  }

  // setting up Eventlisteners to capture play and pause and skipping
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

  // method for initalizing youtube API when creating Iframe
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

  // method for sending a Chat Message to all other clients
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

  // method for searching the web when hitting enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setUrl(currentUrl);

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
  };

  // method for navigating back
  const navigateBack = () => {
    const activeWebview = webviewRefs.current[activeTabId] as any;
    activeWebview?.goBack();
  };

  // method for navigating forward
  const navigateForward = () => {
    const activeWebview = webviewRefs.current[activeTabId] as any;
    activeWebview?.goForward();
  };

  // method for refreshing webpage
  const refresh = () => {
    const activeWebview = webviewRefs.current[activeTabId] as any;
    activeWebview?.reload();
  };

  // method for switching to tab
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

  // method for adding a new Tab (default workspace)
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

  // method for closing a tab from (default workspace)
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

  // method for loading Search History
  const loadHistory = async () => {
    if (!window.electronAPI?.historyload) return;
    const history = await window.electronAPI.historyload();
    const fixedHistory = history.map(({ id, url, favicon, timestamp }) => ({
      id,
      url,
      favicon,
      timestamp: timestamp,
    }));
    const sortedHistory = fixedHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);

    setHistory(sortedHistory);
  };

  // method for saving a new Bookmark
  const saveNewBookmark = (id: number) => {
    const tab = tabs.find((tab) => tab.id == id);
    if (!tab) return;
    window.electronAPI?.addNewBookmark(
      tab.url,
      new URL(tab.url).origin + "/favicon.ico"
    );
  };

  // method for saving a new pinned Tab
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

  // method for deleting a pinned Tab
  const deleteLongTermTab = (id: number) => {
    const filteredTabs = savedTabs.filter((tab) => tab.id !== id);
    setSavedTabs(filteredTabs);
    window.electronAPI?.deleteSavedTab(id);
  };

  // useEffect for loading saved pinned Tabs
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

  // method for loading Bookmarks
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

  const getGridColumns = () => {
    const tabCount = savedTabs.length;
    if (tabCount === 0) return "1fr";
    const cols = Math.min(tabCount, 3);
    return `repeat(${cols}, 1fr)`;
  };

  const ActiveTabCurrentUrl = tabs.find((tab) => tab.id == activeTabId);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const groupId = parseInt(source.droppableId);

    if (source.droppableId !== destination.droppableId) {
      return;
    }

    if (groupId === 0) {
      const newTabs = [...tabs];
      const [removed] = newTabs.splice(source.index, 1); // removes one elemnt from the index and saves the tab

      const isSplitView = splitViewTabs.find(
        (tab) => tab.baseTabId == removed.id
      );

      if (isSplitView) {
        const partnerIndex = newTabs.findIndex(
          (tab) => tab.id === isSplitView.splitViewTabId
        );
        const [splitViewTab] = newTabs.splice(partnerIndex, 1);

        newTabs.splice(destination.index, 0, removed); // fügt Element dort ein 0 means no element deleted

        if (splitViewTab) {
          newTabs.splice(destination.index + 1, 0, splitViewTab);
        }
      } else {
        newTabs.splice(destination.index, 0, removed); // fügt Element dort ein 0 means no element deleted
      }
      setTabs(newTabs);
    } else {
      setTabGroups((prevGroups) => {
        return prevGroups.map((group) => {
          if (group.id === groupId) {
            const newTabs = Array.from(group.tabs);
            const [removed] = newTabs.splice(source.index, 1);
            newTabs.splice(destination.index, 0, removed);
            return { ...group, tabs: newTabs };
          }
          return group;
        });
      });
    }
  };

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

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    style={{
                      backgroundColor: !shareCursor
                        ? activeTheme?.secondary
                        : activeTheme.acsent,
                    }}
                    className={` rounded-lg  mt-2 `}
                    onClick={() => {
                      setShareCursor(!shareCursor);
                    }}
                  >
                    <MousePointer2></MousePointer2>
                  </Button>
                  <Button
                    onClick={() => {
                      setOpenSettings(!openSettings);
                    }}
                    style={{
                      backgroundColor: activeTheme.secondary,
                    }}
                    className={`  rounded-lg  mt-2 `}
                  >
                    <Settings></Settings>
                  </Button>
                  <Dialog>
                    <form className="w-full">
                      <DialogTrigger asChild>
                        <Button
                          style={{
                            backgroundColor: !shared
                              ? activeTheme?.secondary
                              : activeTheme.acsent,
                          }}
                          className={` w-full  rounded-lg  mt-2`}
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
              <DragDropContext onDragEnd={onDragEnd}>
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
                      <div className="mb-3">
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
                      <Droppable droppableId={tabGroup.id.toString()}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="overflow-y-auto max-h-[65vh] scrollbar-hide px-2"
                          >
                            {tabGroup.tabs.map((tab, index) => {
                              const activeSplitView = splitViewTabs.find(
                                (splitViewTab) =>
                                  splitViewTab.baseTabId == tab.id
                              );
                              return activeSplitView ? (
                                <Draggable
                                  key={tab.id.toString()}
                                  draggableId={tab.id.toString()}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        ...provided.draggableProps.style,
                                        opacity: snapshot.isDragging ? 0.5 : 1,
                                      }}
                                      className="mb-2 relative group"
                                    >
                                      {" "}
                                      <div
                                        onMouseEnter={() =>
                                          setHoveredTab(tab.id)
                                        }
                                        onMouseLeave={() => setHoveredTab(null)}
                                        onClick={() => switchToTab(tab.id)}
                                        style={{
                                          backgroundColor:
                                            activeTheme.secondary,
                                          borderColor:
                                            tab.id === activeTabIdSession &&
                                            shared
                                              ? activeTheme.acsent
                                              : tab.id === activeTabId
                                              ? "#52525b"
                                              : undefined,
                                        }}
                                        className={`w-full h-10 ${
                                          tab.id === activeTabIdSession &&
                                          shared
                                            ? "border"
                                            : tab.id === activeTabId
                                            ? "border"
                                            : "border-0"
                                        } flex items-center justify-start text-left px-3 mb-2 rounded-lg`}
                                      >
                                        <div className="flex w-full gap-1">
                                          <div
                                            onMouseEnter={() =>
                                              setHoveredTab(tab.id)
                                            }
                                            onMouseLeave={() =>
                                              setHoveredTab(null)
                                            }
                                            style={{
                                              background:
                                                activeTheme.secondary2,
                                            }}
                                            className="flex items-center flex-1 rounded px-2 py-1"
                                          >
                                            {tab.favIcon && (
                                              <img
                                                src={
                                                  tab.favIcon ||
                                                  "/placeholder.svg"
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
                                                  if (
                                                    tabGroup.title == "Base"
                                                  ) {
                                                    closeTab(tab.id);
                                                  } else {
                                                    removeTabFromTabGroup(
                                                      tab.id
                                                    );
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
                                              (t) =>
                                                t.id === baseTab.splitViewTabId
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
                                                className="flex items-center flex-1   rounded px-2 py-1"
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
                                                          tabGroup.title ==
                                                          "Base"
                                                        ) {
                                                          closeTab(tab.id);
                                                        } else {
                                                          removeTabFromTabGroup(
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
                                                          setSplitViewTabs(
                                                            (prev) =>
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
                                                                layout:
                                                                  "horizontal",
                                                              },
                                                            ]
                                                          );
                                                        }
                                                      }}
                                                      className="h-6 w-6 bg-transparent hover:bg-zinc-600 rounded flex items-center justify-center"
                                                    >
                                                      <Scaling
                                                        style={{
                                                          color:
                                                            splitViewTabs.some(
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
                                                    <button
                                                      onClick={() => {
                                                        if (
                                                          activeSplitView.layout ==
                                                          "horizontal"
                                                        ) {
                                                          setSplitViewTabs(
                                                            (prev) =>
                                                              prev.map(
                                                                (tab) => {
                                                                  if (
                                                                    tab.baseTabId ==
                                                                    activeSplitView.baseTabId
                                                                  ) {
                                                                    return {
                                                                      ...tab,
                                                                      layout:
                                                                        "vertical",
                                                                    };
                                                                  }
                                                                  return tab;
                                                                }
                                                              )
                                                          );
                                                        } else {
                                                          setSplitViewTabs(
                                                            (prev) =>
                                                              prev.map(
                                                                (tab) => {
                                                                  if (
                                                                    tab.baseTabId ==
                                                                    activeSplitView.baseTabId
                                                                  ) {
                                                                    return {
                                                                      ...tab,
                                                                      layout:
                                                                        "horizontal",
                                                                    };
                                                                  }
                                                                  return tab;
                                                                }
                                                              )
                                                          );
                                                        }
                                                      }}
                                                    >
                                                      {activeSplitView.layout ==
                                                      "horizontal" ? (
                                                        <LayoutPanelLeft
                                                          style={{
                                                            color: "#a1a1aa",
                                                          }}
                                                          className="h-4 w-4"
                                                        />
                                                      ) : (
                                                        <LayoutPanelTop
                                                          style={{
                                                            color: "#a1a1aa",
                                                          }}
                                                          className="h-4 w-4"
                                                        />
                                                      )}
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ) : (
                                <>
                                  {(() => {
                                    const activeSplitTab = splitViewTabs.find(
                                      (splitTab) =>
                                        splitTab.splitViewTabId == tab.id
                                    );

                                    return activeSplitTab ? null : (
                                      <Draggable
                                        key={tab.id.toString()}
                                        draggableId={tab.id.toString()}
                                        index={index}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                              ...provided.draggableProps.style,
                                              opacity: snapshot.isDragging
                                                ? 0.5
                                                : 1,
                                            }}
                                            className="mb-2 relative group"
                                          >
                                            <div
                                              onMouseEnter={() =>
                                                setHoveredTab(tab.id)
                                              }
                                              onMouseLeave={() =>
                                                setHoveredTab(null)
                                              }
                                              onClick={() =>
                                                switchToTab(tab.id)
                                              }
                                              style={{
                                                backgroundColor:
                                                  activeTheme.secondary,
                                                borderColor:
                                                  tab.id ===
                                                    activeTabIdSession && shared
                                                    ? activeTheme.acsent
                                                    : tab.id === activeTabId
                                                    ? "#52525b"
                                                    : undefined,
                                              }}
                                              className={`w-full h-10 ${
                                                tab.id === activeTabIdSession &&
                                                shared
                                                  ? "border"
                                                  : tab.id === activeTabId
                                                  ? "border"
                                                  : "border-0"
                                              } flex items-center justify-start text-left px-3 rounded-lg`}
                                            >
                                              {tab.favIcon && (
                                                <img
                                                  src={
                                                    tab.favIcon ||
                                                    "/placeholder.svg"
                                                  }
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
                                              {hoveredTab == tab.id ? (
                                                <div className="flex items-center gap-1">
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (
                                                        tabGroup.title == "Base"
                                                      ) {
                                                        closeTab(tab.id);
                                                      } else {
                                                        removeTabFromTabGroup(
                                                          tab.id
                                                        );
                                                      }
                                                    }}
                                                    className="h-6 w-6 bg-transparent hover:bg-zinc-600 rounded flex items-center justify-center"
                                                  >
                                                    <X className="h-4 w-4 text-zinc-400" />
                                                  </button>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (
                                                        activeTabId !== tab.id
                                                      ) {
                                                        const existingSplitView =
                                                          splitViewTabs.find(
                                                            (splitView) =>
                                                              splitView.splitViewTabId ===
                                                              tab.id
                                                          );
                                                        if (existingSplitView) {
                                                          setSplitViewTabs(
                                                            (prev) =>
                                                              prev.filter(
                                                                (splitView) =>
                                                                  splitView.splitViewTabId !==
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
                                                                layout:
                                                                  "horizontal",
                                                              },
                                                            ]
                                                          );
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
                                                          ) &&
                                                          activeTabId !== tab.id
                                                            ? activeTheme.acsent
                                                            : "#a1a1aa",
                                                      }}
                                                      className="h-4 w-4"
                                                    />
                                                  </button>

                                                  <button
                                                    onClick={async (e) => {
                                                      e.preventDefault();
                                                      e.stopPropagation;
                                                      await addOrRemoveYoutubePopUp(
                                                        !youtubePopUp,
                                                        tab.url,
                                                        tab.id
                                                      );
                                                    }}
                                                    className="h-6 w-6 bg-transparent hover:bg-zinc-600 rounded flex items-center justify-center"
                                                  >
                                                    <PictureInPicture
                                                      className="h-4 w-4"
                                                      style={{
                                                        color:
                                                          youtubePopUpId ==
                                                          tab.id
                                                            ? activeTheme.acsent
                                                            : "#a1a1aa",
                                                      }}
                                                    />
                                                  </button>
                                                </div>
                                              ) : null}
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })()}
                                </>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </DragDropContext>
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

              <Dialog
                open={openSettings}
                onOpenChange={() => {
                  setOpenSettings(!openSettings);
                }}
              >
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
                    <DialogTitle className="text-white">
                      Session Settings
                    </DialogTitle>
                  </DialogHeader>
                  <Separator className="bg-zinc-500" />
                  <div className="flex gap-4">
                    <h1 className="text-white">Allow Scrolling</h1>
                    <Switch
                      checked={allowSharedScrolling}
                      onCheckedChange={() => {
                        setAllowSharedScrolling(!allowSharedScrolling);
                      }}
                      className="mt-1"
                    ></Switch>
                  </div>
                  <div className="flex gap-4">
                    <h1 className="text-white">Share Scrolling</h1>
                    <Switch
                      checked={shareScrolling}
                      onCheckedChange={() => {
                        setShareScrolling(!shareScrolling);
                      }}
                      className="mt-1"
                    ></Switch>
                  </div>
                  <div className="flex gap-4">
                    <h1 className="text-white">Allow Screen</h1>
                    <Switch
                      checked={allowScreen}
                      onCheckedChange={() => {
                        setAllowScreen(!allowScreen);
                      }}
                      className="mt-1"
                    ></Switch>
                  </div>
                  <div className="flex gap-4">
                    <h1 className="text-white">Share Screen</h1>
                    <Switch
                      checked={shareScreen}
                      onCheckedChange={() => {
                        setShareScreen(!shareScreen);
                      }}
                      className="mt-1"
                    ></Switch>
                  </div>
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
                              className="bg-zinc-900 hover:bg-zinc-800 p-6 rounded-lg mt-2 mb-2  "
                            >
                              <Search></Search>
                              <p className="text-xs truncate max-w-[100px]">
                                {currentUrl} —— Search with Google
                              </p>
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
                              <p className="text-xs truncate">{currentUrl}</p>
                              <p>— Search with Google</p>
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
        <div
          style={{ background: activeTheme.hex }}
          className="flex justify-center items-center"
        >
          <GripVertical
            onClick={() => {
              setShowSideBar(!showSidebar);
            }}
            className="h-6 w-4"
          ></GripVertical>
        </div>
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

            {!watchTogether
              ? (() => {
                  const activeSplitView = splitViewTabs.find(
                    (sv) => sv.baseTabId === activeTabId
                  );
                  const allTabs = getAllTabs();

                  return (
                    <ResizablePanelGroup
                      direction={
                        activeSplitView &&
                        (activeSplitView.layout === "horizontal" ||
                          activeSplitView.layout === "vertical")
                          ? activeSplitView.layout
                          : "horizontal"
                      }
                      className="w-full h-full"
                    >
                      {allTabs.map((tab, index) => {
                        const isActiveTab = tab.id === activeTabId;
                        const isSplitViewTab =
                          activeSplitView &&
                          tab.id === activeSplitView.splitViewTabId;
                        const shouldShow = isActiveTab || isSplitViewTab;
                        let cssOrder = 0;
                        if (isActiveTab) {
                          cssOrder = 1;
                        } else if (isSplitViewTab) {
                          cssOrder = 2;
                        } else {
                          cssOrder = 2;
                        }
                        return (
                          <Fragment key={tab.id}>
                            <ResizablePanel
                              key={tab.id}
                              style={{
                                display: shouldShow ? "flex" : "none",
                              }}
                            >
                              <webview
                                key={tab.id}
                                ref={(el) => {
                                  webviewRefs.current[tab.id] = el;
                                }}
                                src={tab.url}
                                className="w-full h-full flex"
                                partition="persist:QuickBrowse"
                                allowpopups="true"
                                style={{
                                  pointerEvents:
                                    shareCursor || isResizing ? "none" : "auto",
                                }}
                                webpreferences="contextIsolation,sandbox"
                              />
                            </ResizablePanel>

                            <ResizableHandle
                              className="bg-zinc-900"
                              onDragging={(isDragging) =>
                                setIsResizing(isDragging)
                              }
                            />
                          </Fragment>
                        );
                      })}
                    </ResizablePanelGroup>
                  );
                })()
              : null}
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
