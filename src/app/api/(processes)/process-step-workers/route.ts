import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProcessStepWorkerCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.processStepWorker.findMany({});
    return fetchSuccess(items);
  } catch (e) {
    return serverError("processStepWorker", "fetch", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = ProcessStepWorkerCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("processStepWorker", "create", res.error);
    }
    const newItem = await prisma.processStepWorker.create({ data: res.data });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("processStepWorker", "create", e);
  }
}
