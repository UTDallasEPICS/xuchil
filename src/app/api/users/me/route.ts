import {verifySession} from "@/lib/session";
import {NextRequest, NextResponse} from "next/server";
import {notFoundError, serverError, updateSuccess, validationError} from "@/utils/responses";
import prisma from "@/lib/db";
import {Prisma} from "@prisma/client";
import bcrypt from "bcrypt";
import {UserRestrictedUpdateSchema} from "@/lib/schemas";

export async function GET() {
  try {
    const payload = (await verifySession())!;
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      omit: {passwordHash: true}
    })
    return NextResponse.json(user);
  } catch (error) {
    return serverError("current user", "fetch", error);
  }
}

export const PUT = async (req: NextRequest) => {
  try {
    const payload = (await verifySession())!;
    const body = await req.json();
    const res = UserRestrictedUpdateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("current user", "update", res.error);
    }
    const updatedItem = await prisma.user.update({
      where: {id: payload.userId},
      data: {
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        imgUrl: res.data.imgUrl,
        passwordHash: res.data.password && (await bcrypt.hash(res.data.password, 10)),
      },
      omit: {
        passwordHash: true,
      },
    });
    return updateSuccess(updatedItem);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return notFoundError("user");
    }
    return serverError("user", "update", e);
  }
}
