import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProcessStepMaterialUsageCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.processStepMaterialUsage.findMany({});
    return fetchSuccess(items);
  } catch (e) {
    return serverError("processStepMaterialUsage", "fetch", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = ProcessStepMaterialUsageCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("processStepMaterialUsage", "create", res.error);
    }
    const newItem = await prisma.processStepMaterialUsage.create({ data: res.data });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("processStepMaterialUsage", "create", e);
  }
}
