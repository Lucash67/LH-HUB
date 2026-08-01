import { NextRequest, NextResponse } from "next/server";
import { MSG, apiError } from "@/shared/api-messages";
import { parseBusinessIdParam, requireSpecificBusinessId } from "@/lib/business-units";
import { computeProductCatalogStats } from "@/lib/analytics-engine";
import {
  createProduct,
  listProducts,
  updateProduct,
} from "@/platform/db/repositories/product-repository";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const businessId = parseBusinessIdParam(request.nextUrl.searchParams.get("businessId"));
    const allProducts = await listProducts(businessId);

    const catalogStats = await computeProductCatalogStats(businessId);
    const statsById = new Map(catalogStats.map((s) => [s.productId, s]));

    const enriched = allProducts.map((p) => {
      const stats = statsById.get(p.id);
      return {
        ...p,
        soldQuantity: stats?.soldQuantity ?? 0,
        revenueGenerated: stats?.revenueGenerated ?? 0,
        salesShare: stats?.salesShare ?? 0,
        lastSaleDate: stats?.lastSaleDate ?? null,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Products GET error:", error);
    return apiError(MSG.LOAD_PRODUCTS);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();
    const businessId = requireSpecificBusinessId(body.businessId);

    if (!body.name?.trim()) {
      return apiError(MSG.PRODUCT_NAME_REQUIRED, 400);
    }
    if (body.price === undefined || body.price === "" || Number(body.price) < 0) {
      return apiError(MSG.PRODUCT_PRICE_INVALID, 400);
    }
    if (body.cost === undefined || body.cost === "" || Number(body.cost) < 0) {
      return apiError(MSG.PRODUCT_COST_INVALID, 400);
    }

    const id = await createProduct({
      businessId,
      name: body.name.trim(),
      category: body.category || "Salgados",
      price: Number(body.price),
      cost: Number(body.cost),
      supplierId: body.supplierId || null,
      stockQuantity: Number(body.stockQuantity ?? 0),
      minStock: Number(body.minStock ?? 10),
      imageUrl: body.imageUrl || null,
      status: body.status ?? "active",
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    if (error instanceof Error && error.message.includes("operação específica")) {
      return apiError(error.message, 400);
    }
    return apiError(MSG.CREATE_PRODUCT);
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();

    await updateProduct({
      id: body.id,
      name: body.name,
      category: body.category,
      price: Number(body.price),
      cost: Number(body.cost),
      stockQuantity: Number(body.stockQuantity),
      minStock: Number(body.minStock),
      status: body.status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Products PUT error:", error);
    return apiError(MSG.UPDATE_PRODUCT);
  }
}
