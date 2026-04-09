import {NextResponse} from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import {createSession} from "@/lib/session";
import {serverError} from "@/utils/responses";

export async function POST(req: Request) {
  try {
    const {email, password} = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {error: "Email and password are required"},
        {status: 400}
      );
    }

    // Find user by email
    const user = await prisma.authUser.findUnique({
      where: {email},
    });

    if (!user) {
      return NextResponse.json(
        {error: "Invalid email or password"},
        {status: 401}
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        {error: "Invalid email or password"},
        {status: 401}
      );
    }

    // Create session payload for cookie
    await createSession({
      authUserId: user.id,
      workerId: user.workerId,
      isAdmin: user.isAdmin,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError('user', 'login', null)
  }
}