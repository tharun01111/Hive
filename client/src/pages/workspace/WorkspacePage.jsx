import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "../../store/workspace.store.js";
import { useProjectStore } from "../../store/project.store.js";
import { useWorkspaces } from "../../hooks/useWorkspaces.js";
import { useProjects } from "../../hooks/useProjects.js";
import { createWorkspaceApi } from "../../api/workspace.api.js";
import { createProjectApi } from "../../api/project.api.js";
import AppLayout from "../../components/layout/AppLayout.jsx";
import Modal from "../../components/ui/Modal.jsx";
import WorkspaceMembersModal from "../../components/members/WorkspaceMembersModal.jsx";
import ActivityPanel from "../../components/activity/ActivityPanel.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import {
  Skeleton,
  WorkspacePageSkeleton,
} from "../../components/ui/Skeleton.jsx";
import { AvatarStack } from "../../components/ui/Avatar.jsx";

export default function WorkspacePage() {
  const navigate = useNavigate();

  const { activeWorkspace, setActiveWorkspace, addWorkspace } =
    useWorkspaceStore();
  const { addProject } = useProjectStore();

  const { workspaces, loading: workspacesLoading } = useWorkspaces();
  const { projects, loading: projectsLoading } = useProjects(
    activeWorkspace?.id,
  );

  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [wsForm, setWsForm] = useState({ name: "", description: "" });
  const [projForm, setProjForm] = useState({ name: "", description: "" });
  const [wsLoading, setWsLoading] = useState(false);
  const [projLoading, setProjLoading] = useState(false);
  const [error, setError] = useState("");
  const [showActivity, setShowActivity] = useState(false);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setWsLoading(true);
    setError("");
    try {
      const { data } = await createWorkspaceApi(wsForm);
      addWorkspace(data.workspace);
      setActiveWorkspace(data.workspace);
      setShowCreateWorkspace(false);
      setWsForm({ name: "", description: "" });
      navigate(`/workspace/${data.workspace.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create workspace");
    } finally {
      setWsLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    setProjLoading(true);
    setError("");
    try {
      const { data } = await createProjectApi(activeWorkspace.id, projForm);
      addProject(data.project);
      setShowCreateProject(false);
      setProjForm({ name: "", description: "" });
      navigate(`/project/${data.project.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create project");
    } finally {
      setProjLoading(false);
    }
  };

  return (
    <AppLayout sidebarLoading={workspacesLoading}>
      <div className="flex h-full">
        <div className="flex-1 overflow-y-auto">
          {workspacesLoading ? (
            <WorkspacePageSkeleton />
          ) : (
          <div className="mx-auto max-w-6xl p-8">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {activeWorkspace?.name ?? "Welcome to Hive"}
                </h1>
                {activeWorkspace?.description && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {activeWorkspace.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeWorkspace && (
                  <button
                    onClick={() => setShowMembers(true)}
                    className="btn-ghost flex items-center gap-1.5 py-1.5 text-xs"
                  >
                    <MembersIcon />
                    Members
                  </button>
                )}
                <button
                  onClick={() => setShowCreateWorkspace(true)}
                  className="btn-secondary py-1.5 text-xs"
                >
                  New workspace
                </button>
                {activeWorkspace && (
                  <button
                    onClick={() => setShowCreateProject(true)}
                    className="btn-primary py-1.5 text-xs"
                  >
                    New project
                  </button>
                )}
                {activeWorkspace && (
                  <button
                    onClick={() => setShowActivity(!showActivity)}
                    className={`btn-ghost flex items-center gap-1.5 py-1.5 text-xs ${
                      showActivity
                        ? "text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800"
                        : ""
                    }`}
                  >
                    <ActivityIcon />
                    Activity
                  </button>
                )}
              </div>
            </div>

            {/* Empty state */}
            {workspaces.length === 0 && (
              <EmptyState
                icon={<HiveIcon />}
                title="Create your first workspace"
                description="Bring your team, projects, and conversations into one place."
                action={
                  <button
                    onClick={() => setShowCreateWorkspace(true)}
                    className="btn-primary"
                  >
                    Create workspace
                  </button>
                }
              />
            )}

            {/* Projects grid */}
            {activeWorkspace && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                    Projects
                  </h2>
                </div>

                {projectsLoading ? (
                  <WorkspaceProjectsSkeleton />
                ) : projects.length === 0 ? (
                  <div className="rounded-premium border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                    <EmptyState
                      compact
                      icon={<ProjectEmptyIcon />}
                      title="No projects yet"
                      description="Create your first project"
                      action={
                        <button
                          onClick={() => setShowCreateProject(true)}
                          className="btn-secondary py-1.5 px-3 text-xs"
                        >
                          Create project
                        </button>
                      }
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => navigate(`/project/${project.id}`)}
                        className="card group p-5 text-left transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-premium-md"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-premium bg-neutral-900 dark:bg-neutral-100 transition-transform duration-200 group-hover:scale-105">
                            <span className="text-[10px] font-bold text-white dark:text-neutral-900">
                              {project.name[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-2">
                          <AvatarStack
                            members={(project.members ?? []).map((m) => m.user)}
                            limit={3}
                            size="sm"
                          />
                          <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                            {project.members?.length} member
                            {project.members?.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          )}
        </div>
        {/* Activity panel */}
        <AnimatePresence>
          {showActivity && activeWorkspace && (
            <ActivityPanel onClose={() => setShowActivity(false)} />
          )}
        </AnimatePresence>
      </div>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={showCreateWorkspace}
        onClose={() => {
          setShowCreateWorkspace(false);
          setError("");
        }}
        title="Create workspace"
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Name
            </label>
            <input
              type="text"
              required
              value={wsForm.name}
              onChange={(e) => setWsForm({ ...wsForm, name: e.target.value })}
              placeholder="My workspace"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description
              <span className="text-neutral-400 font-normal ml-1">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={wsForm.description}
              onChange={(e) =>
                setWsForm({ ...wsForm, description: e.target.value })
              }
              placeholder="What is this workspace for?"
              className="input"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-notion">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateWorkspace(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={wsLoading} className="btn-primary">
              {wsLoading ? "Creating..." : "Create workspace"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateProject}
        onClose={() => {
          setShowCreateProject(false);
          setError("");
        }}
        title="Create project"
      >
        <form onSubmit={handleCreateProject} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Name
            </label>
            <input
              type="text"
              required
              value={projForm.name}
              onChange={(e) =>
                setProjForm({ ...projForm, name: e.target.value })
              }
              placeholder="My project"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description
              <span className="text-neutral-400 font-normal ml-1">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={projForm.description}
              onChange={(e) =>
                setProjForm({ ...projForm, description: e.target.value })
              }
              placeholder="What is this project about?"
              className="input"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-notion">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateProject(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={projLoading}
              className="btn-primary"
            >
              {projLoading ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Members Modal */}
      <WorkspaceMembersModal
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

const HiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 2L3 6v8l7 4 7-4V6l-7-4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M10 2v12M3 6l7 4M17 6l-7 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ActivityIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M1 7h2l2-4 2 8 2-6 2 4h2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProjectEmptyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M4 5h12v10H4V5zM7 8h6M7 11h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function WorkspaceProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="rounded-notion border border-[var(--hive-border)] bg-[color-mix(in_srgb,var(--hive-surface-raised)_92%,transparent)] p-5"
        >
          <Skeleton className="mb-4 h-8 w-8" />
          <Skeleton className="mb-2 h-4 w-2/3" />
          <Skeleton className="mb-4 h-3 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
