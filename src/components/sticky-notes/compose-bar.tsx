"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface ComposeBarProps {
  onCreate: (seed?: { title?: string; body?: string }) => Promise<unknown> | unknown;
}

/** Campo estilo Keep: “Tirar uma nota…” que abre/cria a nota. */
export function ComposeBar({ onCreate }: ComposeBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setTitle("");
    setBody("");
    setExpanded(false);
  };

  const submit = async () => {
    if (!title.trim() && !body.trim()) {
      reset();
      return;
    }
    setBusy(true);
    try {
      await onCreate({ title: title.trim(), body: body.trim() });
      reset();
    } finally {
      setBusy(false);
    }
  };

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-surface-border bg-surface-card px-4 py-3.5 text-left shadow-lg transition hover:border-brand-yellow/30"
      >
        <Plus className="h-4 w-4 text-brand-yellow" />
        <span className="text-sm text-text-muted">Tirar uma nota...</span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-yellow/25 bg-surface-card p-4 shadow-xl">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
        className="mb-2 w-full bg-transparent text-base font-bold text-text-primary placeholder:text-text-muted focus:outline-none"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escreva sua nota..."
        rows={4}
        className="w-full resize-none bg-transparent text-sm leading-relaxed text-text-secondary placeholder:text-text-muted focus:outline-none"
      />
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl px-3 py-2 text-sm text-text-muted hover:bg-surface-hover"
        >
          Fechar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className="rounded-xl bg-brand-yellow/20 px-4 py-2 text-sm font-bold text-brand-yellow hover:bg-brand-yellow/30 disabled:opacity-50"
        >
          Criar nota
        </button>
      </div>
    </div>
  );
}
