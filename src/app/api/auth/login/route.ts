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
    const user = await prisma.user.findUnique({
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
      userId: user.id,
      isAdmin: user.isAdmin,
      isGuest: user.isGuest,
    });

    return new NextResponse(null, {status: 204});
  } catch (e) {
    return serverError('user', 'login', null)
  }
}