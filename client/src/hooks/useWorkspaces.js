import { useEffect, useState } from "react";
import { useWorkspaceStore } from "../store/workspace.store.js";
import { getWorkspacesApi } from "../api/workspace.api.js";

export const useWorkspaces = () => {
  const { workspaces, setWorkspaces, activeWorkspace, setActiveWorkspace } =
    useWorkspaceStore();
  const [loading, setLoading] = useState(workspaces.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (workspaces.length === 0) setLoading(true);
        const { data } = await getWorkspacesApi();
        if (cancelled) return;
        setWorkspaces(data.workspaces);
        if (!activeWorkspace && data.workspaces.length > 0) {
          setActiveWorkspace(data.workspaces[0]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.error("Failed to load workspaces", err);
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
  }, []);

  return { workspaces, activeWorkspace, loading, error };
};
