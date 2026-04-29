import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store.js'
import { useWorkspaceStore } from '../../store/workspace.store.js'
import { useProjectStore } from '../../store/project.store.js'
import { logoutApi } from '../../api/auth.api.js'
import { disconnectSocket } from '../../socket/socket.js'
import NotificationBell from '../ui/NotificationBell.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'

export default function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)
  const projects = useProjectStore((s) => s.projects)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logoutApi()
    } finally {
      disconnectSocket()
      logout()
      navigate('/login')
    }
  }

  const handleWorkspaceChange = (workspace) => {
    setActiveWorkspace(workspace)
    navigate(`/workspace/${workspace.id}`)
  }

  if (!isOpen) {
    return (
      <div className="w-12 border-r border-neutral-200 dark:border-neutral-800 flex flex-col items-center py-4 gap-3">
        <button
          onClick={onToggle}
          className="p-2 rounded-notion hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
        >
          <ChevronRightIcon />
        </button>
      </div>
    )
  }

  return (
    <div className="w-60 shrink-0 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full">

      {/* Workspace selector */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 flex-1 px-2 py-1.5 rounded-notion hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
          >
            <div className="w-5 h-5 bg-neutral-900 dark:bg-white rounded flex items-center justify-center shrink-0">
              <span className="text-white dark:text-neutral-900 text-xs font-semibold">
                {activeWorkspace?.name?.[0]?.toUpperCase() ?? 'H'}
              </span>
            </div>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {activeWorkspace?.name ?? 'Select workspace'}
            </span>
          </button>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">

        {/* Workspaces */}
        <div className="mb-2">
          <p className="px-3 py-1 text-xs font-medium text-neutral-400 dark:text-neutral-600 uppercase tracking-wider">
            Workspaces
          </p>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleWorkspaceChange(ws)}
              className={ws.id === activeWorkspace?.id ? 'sidebar-item-active w-full text-left' : 'sidebar-item w-full text-left'}
            >
              <div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center shrink-0">
                <span className="text-neutral-600 dark:text-neutral-300 text-xs font-medium">
                  {ws.name[0].toUpperCase()}
                </span>
              </div>
              <span className="truncate">{ws.name}</span>
            </button>
          ))}
        </div>

        {/* Projects */}
        {activeWorkspace && projects.length > 0 && (
          <div>
            <p className="px-3 py-1 text-xs font-medium text-neutral-400 dark:text-neutral-600 uppercase tracking-wider">
              Projects
            </p>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className={project.id === projectId ? 'sidebar-item-active w-full text-left' : 'sidebar-item w-full text-left'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 shrink-0" />
                <span className="truncate">{project.name}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-1.5 rounded-notion hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            title="Sign out"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)