function App() {
  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 text-xl  font-bold">
        Quick Browse – Vite + React + Electron
      </header>
      <webview
        id="webview"
        src="https://www.google.com"
        className="flex-1 w-full h-full"
      ></webview>
    </div>
  );
}

export default App;
