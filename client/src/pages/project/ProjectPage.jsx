import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectStore } from '../../store/project.store.js'
import { useKanbanStore } from '../../store/kanban.store.js'
import { getProjectApi } from '../../api/project.api.js'
import { getColumnsApi } from '../../api/kanban.api.js'
import { useSocketEvents } from '../../socket/useSocketEvents.js'
import AppLayout from '../../components/layout/AppLayout.jsx'
import KanbanBoard from '../../components/kanban/KanbanBoard.jsx'
import ChatPanel from '../../components/chat/ChatPanel.jsx'

export default function ProjectPage() {
  const { projectId } = useParams()
  const { setActiveProject, activeProject } = useProjectStore()
  const { setColumns } = useKanbanStore()
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)

  useSocketEvents(projectId)

  useEffect(() => {
    if (!projectId) return

    const load = async () => {
      try {
        const [projectRes, columnsRes] = await Promise.all([
          getProjectApi(projectId),
          getColumnsApi(projectId),
        ])
        setActiveProject(projectRes.data.project)
        setColumns(columnsRes.data.columns)
      } catch (err) {
        console.error('Failed to load project', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [projectId])

  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100 rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col min-w-0">

          {/* Project header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {activeProject?.name}
              </h1>
              {activeProject?.description && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {activeProject.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-notion text-sm transition-colors ${
                chatOpen
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'btn-secondary'
              }`}
            >
              <ChatIcon />
              Chat
            </button>
          </div>

          {/* Kanban board */}
          <div className="flex-1 overflow-hidden">
            <KanbanBoard projectId={projectId} />
          </div>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <ChatPanel
            projectId={projectId}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>
    </AppLayout>
  )
}

const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 2h10v8H8l-3 2v-2H2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)