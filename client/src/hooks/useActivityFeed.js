import { useEffect, useState } from "react";
import { useWorkspaceStore } from "../store/workspace.store.js";
import { getWorkspaceActivitiesApi } from "../api/activity.api.js";
import { getSocket } from "../socket/socket.js";

export const useActivityFeed = () => {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const [activities, setActivities] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!activeWorkspace?.id) return;

    const load = async () => {
      try {
        const { data } = await getWorkspaceActivitiesApi(activeWorkspace.id);
        setActivities(data.activities);
        setNextCursor(data.nextCursor);
      } catch (err) {
        console.error("Failed to load activities", err);
      } finally {
        setLoading(false);
      }
    };

    load();

    // Join workspace room for real-time activity updates
    const socket = getSocket();
    socket?.emit("join:workspace", activeWorkspace.id);

    socket?.on("activity:new", ({ activity }) => {
      setActivities((prev) => [activity, ...prev]);
    });

    return () => {
      socket?.emit("leave:workspace", activeWorkspace.id);
      socket?.off("activity:new");
    };
  }, [activeWorkspace?.id]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data } = await getWorkspaceActivitiesApi(
        activeWorkspace.id,
        nextCursor,
      );
      setActivities((prev) => [...prev, ...data.activities]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error("Failed to load more activities", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return { activities, nextCursor, loading, loadingMore, loadMore };
};
