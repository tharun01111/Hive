import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import CardDetailModal from "./CardDetailModal.jsx";
import { AvatarStack } from "../ui/Avatar.jsx";

export default function KanbanCard({ card, index, projectId }) {
  const [showDetail, setShowDetail] = useState(false);
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => {
              if (!card.pending) setShowDetail(true);
            }}
            className={`card animate-card-enter relative overflow-hidden p-3 cursor-pointer group transition-all ${
              snapshot.isDragging
                ? "shadow-notion-lg rotate-1"
                : "hover:-translate-y-0.5 hover:shadow-notion-md"
            } ${card.pending ? "pointer-events-none opacity-80" : ""}`}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                isOverdue ? "bg-red-500" : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            />
            {card.pending && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="h-full w-full animate-pulse bg-neutral-100/40 dark:bg-neutral-800/30" />
              </div>
            )}
            <p className="pl-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-snug">
              {card.title}
            </p>

            {card.description && (
              <p className="pl-1 text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-5">
                {card.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-3 pl-1">
              {/* Due date */}
              {card.dueDate && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    isOverdue
                      ? "bg-red-50 dark:bg-red-950/30 text-red-500"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {new Date(card.dueDate).toLocaleDateString()}
                </span>
              )}

              {/* Assignees */}
              {card.assignees?.length > 0 && (
                <div className="ml-auto">
                  <AvatarStack
                    members={card.assignees.map((assignee) => assignee.user)}
                    limit={3}
                    size="sm"
                  />
                </div>
              )}
              {card.pending && (
                <span className="ml-auto flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-600">
                  <span className="h-3 w-3 animate-spin rounded-full border border-neutral-300 border-t-neutral-600 dark:border-neutral-700 dark:border-t-neutral-200" />
                  Saving
                </span>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {!card.pending && (
        <CardDetailModal
          card={card}
          projectId={projectId}
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
