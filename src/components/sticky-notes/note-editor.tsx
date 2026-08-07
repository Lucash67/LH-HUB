"use client";

import { useEffect, useRef } from "react";
import { Archive, Pin, PinOff, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STICKY_NOTE_COLORS,
  STICKY_NOTE_COLOR_STYLES,
  type StickyNote,
  type StickyNoteColor,
} from "@/lib/sticky-notes/types";

interface NoteEditorProps {
  note: StickyNote;
  onChange: (
    id: string,
    patch: Partial<Pick<StickyNote, "title" | "body" | "color" | "pinned" | "archived">>,
  ) => void;
  onClose: () => void;
  onTogglePin: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onSetColor: (id: string, color: StickyNoteColor) => void;
}

export function NoteEditor({
  note,
  onChange,
  onClose,
  onTogglePin,
  onArchive,
  onDelete,
  onSetColor,
}: NoteEditorProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const colors = STICKY_NOTE_COLOR_STYLES[note.color] ?? STICKY_NOTE_COLOR_STYLES.default;

  useEffect(() => {
    bodyRef.current?.focus();
  }, [note.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border shadow-2xl",
          colors.card,
          colors.border,
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={note.pinned ? "Desafixar" : "Fixar"}
              onClick={() => onTogglePin(note.id)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-black/20"
            >
              {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
            <button
              type="button"
              title="Arquivar"
              onClick={() => {
                onArchive(note.id);
                onClose();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-black/20"
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Excluir"
              onClick={() => {
                onDelete(note.id);
                onClose();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-black/20 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-black/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
          <input
            value={note.title}
            onChange={(e) => onChange(note.id, { title: e.target.value })}
            placeholder="Título"
            className="w-full bg-transparent text-xl font-bold text-white placeholder:text-white/40 focus:outline-none"
          />
          <textarea
            ref={bodyRef}
            value={note.body}
            onChange={(e) => onChange(note.id, { body: e.target.value })}
            placeholder="Escreva sua nota..."
            rows={10}
            className="min-h-[220px] w-full resize-none bg-transparent text-base leading-relaxed text-white/90 placeholder:text-white/35 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-4 py-3">
          {STICKY_NOTE_COLORS.map((color) => {
            const style = STICKY_NOTE_COLOR_STYLES[color];
            return (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => onSetColor(note.id, color)}
                className={cn(
                  "h-7 w-7 rounded-full border-2",
                  style.accent,
                  note.color === color ? "border-white" : "border-transparent",
                )}
              />
            );
          })}
          <span className="ml-auto text-[11px] text-white/45">Esc para fechar · salva sozinho</span>
        </div>
      </div>
    </div>
  );
}
