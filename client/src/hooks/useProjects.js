import { useEffect, useState } from "react";
import { useProjectStore } from "../store/project.store.js";
import { getProjectsApi } from "../api/project.api.js";

export const useProjects = (workspaceId) => {
  const { projects, setProjects } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getProjectsApi(workspaceId);
        if (cancelled) return;
        setProjects(data.projects);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.error("Failed to load projects", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  return { projects, loading, error };
};
