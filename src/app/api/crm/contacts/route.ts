import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { ensureCrmWorkspace } from "@/lib/crm/ensure-workspace";
import { crmContacts } from "@/lib/db/postgres/schema-crm";
import { getPostgresDb } from "@/platform/db";
import { apiError } from "@/shared/api-messages";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  contactType: z.enum(["lead", "client"]).optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const db = await getPostgresDb();
    const contacts = await db
      .select()
      .from(crmContacts)
      .where(eq(crmContacts.workspaceId, workspaceId))
      .orderBy(desc(crmContacts.updatedAt));
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("CRM contacts GET error:", error);
    return apiError("Não foi possível carregar os contatos.");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Contato inválido.", 400);
    }
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const db = await getPostgresDb();
    const [contact] = await db
      .insert(crmContacts)
      .values({
        workspaceId,
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        contactType: parsed.data.contactType ?? "lead",
        notes: parsed.data.notes || null,
      })
      .returning();
    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error("CRM contacts POST error:", error);
    return apiError("Não foi possível criar o contato.");
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : null;
    if (!id) return apiError("Informe o id do contato.", 400);
    const parsed = contactSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Contato inválido.", 400);
    }
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const db = await getPostgresDb();
    const [existing] = await db
      .select()
      .from(crmContacts)
      .where(eq(crmContacts.id, id))
      .limit(1);
    if (!existing || existing.workspaceId !== workspaceId) {
      return apiError("Contato não encontrado.", 404);
    }

    const [contact] = await db
      .update(crmContacts)
      .set({
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.email !== undefined ? { email: parsed.data.email || null } : {}),
        ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone || null } : {}),
        ...(parsed.data.company !== undefined ? { company: parsed.data.company || null } : {}),
        ...(parsed.data.contactType !== undefined
          ? { contactType: parsed.data.contactType }
          : {}),
        ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes || null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(crmContacts.id, id))
      .returning();

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("CRM contacts PATCH error:", error);
    return apiError("Não foi possível atualizar o contato.");
  }
}
