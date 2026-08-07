"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive,
  CalendarDays,
  Check,
  ImagePlus,
  MoreVertical,
  Palette,
  Pin,
  Redo2,
  Trash2,
  Undo2,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  STICKY_NOTE_COLORS,
  STICKY_NOTE_COLOR_STYLES,
  type StickyNote,
  type StickyNoteColor,
} from "@/lib/sticky-notes/types";
import { formatNoteDateLabel } from "@/lib/sticky-notes/week-board";

interface NoteEditorProps {
  note: StickyNote;
  onChange: (
    id: string,
    patch: Partial<
      Pick<StickyNote, "title" | "body" | "color" | "noteDate" | "pinned" | "archived">
    >,
  ) => void;
  onClose: () => void;
  onTogglePin: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onSetColor: (id: string, color: StickyNoteColor) => void;
}

type Snapshot = { title: string; body: string };

function ToolbarButton({
  title,
  onClick,
  disabled,
  children,
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full text-[#e8eaed]/75 transition-colors",
        disabled
          ? "cursor-default opacity-30"
          : "hover:bg-white/10 hover:text-[#e8eaed]",
      )}
    >
      {children}
    </button>
  );
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
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const skipHistory = useRef(false);
  const colors = STICKY_NOTE_COLOR_STYLES[note.color] ?? STICKY_NOTE_COLOR_STYLES.default;

  const pushHistory = useCallback((next: Snapshot, prev: Snapshot) => {
    if (skipHistory.current) {
      skipHistory.current = false;
      return;
    }
    if (prev.title === next.title && prev.body === next.body) return;
    setPast((stack) => [...stack.slice(-40), prev]);
    setFuture([]);
  }, []);

  useEffect(() => {
    // Foca o corpo se já houver título; senão o título.
    if (note.title.trim()) bodyRef.current?.focus();
  }, [note.id]);

  const undo = useCallback(() => {
    setPast((stack) => {
      if (stack.length === 0) return stack;
      const prev = stack[stack.length - 1]!;
      setFuture((f) => [{ title: note.title, body: note.body }, ...f]);
      skipHistory.current = true;
      onChange(note.id, prev);
      return stack.slice(0, -1);
    });
  }, [note.body, note.id, note.title, onChange]);

  const redo = useCallback(() => {
    setFuture((stack) => {
      if (stack.length === 0) return stack;
      const next = stack[0]!;
      setPast((p) => [...p, { title: note.title, body: note.body }]);
      skipHistory.current = true;
      onChange(note.id, next);
      return stack.slice(1);
    });
  }, [note.body, note.id, note.title, onChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showPalette || showMore || showDate) {
          setShowPalette(false);
          setShowMore(false);
          setShowDate(false);
          return;
        }
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, redo, showDate, showMore, showPalette, undo]);

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 420)}px`;
  };

  useEffect(() => {
    autoResize(bodyRef.current);
  }, [note.body, note.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-8">
      <button
        type="button"
        aria-label="Fechar editor"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 flex h-[min(88vh,860px)] w-full max-w-[920px] flex-col overflow-hidden rounded-xl border shadow-[0_8px_28px_rgba(0,0,0,0.55)]",
          colors.card,
          colors.border,
        )}
      >
        {/* Cabeçalho Keep: título + pin à direita */}
        <div className="flex items-start gap-2 px-4 pb-1 pt-4 sm:px-5 sm:pt-5">
          <input
            value={note.title}
            onChange={(e) => {
              pushHistory(
                { title: e.target.value, body: note.body },
                { title: note.title, body: note.body },
              );
              onChange(note.id, { title: e.target.value });
            }}
            placeholder="Título"
            className="min-w-0 flex-1 bg-transparent text-[22px] font-normal leading-tight tracking-tight text-[#e8eaed] placeholder:text-[#e8eaed]/40 focus:outline-none"
          />
          <ToolbarButton
            title={note.pinned ? "Desafixar" : "Fixar"}
            onClick={() => onTogglePin(note.id)}
          >
            <Pin className={cn("h-[18px] w-[18px]", note.pinned && "fill-current text-[#e8eaed]")} />
          </ToolbarButton>
        </div>

        {/* Corpo amplo — ocupa o espaço restante do modal */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3 pt-2 sm:px-7 [scrollbar-width:thin] [scrollbar-color:#5f6368_transparent]">
          <textarea
            ref={bodyRef}
            value={note.body}
            onChange={(e) => {
              pushHistory(
                { title: note.title, body: e.target.value },
                { title: note.title, body: note.body },
              );
              onChange(note.id, { body: e.target.value });
              autoResize(e.target);
            }}
            placeholder="Anotar..."
            rows={16}
            className="min-h-full w-full resize-none bg-transparent text-[16px] leading-[1.6] text-[#e8eaed]/92 placeholder:text-[#e8eaed]/35 focus:outline-none"
          />
        </div>

        {/* Barra inferior Keep */}
        <div className="relative flex items-center gap-0.5 px-2 pb-2 pt-1 sm:px-3">
          {showPalette && (
            <div className="absolute bottom-12 left-2 z-20 flex flex-wrap gap-2 rounded-xl border border-[#5f6368]/50 bg-[#2d2e30] p-2.5 shadow-xl">
              {STICKY_NOTE_COLORS.map((color) => {
                const style = STICKY_NOTE_COLOR_STYLES[color];
                return (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() => {
                      onSetColor(note.id, color);
                      setShowPalette(false);
                    }}
                    className={cn(
                      "relative h-7 w-7 rounded-full",
                      style.swatch,
                      note.color === color && "ring-2 ring-[#e8eaed] ring-offset-1 ring-offset-[#2d2e30]",
                    )}
                  >
                    {note.color === color && (
                      <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-[#e8eaed]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {showDate && (
            <div className="absolute bottom-12 left-12 z-20 w-[240px] rounded-xl border border-[#5f6368]/50 bg-[#2d2e30] p-3 shadow-xl">
              <p className="mb-2 text-xs font-semibold text-[#e8eaed]/55">Data da nota</p>
              <input
                ref={dateInputRef}
                type="date"
                value={note.noteDate ?? ""}
                onChange={(e) => {
                  const value = e.target.value || null;
                  onChange(note.id, { noteDate: value });
                }}
                className="w-full rounded-lg border border-[#5f6368]/50 bg-[#202124] px-2 py-2 text-sm text-[#e8eaed] focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange(note.id, { noteDate: format(new Date(), "yyyy-MM-dd") });
                  }}
                  className="rounded-md px-2 py-1 text-xs text-[#e8eaed]/80 hover:bg-white/10"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(note.id, { noteDate: null });
                  }}
                  className="rounded-md px-2 py-1 text-xs text-[#e8eaed]/80 hover:bg-white/10"
                >
                  Sem data
                </button>
                <button
                  type="button"
                  onClick={() => setShowDate(false)}
                  className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-brand-yellow hover:bg-brand-yellow/10"
                >
                  Salvar
                </button>
              </div>
              <p className="mt-2 text-[11px] text-[#e8eaed]/40">
                Atual: {formatNoteDateLabel(note.noteDate)}
              </p>
            </div>
          )}

          {showMore && (
            <div className="absolute bottom-12 left-36 z-20 min-w-[160px] overflow-hidden rounded-lg border border-[#5f6368]/50 bg-[#2d2e30] py-1 shadow-xl">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#e8eaed]/90 hover:bg-white/10"
                onClick={() => {
                  onDelete(note.id);
                  onClose();
                }}
              >
                <Trash2 className="h-4 w-4" />
                Excluir nota
              </button>
            </div>
          )}

          <ToolbarButton
            title="Cor de fundo"
            onClick={() => {
              setShowMore(false);
              setShowDate(false);
              setShowPalette((v) => !v);
            }}
          >
            <Palette className="h-[18px] w-[18px]" />
          </ToolbarButton>
          <ToolbarButton
            title="Data da nota"
            onClick={() => {
              setShowMore(false);
              setShowPalette(false);
              setShowDate((v) => !v);
            }}
          >
            <CalendarDays className="h-[18px] w-[18px]" />
          </ToolbarButton>
          <ToolbarButton title="Colaboradores (em breve)" disabled>
            <UserPlus className="h-[18px] w-[18px]" />
          </ToolbarButton>
          <ToolbarButton title="Imagem (em breve)" disabled>
            <ImagePlus className="h-[18px] w-[18px]" />
          </ToolbarButton>
          <ToolbarButton
            title="Arquivar"
            onClick={() => {
              onArchive(note.id);
              onClose();
            }}
          >
            <Archive className="h-[18px] w-[18px]" />
          </ToolbarButton>
          <ToolbarButton
            title="Mais"
            onClick={() => {
              setShowPalette(false);
              setShowDate(false);
              setShowMore((v) => !v);
            }}
          >
            <MoreVertical className="h-[18px] w-[18px]" />
          </ToolbarButton>

          <div className="mx-1 hidden h-5 w-px bg-white/10 sm:block" />

          <ToolbarButton title="Desfazer" disabled={past.length === 0} onClick={undo}>
            <Undo2 className="h-[18px] w-[18px]" />
          </ToolbarButton>
          <ToolbarButton title="Refazer" disabled={future.length === 0} onClick={redo}>
            <Redo2 className="h-[18px] w-[18px]" />
          </ToolbarButton>

          <div className="flex-1" />

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-[#e8eaed]/85 hover:bg-white/10"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
