import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  ChevronsLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BrowserLayout() {
  const [url, setUrl] = useState("https://google.com/");
  const [currentUrl, setCurrentUrl] = useState<string>("https://google.com/");
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [nextId, setNextId] = useState(1);
  const [activeTabId, setActiveTabId] = useState<number>(2);

  const webviewRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  interface tab {
    id: number;
    url: string;
    title?: string;
  }
  const [tabs, setTabs] = useState<tab[]>([]);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setUrl(currentUrl);
    }
  };

  const switchToTab = (tabId: number) => {
    setActiveTabId(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      setCurrentUrl(tab.url);
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

  const refresh = () => {
    const activeWebview = webviewRefs.current[activeTabId] as any;
    activeWebview?.reload();
  };

  const addNewTab = (url: string) => {
    setTabs([
      ...tabs,
      {
        id: nextId,
        url: url,
      },
    ]);
    setNextId(nextId + 1);
    setActiveTabId(nextId);
  };

  return (
    <div className="h-screen bg-zinc-800 text-white flex flex-col ">
      <div className="flex h-full w-full overflow-hidden justify-between">
        {/* Left Sidebar */}
        {showSidebar ? (
          <div className="w-64 bg-zinc-800 border-r border-gray-700 flex flex-col">
            {/* Search Bar */}
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
                <Button className="bg-zinc-700 border-gray-600 text-white placeholder-gray-400 h-8 mt-3 w-full hover:bg-zinc-600">
                  Share Session
                </Button>
              </div>
            </div>

            <div className="flex-1 p-3">
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

              {tabs.map((tab) => (
                <div key={tab.id} className="mb-2 relative group">
                  <button
                    onClick={() => switchToTab(tab.id)}
                    className={`w-full h-10 flex items-center justify-start text-left pr-8 px-3 rounded ${
                      tab.id === activeTabId
                        ? "bg-zinc-600 border border-blue-500 rounded-lg"
                        : "bg-zinc-700 border-none hover:bg-zinc-600 rounded-lg"
                    }`}
                  >
                    <div className="truncate flex-1 text-sm">
                      {tab.title || tab.url}
                    </div>
                  </button>
                </div>
              ))}
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

            {tabs.map((tab) => (
              <webview
                key={tab.id}
                ref={(el) => {
                  webviewRefs.current[tab.id] = el;
                }}
                src={tab.id === activeTabId ? url : tab.url}
                className={`w-full min-h-screen ${
                  tab.id === activeTabId ? "flex" : "hidden"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
