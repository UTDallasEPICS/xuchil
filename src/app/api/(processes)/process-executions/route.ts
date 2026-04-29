import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProcessExecutionCreateSchema } from "@/lib/schemas";
import qs from "qs";
import {ProcessStatus} from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const paginatedFilterSchema = z.strictObject({
      pending: z.coerce.boolean(),
      offset: z.coerce.number().int(),
      limit: z.coerce.number().int(),
    });
    const res = paginatedFilterSchema.partial().safeParse(qs.parse(req.nextUrl.search));
    if (!res.success) {
      return validationError("processExecution", "fetch", res.error);
    }
    const { limit, offset, pending } = res.data;
    const items = await prisma.processExecution.findMany({
      where: {
        ...(pending !== undefined && {
          status: { [pending ? "in":"notIn"]: [ProcessStatus.PLANNED, ProcessStatus.IN_PROGRESS, ProcessStatus.PAUSED] }
        })
      },
      skip: offset,
      take: limit,
      orderBy: { id: "asc" },
      include: {
        processStepExecutions: {
          orderBy: {
            step: {
              position: "asc",
            }
          }
        }
      }
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("processExecution", "fetch", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = ProcessExecutionCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("processExecution", "create", res.error);
    }
    const newItem = await prisma.processExecution.create({
      data: res.data,
      include: {
        processStepExecutions: {
          orderBy: {
            step: {
              position: "asc",
            }
          }
        }
      }
    });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("processExecution", "create", e);
  }
}
