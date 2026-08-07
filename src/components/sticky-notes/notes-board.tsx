"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StickyNote } from "@/lib/sticky-notes/types";
import { STICKY_NOTE_COLOR_STYLES } from "@/lib/sticky-notes/types";
import {
  UNDATED_COLUMN_ID,
  buildWeekColumns,
  dateForWeekDrop,
  ensureCurrentWeekColumn,
  formatNoteDateLabel,
  type WeekColumn,
} from "@/lib/sticky-notes/week-board";

interface NotesBoardProps {
  notes: StickyNote[];
  onOpen: (note: StickyNote) => void;
  onBoardChange: (notes: StickyNote[]) => void;
}

function SortableNoteCard({
  note,
  onOpen,
}: {
  note: StickyNote;
  onOpen: (note: StickyNote) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: note.id,
    data: { type: "note", note },
  });
  const colors = STICKY_NOTE_COLOR_STYLES[note.color] ?? STICKY_NOTE_COLOR_STYLES.default;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group rounded-lg border shadow-sm",
        colors.card,
        colors.border,
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start gap-1 p-2.5">
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none rounded p-0.5 text-[#e8eaed]/35 hover:bg-white/10 hover:text-[#e8eaed]/70 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => onOpen(note)} className="min-w-0 flex-1 text-left">
          {note.title.trim() ? (
            <p className="truncate text-sm font-medium text-[#e8eaed]">{note.title}</p>
          ) : null}
          <p className="mt-0.5 line-clamp-4 whitespace-pre-wrap text-[13px] leading-snug text-[#e8eaed]/75">
            {note.body.trim() || "Nota vazia"}
          </p>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-[#e8eaed]/40">
            {formatNoteDateLabel(note.noteDate)}
          </p>
        </button>
      </div>
    </div>
  );
}

function WeekLane({
  column,
  onOpen,
}: {
  column: WeekColumn;
  onOpen: (note: StickyNote) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col:${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex h-full w-[280px] shrink-0 flex-col rounded-xl border bg-[#18191b]/90",
        isOver ? "border-brand-yellow/50 bg-[#202124]" : "border-[#5f6368]/30",
      )}
    >
      <header className="border-b border-[#5f6368]/25 px-3 py-3">
        <p className="text-[12px] font-bold leading-snug text-[#e8eaed]/90">{column.label}</p>
        <p className="mt-0.5 text-[11px] text-[#e8eaed]/40">
          {column.notes.length} {column.notes.length === 1 ? "nota" : "notas"}
        </p>
      </header>
      <SortableContext items={column.notes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[160px] flex-1 flex-col gap-2 overflow-y-auto p-2 [scrollbar-width:thin]">
          {column.notes.map((note) => (
            <SortableNoteCard key={note.id} note={note} onOpen={onOpen} />
          ))}
          {column.notes.length === 0 && (
            <p className="px-2 py-8 text-center text-xs text-[#e8eaed]/30">
              Arraste notas para cá
            </p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}

function findColumnOfNote(columns: WeekColumn[], noteId: string): WeekColumn | null {
  return columns.find((c) => c.notes.some((n) => n.id === noteId)) ?? null;
}

function resolveTargetColumn(
  columns: WeekColumn[],
  overId: string,
): WeekColumn | null {
  if (overId.startsWith("col:")) {
    const id = overId.slice(4);
    return columns.find((c) => c.id === id) ?? null;
  }
  return findColumnOfNote(columns, overId);
}

export function NotesBoard({ notes, onOpen, onBoardChange }: NotesBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const columns = useMemo(
    () => ensureCurrentWeekColumn(buildWeekColumns(notes)),
    [notes],
  );

  const activeNote = activeId ? notes.find((n) => n.id === activeId) ?? null : null;

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const noteId = String(active.id);
    const overId = String(over.id);
    const fromCol = findColumnOfNote(columns, noteId);
    const toCol = resolveTargetColumn(columns, overId);
    if (!fromCol || !toCol) return;

    const moving = notes.find((n) => n.id === noteId);
    if (!moving) return;

    const nextDate =
      toCol.id === UNDATED_COLUMN_ID
        ? null
        : dateForWeekDrop(toCol.weekStart, moving.noteDate);

    let targetIds = toCol.notes.map((n) => n.id).filter((id) => id !== noteId);
    if (fromCol.id === toCol.id) {
      const oldIndex = toCol.notes.findIndex((n) => n.id === noteId);
      let newIndex = toCol.notes.findIndex((n) => n.id === overId);
      if (overId.startsWith("col:")) newIndex = toCol.notes.length - 1;
      if (oldIndex < 0) return;
      if (newIndex < 0) newIndex = toCol.notes.length - 1;
      const reordered = arrayMove(
        toCol.notes.map((n) => n.id),
        oldIndex,
        newIndex,
      );
      targetIds = reordered;
    } else {
      let insertAt = toCol.notes.findIndex((n) => n.id === overId);
      if (insertAt < 0 || overId.startsWith("col:")) insertAt = targetIds.length;
      targetIds.splice(insertAt, 0, noteId);
    }

    const orderMap = new Map(targetIds.map((id, index) => [id, index]));
    const next = notes.map((n) => {
      if (n.id === noteId) {
        return {
          ...n,
          noteDate: nextDate,
          sortOrder: orderMap.get(n.id) ?? 0,
        };
      }
      if (orderMap.has(n.id)) {
        return { ...n, sortOrder: orderMap.get(n.id)! };
      }
      return n;
    });

    onBoardChange(next);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex min-h-[420px] gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {columns.map((column) => (
          <WeekLane key={column.id} column={column} onOpen={onOpen} />
        ))}
      </div>

      <DragOverlay>
        {activeNote ? (
          <div
            className={cn(
              "w-[252px] rounded-lg border p-3 shadow-2xl",
              STICKY_NOTE_COLOR_STYLES[activeNote.color]?.card,
              STICKY_NOTE_COLOR_STYLES[activeNote.color]?.border,
            )}
          >
            <p className="text-sm font-medium text-[#e8eaed]">
              {activeNote.title.trim() || "Nota"}
            </p>
            <p className="mt-1 line-clamp-3 text-xs text-[#e8eaed]/70">{activeNote.body}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
