import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/auth.store.js";
import { useKanbanStore } from "../../store/kanban.store.js";
import { ensureSocket } from "../../socket/socket.js";

const createTempId = () =>
  `temp-column-${crypto.randomUUID?.() ?? Date.now().toString(36)}`;

export default function AddColumnButton({ projectId }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const addColumn = useKanbanStore((s) => s.addColumn);
  const confirmColumn = useKanbanStore((s) => s.confirmColumn);
  const removeColumn = useKanbanStore((s) => s.removeColumn);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const socket = ensureSocket(accessToken);
    if (!socket) return;
    const trimmedName = name.trim();
    const clientId = createTempId();

    const cleanup = () => {
      socket.off("column:create:ack", handleAck);
      socket.off("column:create:error", handleError);
    };

    const handleAck = ({ column, clientId: ackClientId }) => {
      if (ackClientId !== clientId) return;
      cleanup();
      confirmColumn(clientId, column);
    };

    const handleError = ({ clientId: errorClientId, message }) => {
      if (errorClientId !== clientId) return;
      cleanup();
      removeColumn(clientId);
      toast.error(message ?? "Failed to create column");
    };

    addColumn({
      id: clientId,
      name: trimmedName,
      projectId,
      order: useKanbanStore.getState().columns.length,
      cards: [],
      pending: true,
    });

    socket.on("column:create:ack", handleAck);
    socket.on("column:create:error", handleError);

    socket.emit("column:create", {
      name: trimmedName,
      projectId,
      clientId,
    });

    setName("");
    setAdding(false);
  };

  if (adding) {
    return (
      <div className="w-72 shrink-0 rounded-premium border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50 p-2 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setAdding(false);
                setName("");
              }
            }}
            placeholder="Column name..."
            className="input text-sm py-1.5"
          />
          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary py-1 px-3 text-[11px]">
              Add column
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setName("");
              }}
              className="btn-ghost py-1 px-2 text-[11px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setAdding(true)}
      className="flex w-72 shrink-0 items-center gap-2 rounded-premium border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30 px-3 py-2 text-sm text-neutral-500 dark:text-neutral-500 transition-all duration-150 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 shadow-sm"
    >
      <PlusIcon />
      <span className="font-medium">Add column</span>
    </button>
  );
}

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7 2v10M2 7h10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
