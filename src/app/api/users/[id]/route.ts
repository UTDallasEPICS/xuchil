import {deleteHandler, findByIdHandler, withAuthAdmin} from "@/utils/handlers";
import {UserCreateSchema} from "@/lib/schemas";
import prisma from "@/lib/db";
import {NextRequest} from "next/server";
import {idError, notFoundError, serverError, updateSuccess, validationError} from "@/utils/responses";
import {Prisma} from "@prisma/client";
import bcrypt from "bcrypt";

export const GET = withAuthAdmin(findByIdHandler("user", {omit: {passwordHash: true}}));
export const PUT = withAuthAdmin(
    async (req: NextRequest, {params}: { params: Promise<{ id: string }> }) => {
      try {
        const {id} = await params;
        const idParsed = parseInt(id);
        if (Number.isNaN(idParsed)) {
          return idError("user");
        }
        const body = await req.json();
        const res = UserCreateSchema.partial().safeParse(body);
        if (!res.success) {
          return validationError("user", "update", res.error);
        }
        const updatedItem = await prisma.user.update({
          where: {id: idParsed},
          data: {
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone,
            imgUrl: res.data.imgUrl,
            passwordHash: res.data.password && await bcrypt.hash(res.data.password, 10),
            isAdmin: res.data.isAdmin,
            isGuest: res.data.isGuest,
          },
          omit: {
            passwordHash: true,
          }
        });
        return updateSuccess(updatedItem);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
          return notFoundError("user");
        }
        return serverError("user", "update", e);
      }
    }
);
export const DELETE = withAuthAdmin(deleteHandler("user"));