import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";

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
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
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

    // Fetch worker so we can put workerId into the session
    const worker = await prisma.worker.findUnique({
      where: { id: user.workerId ?? undefined },
    });

    // Create session payload for cookie
    await createSession({
      authUserId: user.id,
      workerId: user.workerId,
      isAdmin: user.isAdmin,
    });

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        worker: worker ?? null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Login failed", detail: error.message },
      { status: 500 }
    );
  }
}