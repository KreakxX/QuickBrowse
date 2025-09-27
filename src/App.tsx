import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  MousePointer2,
  RefreshCcw,
  X,
} from "lucide-react";
import React from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import colors from "./colors";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import type {
  ChatMessage,
  color,
  savedTab,
  SplitView,
  tab,
  tabGroup,
} from "./types/browser";
import Sidebar from "./UI/SideBar";
import { Button } from "./components/ui/button";
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
      historyDelete: () => void;
      addNewBookmark: (url: string, favicon: string, id: number) => void;
      loadAllBookmarks: () => Promise<
        Array<{
          id: number;
          url: string;
          favicon: string;
          timestamp: number;
        }>
      >;
      removeBookMark: (id: number) => void;
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
      saveImage: (url: string) => void;
      addTab: (id: number, url: string, favicon: string) => void;
      removeTab: (id: number) => void;
      loadTabs: () => Promise<
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
  const [username, setUsername] = useState<string>("Username");
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
  const [bookMarkId, setBookMarkId] = useState<number>(0);
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
  const [tabs, setTabs] = useState<tab[]>([]);
  const [showStickyNote, setShowStickyNote] = useState<boolean>(false);
  const [todos, setTodos] = useState<string[]>([]);
  const [sessionUsers, setSessionUsers] = useState<string[]>([]);
  const [sessionCreated, setSessionCreated] = useState<boolean>(false);
  const [sessionJoined, setSessionJoined] = useState<boolean>(false);
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
  const shareCursorRef = useRef(shareCursor);
  const [allowCursor, setAllowCursor] = useState<boolean>(false);
  const allowCursorRef = useRef(allowCursor);
  const [allowTabsAdded, setAllowTabsAdded] = useState<boolean>(false);
  const [shareTabsAdded, setShareTabs] = useState<boolean>(false);
  const allowTabsRef = useRef(allowTabsAdded);
  const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  // tracks all processedUrls with Tab ID as key -> important for no redirects
  const lastProcessedUrls = useRef<Map<number, string>>(new Map());
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

  useEffect(() => {
    shareCursorRef.current = shareCursor;
  }, [shareCursor]);

  useEffect(() => {
    allowCursorRef.current = allowCursor;
  }, [allowCursor]);

  useEffect(() => {
    allowTabsRef.current = allowTabsAdded;
  }, [allowTabsAdded]);

  // UseEffect for handling connections with the websocket
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // connect to the websockket and update the ref
        const ws = new WebSocket("ws://localhost:8080");
        wsRef.current = ws;

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

  // useEffect for sharing title changes, and url changes
  useEffect(() => {
    const handleWebViewEvents = () => {
      const activeWebView = webviewRefs.current[activeTabId] as any;
      if (!activeWebView) return;

      const handleNavigate = (event: any, id: number, isInPage = false) => {
        let newUrl = event.url;

        if (isInPage) {
          return;
        }

        if (newUrl.includes("youtube") && newUrl.includes("list")) {
          return;
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

        const lastUrl = lastProcessedUrls.current.get(id);
        if (lastUrl === newUrl) {
          return;
        }

        lastProcessedUrls.current.set(id, newUrl);

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

      const handleMouseTracking = () => {
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

          const mouseHandler = throttle((event) => {
            const mouseData = {
              mouseX: event.clientX ,
              mouseY: event.clientY,
              pageX: event.pageX,
              pageY: event.pageY
            };
            
            console.log('MOUSE_DATA:', JSON.stringify(mouseData));
          }, 10);

          window.addEventListener('mousemove', mouseHandler, { passive: true });
          document.addEventListener('mousemove', mouseHandler, { passive: true });
          
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

      const handleImageClickingTracking = () => {
        setTimeout(() => {
          activeWebView
            .executeJavaScript(
              `
       try {
        
          if (typeof window === 'undefined' || typeof document === 'undefined') {
            throw new Error('Window or document not available');
          }
          
              document.addEventListener('contextmenu', (event) =>{
                const target = event.target;
                if(target && target.tagName == "IMG"){
                  const imgUrl = target.src;
                  console.log("IMAGE_URL: ", imgUrl)
                }
              }, true);
        } catch (error) {
          console.error('Error in Image Context Menu:', error.message);
        }
      `
            )
            .catch((err: any) =>
              console.error("Failed to inject Image Context Menu:", err)
            );
        }, 1000);
      };

      activeWebView.addEventListener("did-finish-load", handleScrollTracking);
      activeWebView.addEventListener("dom-ready", handleScrollTracking);

      activeWebView.addEventListener("did-finish-load", handleMouseTracking);
      activeWebView.addEventListener("dom-ready", handleMouseTracking);

      activeWebView.addEventListener(
        "did-finish-load",
        handleImageClickingTracking
      );
      activeWebView.addEventListener("dom-ready", handleImageClickingTracking);

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
        } else if (e.message.includes("MOUSE_DATA:")) {
          const MOUSE_DATA = JSON.parse(e.message.replace("MOUSE_DATA:", ""));

          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            alert("Not connected to server");
            return;
          }
          console.log("Mouse Data", MOUSE_DATA);

          if (shareCursorRef.current) {
            wsRef.current.send(
              JSON.stringify({
                type: "mouse_move",
                data: {
                  x: MOUSE_DATA.mouseX,
                  y: MOUSE_DATA.mouseY,
                },
              })
            );
          }
        } else if (e.message.includes("IMAGE_URL:")) {
          const IMAGE_URL = e.message.replace("IMAGE_URL:", "");
          setImageUrl(IMAGE_URL);
          setShowContextMenu(true);
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

        lastProcessedUrls.current.clear();
      };
    };

    const cleanup = handleWebViewEvents();
    return cleanup;
  }, [activeTabId, activeTabGroup, splitViewTabs, shared]);

  // method for handling messages and updating the client via websockets
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "session_created":
        setSessionUsers((prev) => [...prev, username]);
        setSessionCode(data.code);
        setSessionCreated(true);
        setShared(true);
        break;
      case "mouse_update":
        if (allowCursorRef.current) {
          setXSession(data.x);
          setYSession(data.y);
        }
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
        if (allowTabsRef.current) {
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
        }
        break;

      case "browser_tab_old":
        if (allowTabsRef.current) {
          setTabs((prev) => prev.filter((tab) => tab.id !== data.id));
          setNextId(data.nextId);
          setActiveTabIdSession(data.activeTabId);
        }

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
      case "kicked_message":
        setShared(false);
        setSessionJoined(false);
        setWatchTogether(false);
        break;
      case "leave_sessionMessage":
        toast(data.username + " has left the Session");
        setSessionUsers((prev) =>
          prev.filter((user) => user !== data.username)
        );
        break;
      case "joinedMessage":
        toast(data.username + " has joined the Session");
        setSessionUsers((prev) => [...prev, data.username]);
        break;
      case "cantJoinMessage":
        toast("You cant join the Session its full");
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
          }, 250);
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
  // loading the savedTabs
  useEffect(() => {
    const loadTabs = async () => {
      if (!window.electronAPI?.loadTabs) return;
      const tabs = await window.electronAPI.loadTabs();
      console.log(tabs);
      const count = tabs?.length;
      if (count) {
        setNextId(count + 1);
        console.log(count);
      }
      const fixedtabs = tabs.map(({ id, url, favicon }) => ({
        id,
        url,
        favicon,
      }));

      setTabs(fixedtabs);
      setActiveTabId(fixedtabs[0].id);
      console.log(fixedtabs);
    };

    loadTabs();
  }, []);

  // SESSION
  const kickUserFromSession = (username: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Not connected to server");
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        type: "kicked_user",
        username: username,
      })
    );
    setSessionUsers((prev) => prev.filter((user) => user !== username));
  };

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
      // if Watch together is still running
      setWatchTogether(false);
      setSessionCode("");
      setSessionCreated(false);
    }

    if (sessionJoined && shared) {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        alert("Not connected to server");
        return;
      }
      wsRef.current.send(
        JSON.stringify({
          type: "leave_session_client",
          username: username,
        })
      );

      setShared(false);
      // if Watch together is still running
      setWatchTogether(false);
      setSessionCode("");
      setSessionJoined(false);
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
      }, 250);
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

  const navigateBackSplitview = () => {
    const activeSplitView = splitViewTabs.find(
      (tab) => tab.baseTabId == activeTabId
    );
    if (activeSplitView) {
      const splitViewWebView = webviewRefs.current[
        activeSplitView?.splitViewTabId
      ] as any;
      splitViewWebView?.goBack();
    }
  };

  // method for navigating forward
  const navigateForward = () => {
    const activeWebview = webviewRefs.current[activeTabId] as any;
    activeWebview?.goForward();
  };

  const navigateForwardSplitView = () => {
    const activeSplitView = splitViewTabs.find(
      (tab) => tab.baseTabId == activeTabId
    );
    if (activeSplitView) {
      const splitViewWebView = webviewRefs.current[
        activeSplitView?.splitViewTabId
      ] as any;
      splitViewWebView?.goForward();
    }
  };

  // method for refreshing webpage
  const refresh = () => {
    const activeWebview = webviewRefs.current[activeTabId] as any;
    activeWebview?.reload();
  };

  const refreshSplitView = () => {
    const activeSplitView = splitViewTabs.find(
      (tab) => tab.baseTabId == activeTabId
    );
    if (activeSplitView) {
      const splitViewWebView = webviewRefs.current[
        activeSplitView?.splitViewTabId
      ] as any;
      splitViewWebView?.reload();
    }
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

  const downloadImage = () => {
    window.electronAPI?.saveImage(imageUrl);
  };

  // method for adding a new Tab (default workspace)
  const addNewTab = (url: string) => {
    const origin = new URL(url).origin;
    if (!window.electronAPI) return;
    window.electronAPI?.addTab(nextId, url, origin + "/favicon.ico");
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

    if (shareTabsAdded) {
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
    }
  };

  // method for closing a tab from (default workspace)
  const closeTab = (id: number) => {
    if (!window.electronAPI) return;
    window.electronAPI.removeTab(id);
    if (id == activeTabId) {
      const nextTab = tabs.find((tab) => tab.id == id - 1);
      if (nextTab) {
        setActiveTabId(nextTab.id);
        setCurrentUrl(nextTab?.url);
        setUrl(nextTab.url);
      }
    }

    if (
      splitViewTabs.some(
        (tab) => tab.baseTabId === id || tab.splitViewTabId === id
      )
    ) {
      const filteredSplitViewTabs = splitViewTabs.filter(
        (tab) => tab.baseTabId !== id && tab.splitViewTabId !== id
      );

      setSplitViewTabs(filteredSplitViewTabs);
    }

    const remainingTabs = tabs.filter((tab) => tab.id !== id);
    const tabToDelete = tabs.find((tab) => tab.id === id);
    setTabs(remainingTabs);
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Not connected to server");
      return;
    }

    if (shared && shareTabsAdded) {
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

  const deleteHistory = () => {
    window.electronAPI?.historyDelete();
    setHistory([]);
  };

  // method for saving a new Bookmark
  const saveNewBookmark = (id: number) => {
    const tab = tabs.find((tab) => tab.id == id);
    if (!tab) return;
    window.electronAPI?.addNewBookmark(
      tab.url,
      new URL(tab.url).origin + "/favicon.ico",
      bookMarkId
    );

    setBookMarkId(bookMarkId + 1);
  };

  const removeBookMark = (id: number) => {
    const filteredBookmarks = bookMarkTabs.filter(
      (bookmark) => bookmark.id !== id
    );
    setBookMarkTabs(filteredBookmarks);
    window.electronAPI?.removeBookMark(id);
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

  const addTodoToStickyNote = (todo: string) => {
    setTodos((prev) => [...prev, todo]);
  };

  const removeTodoFromStickyNote = (todo: string) => {
    const filtered = todos.filter((Todo) => Todo !== todo);
    setTodos(filtered);
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
      <Toaster />
      <div className="flex h-full w-full overflow-hidden justify-between">
        <Sidebar
          showSidebar={showSidebar}
          activeTheme={activeTheme}
          navigateback={navigateBack}
          navigateForward={navigateForward}
          refresh={refresh}
          activeTabId={activeTabId}
          ActiveTabCurrentUrl={ActiveTabCurrentUrl}
          currentUrl={currentUrl}
          setCurrentUrl={setCurrentUrl}
          inputFocused={inputFocused}
          setInputFocused={setInputFocused}
          handleKeyDown={handleKeyDown}
          suggestions={suggestions}
          addNewTab={addNewTab}
          shareCursor={shareCursor}
          setShareCursor={setShareCursor}
          openSettings={openSettings}
          setOpenSettings={setOpenSettings}
          shared={shared}
          sessionCreated={sessionCreated}
          sessionCode={sessionCode}
          setSessionCode={setSessionCode}
          username={username}
          setUsername={setUsername}
          joinSession={joinSession}
          sessionUsers={sessionUsers}
          createSession={createSession}
          closeSession={closeSession}
          savedTabs={savedTabs}
          getGridColumns={getGridColumns}
          deleteLongTermTab={deleteLongTermTab}
          getAllTabGroups={getAllTabGroups}
          onDragEnd={onDragEnd}
          scrollContainerRef={scrollContainerRef}
          handleScroll={handleScroll}
          deleteTabGroup={deleteTabGroup}
          setAddNewTabSearchBar={setAddNewTabSearchBar}
          setAddNewTabSearchBarWorkspace={setAddNewTabSearchBarWorkspace}
          splitViewTabs={splitViewTabs}
          activeTabIdSession={activeTabIdSession}
          switchToTab={switchToTab}
          hoveredTab={hoveredTab}
          setHoveredTab={setHoveredTab}
          closeTab={closeTab}
          removeTabFromTabGroup={removeTabFromTabGroup}
          getAllTabs={getAllTabs}
          setSplitViewTabs={setSplitViewTabs}
          youtubePopUp={youtubePopUp}
          addOrRemoveYoutubePopUp={addOrRemoveYoutubePopUp}
          youtubePopUpId={youtubePopUpId}
          activeTabGroup={activeTabGroup}
          TabGroupOpen={TabGroupOpen}
          setTabGroupOpen={setTabGroupOpen}
          title={title}
          setTitle={setTitle}
          createNewTabGroup={createNewTabGroup}
          allowSharedScrolling={allowSharedScrolling}
          setAllowSharedScrolling={setAllowSharedScrolling}
          shareScrolling={shareScrolling}
          setShareScrolling={setShareScrolling}
          allowScreen={allowScreen}
          setAllowScreen={setAllowScreen}
          shareScreen={shareScreen}
          setShareScreen={setShareScreen}
          loadBookMarks={loadBookMarks}
          bookMarkTabs={bookMarkTabs}
          saveNewBookmark={saveNewBookmark}
          saveNewLongTermTab={saveNewLongTermTab}
          loadHistory={loadHistory}
          history={history}
          watchTogether={watchTogether}
          setWatchTogether={setWatchTogether}
          watchTogetherURL={watchTogetherURL}
          setWatchTogetherURL={setWatchTogetherURL}
          watchTogetherCurrentURL={watchTogetherCurrentURL}
          setWatchTogetherCurrentURL={setWatchTogetherCurrentURL}
          EnableWatchTogether={EnableWatchTogether}
          handleJoingWatchTogetherSession={handleJoingWatchTogetherSession}
          colors={colors}
          setActiveTheme={setActiveTheme}
          addNewTabSearchBarWorkspace={addNewTabSearchBarWorkspace}
          addTabToTabGroup={addTabToTabGroup}
          addNewTabSearchBar={addNewTabSearchBar}
          chatMessages={chatMessages}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          sendChatMessage={sendChatMessage}
          extractYouTubeVideoID={extractYouTubeVideoID}
          removeBookMark={removeBookMark}
          deleteHistory={deleteHistory}
          addTodoToStickyNote={addTodoToStickyNote}
          showStickyNote={showStickyNote}
          setShowStickyNote={setShowStickyNote}
          allowShareCursor={allowCursor}
          setAllowShareCursor={setAllowCursor}
          allowTabsAdded={allowTabsAdded}
          setAllowTabsAdded={setAllowTabsAdded}
          shareTabsAdded={shareTabsAdded}
          setShareTabsAdded={setShareTabs}
          showContextMenu={showContextMenu}
          setShowContextMenu={setShowContextMenu}
          downloadImage={downloadImage}
          kickUserFromSession={kickUserFromSession}
        ></Sidebar>
        <div
          style={{ background: activeTheme.hex }}
          className="flex justify-center items-center"
        >
          <GripVertical
            onClick={() => {
              setShowSideBar(!showSidebar);
            }}
            className="h-6 w-4 text-zinc-600"
          ></GripVertical>
        </div>
        <div className="flex-1 bg-zinc-900 relative min-h-screen">
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
            {activeTabId === activeTabIdSession && shared && allowCursor ? (
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
            {showStickyNote ? (
              <div className="absolute top-4 right-10 w-64 bg-zinc-900 shadow-lg transform rotate-1 rounded-lg">
                <div className="bg-zinc-800 h-6 w-full rounded-t-lg "></div>
                <div className="p-4 ">
                  <h3 className="font-semibold text-gray-200 mb-3 text- sm">
                    Todo List
                  </h3>
                  <ul className="space-y-2">
                    {todos.map((todo, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-700 flex items-start"
                      >
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span className=" text-white text-sm ">{todo}</span>
                        <Button
                          onClick={() => {
                            removeTodoFromStickyNote(todo);
                          }}
                          className="w-2 h-2 mt-0.5 ml-2"
                        >
                          <X></X>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  onClick={() => {
                    setShowStickyNote(false);
                  }}
                  className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-400 rounded-full shadow-sm"
                ></div>
              </div>
            ) : null}
            {!watchTogether
              ? (() => {
                  const activeSplitView = splitViewTabs.find(
                    (sv) => sv.baseTabId === activeTabId
                  );
                  const allTabs = getAllTabs();

                  return (
                    <div className="w-full h-full flex flex-col">
                      {activeSplitView && (
                        <div className="flex items-center gap-2 p-2 bg-zinc-950 border-b border-none">
                          <Button
                            className="bg-zinc-950 text-gray-400"
                            onClick={navigateBackSplitview}
                          >
                            <ChevronLeft></ChevronLeft>
                          </Button>
                          <Button
                            className="bg-zinc-950 text-gray-400"
                            onClick={navigateForwardSplitView}
                          >
                            <ChevronRight></ChevronRight>
                          </Button>
                          <Button
                            className="bg-zinc-950 text-gray-400"
                            onClick={refreshSplitView}
                          >
                            <RefreshCcw></RefreshCcw>
                          </Button>
                        </div>
                      )}

                      <ResizablePanelGroup
                        direction={
                          activeSplitView &&
                          (activeSplitView.layout === "horizontal" ||
                            activeSplitView.layout === "vertical")
                            ? activeSplitView.layout
                            : "horizontal"
                        }
                        className="w-full flex-1"
                      >
                        {allTabs.map((tab) => {
                          const isActiveTab = tab.id === activeTabId;
                          const isSplitViewTab =
                            activeSplitView &&
                            tab.id === activeSplitView.splitViewTabId;
                          const shouldShow = isActiveTab || isSplitViewTab;

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
                                    pointerEvents: isResizing ? "none" : "auto",
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
                    </div>
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
