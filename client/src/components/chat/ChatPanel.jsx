import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { motion as Motion } from "framer-motion";
import { useAuthStore } from "../../store/auth.store.js";
import { useMessages } from "../../hooks/useMessages.js";
import { useChatStore } from "../../store/chat.store.js";
import { useProjectStore } from "../../store/project.store.js";
import { ensureSocket } from "../../socket/socket.js";
import ChatHeader from "./ChatHeader.jsx";
import MessageList from "./MessageList.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import ChatComposer from "./ChatComposer.jsx";

const createTempId = () =>
  `temp-message-${crypto.randomUUID?.() ?? Date.now().toString(36)}`;

export default function ChatPanel({ projectId, onClose }) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const activeProject = useProjectStore((s) => s.activeProject);
  const { messages, nextCursor, loading, loadingMore, loadMore } =
    useMessages(projectId);
  const addMessage = useChatStore((s) => s.addMessage);
  const confirmMessage = useChatStore((s) => s.confirmMessage);
  const markMessageFailed = useChatStore((s) => s.markMessageFailed);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const socket = ensureSocket(accessToken);
    if (!socket) return;
    const trimmedContent = content.trim();
    const clientId = createTempId();

    const cleanup = () => {
      socket.off("message:send:ack", handleAck);
      socket.off("message:send:error", handleError);
    };

    const handleAck = ({ message, clientId: ackClientId }) => {
      if (ackClientId !== clientId) return;
      cleanup();
      confirmMessage(clientId, message);
    };

    const handleError = ({ clientId: errorClientId, message }) => {
      if (errorClientId !== clientId) return;
      cleanup();
      markMessageFailed(clientId);
      toast.error(message ?? "Failed to send message");
    };

    addMessage({
      id: clientId,
      projectId,
      userId: user?.id,
      user,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
      pending: true,
    });

    socket.on("message:send:ack", handleAck);
    socket.on("message:send:error", handleError);
    socket.emit("message:send", {
      projectId,
      content: trimmedContent,
      clientId,
    });
    setContent("");
    socket.emit("typing:stop", { projectId });
    clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (e) => {
    setContent(e.target.value);
    const socket = ensureSocket(accessToken);
    socket?.emit("typing:start", { projectId, userName: user?.name });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("typing:stop", { projectId });
    }, 2000);
  };

  return (
    <Motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.18 }}
      className="flex h-full w-80 shrink-0 flex-col border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-premium-lg"
    >
      <ChatHeader projectName={activeProject?.name} onClose={onClose} />
      <MessageList
        messages={messages}
        user={user}
        loading={loading}
        nextCursor={nextCursor}
        loadingMore={loadingMore}
        loadMore={loadMore}
        messagesEndRef={messagesEndRef}
      />
      <TypingIndicator users={typingUsers} />
      <ChatComposer
        content={content}
        onChange={handleTyping}
        onSend={handleSend}
      />
    </Motion.aside>
  );
}
