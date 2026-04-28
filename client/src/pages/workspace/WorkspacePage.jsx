import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkspaceStore } from '../../store/workspace.store.js'
import { useProjectStore } from '../../store/project.store.js'
import { useWorkspaces } from '../../hooks/useWorkspaces.js'
import { useProjects } from '../../hooks/useProjects.js'
import { createWorkspaceApi } from '../../api/workspace.api.js'
import { createProjectApi } from '../../api/project.api.js'
import AppLayout from '../../components/layout/AppLayout.jsx'
import Modal from '../../components/ui/Modal.jsx'
import WorkspaceMembersModal from '../../components/members/WorkspaceMembersModal.jsx'

export default function WorkspacePage() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()

  const { activeWorkspace, setActiveWorkspace, addWorkspace } = useWorkspaceStore()
  const { addProject } = useProjectStore()

  const { workspaces } = useWorkspaces()
  const { projects } = useProjects(activeWorkspace?.id)

  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [wsForm, setWsForm] = useState({ name: '', description: '' })
  const [projForm, setProjForm] = useState({ name: '', description: '' })
  const [wsLoading, setWsLoading] = useState(false)
  const [projLoading, setProjLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    setWsLoading(true)
    setError('')
    try {
      const { data } = await createWorkspaceApi(wsForm)
      addWorkspace(data.workspace)
      setActiveWorkspace(data.workspace)
      setShowCreateWorkspace(false)
      setWsForm({ name: '', description: '' })
      navigate(`/workspace/${data.workspace.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create workspace')
    } finally {
      setWsLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!activeWorkspace) return
    setProjLoading(true)
    setError('')
    try {
      const { data } = await createProjectApi(activeWorkspace.id, projForm)
      addProject(data.project)
      setShowCreateProject(false)
      setProjForm({ name: '', description: '' })
      navigate(`/project/${data.project.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project')
    } finally {
      setProjLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {activeWorkspace?.name ?? 'Welcome to Hive'}
            </h1>
            {activeWorkspace?.description && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {activeWorkspace.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeWorkspace && (
              <button
                onClick={() => setShowMembers(true)}
                className="btn-ghost flex items-center gap-1.5"
              >
                <MembersIcon />
                Members
              </button>
            )}
            <button
              onClick={() => setShowCreateWorkspace(true)}
              className="btn-secondary"
            >
              New workspace
            </button>
            {activeWorkspace && (
              <button
                onClick={() => setShowCreateProject(true)}
                className="btn-primary"
              >
                New project
              </button>
            )}
          </div>
        </div>

        {/* Empty state */}
        {workspaces.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-notion flex items-center justify-center mb-4">
              <HiveIcon />
            </div>
            <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Create your first workspace
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm">
              Workspaces are where your team collaborates. Create one to get started.
            </p>
            <button
              onClick={() => setShowCreateWorkspace(true)}
              className="btn-primary"
            >
              Create workspace
            </button>
          </div>
        )}

        {/* Projects grid */}
        {activeWorkspace && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Projects
              </h2>
            </div>

            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-notion">
                <p className="text-sm text-neutral-400 dark:text-neutral-600 mb-4">
                  No projects yet
                </p>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="btn-secondary"
                >
                  Create first project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="card p-5 text-left hover:shadow-notion-md transition-shadow duration-150"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-notion flex items-center justify-center">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                          {project.name[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {project.members?.slice(0, 3).map((m) => (
                          <div
                            key={m.id}
                            className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 border border-white dark:border-neutral-900 flex items-center justify-center"
                          >
                            <span className="text-xs text-neutral-600 dark:text-neutral-300">
                              {m.user.name[0].toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-neutral-400 dark:text-neutral-600">
                        {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={showCreateWorkspace}
        onClose={() => { setShowCreateWorkspace(false); setError('') }}
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
              <span className="text-neutral-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="text"
              value={wsForm.description}
              onChange={(e) => setWsForm({ ...wsForm, description: e.target.value })}
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
              {wsLoading ? 'Creating...' : 'Create workspace'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateProject}
        onClose={() => { setShowCreateProject(false); setError('') }}
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
              onChange={(e) => setProjForm({ ...projForm, name: e.target.value })}
              placeholder="My project"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description
              <span className="text-neutral-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="text"
              value={projForm.description}
              onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
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
            <button type="submit" disabled={projLoading} className="btn-primary">
              {projLoading ? 'Creating...' : 'Create project'}
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
  )
}

const MembersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="5" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="10" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 8c1.7.3 3 1.8 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const HiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M10 2v12M3 6l7 4M17 6l-7 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)