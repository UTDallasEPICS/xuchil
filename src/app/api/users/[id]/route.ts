import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {idError, notFoundError, serverError} from "@/utils/responses";
import {verifySession} from "@/lib/session";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {

  const payload = await verifySession();
  if (!payload) {
    return new NextResponse(null, { status: 403 });
  }
  const {id} = await context.params
  const userId = parseInt(id);
  if (isNaN(userId)) {
    return idError('user')
  }

  try {
    const user = await prisma.authUser.findUnique({
      where: { id: userId },
      include: { worker: true },
      omit: { passwordHash: true }
    });

    if (!user) {
      return notFoundError('user')
    }

    return NextResponse.json(user);
  } catch (error) {
    return serverError('user', 'fetch', null)
  }
}

export async function PUT(
  req: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }
  const userId = parseInt((await context).params.id);
  if (isNaN(userId)) {
    return idError('user')
  }

  try {
    const body = await req.json();
    const { fullName, phone, profilePhotoUrl, isActive, isAdmin } = body;

    const updatedUser = await prisma.authUser.update({
      where: { id: userId },
      data: {
        isAdmin: isAdmin ?? undefined,
        isActive: isActive ?? undefined,
        worker: {
          update: {
            fullName: fullName ?? undefined,
            phone: phone ?? undefined,
            profilePhotoUrl: profilePhotoUrl ?? undefined,
          },
        },
      },
      include: { worker: true },
      omit: { passwordHash: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return serverError('user', 'update', null)
  }
}

export async function DELETE(
  _req: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }
  const userId = parseInt((await context).params.id);
  if (isNaN(userId)) {
    return idError('user')
  }

  try {
    await prisma.authUser.update({
      where: { id: userId },
      data: { worker: { delete: true } },
    })
    await prisma.authUser.delete({
      where: { id: userId },
    })
  } catch (error) {
    return serverError('user', 'delete', null)
  }
}
