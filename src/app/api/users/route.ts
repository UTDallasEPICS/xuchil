import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { serverError } from "@/utils/responses";
import bcrypt from "bcrypt";
import { verifySession } from "@/lib/session";
import { randomBytes } from "crypto";

const TEMPORARY_PASSWORD_BYTES = 12;

function generateTemporaryPassword() {
  return randomBytes(TEMPORARY_PASSWORD_BYTES).toString("hex");
}

export async function GET() {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }
  try {
    const users = await prisma.authUser.findMany({
      include: { worker: true },
      omit: { passwordHash: true }
    });

    return NextResponse.json(users);
  } catch {
    return serverError('user', 'fetch', null);
  }
}

export async function POST(req: NextRequest) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }
  try {
    const body = await req.json();
    const {
      fullName,
      phone,
      email,
      profilePhotoUrl,
      roleId,
      password,
      temporaryDurationDays,
    } = body;

    const isTemporary = Number.isInteger(temporaryDurationDays) && temporaryDurationDays > 0;
    const finalPassword = password || (isTemporary ? generateTemporaryPassword() : null);

    if (!finalPassword) {
      return NextResponse.json(
        { error: "Password or temporaryDurationDays is required" },
        { status: 400 }
      );
    }

    const finalExpiresAt = isTemporary
      ? new Date(Date.now() + temporaryDurationDays * 24 * 60 * 60 * 1000)
      : null;

    const user = await prisma.authUser.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(finalPassword, 10),
        worker: {
          create: {
            fullName,
            roleId: roleId ? Number.parseInt(roleId, 10) : null,
            phone,
            profilePhotoUrl,
            expiresAt: finalExpiresAt,
          }
        }
      },
      include: { worker: true },
      omit: { passwordHash: true }
    });

    return NextResponse.json({
      ...user,
      temporaryPassword: isTemporary ? finalPassword : null,
      expiresAt: finalExpiresAt,
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return serverError('user', 'create', null);
  }
}

export async function PUT(req: NextRequest) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }
  try {
    const body = await req.json();
    const { userId, isActive, role, additionalDays, newPassword } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Optional admin password reset. Empty/absent = keep current password.
    if (newPassword !== undefined && (typeof newPassword !== "string" || newPassword.length < 8)) {
      return NextResponse.json({ error: "newPassword must be at least 8 characters" }, { status: 400 });
    }

    // 1. Encontrar el AuthUser y su Worker asociado actualmente
    const currentAccount = await prisma.authUser.findUnique({
      where: { id: userId },
      include: { worker: true }
    });

    if (!currentAccount || !currentAccount.worker) {
      return NextResponse.json({ error: "User or Worker profiles not found" }, { status: 404 });
    }

    // 2. Resolver las transformaciones de Tiempos y Roles
    let updatedExpiresAt = currentAccount.worker.expiresAt;
    let updatedRoleId = currentAccount.worker.roleId;

    if (role === "empleado") {
      // Si pasa a permanente: se elimina cualquier restricción de expiración y se le asigna rol permanente (1)
      updatedExpiresAt = null;
      updatedRoleId = 1; 
    } else if (role === "temporal") {
      // Si es o se mantiene temporal y se le añaden días
      updatedRoleId = null; // Rol null para denotar temporalidad en tu esquema
      
      if (additionalDays > 0) {
        const baseDate = currentAccount.worker.expiresAt 
          ? new Date(currentAccount.worker.expiresAt) 
          : new Date(); // Si era permanente y cambia a temporal, toma la fecha de hoy
          
        updatedExpiresAt = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);
      }
    }

    // 3. Guardar cambios en Cascada mediante Prisma respetando la arquitectura de AuthUser
    const updatedUser = await prisma.authUser.update({
      where: { id: userId },
      data: {
        isActive: isActive, // Cambio de estado general en AuthUser
        passwordHash: newPassword ? await bcrypt.hash(newPassword, 10) : undefined,
        worker: {
          update: {
            isActive: isActive, // Cambio de estado general en Worker
            roleId: updatedRoleId,
            expiresAt: updatedExpiresAt
          }
        }
      },
      include: { worker: true },
      omit: { passwordHash: true } // never send the hash back to the browser
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error en PUT /api/users:", error);
    return serverError('user', 'update', null);
  }
}