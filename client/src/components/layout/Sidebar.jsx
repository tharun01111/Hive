import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store.js";
import { useWorkspaceStore } from "../../store/workspace.store.js";
import { useProjectStore } from "../../store/project.store.js";
import { logoutApi } from "../../api/auth.api.js";
import { disconnectSocket } from "../../socket/socket.js";
import NotificationBell from "../ui/NotificationBell.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";

export default function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const projects = useProjectStore((s) => s.projects);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutApi();
    } finally {
      disconnectSocket();
      logout();
      navigate("/login");
    }
  };

  const handleWorkspaceChange = (workspace) => {
    setActiveWorkspace(workspace);
    navigate(`/workspace/${workspace.id}`);
  };

  if (!isOpen) {
    return (
      <div className="flex w-12 flex-col items-center gap-3 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-4">
        <button
          onClick={onToggle}
          className="btn-ghost p-2 text-neutral-500"
        >
          <ChevronRightIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-60 shrink-0 flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      {/* Workspace selector */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggle}
            className="flex flex-1 items-center gap-2 rounded-premium px-2 py-1.5 text-left transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-premium bg-neutral-900 dark:bg-neutral-100">
              <span className="text-xs font-semibold text-white dark:text-neutral-900">
                {activeWorkspace?.name?.[0]?.toUpperCase() ?? "H"}
              </span>
            </div>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {activeWorkspace?.name ?? "Select workspace"}
            </span>
          </button>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Workspaces */}
        <div className="mb-2">
          <p className="px-3 py-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            Workspaces
          </p>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleWorkspaceChange(ws)}
              className={
                ws.id === activeWorkspace?.id
                  ? "sidebar-item-active w-full text-left"
                  : "sidebar-item w-full text-left"
              }
            >
              <div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded-sm flex items-center justify-center shrink-0">
                <span className="text-neutral-600 dark:text-neutral-300 text-[10px] font-bold">
                  {ws.name[0].toUpperCase()}
                </span>
              </div>
              <span className="truncate">{ws.name}</span>
            </button>
          ))}
        </div>

        {/* Projects */}
        {activeWorkspace && (
          <div>
            <p className="px-3 py-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
              Projects
            </p>
            {projects.length > 0 ? (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className={
                    project.id === projectId
                      ? "sidebar-item-active w-full text-left"
                      : "sidebar-item w-full text-left"
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 shrink-0" />
                  <span className="truncate">{project.name}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-1 text-xs text-neutral-400 italic">No projects</p>
            )}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-3">
        <div className="flex items-center gap-2 rounded-premium border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate leading-none">
              {user?.name}
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-500 truncate mt-1">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn-ghost p-1.5 text-neutral-400 hover:text-red-500 dark:hover:text-red-400"
            title="Sign out"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M6 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 10l3-3-3-3M13 7H6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
