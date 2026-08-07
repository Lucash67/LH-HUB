"use client";

import { Archive, Pin, PinOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STICKY_NOTE_COLOR_STYLES,
  type StickyNote,
} from "@/lib/sticky-notes/types";

interface NoteCardProps {
  note: StickyNote;
  onOpen: (note: StickyNote) => void;
  onTogglePin: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({
  note,
  onOpen,
  onTogglePin,
  onArchive,
  onDelete,
}: NoteCardProps) {
  const colors = STICKY_NOTE_COLOR_STYLES[note.color] ?? STICKY_NOTE_COLOR_STYLES.default;
  const preview = note.body.trim() || "Nota vazia";

  return (
    <article
      className={cn(
        "group relative break-inside-avoid rounded-2xl border p-4 shadow-sm transition-transform hover:-translate-y-0.5",
        colors.card,
        colors.border,
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(note)}
        className="w-full text-left"
      >
        {note.title.trim() ? (
          <h3 className="mb-1.5 text-base font-bold leading-snug text-white/95">
            {note.title}
          </h3>
        ) : null}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/80 line-clamp-8">
          {preview}
        </p>
      </button>

      <div className="mt-3 flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <button
          type="button"
          title={note.pinned ? "Desafixar" : "Fixar"}
          onClick={() => onTogglePin(note.id)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-black/25 hover:text-white"
        >
          {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          title="Arquivar"
          onClick={() => onArchive(note.id)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-black/25 hover:text-white"
        >
          <Archive className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Excluir"
          onClick={() => onDelete(note.id)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-black/25 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {note.pinned && (
        <span className="absolute right-3 top-3 text-brand-yellow">
          <Pin className="h-3.5 w-3.5 fill-current" />
        </span>
      )}
    </article>
  );
}
