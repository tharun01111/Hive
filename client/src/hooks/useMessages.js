import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chat.store.js";
import { getMessagesApi } from "../api/message.api.js";

export const useMessages = (projectId) => {
  const { messages, nextCursor, setMessages, prependMessages } = useChatStore();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!projectId) {
      useChatStore.getState().clearChat();
      setLoading(false);
      return;
    }

    setLoading(true);

    const load = async () => {
      try {
        const { data } = await getMessagesApi(projectId);
        if (requestIdRef.current !== requestId) return;
        setMessages(data.messages, data.nextCursor);
      } catch (err) {
        if (requestIdRef.current === requestId) {
          console.error("Failed to load messages", err);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    };
    load();

    return () => {
      requestIdRef.current += 1;
      useChatStore.getState().clearChat();
    };
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
