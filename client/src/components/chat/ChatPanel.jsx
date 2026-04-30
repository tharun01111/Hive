import { useState, useEffect, useRef } from "react";
import { motion as Motion } from "framer-motion";
import { useAuthStore } from "../../store/auth.store.js";
import { useMessages } from "../../hooks/useMessages.js";
import { useChatStore } from "../../store/chat.store.js";
import { useProjectStore } from "../../store/project.store.js";
import { getSocket } from "../../socket/socket.js";
import ChatHeader from "./ChatHeader.jsx";
import MessageList from "./MessageList.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import ChatComposer from "./ChatComposer.jsx";

export default function ChatPanel({ projectId, onClose }) {
  const user = useAuthStore((s) => s.user);
  const activeProject = useProjectStore((s) => s.activeProject);
  const { messages, nextCursor, loading, loadingMore, loadMore } =
    useMessages(projectId);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    socket?.emit("message:send", { projectId, content: content.trim() });
    setContent("");
    socket?.emit("typing:stop", { projectId });
    clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (e) => {
    setContent(e.target.value);
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
      className="w-80 shrink-0 border-l border-neutral-200 dark:border-neutral-800 flex flex-col h-full bg-white dark:bg-neutral-950"
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
      <ChatComposer content={content} onChange={handleTyping} onSend={handleSend} />
    </Motion.aside>
  );
}
