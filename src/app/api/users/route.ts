import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {idError, notFoundError, serverError} from "@/utils/responses";
import bcrypt from "bcryptjs";

export async function GET(
  _req: NextRequest,
) {
  try {
    const users = await prisma.authUser.findMany({
      include: { worker: true },
      omit: { passwordHash: true }
    });

    return NextResponse.json(users);
  } catch (error) {
    return serverError('user', 'fetch', null)
  }
}

export async function POST(
  req: NextRequest,
) {
  try {
    const body = await req.json();
    const { fullName, phone, email, profilePhotoUrl, roleId, password } = body;

    const user = await prisma.authUser.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        worker: {
          create: {
            fullName,
            roleId,
            phone,
            profilePhotoUrl,
          }
        }
      },
      include: { worker: true },
      omit: { passwordHash: true }
    });

    return NextResponse.json(user, {status: 201});
  } catch (error) {
    return serverError('user', 'create', null)
  }
}
