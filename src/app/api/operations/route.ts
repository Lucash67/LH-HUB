import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_BUSINESS_ID,
  type OperationContext,
} from "@/core/contracts";
import { getBusinessEngine } from "@/core/engine";
import { operationRepository } from "@/platform/db/repositories/operation-repository";
import { generateCorrelationId } from "@/shared/ids/generate-id";
import { MSG, apiError } from "@/shared/api-messages";

function isDevOnly(): boolean {
  return process.env.NODE_ENV === "development";
}

export async function GET() {
  if (!isDevOnly()) {
    return apiError("Recurso não disponível.", 404);
  }

  try {
    const operations = await operationRepository.listRecent(50);
    return NextResponse.json(operations);
  } catch (error) {
    console.error("Operations GET error:", error);
    return apiError("Não foi possível carregar o diagnóstico de operações.");
  }
}

export async function POST(request: NextRequest) {
  if (process.env.ENGINE_ENABLED === "false") {
    return apiError(MSG.OPERATIONS_DISABLED, 503);
  }

  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : null;

    if (!text) {
      return apiError(MSG.OPERATIONS_TEXT_REQUIRED, 400);
    }

    const context: OperationContext = {
      businessId: body.businessId ?? DEFAULT_BUSINESS_ID,
      correlationId: generateCorrelationId(),
      source: "api",
      options: {
        force: body.force === true,
        dryRun: body.dryRun === true,
      },
    };

    const engine = getBusinessEngine();
    const result = await engine.process(text, context);

    if (result.status === "rejected") {
      const message = result.validation.errors[0]?.message ?? "Não foi possível interpretar a operação.";
      return NextResponse.json({ ...result, message }, { status: 400 });
    }

    if (result.status === "failed") {
      const message = result.execution?.error?.message ?? result.message ?? MSG.OPERATIONS_FAILED;
      return NextResponse.json({ ...result, message }, { status: 422 });
    }

    if (result.interpretation.confidence < 0.5 && !context.options.force) {
      return NextResponse.json(
        { ...result, message: "Operação ambígua. Revise o texto ou confirme os dados." },
        { status: 422 },
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Operations POST error:", error);
    const message =
      error instanceof Error && !error.message.includes("ENOENT")
        ? error.message
        : MSG.OPERATIONS_FAILED;
    return apiError(message);
  }
}
