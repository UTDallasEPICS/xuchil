import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  idError, notFoundError, serverError, updateSuccess, validationError, deleteSuccess, fetchSuccess,
  forbiddenError
} from "@/utils/responses";
import { UserCreateSchema } from "@/lib/schemas";
import {withAuthAdmin, withAuthWorker} from "@/utils/handlers";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import {verifySession} from "@/lib/session";

export const GET = withAuthWorker(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const session = (await verifySession())!;
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("user");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: idParsed
      },
    });
    if (!user) {
      return notFoundError("user");
    }
    if (!session.isAdmin && !user.isGuest) {
      // workers can only access guest users, admins can access all users
      return forbiddenError();
    }
    return fetchSuccess(user);
  } catch (error) {
    return serverError("user", "fetch", error);
  }
});

export const PUT = withAuthWorker(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const session = (await verifySession())!;
      const { id } = await params;
      const idParsed = parseInt(id);
      if (Number.isNaN(idParsed)) {
        return idError("user");
      }
      const body = await req.json();
      const res = UserCreateSchema.partial().safeParse(body);
      if (!res.success) {
        return validationError("user", "update", res.error);
      }
      const user = await prisma.user.findUnique({ where: { id: idParsed } });
      if (!user) {
        return notFoundError("user");
      }
      if (!session.isAdmin) {
        if (!user.isGuest) {
          // workers can only update guest users, admins can update all users
          return forbiddenError();
        }
        if (res.data.isAdmin) {
          // workers cannot make users admin
          return forbiddenError();
        }
      }
      const updatedItem = await prisma.user.update({
        where: { id: idParsed },
        data: {
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          imgUrl: res.data.imgUrl,
          passwordHash: res.data.password && (await bcrypt.hash(res.data.password, 10)),
          isAdmin: res.data.isAdmin,
          isGuest: res.data.isGuest,
        },
      });
      return updateSuccess(updatedItem);
    } catch (e) {
      return serverError("user", "update", e);
    }
  }
);

export const DELETE = withAuthWorker(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const session = (await verifySession())!;
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("user");
    }
    const user = await prisma.user.findUnique({ where: { id: idParsed } });
    if (!user) {
      return notFoundError("user");
    }
    if (!session.isAdmin && !user.isGuest) {
      return forbiddenError();
    }
    await prisma.user.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (error) {
    return serverError("user", "delete", error);
  }
});
