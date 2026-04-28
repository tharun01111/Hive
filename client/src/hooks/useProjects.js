import { useEffect, useState } from 'react'
import { useProjectStore } from '../store/project.store.js'
import { getProjectsApi } from '../api/project.api.js'

export const useProjects = (workspaceId) => {
  const { projects, setProjects } = useProjectStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!workspaceId) return
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await getProjectsApi(workspaceId)
        setProjects(data.projects)
      } catch (err) {
        setError(err)
        console.error('Failed to load projects', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [workspaceId])

  return { projects, loading, error }
}