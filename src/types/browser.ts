export interface ChatMessage {
    username?: string;
    message?: string;
  }
 export interface SplitView {
    baseTabId: number;
    splitViewTabId: number;
    layout: string;
  }
 export interface color {
    name: string;
    hex: string;
    secondary: string;
    secondary2: string;
    acsent: string;
  }

 export interface savedTab {
    id: number;
    url: string;
    favicon?: string;
  }

 export interface tabGroup {
    id: number;
    title: string;
    tabs: tab[];
  }

 export interface tab {
    id: number;
    url: string;
    title?: string;
    favIcon?: string;
  }