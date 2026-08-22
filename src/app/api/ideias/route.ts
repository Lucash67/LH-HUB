import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { ideaUpsertSchema } from "@/lib/ideias/types";
import {
  deleteIdeaItem,
  listIdeaItems,
  upsertIdeaItem,
} from "@/platform/db/repositories/idea-repository";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const includeArchived = request.nextUrl.searchParams.get("archived") === "1";
    const items = await listIdeaItems(auth.id, { includeArchived });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Ideias GET error:", error);
    return apiError("Não foi possível carregar as ideias.");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();
    const parsed = ideaUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Ideia inválida.", 400);
    }
    if (!parsed.data.title?.trim() && !parsed.data.body?.trim()) {
      return apiError("Escreva um título ou descrição.", 400);
    }
    const item = await upsertIdeaItem(auth.id, parsed.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Ideias POST error:", error);
    return apiError("Não foi possível criar a ideia.");
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();
    const parsed = ideaUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Ideia inválida.", 400);
    }
    if (!parsed.data.id) {
      return apiError("Informe o id da ideia.", 400);
    }
    const item = await upsertIdeaItem(auth.id, parsed.data);
    return NextResponse.json({ item });
  } catch (error) {
    console.error("Ideias PUT error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("não encontrada")) return apiError("Ideia não encontrada.", 404);
    return apiError("Não foi possível salvar a ideia.");
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return apiError("Ideia não encontrada.", 400);
    const ok = await deleteIdeaItem(auth.id, id);
    if (!ok) return apiError("Ideia não encontrada.", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ideias DELETE error:", error);
    return apiError("Não foi possível excluir a ideia.");
  }
}
