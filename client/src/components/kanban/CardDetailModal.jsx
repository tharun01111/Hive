import { useState } from "react";
import { useKanbanStore } from "../../store/kanban.store.js";
import { useProjectStore } from "../../store/project.store.js";
import { getSocket } from "../../socket/socket.js";
import Modal from "../ui/Modal.jsx";

export default function CardDetailModal({ card, projectId, isOpen, onClose }) {
  const removeCard = useKanbanStore((s) => s.removeCard);
  const updateCard = useKanbanStore((s) => s.updateCard);
  const activeProject = useProjectStore((s) => s.activeProject);
  const socket = getSocket();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: card.title,
    description: card.description ?? "",
    dueDate: card.dueDate
      ? new Date(card.dueDate).toISOString().split("T")[0]
      : "",
  });

  const handleSave = () => {
    if (!form.title.trim()) return;

    socket?.emit("card:update", {
      cardId: card.id,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
      projectId,
    });

    updateCard({
      ...card,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
    });

    setEditing(false);
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this card?")) return;
    socket?.emit("card:delete", { cardId: card.id, projectId });
    removeCard(card.id);
    onClose();
  };

  const handleAssign = (userId) => {
    socket?.emit("card:assign", { cardId: card.id, userId, projectId });
  };

  const handleUnassign = (userId) => {
    socket?.emit("card:unassign", { cardId: card.id, userId, projectId });
  };

  const isAssigned = (userId) =>
    card.assignees?.some((a) => a.userId === userId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card details" size="lg">
      <div className="space-y-4">
        {/* Title */}
        {editing ? (
          <input
            autoFocus
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input text-base font-medium"
          />
        ) : (
          <h3
            onDoubleClick={() => setEditing(true)}
            className="text-base font-medium text-neutral-900 dark:text-neutral-100 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300"
            title="Double click to edit"
          >
            {card.title}
          </h3>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
            Description
          </label>
          {editing ? (
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              placeholder="Add a description..."
              className="input text-sm resize-none"
            />
          ) : (
            <p
              onDoubleClick={() => setEditing(true)}
              className="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer min-h-8"
            >
              {card.description || (
                <span className="text-neutral-300 dark:text-neutral-600 italic">
                  No description — double click to add
                </span>
              )}
            </p>
          )}
        </div>

        {/* Due date */}
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
            Due date
          </label>
          {editing ? (
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="input text-sm"
            />
          ) : (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {card.dueDate ? (
                new Date(card.dueDate).toLocaleDateString()
              ) : (
                <span className="text-neutral-300 dark:text-neutral-600 italic">
                  No due date
                </span>
              )}
            </p>
          )}
        </div>

        {/* Assignees */}
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
            Assignees
          </label>
          <div className="flex flex-wrap gap-2">
            {activeProject?.members?.map((member) => {
              const assigned = isAssigned(member.userId);
              return (
                <button
                  key={member.id}
                  onClick={() =>
                    assigned
                      ? handleUnassign(member.userId)
                      : handleAssign(member.userId)
                  }
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-notion text-xs transition-colors ${
                    assigned
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-neutral-400 dark:bg-neutral-600 flex items-center justify-center">
                    <span className="text-white text-xs">
                      {member.user.name[0].toUpperCase()}
                    </span>
                  </div>
                  {member.user.name}
                  {assigned && <CheckIcon />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button onClick={handleDelete} className="btn-danger text-xs py-1.5">
            Delete card
          </button>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="btn-secondary text-xs py-1.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary text-xs py-1.5"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary text-xs py-1.5"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M2 6l3 3 5-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
