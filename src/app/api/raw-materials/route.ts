import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/db";
import {rawMaterialSchema} from "@/lib/schemas";
import {z} from "zod";
import {serverError, validationError} from "@/utils/responses";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = rawMaterialSchema.safeParse(body);
  if (!result.success) {
    return validationError("raw material", result.error);
  }

  try {
    const rawMaterial = await prisma.rawMaterial.create({
      data: result.data
    });
    return NextResponse.json(rawMaterial, {status: 201});
  } catch (error) {
    return serverError("raw material", "create", error);
  }
}
