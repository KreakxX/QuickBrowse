import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type {
  ChatMessage,
  color,
  savedTab,
  SplitView,
  tab,
  tabGroup,
} from "@/types/browser";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Group,
  RotateCcw,
  Search,
  Plus,
  X,
  MousePointer2,
  Settings,
  Link,
  AppWindow,
  History,
  Youtube,
  Palette,
  MessageCircle,
  ExternalLink,
  Play,
  ArrowBigRight,
  Scaling,
  LayoutPanelLeft,
  LayoutPanelTop,
  PictureInPicture,
  Clipboard,
} from "lucide-react";
import { useSonner } from "sonner";

interface SideBarProps {
  showSidebar: boolean;
  activeTheme: color;
  navigateback: () => void;
  navigateForward: () => void;
  refresh: () => void;
  activeTabId: number;
  ActiveTabCurrentUrl?: { favIcon?: string };
  currentUrl: string;
  setCurrentUrl: (url: string) => void;
  inputFocused: boolean;
  setInputFocused: (focused: boolean) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  suggestions: string[];
  addNewTab: (url: string) => void;
  shareCursor: boolean;
  setShareCursor: (share: boolean) => void;
  openSettings: boolean;
  setOpenSettings: (open: boolean) => void;
  shared: boolean;
  sessionCreated: boolean;
  sessionCode: string;
  setSessionCode: (code: string) => void;
  username: string;
  setUsername: (username: string) => void;
  joinSession: () => void;
  sessionUsers: string[];
  createSession: () => void;
  closeSession: () => void;
  savedTabs: savedTab[];
  getGridColumns: () => string;
  deleteLongTermTab: (id: number) => void;
  getAllTabGroups: () => tabGroup[];
  onDragEnd: (result: any) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
  deleteTabGroup: (id: number) => void;
  setAddNewTabSearchBar: (show: boolean) => void;
  setAddNewTabSearchBarWorkspace: (show: boolean) => void;
  splitViewTabs: SplitView[];
  activeTabIdSession: number;
  switchToTab: (id: number) => void;
  hoveredTab: number | null;
  setHoveredTab: (id: number | null) => void;
  closeTab: (id: number) => void;
  removeTabFromTabGroup: (id: number) => void;
  getAllTabs: () => tab[];
  setSplitViewTabs: React.Dispatch<React.SetStateAction<SplitView[]>>;
  youtubePopUp: boolean;
  addOrRemoveYoutubePopUp: (enabled: boolean, url: string, id: number) => void;
  youtubePopUpId: number | null;
  activeTabGroup: number;
  TabGroupOpen: boolean;
  setTabGroupOpen: (open: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  createNewTabGroup: () => void;
  allowSharedScrolling: boolean;
  setAllowSharedScrolling: (allow: boolean) => void;
  shareScrolling: boolean;
  setShareScrolling: (share: boolean) => void;
  allowScreen: boolean;
  setAllowScreen: (allow: boolean) => void;
  shareScreen: boolean;
  setShareScreen: (share: boolean) => void;
  showStickyNote: boolean;
  setShowStickyNote: (showStickyNote: boolean) => void;
  loadBookMarks: () => void;
  bookMarkTabs: {
    id: number;
    url: string;
    favicon: string;
    timestamp: number;
  }[];
  saveNewBookmark: (tabId: number) => void;
  removeBookMark: (id: number) => void;
  saveNewLongTermTab: (tabId: number) => void;
  loadHistory: () => void;
  deleteHistory: () => void;
  history: { id: number; url: string; favicon: string; timestamp: number }[];
  watchTogether: boolean;
  setWatchTogether: (watch: boolean) => void;
  watchTogetherURL: string;
  setWatchTogetherURL: (url: string) => void;
  watchTogetherCurrentURL: string;
  setWatchTogetherCurrentURL: (url: string) => void;
  EnableWatchTogether: () => void;
  handleJoingWatchTogetherSession: () => void;
  colors: color[];
  setActiveTheme: (theme: color) => void;
  addNewTabSearchBarWorkspace: boolean;
  addTabToTabGroup: (url: string) => void;
  addNewTabSearchBar: boolean;
  chatMessages: ChatMessage[];
  messageInput: string;
  setMessageInput: (message: string) => void;
  sendChatMessage: () => void;
  extractYouTubeVideoID: (url: string) => string | null;
  addTodoToStickyNote: (todo: string) => void;
}

export default function Sidebar(props: SideBarProps) {
  const {
    showSidebar,
    activeTheme,
    navigateback,
    navigateForward,
    refresh,
    activeTabId,
    ActiveTabCurrentUrl,
    currentUrl,
    setCurrentUrl,
    inputFocused,
    setInputFocused,
    handleKeyDown,
    suggestions,
    addNewTab,
    shareCursor,
    setShareCursor,
    openSettings,
    setOpenSettings,
    shared,
    sessionCreated,
    sessionCode,
    setSessionCode,
    username,
    setUsername,
    joinSession,
    sessionUsers,
    createSession,
    closeSession,
    savedTabs,
    getGridColumns,
    deleteLongTermTab,
    getAllTabGroups,
    onDragEnd,
    scrollContainerRef,
    handleScroll,
    deleteTabGroup,
    setAddNewTabSearchBar,
    setAddNewTabSearchBarWorkspace,
    splitViewTabs,
    activeTabIdSession,
    switchToTab,
    hoveredTab,
    setHoveredTab,
    closeTab,
    removeTabFromTabGroup,
    getAllTabs,
    setSplitViewTabs,
    youtubePopUp,
    addOrRemoveYoutubePopUp,
    youtubePopUpId,
    activeTabGroup,
    TabGroupOpen,
    setTabGroupOpen,
    setTitle,
    createNewTabGroup,
    allowSharedScrolling,
    setAllowSharedScrolling,
    shareScrolling,
    setShareScrolling,
    allowScreen,
    setAllowScreen,
    shareScreen,
    setShareScreen,
    loadBookMarks,
    bookMarkTabs,
    saveNewBookmark,
    saveNewLongTermTab,
    loadHistory,
    history,
    watchTogether,
    setWatchTogether,
    setWatchTogetherURL,
    setWatchTogetherCurrentURL,
    EnableWatchTogether,
    handleJoingWatchTogetherSession,
    colors,
    setActiveTheme,
    addNewTabSearchBarWorkspace,
    addTabToTabGroup,
    addNewTabSearchBar,
    chatMessages,
    messageInput,
    setMessageInput,
    sendChatMessage,
    extractYouTubeVideoID,
    removeBookMark,
    deleteHistory,
    addTodoToStickyNote,
    showStickyNote,
    setShowStickyNote,
  } = props;

  const [todoInput, setTodoInput] = useState<string>("");

  return (
    <>
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
                navigateback();
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

                          {sessionCreated ? (
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
                              value="users"
                            >
                              Users
                            </TabsTrigger>
                          ) : null}

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

                        {sessionCreated ? (
                          <TabsContent value="users">
                            <h1 className="text-white font-bold mb-3 mt-5">
                              Users in current Session
                            </h1>
                            <div className="flex ml-5 mt-4 ">
                              {sessionUsers.map((user) => (
                                <div className="relative">
                                  <Avatar>
                                    <AvatarFallback
                                      style={{
                                        backgroundColor: activeTheme?.secondary,
                                      }}
                                      className="text-white"
                                    >
                                      {user?.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        ) : null}

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
            <div className="mt-5">
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
                          <img className="h-6 w-6 " src={tab?.favicon} alt="" />
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
                      {(provided: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="overflow-y-auto max-h-[65vh] scrollbar-hide px-2"
                        >
                          {tabGroup.tabs.map((tab: any, index: any) => {
                            const activeSplitView = splitViewTabs.find(
                              (splitViewTab) => splitViewTab.baseTabId == tab.id
                            );
                            return activeSplitView ? (
                              <Draggable
                                key={tab.id.toString()}
                                draggableId={tab.id.toString()}
                                index={index}
                              >
                                {(provided: any, snapshot: any) => (
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
                                      onMouseEnter={() => setHoveredTab(tab.id)}
                                      onMouseLeave={() => setHoveredTab(null)}
                                      onClick={() => switchToTab(tab.id)}
                                      style={{
                                        backgroundColor: activeTheme.secondary,
                                        borderColor:
                                          tab.id === activeTabIdSession &&
                                          shared
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
                                            background: activeTheme.secondary2,
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
                                                if (tabGroup.title == "Base") {
                                                  closeTab(tab.id);
                                                } else {
                                                  removeTabFromTabGroup(tab.id);
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
                                                            prev.map((tab) => {
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
                                                            })
                                                        );
                                                      } else {
                                                        setSplitViewTabs(
                                                          (prev) =>
                                                            prev.map((tab) => {
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
                                                            })
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
                                      {(provided: any, snapshot: any) => (
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
                                                        youtubePopUpId == tab.id
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
          <Dialog>
            <DialogTrigger asChild>
              <Button
                style={{ backgroundColor: activeTheme?.secondary }}
                className="rounded-lg mb-2 ml-2 w-8 h-8 "
              >
                <Clipboard></Clipboard>
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
                <DialogTitle className="text-white">Todo</DialogTitle>
                <DialogDescription>
                  Create new Todos and view them with the Sticky Note
                </DialogDescription>
              </DialogHeader>
              <Input
                onChange={(e) => {
                  setTodoInput(e.target.value);
                }}
                className="text-white border-zinc-800"
                placeholder="Todo"
              ></Input>

              <Button
                onClick={() => {
                  addTodoToStickyNote(todoInput);
                  setTodoInput("");
                }}
                className="bg-zinc-800"
              >
                Create new Todo
              </Button>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-white">Show Todos</h3>
                  <p className="text-xs text-white/70">
                    Showcase your Todos with a Sticky Note in the top right
                    corner
                  </p>
                </div>
                <Switch
                  checked={showStickyNote}
                  onCheckedChange={() => setShowStickyNote(!showStickyNote)}
                  className="data-[state=checked]:bg-white/20"
                />
              </div>
            </DialogContent>
          </Dialog>

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
                  className="rounded-lg mb-2 ml-2 w-8 h-8 "
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
                  <DialogDescription>Create a new Tab Group</DialogDescription>
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
                className="max-w-md border-zinc-800 p-0"
                style={{ background: activeTheme.hex }}
              >
                <div className="relative p-6">
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>

                  <DialogHeader className="space-y-3 pr-10">
                    <DialogTitle className="text-xl font-semibold text-white">
                      Session Settings
                    </DialogTitle>
                  </DialogHeader>

                  <Separator className="bg-white/20 my-6" />

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-white">
                          Allow Scrolling
                        </h3>
                        <p className="text-xs text-white/70">
                          Enable scroll synchronization
                        </p>
                      </div>
                      <Switch
                        checked={allowSharedScrolling}
                        onCheckedChange={() =>
                          setAllowSharedScrolling(!allowSharedScrolling)
                        }
                        className="data-[state=checked]:bg-white/20"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-white">
                          Share Scrolling
                        </h3>
                        <p className="text-xs text-white/70">
                          Broadcast your scroll position
                        </p>
                      </div>
                      <Switch
                        checked={shareScrolling}
                        onCheckedChange={() =>
                          setShareScrolling(!shareScrolling)
                        }
                        className="data-[state=checked]:bg-white/20"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-white">
                          Allow Screen
                        </h3>
                        <p className="text-xs text-white/70">
                          Enable screen sharing features
                        </p>
                      </div>
                      <Switch
                        checked={allowScreen}
                        onCheckedChange={() => setAllowScreen(!allowScreen)}
                        className="data-[state=checked]:bg-white/20"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-white">
                          Share Screen
                        </h3>
                        <p className="text-xs text-white/70">
                          Broadcast your screen to others
                        </p>
                      </div>
                      <Switch
                        checked={shareScreen}
                        onCheckedChange={() => setShareScreen(!shareScreen)}
                        className="data-[state=checked]:bg-white/20"
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  style={{ backgroundColor: activeTheme?.secondary }}
                  className="rounded-lg mb-2 ml-2 w-8 h-8  "
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
                              <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center overflow-hidden ">
                                {bookmark.favicon ? (
                                  <img
                                    src={bookmark.favicon || "/placeholder.svg"}
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

                              <div className="flex-1 min-w-0 text-left">
                                <div className="font-medium text-white truncate">
                                  {serviceName}
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-400 truncate max-w-[300px]">
                                  {bookmark.url}
                                </div>
                              </div>

                              <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBookMark(bookmark.id);
                              }}
                            >
                              <X className="text-gray-400"></X>
                            </Button>
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
                  className="rounded-lg mb-2 ml-2 w-8 h-8  "
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
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHistory();
                  }}
                >
                  Delete Search History
                </Button>
                <ScrollArea className="max-h-[600px] max-w-[500px] ">
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
                    className="rounded-lg mb-2 ml-2 w-8 h-8  "
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
                  className="rounded-lg mb-2 ml-2 w-8 h-8  "
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
                      className="rounded-lg mb-3 ml-2 w-8 h-8  "
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
                                      message.toLowerCase().includes("youtube")
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
                                      message.toLowerCase().includes("youtube")
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
    </>
  );
}
