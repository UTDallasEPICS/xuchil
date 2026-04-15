import {findAllHandler, withAuthAdmin} from "@/utils/handlers";
import {UserCreateSchema} from "@/lib/schemas";
import {NextRequest} from "next/server";
import {createSuccess, serverError, validationError} from "@/utils/responses";
import bcrypt from "bcrypt";
import prisma from "@/lib/db";

export const GET = withAuthAdmin(findAllHandler("user", {omit: {passwordHash: true}}));
export const POST = withAuthAdmin(
    async (req: NextRequest) => {
      try {
        const body = await req.json();
        const res = UserCreateSchema.safeParse(body);
        if (!res.success) {
          return validationError("user", "create", res.error);
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
            passwordHash: true
          }
        });
        return createSuccess(newItem);
      } catch (e) {
        return serverError("user", "create", e);
      }
    }
);