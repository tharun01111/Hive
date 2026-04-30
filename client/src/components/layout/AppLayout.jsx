import { useState } from "react";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-neutral-950">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
