import { useEffect } from "react";
import { getSocket } from "./socket.js";
import { useKanbanStore } from "../store/kanban.store.js";
import { useChatStore } from "../store/chat.store.js";
import { useNotificationStore } from "../store/notification.store.js";
import { usePresenceStore } from "../store/presence.store.js";

export const useSocketEvents = (projectId) => {
  const addColumn = useKanbanStore((s) => s.addColumn);
  const updateColumn = useKanbanStore((s) => s.updateColumn);
  const removeColumn = useKanbanStore((s) => s.removeColumn);
  const addCard = useKanbanStore((s) => s.addCard);
  const updateCard = useKanbanStore((s) => s.updateCard);
  const removeCard = useKanbanStore((s) => s.removeCard);
  const setColumns = useKanbanStore((s) => s.setColumns);

  const addMessage = useChatStore((s) => s.addMessage);
  const removeMessage = useChatStore((s) => s.removeMessage);
  const addTypingUser = useChatStore((s) => s.addTypingUser);
  const removeTypingUser = useChatStore((s) => s.removeTypingUser);

  const addNotification = useNotificationStore((s) => s.addNotification);
  const setProjectUsers = usePresenceStore((s) => s.setProjectUsers);
  const clearPresence = usePresenceStore((s) => s.clearPresence);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !projectId) return;

    socket.emit("join:project", projectId);
    const heartbeat = window.setInterval(() => {
      socket.emit("presence:heartbeat", { projectId });
    }, 30000);

    socket.on("card:created", ({ card }) => addCard(card));
    socket.on("card:updated", ({ card }) => updateCard(card));
    socket.on("card:deleted", ({ cardId }) => removeCard(cardId));
    socket.on("card:moved", ({ card }) => updateCard(card));
    socket.on("card:assigned", ({ card }) => updateCard(card));
    socket.on("card:unassigned", ({ card }) => updateCard(card));

    socket.on("column:created", ({ column }) => addColumn(column));
    socket.on("column:updated", ({ column }) =>
      updateColumn(column.id, column),
    );
    socket.on("column:deleted", ({ columnId }) => removeColumn(columnId));
    socket.on("columns:reordered", ({ columns: reordered }) => {
      const currentColumns = useKanbanStore.getState().columns;
      setColumns(
        currentColumns
          .map((c) => {
            const updated = reordered.find((col) => col.id === c.id);
            return updated ? { ...c, order: updated.order } : c;
          })
          .sort((a, b) => a.order - b.order),
      );
    });

    socket.on("message:received", ({ message }) => addMessage(message));
    socket.on("message:deleted", ({ messageId }) => removeMessage(messageId));
    socket.on("typing:started", (data) => addTypingUser(data));
    socket.on("typing:stopped", ({ userId }) => removeTypingUser(userId));
    socket.on("notification:new", ({ notification }) =>
      addNotification(notification),
    );
    socket.on("presence:update", ({ users }) => setProjectUsers(users));

    return () => {
      window.clearInterval(heartbeat);
      socket.emit("leave:project", projectId);
      socket.off("card:created");
      socket.off("card:updated");
      socket.off("card:deleted");
      socket.off("card:moved");
      socket.off("card:assigned");
      socket.off("card:unassigned");
      socket.off("column:created");
      socket.off("column:updated");
      socket.off("column:deleted");
      socket.off("columns:reordered");
      socket.off("message:received");
      socket.off("message:deleted");
      socket.off("typing:started");
      socket.off("typing:stopped");
      socket.off("notification:new");
      socket.off("presence:update");
      clearPresence();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);
};
