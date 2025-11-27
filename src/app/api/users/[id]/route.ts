import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserIdFromHeaders } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUserId = getUserIdFromHeaders(req);

  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const authUser = await prisma.authUser.findUnique({
      where: { id: authUserId },
    });

    if (!authUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.authUser.findUnique({
      where: { id: Number(params.id) },
      include: { worker: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      worker: user.worker
        ? {
          id: user.worker.id,
          fullName: user.worker.fullName,
          phone: user.worker.phone,
          profilePhotoUrl: user.worker.profilePhotoUrl,
          roleId: user.worker.roleId,
        }
        : null,
    });
  } catch (error) {
    console.error("GET /users/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUserId = getUserIdFromHeaders(req);

  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const authUser = await prisma.authUser.findUnique({
      where: { id: authUserId },
    });

    if (!authUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { fullName, phone, profilePhotoUrl, isActive, isAdmin } = body;

    const updatedUser = await prisma.authUser.update({
      where: { id: Number(params.id) },
      data: {
        isAdmin: typeof isAdmin === "boolean" ? isAdmin : undefined,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
        worker: {
          update: {
            fullName: fullName ?? undefined,
            phone: phone ?? undefined,
            profilePhotoUrl: profilePhotoUrl ?? undefined,
          },
        },
      },
      include: { worker: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT /users/:id error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
