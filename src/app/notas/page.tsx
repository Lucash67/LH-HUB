"use client";

import { useMemo, useState } from "react";
import { NotebookPen, Search } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";
import { PageLoader } from "@/components/ui/loading";
import { ComposeBar } from "@/components/sticky-notes/compose-bar";
import { NoteCard } from "@/components/sticky-notes/note-card";
import { NoteEditor } from "@/components/sticky-notes/note-editor";
import { StickySaveStatus } from "@/components/sticky-notes/save-status";
import { useStickyNotes } from "@/hooks/use-sticky-notes";
import type { StickyNote } from "@/lib/sticky-notes/types";

export default function NotasPage() {
  const {
    notes,
    loading,
    status,
    createNote,
    updateNote,
    setColor,
    togglePin,
    archiveNote,
    deleteNote,
  } = useStickyNotes();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<StickyNote | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
    );
  }, [notes, query]);

  const pinned = filtered.filter((n) => n.pinned);
  const others = filtered.filter((n) => !n.pinned);

  const openNote = (note: StickyNote) => {
    setActive(notes.find((n) => n.id === note.id) ?? note);
  };

  // Mantém o editor sincronizado com o estado autosave.
  const editing = active ? notes.find((n) => n.id === active.id) ?? active : null;

  return (
    <ModuleShell
      title="Notas"
      subtitle="Seu bloco de notas — salva sozinho, estilo Keep"
      temporalFilter={false}
      actions={<StickySaveStatus status={status} />}
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar notas"
              className="h-11 w-full rounded-xl border border-surface-border bg-surface-elevated pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-yellow/40 focus:outline-none"
            />
          </div>
        </div>

        <ComposeBar
          onCreate={async (seed) => {
            const note = await createNote(seed);
            setActive(note);
          }}
        />

        {loading && notes.length === 0 ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-border px-6 py-16 text-center">
            <NotebookPen className="mx-auto mb-3 h-10 w-10 text-text-muted/50" />
            <p className="text-base font-semibold text-text-primary">Nenhuma nota ainda</p>
            <p className="mt-1 text-sm text-text-muted">
              Escreva rascunhos do dia, ideias e anotações — tudo salva automaticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pinned.length > 0 && (
              <section>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
                  Fixadas
                </p>
                <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
                  {pinned.map((note) => (
                    <div key={note.id} className="mb-3 break-inside-avoid">
                      <NoteCard
                        note={note}
                        onOpen={openNote}
                        onTogglePin={togglePin}
                        onArchive={archiveNote}
                        onDelete={(id) => void deleteNote(id)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {others.length > 0 && (
              <section>
                {pinned.length > 0 && (
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
                    Outras
                  </p>
                )}
                <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
                  {others.map((note) => (
                    <div key={note.id} className="mb-3 break-inside-avoid">
                      <NoteCard
                        note={note}
                        onOpen={openNote}
                        onTogglePin={togglePin}
                        onArchive={archiveNote}
                        onDelete={(id) => void deleteNote(id)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

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
    </ModuleShell>
  );
}
