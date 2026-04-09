import {deleteHandler, findByIdHandler, updateHandler, withAuthAdmin} from "@/utils/handlers";
import {UserCreateSchema} from "@/lib/schemas";

export const GET = withAuthAdmin(findByIdHandler("user", {omit: {passwordHash: true}}));
export const PUT = withAuthAdmin(updateHandler("user", UserCreateSchema, {omit: {passwordHash: true}}));
export const DELETE = withAuthAdmin(deleteHandler("user"));