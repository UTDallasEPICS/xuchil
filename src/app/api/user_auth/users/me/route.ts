// app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifySession } from "@/lib/session";
import { workerSchema } from "@/lib/schemas";
import { z } from "zod";

const UPLOADED_IMAGE_PATH = "/mnt/data/05ca9d30-a3f6-4df0-a878-6bb26a5d69ad.png";

export async function GET(request: NextRequest) {
  try {
    const payload = await verifySession();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If workerId exists on the session, prefer returning the worker row joined with authUser
    if (payload.workerId) {
      const worker = await prisma.worker.findUnique({
        where: { id: payload.workerId },
        include: { authUser: true },
      });

      if (!worker) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(worker, { status: 200 });
    }

    // Otherwise fetch by authUserId and include worker relation
    const authUser = await prisma.authUser.findUnique({
      where: { id: payload.authUserId },
      include: { worker: true },
    });

    if (!authUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(authUser, { status: 200 });
  } catch (err) {
    console.error("GET /api/users/me error:", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // validate payload against partial worker schema
  const updateSchema = workerSchema.partial();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    const formatted = z.flattenError(parsed.error);
    return NextResponse.json({ error: "Invalid request body", details: formatted }, { status: 400 });
  }

  try {
    const payload = await verifySession();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Must have a workerId to update worker profile
    if (!payload.workerId) {
      return NextResponse.json({ error: "No worker profile associated with session" }, { status: 400 });
    }

    const data = parsed.data;

    // If profilePhotoUrl is omitted, use uploaded image path as fallback
    if (data.profilePhotoUrl === undefined) {
      data.profilePhotoUrl = UPLOADED_IMAGE_PATH;
    }

    const updated = await prisma.worker.update({
      where: { id: payload.workerId },
      data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/users/me error:", err);

    if (err?.code === "P2002") {
      // Prisma unique constraint
      return NextResponse.json({ error: "Duplicate field", field: err.meta?.target }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
