// app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifySession } from "@/lib/session";
import { workerSchema } from "@/lib/schemas";
import {notFoundError, serverError, validationError} from "@/utils/responses";

export async function GET(request: NextRequest) {
  try {
    const payload = await verifySession();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUser = await prisma.authUser.findUnique({
      where: { id: payload.authUserId },
      include: { worker: true },
      omit: { passwordHash: true },
    });

    if (!authUser) {
      return notFoundError('user')
    }

    return NextResponse.json(authUser, { status: 200 });
  } catch (err) {
    return serverError('user', 'fetch', null)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await verifySession();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const result = workerSchema.partial().safeParse(body);
    if (!result.success) {
      return validationError('user', result.error)
    }
    const updatedWorker = await prisma.worker.update({
      where: { id: payload?.workerId ?? undefined },
      data: result.data
    });

    return NextResponse.json(updatedWorker);
  } catch (error) {
    return serverError('user', 'update', null)
  }
}
