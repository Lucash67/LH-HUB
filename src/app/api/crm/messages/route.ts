import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CRM_MESSAGE_KIND_SLUGS, CRM_MESSAGE_STATUSES } from "@/constants/crm-brand";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { ensureCrmWorkspace } from "@/lib/crm/ensure-workspace";
import { localFortalezaToDate } from "@/lib/crm/message-drafts";
import {
  crmContacts,
  crmDeals,
  crmMessageDrafts,
} from "@/lib/db/postgres/schema-crm";
import { getPostgresDb } from "@/platform/db";
import { apiError } from "@/shared/api-messages";

const messageSchema = z.object({
  contactId: z.string().uuid("Escolha um contato."),
  dealId: z.string().uuid().optional().nullable(),
  kind: z.enum(CRM_MESSAGE_KIND_SLUGS).optional(),
  title: z.string().trim().min(1, "Informe o título.").optional(),
  body: z.string().trim().min(1, "Escreva a mensagem."),
  scheduledFor: z.string().optional().nullable(),
  status: z.enum(CRM_MESSAGE_STATUSES).optional(),
});

async function assertContact(workspaceId: string, contactId: string) {
  const db = await getPostgresDb();
  const [row] = await db
    .select({ id: crmContacts.id, workspaceId: crmContacts.workspaceId, name: crmContacts.name })
    .from(crmContacts)
    .where(eq(crmContacts.id, contactId))
    .limit(1);
  if (!row || row.workspaceId !== workspaceId) return null;
  return row;
}

async function assertDeal(workspaceId: string, dealId: string | null | undefined) {
  if (!dealId) return true;
  const db = await getPostgresDb();
  const [row] = await db
    .select({ id: crmDeals.id, workspaceId: crmDeals.workspaceId })
    .from(crmDeals)
    .where(eq(crmDeals.id, dealId))
    .limit(1);
  return Boolean(row && row.workspaceId === workspaceId);
}

export async function GET() {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const db = await getPostgresDb();
    const messages = await db
      .select({
        id: crmMessageDrafts.id,
        kind: crmMessageDrafts.kind,
        title: crmMessageDrafts.title,
        body: crmMessageDrafts.body,
        scheduledFor: crmMessageDrafts.scheduledFor,
        status: crmMessageDrafts.status,
        sentAt: crmMessageDrafts.sentAt,
        contactId: crmMessageDrafts.contactId,
        dealId: crmMessageDrafts.dealId,
        contactName: crmContacts.name,
        contactPhone: crmContacts.phone,
        contactCompany: crmContacts.company,
        dealTitle: crmDeals.title,
        createdAt: crmMessageDrafts.createdAt,
        updatedAt: crmMessageDrafts.updatedAt,
      })
      .from(crmMessageDrafts)
      .leftJoin(crmContacts, eq(crmMessageDrafts.contactId, crmContacts.id))
      .leftJoin(crmDeals, eq(crmMessageDrafts.dealId, crmDeals.id))
      .where(eq(crmMessageDrafts.workspaceId, workspaceId))
      .orderBy(desc(crmMessageDrafts.scheduledFor), desc(crmMessageDrafts.updatedAt));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("CRM messages GET error:", error);
    return apiError("Não foi possível carregar as mensagens.");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const parsed = messageSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Mensagem inválida.", 400);
    }
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const contact = await assertContact(workspaceId, parsed.data.contactId);
    if (!contact) return apiError("Contato inválido.", 400);
    if (!(await assertDeal(workspaceId, parsed.data.dealId))) {
      return apiError("Negócio inválido.", 400);
    }

    const scheduledFor = localFortalezaToDate(parsed.data.scheduledFor);
    const status =
      parsed.data.status ?? (scheduledFor ? "scheduled" : "draft");
    const kind = parsed.data.kind ?? "pitch_inicial";
    const title = parsed.data.title ?? `${contact.name}`;

    const db = await getPostgresDb();
    const [message] = await db
      .insert(crmMessageDrafts)
      .values({
        workspaceId,
        contactId: parsed.data.contactId,
        dealId: parsed.data.dealId || null,
        kind,
        title,
        body: parsed.data.body,
        scheduledFor,
        status,
      })
      .returning();

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("CRM messages POST error:", error);
    return apiError("Não foi possível criar a mensagem.");
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : null;
    if (!id) return apiError("Informe o id da mensagem.", 400);
    const parsed = messageSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Mensagem inválida.", 400);
    }

    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const db = await getPostgresDb();
    const [current] = await db
      .select()
      .from(crmMessageDrafts)
      .where(and(eq(crmMessageDrafts.id, id), eq(crmMessageDrafts.workspaceId, workspaceId)))
      .limit(1);
    if (!current) return apiError("Mensagem não encontrada.", 404);

    if (parsed.data.contactId) {
      if (!(await assertContact(workspaceId, parsed.data.contactId))) {
        return apiError("Contato inválido.", 400);
      }
    }
    if (parsed.data.dealId !== undefined && !(await assertDeal(workspaceId, parsed.data.dealId))) {
      return apiError("Negócio inválido.", 400);
    }

    const scheduledFor =
      parsed.data.scheduledFor !== undefined
        ? localFortalezaToDate(parsed.data.scheduledFor)
        : undefined;
    const markSent = parsed.data.status === "sent";

    const [message] = await db
      .update(crmMessageDrafts)
      .set({
        ...(parsed.data.contactId !== undefined ? { contactId: parsed.data.contactId } : {}),
        ...(parsed.data.dealId !== undefined ? { dealId: parsed.data.dealId || null } : {}),
        ...(parsed.data.kind !== undefined ? { kind: parsed.data.kind } : {}),
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.body !== undefined ? { body: parsed.data.body } : {}),
        ...(scheduledFor !== undefined ? { scheduledFor } : {}),
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
        ...(markSent ? { sentAt: new Date() } : {}),
        updatedAt: new Date(),
      })
      .where(eq(crmMessageDrafts.id, id))
      .returning();

    return NextResponse.json({ message });
  } catch (error) {
    console.error("CRM messages PATCH error:", error);
    return apiError("Não foi possível atualizar a mensagem.");
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return apiError("Informe o id da mensagem.", 400);
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const db = await getPostgresDb();
    const [current] = await db
      .select({ id: crmMessageDrafts.id })
      .from(crmMessageDrafts)
      .where(and(eq(crmMessageDrafts.id, id), eq(crmMessageDrafts.workspaceId, workspaceId)))
      .limit(1);
    if (!current) return apiError("Mensagem não encontrada.", 404);
    await db.delete(crmMessageDrafts).where(eq(crmMessageDrafts.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("CRM messages DELETE error:", error);
    return apiError("Não foi possível apagar a mensagem.");
  }
}
