import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProcessPauseCreateSchema } from "@/lib/schemas";
import qs from "qs";
import {z} from "zod";

export async function GET(req: NextRequest) {
  try {
    const paginatedFilterSchema = z.strictObject({
      processStepExecutionId: z.coerce.number().int(),
      offset: z.coerce.number().int(),
      limit: z.coerce.number().int(),
    });
    const res = paginatedFilterSchema.partial().safeParse(qs.parse(req.nextUrl.search));
    if (!res.success) {
      return validationError("processExecution", "fetch", res.error);
    }
    const { limit, offset, ...where } = res.data;

    const items = await prisma.processPause.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
    });
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
