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

  const editing = active ? notes.find((n) => n.id === active.id) ?? active : null;

  return (
    <ModuleShell
      title="Notas"
      subtitle="Bloco de notas com autosave"
      temporalFilter={false}
      actions={<StickySaveStatus status={status} />}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mx-auto w-full max-w-[600px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e8eaed]/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar"
              className="h-11 w-full rounded-lg border border-[#5f6368]/40 bg-[#202124] pl-10 pr-3 text-sm text-[#e8eaed] placeholder:text-[#e8eaed]/40 focus:border-[#5f6368] focus:outline-none"
            />
          </div>
        </div>

        <ComposeBar
          onCreate={async (seed) => {
            const note = await createNote(seed);
            // Composer Keep: “Fechar” já salva; abre só se veio vazia e expandida via clique.
            if (!seed?.title && !seed?.body) setActive(note);
          }}
        />

        {loading && notes.length === 0 ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <NotebookPen className="mx-auto mb-3 h-10 w-10 text-[#e8eaed]/25" />
            <p className="text-base text-[#e8eaed]/70">As suas notas aparecem aqui</p>
            <p className="mt-1 text-sm text-[#e8eaed]/40">
              Tudo salva sozinho — pode fechar a aba sem medo.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {pinned.length > 0 && (
              <section>
                <p className="mb-3 px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#e8eaed]/45">
                  Fixadas
                </p>
                <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                  {pinned.map((note) => (
                    <div key={note.id} className="mb-4 break-inside-avoid">
                      <NoteCard
                        note={note}
                        onOpen={openNote}
                        onTogglePin={togglePin}
                        onArchive={archiveNote}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {others.length > 0 && (
              <section>
                {pinned.length > 0 && (
                  <p className="mb-3 px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#e8eaed]/45">
                    Outras
                  </p>
                )}
                <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                  {others.map((note) => (
                    <div key={note.id} className="mb-4 break-inside-avoid">
                      <NoteCard
                        note={note}
                        onOpen={openNote}
                        onTogglePin={togglePin}
                        onArchive={archiveNote}
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
