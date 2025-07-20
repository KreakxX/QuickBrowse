import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  X,
  Search,
  Folder,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BrowserLayout() {
  const [url, setUrl] = useState("https://google.com/");
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const webviewRef = useRef<Electron.WebviewTag>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setUrl(currentUrl);
    }
  };

  const navigateBack = () => {
    webviewRef.current?.goBack();
  };

  const navigateForward = () => {
    webviewRef.current?.goForward();
  };

  const refresh = () => {
    webviewRef.current?.reload();
  };

  return (
    <div className="h-screen bg-zinc-800 text-white flex flex-col">
      <div className="h-12 bg-zinc-800 border-b border-gray-700 flex items-center px-4 space-x-3">
        <div className="flex items-center space-x-2">
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

        <div className="flex-1 max-w-md">
          <Input
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-zinc-700 border-gray-600 text-white placeholder-gray-400 h-8"
            placeholder="Enter URL..."
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-zinc-800 border-r border-gray-700 flex flex-col">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="bg-zinc-700 border-gray-600 text-white placeholder-gray-400 pl-10 h-8"
              />
            </div>
          </div>

          <div className="flex-1 p-3">
            {/* New Tab Button */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-zinc-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New tab
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-zinc-900 relative">
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
            <div className="text-center text-gray-500 h-full w-full">
              <webview
                id="webview"
                ref={webviewRef}
                src={url}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
