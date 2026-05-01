import { useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import { SidebarSkeleton } from "../ui/Skeleton.jsx";

export default function AppLayout({ children, sidebarLoading = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-neutral-950">
      <AnimatePresence initial={false} mode="wait">
        <Motion.div
          key={sidebarOpen ? "sidebar-open" : "sidebar-closed"}
          initial={{ width: sidebarOpen ? 48 : 240, opacity: 0.95 }}
          animate={{ width: sidebarOpen ? 240 : 48, opacity: 1 }}
          exit={{ opacity: 0.95 }}
          transition={{ duration: 0.18 }}
          className="shrink-0 overflow-hidden"
        >
          {sidebarLoading ? (
            <SidebarSkeleton collapsed={!sidebarOpen} />
          ) : (
            <Sidebar
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          )}
        </Motion.div>
      </AnimatePresence>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
