import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../store/workspace.store.js'
import { getWorkspacesApi } from '../api/workspace.api.js'

export const useWorkspaces = () => {
  const { workspaces, setWorkspaces, activeWorkspace, setActiveWorkspace } =
    useWorkspaceStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getWorkspacesApi()
        setWorkspaces(data.workspaces)
        if (!activeWorkspace && data.workspaces.length > 0) {
          setActiveWorkspace(data.workspaces[0])
        }
      } catch (err) {
        setError(err)
        console.error('Failed to load workspaces', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { workspaces, activeWorkspace, loading, error }
}