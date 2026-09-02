import { NextRequest, NextResponse } from "next/server";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { ensureCrmWorkspace } from "@/lib/crm/ensure-workspace";
import {
  deleteCrmNote,
  listCrmNotes,
  upsertCrmNote,
} from "@/lib/crm/notes-repository";
import { stickyNoteUpsertSchema } from "@/lib/sticky-notes/types";
import { apiError } from "@/shared/api-messages";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const includeArchived = request.nextUrl.searchParams.get("archived") === "1";
    const notes = await listCrmNotes(workspaceId, auth.id, { includeArchived });
    return NextResponse.json({ notes });
  } catch (error) {
    console.error("CRM notes GET error:", error);
    return apiError("Não foi possível carregar as notas.");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const parsed = stickyNoteUpsertSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Nota inválida.", 400);
    }
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const note = await upsertCrmNote(workspaceId, auth.id, {
      ...parsed.data,
      clientUpdatedAt: parsed.data.clientUpdatedAt || new Date().toISOString(),
    });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("CRM notes POST error:", error);
    return apiError("Não foi possível criar a nota.");
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();
    const batch = Array.isArray(body?.notes) ? body.notes : [body];
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const saved = [];

    for (const item of batch) {
      const parsed = stickyNoteUpsertSchema.safeParse(item);
      if (!parsed.success) continue;
      if (!parsed.data.id && parsed.data.title === undefined && parsed.data.body === undefined) {
        continue;
      }
      const note = await upsertCrmNote(workspaceId, auth.id, {
        ...parsed.data,
        clientUpdatedAt: parsed.data.clientUpdatedAt || new Date().toISOString(),
      });
      saved.push(note);
    }

    return NextResponse.json({ notes: saved, note: saved[0] ?? null });
  } catch (error) {
    console.error("CRM notes PUT error:", error);
    return apiError("Não foi possível salvar as notas.");
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return apiError("Nota não encontrada.", 400);
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const ok = await deleteCrmNote(workspaceId, auth.id, id);
    if (!ok) return apiError("Nota não encontrada.", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CRM notes DELETE error:", error);
    return apiError("Não foi possível excluir a nota.");
  }
}
