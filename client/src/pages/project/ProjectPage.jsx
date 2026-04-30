import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "../../hooks/useProject.js";
import { useSocketEvents } from "../../socket/useSocketEvents.js";
import AppLayout from "../../components/layout/AppLayout.jsx";
import KanbanBoard from "../../components/kanban/KanbanBoard.jsx";
import ChatPanel from "../../components/chat/ChatPanel.jsx";
import ProjectMembersModal from "../../components/members/ProjectMembersModal.jsx";
import { useProjectStore } from "../../store/project.store.js";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { loading } = useProject(projectId);
  const activeProject = useProjectStore((s) => s.activeProject);
  const [chatOpen, setChatOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  useSocketEvents(projectId);

  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100 rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMembers(true)}
                className="btn-secondary flex items-center gap-1.5"
              >
                <MembersIcon />
                Members
              </button>
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-notion text-sm transition-colors ${
                  chatOpen
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "btn-secondary"
                }`}
              >
                <ChatIcon />
                Chat
              </button>
            </div>
          </div>

          {/* Kanban board */}
          <div className="flex-1 overflow-hidden">
            <KanbanBoard projectId={projectId} />
          </div>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <ChatPanel projectId={projectId} onClose={() => setChatOpen(false)} />
        )}
      </div>

      <ProjectMembersModal
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
      />
    </AppLayout>
  );
}

const MembersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="5" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 8c1.7.3 3 1.8 3 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2 2h10v8H8l-3 2v-2H2V2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);
