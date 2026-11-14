import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import { createSession } from "@/lib/session";
import { serverError } from "@/utils/responses";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.authUser.findUnique({
      where: { email },
      include: { worker: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const workerExpired = user.worker?.expiresAt
      ? user.worker.expiresAt < new Date()
      : false;

    if (!user.isActive || user.worker?.isActive === false || workerExpired) {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session payload for cookie
    await createSession({
      authUserId: user.id,
      workerId: user.workerId,
      isAdmin: user.isAdmin,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return serverError("user", "login", null);
  }
}