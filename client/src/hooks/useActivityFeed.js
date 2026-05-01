import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth.store.js";
import { useWorkspaceStore } from "../store/workspace.store.js";
import { getWorkspaceActivitiesApi } from "../api/activity.api.js";
import { ensureSocket } from "../socket/socket.js";

export const useActivityFeed = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const [activities, setActivities] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const workspaceId = activeWorkspace?.id;
    if (!workspaceId) {
      setActivities([]);
      setNextCursor(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const { data } = await getWorkspaceActivitiesApi(workspaceId);
        if (cancelled) return;
        setActivities(data.activities);
        setNextCursor(data.nextCursor);
      } catch (err) {
        if (!cancelled) console.error("Failed to load activities", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    const socket = ensureSocket(accessToken);
    const handleNewActivity = ({ activity }) => {
      setActivities((prev) => [activity, ...prev]);
    };

    socket?.emit("join:workspace", workspaceId);
    socket?.on("activity:new", handleNewActivity);

    return () => {
      cancelled = true;
      socket?.emit("leave:workspace", workspaceId);
      socket?.off("activity:new", handleNewActivity);
    };
  }, [activeWorkspace?.id, accessToken]);

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
