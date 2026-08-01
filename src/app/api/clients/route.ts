import { NextRequest, NextResponse } from "next/server";
import { getClientCrmList, getClientCrmProfile } from "@/lib/client-crm-service";
import { MSG, apiError } from "@/shared/api-messages";
import { parseBusinessIdParam, SALGADOS_BUSINESS_ID } from "@/lib/business-units";
import { createClient, updateClient } from "@/platform/db/repositories/client-repository";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const businessId = parseBusinessIdParam(searchParams.get("businessId"));

    if (id) {
      const profile = await getClientCrmProfile(id, businessId);
      if (!profile) return apiError(MSG.CLIENT_NOT_FOUND, 404);
      return NextResponse.json({
        ...profile,
        purchaseCount: profile.summary.purchaseCount,
        totalSpent: profile.summary.totalSpent,
        favoriteProduct: profile.summary.favoriteProduct,
        lastPurchase: profile.summary.lastPurchaseDate
          ? { date: profile.summary.lastPurchaseDate, totalAmount: profile.summary.totalSpent }
          : null,
        isRecurring: profile.isRecurring,
        sales: profile.timeline.map((sale) => ({
          id: sale.id,
          date: sale.date,
          totalAmount: sale.totalAmount,
          paymentMethod: sale.paymentMethod,
        })),
      });
    }

    return NextResponse.json(await getClientCrmList(businessId));
  } catch (error) {
    console.error("Clients GET error:", error);
    return apiError(MSG.LOAD_CLIENTS);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return apiError(MSG.CLIENT_NAME_REQUIRED, 400);
    }

    const businessId = parseBusinessIdParam(body.businessId) ?? SALGADOS_BUSINESS_ID;
    const id = await createClient({
      businessId: businessId === "all" ? SALGADOS_BUSINESS_ID : businessId,
      name: body.name.trim(),
      sector: body.sector || null,
      company: body.company || null,
      phone: body.phone || null,
      notes: body.notes || null,
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error("Clients POST error:", error);
    return apiError(MSG.CREATE_CLIENT);
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();

    await updateClient({
      id: body.id,
      name: body.name,
      sector: body.sector,
      company: body.company,
      phone: body.phone,
      notes: body.notes,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clients PUT error:", error);
    return apiError(MSG.UPDATE_CLIENT);
  }
}
