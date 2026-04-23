import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProcessPauseCreateSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const items = await prisma.processPause.findMany({});
    return fetchSuccess(items);
  } catch (e) {
    return serverError("processPause", "fetch", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = ProcessPauseCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("processPause", "create", res.error);
    }
    const newItem = await prisma.processPause.create({ data: res.data });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("processPause", "create", e);
  }
}
