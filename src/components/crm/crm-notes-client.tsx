"use client";

import { useMemo, useState } from "react";
import { format, subWeeks } from "date-fns";
import { NotebookPen, Search } from "lucide-react";
import { PageLoader } from "@/components/ui/loading";
import { ComposeBar } from "@/components/sticky-notes/compose-bar";
import { NoteEditor } from "@/components/sticky-notes/note-editor";
import { NotesBoard } from "@/components/sticky-notes/notes-board";
import {
  DEFAULT_NOTES_FILTERS,
  NotesFilters,
  type NotesFilterState,
} from "@/components/sticky-notes/notes-filters";
import { StickySaveStatus } from "@/components/sticky-notes/save-status";
import { useCrmStickyNotes } from "@/hooks/use-crm-sticky-notes";
import type { StickyNote } from "@/lib/sticky-notes/types";
import { currentWeekStart, weekKeyFromDate } from "@/lib/sticky-notes/week-board";

function applyFilters(notes: StickyNote[], filters: NotesFilterState, query: string): StickyNote[] {
  const q = query.trim().toLowerCase();
  const thisWeek = weekKeyFromDate(format(new Date(), "yyyy-MM-dd"));
  const lastWeek = weekKeyFromDate(format(subWeeks(new Date(), 1), "yyyy-MM-dd"));

  return notes.filter((n) => {
    if (q && !n.title.toLowerCase().includes(q) && !n.body.toLowerCase().includes(q)) {
      return false;
    }
    if (filters.pinnedOnly && !n.pinned) return false;
    if (filters.color !== "all" && n.color !== filters.color) return false;

    switch (filters.date) {
      case "with_date":
        if (!n.noteDate) return false;
        break;
      case "no_date":
        if (n.noteDate) return false;
        break;
      case "this_week":
        if (!n.noteDate || weekKeyFromDate(n.noteDate) !== thisWeek) return false;
        break;
      case "last_week":
        if (!n.noteDate || weekKeyFromDate(n.noteDate) !== lastWeek) return false;
        break;
      default:
        break;
    }
    return true;
  });
}

export function CrmNotesClient() {
  const {
    notes,
    loading,
    status,
    createNote,
    updateNote,
    applyBoardMove,
    setColor,
    togglePin,
    archiveNote,
    deleteNote,
  } = useCrmStickyNotes();
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<NotesFilterState>(DEFAULT_NOTES_FILTERS);
  const [focusWeekStart, setFocusWeekStart] = useState(() => currentWeekStart());
  const [active, setActive] = useState<StickyNote | null>(null);

  const filtered = useMemo(
    () => applyFilters(notes, filters, query),
    [notes, filters, query],
  );

  const openNote = (note: StickyNote) => {
    setActive(notes.find((n) => n.id === note.id) ?? note);
  };

  const editing = active ? notes.find((n) => n.id === active.id) ?? active : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Notas
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Anote rápido
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#A0A0A0]">
            Colunas por dia · arraste entre dias ou semanas · autosave. Só do CRM —
            não mistura com as notas do Business.
          </p>
        </div>
        <StickySaveStatus status={status} />
      </div>

      {loading && notes.length === 0 ? (
        <PageLoader />
      ) : (
        <>
          {filtered.length === 0 && (
            <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 to-[#3882F6]/5 px-4 py-3 text-sm text-[#C8C8C8]">
              <NotebookPen className="mr-2 inline h-4 w-4 align-text-bottom text-emerald-400" />
              Nenhuma nota neste filtro — você ainda pode trocar a semana ou criar
              uma nota nova.
            </div>
          )}
          <NotesBoard
            notes={filtered}
            focusWeekStart={focusWeekStart}
            onFocusWeekChange={setFocusWeekStart}
            onOpen={openNote}
            onBoardChange={applyBoardMove}
            onCreateForDay={async (date) => {
              const note = await createNote({ noteDate: date });
              setActive(note);
            }}
            toolbarStart={
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400/70" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquisar notas"
                  className="h-11 w-full rounded-xl border border-emerald-500/20 bg-[#1a1c24] pl-10 pr-3 text-sm text-[#e8eaed] placeholder:text-[#e8eaed]/40 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/15"
                />
              </div>
            }
            toolbarEnd={
              <NotesFilters
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
                filters={filters}
                onChange={setFilters}
              />
            }
            belowToolbar={
              <ComposeBar
                onCreate={async (seed) => {
                  const note = await createNote(seed);
                  if (!seed?.title && !seed?.body) setActive(note);
                }}
              />
            }
          />
        </>
      )}

      {editing && (
        <NoteEditor
          note={editing}
          onChange={updateNote}
          onClose={() => setActive(null)}
          onTogglePin={togglePin}
          onArchive={archiveNote}
          onDelete={(id) => void deleteNote(id)}
          onSetColor={setColor}
        />
      )}
    </div>
  );
}
