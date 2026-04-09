import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createProcess } from "@/lib/schemas";
import { notFoundError, serverError, validationError } from "@/utils/responses";
import { verifySession } from "@/lib/session";

export async function POST(req: Request) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = createProcess.safeParse(body);
    if (!result.success) {
      return validationError("process template with steps", result.error);
    }

    const validBody = result.data;

    const variant = await prisma.productVariant.findUnique({
      where: { id: validBody.productVariantId },
      select: { id: true },
    });

    if (!variant) {
      return notFoundError("product variant");
    }

    const createdTemplate = await prisma.$transaction(async (tx) => {
      const lastTemplate = await tx.processTemplate.findFirst({
        where: { productVariantId: validBody.productVariantId },
        orderBy: { version: "desc" },
        select: { version: true },
      });

      const nextVersion = (lastTemplate?.version ?? 0) + 1;

      return tx.processTemplate.create({
        data: {
          productVariantId: validBody.productVariantId,
          name: validBody.name,
          version: nextVersion,
          isActive: validBody.isActive ?? true,
          notes: validBody.notes,
          templateSteps: {
            create: validBody.steps.map((step, index) => ({
              position: index + 1,
              name: step.name,
              idealDurationMin: step.idealDurationMin,
              requiresInput: step.requiresInput ?? false,
              instructions: step.instructions,
            })),
          },
        },
        include: {
          templateSteps: {
            orderBy: { position: "asc" },
          },
        },
      });
    });

    return NextResponse.json(createdTemplate, { status: 201 });
  } catch (error) {
    return serverError("process template with steps", "create", error);
  }
}
