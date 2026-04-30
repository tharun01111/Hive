import { useEffect, useState } from "react";
import { useChatStore } from "../store/chat.store.js";
import { getMessagesApi } from "../api/message.api.js";

export const useMessages = (projectId) => {
  const { messages, nextCursor, setMessages, prependMessages } = useChatStore();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      try {
        const { data } = await getMessagesApi(projectId);
        setMessages(data.messages, data.nextCursor);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };
    load();

    return () => useChatStore.getState().clearChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data } = await getMessagesApi(projectId, nextCursor);
      prependMessages(data.messages, data.nextCursor);
    } catch (err) {
      console.error("Failed to load more messages", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return { messages, nextCursor, loading, loadingMore, loadMore };
};
