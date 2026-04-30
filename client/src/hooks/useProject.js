import { useEffect, useState } from "react";
import { useProjectStore } from "../store/project.store.js";
import { useKanbanStore } from "../store/kanban.store.js";
import { getProjectApi } from "../api/project.api.js";
import { getColumnsApi } from "../api/kanban.api.js";

export const useProject = (projectId) => {
  const { setActiveProject, activeProject } = useProjectStore();
  const { setColumns } = useKanbanStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      try {
        const [projectRes, columnsRes] = await Promise.all([
          getProjectApi(projectId),
          getColumnsApi(projectId),
        ]);
        setActiveProject(projectRes.data.project);
        setColumns(columnsRes.data.columns);
      } catch (err) {
        setError(err);
        console.error("Failed to load project", err);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return { activeProject, loading, error };
};
