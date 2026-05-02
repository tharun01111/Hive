import { useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useProject } from "../../hooks/useProject.js";
import { useSocketEvents } from "../../socket/useSocketEvents.js";
import AppLayout from "../../components/layout/AppLayout.jsx";
import KanbanBoard from "../../components/kanban/KanbanBoard.jsx";
import ChatPanel from "../../components/chat/ChatPanel.jsx";
import ProjectMembersModal from "../../components/members/ProjectMembersModal.jsx";
import { useProjectStore } from "../../store/project.store.js";
import { usePresenceStore } from "../../store/presence.store.js";
import { AvatarStack } from "../../components/ui/Avatar.jsx";
import { BoardSkeleton } from "../../components/ui/Skeleton.jsx";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { loading } = useProject(projectId);
  const activeProject = useProjectStore((s) => s.activeProject);
  const onlineUsers = usePresenceStore((s) => s.projectUsers);
  const [chatOpen, setChatOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  useSocketEvents(projectId);

  return (
    <AppLayout>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Project header */}
          <div className="shrink-0 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {activeProject?.name ?? "Loading project"}
                </h1>
                {activeProject?.description && (
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {activeProject.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  <span>{activeProject?.members?.length ?? 0} members</span>
                  <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                    {onlineUsers.length} online
                  </span>
                  {onlineUsers.length > 0 && (
                    <AvatarStack members={onlineUsers} limit={4} size="sm" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMembers(true)}
                  className="btn-secondary flex items-center gap-1.5 py-1.5 text-xs"
                >
                  <MembersIcon />
                  Members
                </button>
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className={`flex items-center gap-2 rounded-premium px-3 py-1.5 text-xs font-medium transition-all ${
                    chatOpen 
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border border-neutral-900 dark:border-white" 
                      : "btn-secondary"
                  }`}
                >
                  <ChatIcon />
                  Chat
                </button>
              </div>
            </div>
          </div>

          {/* Kanban board */}
          <div className="flex-1 overflow-hidden">
            {loading ? <BoardSkeleton /> : <KanbanBoard projectId={projectId} />}
          </div>
        </div>

        {/* Chat panel */}
        <AnimatePresence>
          {chatOpen && (
            <ChatPanel
              projectId={projectId}
              onClose={() => setChatOpen(false)}
            />
          )}
        </AnimatePresence>
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
