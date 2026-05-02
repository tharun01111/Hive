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
            className={`card p-2.5 cursor-pointer group/card ${
              snapshot.isDragging
                ? "shadow-xl rotate-1 scale-[1.02] ring-1 ring-neutral-200 dark:ring-neutral-700 bg-white dark:bg-neutral-800 z-50 transition-none"
                : "transition-all duration-150 hover:-translate-y-0.5 hover:shadow-premium hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            } ${card.pending ? "pointer-events-none opacity-80" : ""}`}
          >
            {card.pending && (
              <div className="absolute inset-0 overflow-hidden rounded-premium">
                <div className="h-full w-full animate-pulse bg-neutral-100/40 dark:bg-neutral-800/30" />
              </div>
            )}
            
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-tight">
                {card.title}
              </p>
              {/* Progressive actions could go here */}
            </div>

            {card.description && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                {card.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-3 gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                {/* Due date */}
                {card.dueDate && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${
                      isOverdue
                        ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-500/80 border border-red-100/50 dark:border-red-900/30"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500 border border-neutral-200/50 dark:border-neutral-700/50"
                    }`}
                  >
                    <CalendarIcon />
                    {new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Assignees */}
              {card.assignees?.length > 0 && (
                <div className="shrink-0">
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

const CalendarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
    <path
      d="M3 2v2M11 2v2M2 5.5h10M3.5 2h7a1.5 1.5 0 011.5 1.5v8a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 012 11.5v-8A1.5 1.5 0 013.5 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
