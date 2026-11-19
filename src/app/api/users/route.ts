import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { serverError } from "@/utils/responses";
import bcrypt from "bcrypt";
import { verifySession } from "@/lib/session";
import { randomBytes } from "crypto";

const TEMPORARY_PASSWORD_BYTES = 5; // 10 hex chars

function generateTemporaryPassword() {
  return `Temp-${randomBytes(TEMPORARY_PASSWORD_BYTES).toString("hex")}`;
}

async function resolveDefaultEmployeeRoleId(requestedRoleId?: number | string | null): Promise<number> {
  const parsed = requestedRoleId ? Number.parseInt(String(requestedRoleId), 10) : NaN;
  if (!Number.isNaN(parsed) && parsed > 0) {
    const existing = await prisma.role.findUnique({ where: { id: parsed } });
    if (existing) return existing.id;
  }

  const prodRole = await prisma.role.findFirst({
    where: {
      OR: [{ name: "Produccion" }, { name: "Producción" }, { id: 1 }],
    },
    orderBy: { id: "asc" },
  });
  if (prodRole) return prodRole.id;

  const anyRole = await prisma.role.findFirst({ orderBy: { id: "asc" } });
  if (anyRole) return anyRole.id;

  const created = await prisma.role.create({
    data: { name: "Produccion" },
  });
  return created.id;
}

export async function GET() {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }
  try {
    const users = await prisma.authUser.findMany({
      include: { worker: true },
      omit: { passwordHash: true },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(users);
  } catch {
    return serverError("user", "fetch", null);
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

    const cleanName = typeof fullName === "string" ? fullName.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanName || !cleanEmail) {
      return NextResponse.json(
        { error: "El nombre completo y el correo electrónico son obligatorios." },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.authUser.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Ya existe un usuario registrado con ese correo electrónico." },
        { status: 409 }
      );
    }

    const parsedDuration =
      typeof temporaryDurationDays === "number"
        ? temporaryDurationDays
        : typeof temporaryDurationDays === "string"
        ? Number.parseInt(temporaryDurationDays, 10)
        : 0;

    const isTemporary = Number.isInteger(parsedDuration) && parsedDuration > 0;
    const trimmedPassword = typeof password === "string" ? password.trim() : "";

    if (trimmedPassword && trimmedPassword.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    const finalPassword =
      trimmedPassword || (isTemporary ? generateTemporaryPassword() : null);

    if (!finalPassword) {
      return NextResponse.json(
        { error: "Se requiere una contraseña o especificar los días de duración temporal." },
        { status: 400 }
      );
    }

    const finalExpiresAt = isTemporary
      ? new Date(Date.now() + parsedDuration * 24 * 60 * 60 * 1000)
      : null;

    const resolvedRoleId = isTemporary
      ? null
      : await resolveDefaultEmployeeRoleId(roleId);

    const user = await prisma.authUser.create({
      data: {
        email: cleanEmail,
        passwordHash: await bcrypt.hash(finalPassword, 10),
        isActive: true,
        worker: {
          create: {
            fullName: cleanName,
            roleId: resolvedRoleId,
            phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
            profilePhotoUrl: profilePhotoUrl ?? null,
            isActive: true,
            expiresAt: finalExpiresAt,
          },
        },
      },
      include: { worker: true },
      omit: { passwordHash: true },
    });

    return NextResponse.json(
      {
        ...user,
        temporaryPassword: isTemporary ? finalPassword : null,
        expiresAt: finalExpiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/users:", error);
    return serverError("user", "create", null);
  }
}

export async function PUT(req: NextRequest) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }
  try {
    const body = await req.json();
    const { userId, isActive, role, additionalDays } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const currentAccount = await prisma.authUser.findUnique({
      where: { id: Number(userId) },
      include: { worker: true },
    });

    if (!currentAccount || !currentAccount.worker) {
      return NextResponse.json(
        { error: "No se encontró el perfil del trabajador." },
        { status: 404 }
      );
    }

    const now = new Date();
    let updatedExpiresAt = currentAccount.worker.expiresAt;
    let updatedRoleId = currentAccount.worker.roleId;

    const parsedAdditionalDays =
      typeof additionalDays === "number"
        ? additionalDays
        : Number.parseInt(String(additionalDays ?? "0"), 10) || 0;

    if (role === "empleado") {
      updatedExpiresAt = null;
      updatedRoleId = await resolveDefaultEmployeeRoleId(currentAccount.worker.roleId);
    } else if (role === "temporal") {
      updatedRoleId = null;

      const existingExpiry = currentAccount.worker.expiresAt
        ? new Date(currentAccount.worker.expiresAt)
        : null;
      const baseDate =
        existingExpiry && existingExpiry > now ? existingExpiry : now;

      if (parsedAdditionalDays > 0) {
        updatedExpiresAt = new Date(
          baseDate.getTime() + parsedAdditionalDays * 24 * 60 * 60 * 1000
        );
      } else if (
        Boolean(isActive) &&
        (!existingExpiry || existingExpiry <= now)
      ) {
        // Reactivating an expired temporary worker or converting permanent -> temporary
        // without specifying additionalDays defaults to 7 days from today.
        updatedExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
    }

    const nextActive = Boolean(isActive);

    const updatedUser = await prisma.authUser.update({
      where: { id: Number(userId) },
      data: {
        isActive: nextActive,
        worker: {
          update: {
            isActive: nextActive,
            roleId: updatedRoleId,
            expiresAt: updatedExpiresAt,
          },
        },
      },
      include: { worker: true },
      omit: { passwordHash: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error en PUT /api/users:", error);
    return serverError("user", "update", null);
  }
}
