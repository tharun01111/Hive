import { useEffect } from "react";
import { ensureSocket } from "./socket.js";
import { useAuthStore } from "../store/auth.store.js";
import { useKanbanStore } from "../store/kanban.store.js";
import { useChatStore } from "../store/chat.store.js";
import { useNotificationStore } from "../store/notification.store.js";
import { usePresenceStore } from "../store/presence.store.js";

export const useSocketEvents = (projectId) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const addColumn = useKanbanStore((s) => s.addColumn);
  const confirmColumn = useKanbanStore((s) => s.confirmColumn);
  const updateColumn = useKanbanStore((s) => s.updateColumn);
  const removeColumn = useKanbanStore((s) => s.removeColumn);
  const addCard = useKanbanStore((s) => s.addCard);
  const confirmCard = useKanbanStore((s) => s.confirmCard);
  const updateCard = useKanbanStore((s) => s.updateCard);
  const removeCard = useKanbanStore((s) => s.removeCard);
  const setColumns = useKanbanStore((s) => s.setColumns);

  const addMessage = useChatStore((s) => s.addMessage);
  const confirmMessage = useChatStore((s) => s.confirmMessage);
  const removeMessage = useChatStore((s) => s.removeMessage);
  const addTypingUser = useChatStore((s) => s.addTypingUser);
  const removeTypingUser = useChatStore((s) => s.removeTypingUser);

  const addNotification = useNotificationStore((s) => s.addNotification);
  const setProjectUsers = usePresenceStore((s) => s.setProjectUsers);
  const clearPresence = usePresenceStore((s) => s.clearPresence);

  useEffect(() => {
    const socket = ensureSocket(accessToken);
    if (!socket || !projectId) return;

    const joinProject = () => {
      socket.emit("join:project", projectId);
      socket.emit("presence:heartbeat", { projectId });
    };

    joinProject();
    socket.on("connect", joinProject);
    const heartbeat = window.setInterval(() => {
      socket.emit("presence:heartbeat", { projectId });
    }, 30000);

    const handleCardCreated = ({ card, clientId }) => {
      if (clientId) confirmCard(clientId, card);
      else addCard(card);
    };
    const handleCardUpdated = ({ card }) => updateCard(card);
    const handleCardDeleted = ({ cardId }) => removeCard(cardId);
    const handleCardMoved = ({ card }) => updateCard(card);
    const handleCardAssigned = ({ card }) => updateCard(card);
    const handleCardUnassigned = ({ card }) => updateCard(card);
    const handleColumnCreated = ({ column, clientId }) => {
      if (clientId) confirmColumn(clientId, column);
      else addColumn(column);
    };
    const handleColumnUpdated = ({ column }) => updateColumn(column.id, column);
    const handleColumnDeleted = ({ columnId }) => removeColumn(columnId);
    const handleColumnsReordered = ({ columns: reordered }) => {
      const currentColumns = useKanbanStore.getState().columns;
      setColumns(
        currentColumns
          .map((c) => {
            const updated = reordered.find((col) => col.id === c.id);
            return updated ? { ...c, order: updated.order } : c;
          })
          .sort((a, b) => a.order - b.order),
      );
    };
    const handleMessageReceived = ({ message, clientId }) => {
      if (clientId) confirmMessage(clientId, message);
      else addMessage(message);
    };
    const handleMessageDeleted = ({ messageId }) => removeMessage(messageId);
    const handleTypingStarted = (data) => addTypingUser(data);
    const handleTypingStopped = ({ userId }) => removeTypingUser(userId);
    const handleNotificationNew = ({ notification }) =>
      addNotification(notification);
    const handlePresenceUpdate = ({ users }) => setProjectUsers(users);

    socket.on("card:created", handleCardCreated);
    socket.on("card:updated", handleCardUpdated);
    socket.on("card:deleted", handleCardDeleted);
    socket.on("card:moved", handleCardMoved);
    socket.on("card:assigned", handleCardAssigned);
    socket.on("card:unassigned", handleCardUnassigned);

    socket.on("column:created", handleColumnCreated);
    socket.on("column:updated", handleColumnUpdated);
    socket.on("column:deleted", handleColumnDeleted);
    socket.on("columns:reordered", handleColumnsReordered);

    socket.on("message:received", handleMessageReceived);
    socket.on("message:deleted", handleMessageDeleted);
    socket.on("typing:started", handleTypingStarted);
    socket.on("typing:stopped", handleTypingStopped);
    socket.on("notification:new", handleNotificationNew);
    socket.on("presence:update", handlePresenceUpdate);

    return () => {
      window.clearInterval(heartbeat);
      socket.off("connect", joinProject);
      socket.emit("leave:project", projectId);
      socket.off("card:created", handleCardCreated);
      socket.off("card:updated", handleCardUpdated);
      socket.off("card:deleted", handleCardDeleted);
      socket.off("card:moved", handleCardMoved);
      socket.off("card:assigned", handleCardAssigned);
      socket.off("card:unassigned", handleCardUnassigned);
      socket.off("column:created", handleColumnCreated);
      socket.off("column:updated", handleColumnUpdated);
      socket.off("column:deleted", handleColumnDeleted);
      socket.off("columns:reordered", handleColumnsReordered);
      socket.off("message:received", handleMessageReceived);
      socket.off("message:deleted", handleMessageDeleted);
      socket.off("typing:started", handleTypingStarted);
      socket.off("typing:stopped", handleTypingStopped);
      socket.off("notification:new", handleNotificationNew);
      socket.off("presence:update", handlePresenceUpdate);
      clearPresence();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, accessToken]);
};
