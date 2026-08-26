import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProcessStepExecutionCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
  
    const items = await prisma.processStepExecution.findMany({
     include: {
      processStepWorkers: {
        include: { 
          worker: true
        }
      }
     }
    });

    return fetchSuccess(items);
  } catch (e) {
    return serverError("processStepExecution", "fetch", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = ProcessStepExecutionCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("processStepExecution", "create", res.error);
    }
    const newItem = await prisma.processStepExecution.create({ data: res.data });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("processStepExecution", "create", e);
  }
}
