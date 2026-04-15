import { NextRequest } from "next/server";
import {qsToObject, withAuthWorker} from "@/utils/handlers";
import { UserCreateSchema } from "@/lib/schemas";
import {createSuccess, serverError, validationError, fetchSuccess, forbiddenError} from "@/utils/responses";
import bcrypt from "bcrypt";
import prisma from "@/lib/db";
import { z } from "zod";
import {verifySession} from "@/lib/session";

export const GET = withAuthWorker(async (req: NextRequest) => {
  try {
    const session = (await verifySession())!;
    const paginatedFilterSchema = z.strictObject({
      isGuest: z.coerce.boolean(),
      offset: z.coerce.number().int(),
      limit: z.coerce.number().int(),
    });
    const res = paginatedFilterSchema.partial().safeParse(qsToObject(req.nextUrl.searchParams));
    if (!res.success) {
      return validationError("user", "fetch", res.error);
    }
    const { limit, offset, ...where } = res.data as z.infer<typeof paginatedFilterSchema>;

    const items = await prisma.user.findMany({
      where: {
        ...where,
        // workers can only see guests, admins can see all users
        ...(!session.isAdmin && { isGuest: true }),
      },
      skip: offset,
      take: limit,
      omit: { passwordHash: true },
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("user", "fetch", e);
  }
});

export const POST = withAuthWorker(
  async (req: NextRequest) => {
    try {
      const session = (await verifySession())!;
      const body = await req.json();
      const res = UserCreateSchema.safeParse(body);
      if (!res.success) {
        return validationError("user", "create", res.error);
      }

      if (!session.isAdmin) {
        if (!res.data.isGuest) {
          // workers can only create guest users
          return forbiddenError();
        }
        if (res.data.isAdmin) {
          // workers cannot create admin
          return forbiddenError();
        }
      }

      const newItem = await prisma.user.create({
        data: {
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          imgUrl: res.data.imgUrl,
          passwordHash: await bcrypt.hash(res.data.password, 10),
          isAdmin: res.data.isAdmin,
          isGuest: res.data.isGuest,
        },
        omit: {
          passwordHash: true,
        },
      });
      return createSuccess(newItem);
    } catch (e) {
      return serverError("user", "create", e);
    }
  }
);