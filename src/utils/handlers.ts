import prisma from "@/lib/db";
import {Prisma} from "@prisma/client";
import {NextRequest} from "next/server";
import {z} from "zod";
import {
  createSuccess, deleteSuccess,
  fetchSuccess,
  idError,
  notFoundError,
  serverError,
  updateSuccess,
  validationError
} from "@/utils/responses";
import {verifySession} from "@/lib/session";

function qsToObject(sp: URLSearchParams) {
  const obj: Record<string, string> = {};
  sp.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
}

export function findByIdHandler(name: keyof typeof prisma & string, prismaOpts = {}) {
  return async (req: NextRequest, {params}: { params: Promise<{ id: string }> }) => {
    try {
      const {id} = await params;
      const idParsed = parseInt(id);
      if (Number.isNaN(idParsed)) {
        return idError(name);
      }
      const item = await prisma[name].findUnique({
        where: {id: idParsed},
        ...prismaOpts
      });
      if (!item) {
        return notFoundError(name)
      }
      return fetchSuccess(item);
    } catch (e) {
      return serverError(name, "fetch", e);
    }
  }
}

export function findAllHandler(name: keyof typeof prisma & string, filterSchema: z.ZodObject<z.ZodRawShape> | null = null, prismaOpts = {}) {
  return async (req: NextRequest) => {
    try {
      const paginatedFilterSchema = z.strictObject({
        ...(filterSchema?.shape),
        offset: z.coerce.number().int().optional(),
        limit: z.coerce.number().int().optional(),
      })
      const res = paginatedFilterSchema.safeParse(qsToObject(req.nextUrl.searchParams));
      if (!res.success) {
        return validationError(name, "fetch", res.error);
      }
      const filter = res.data;
      const limit = filter.limit;
      const offset = filter.offset;
      delete filter.limit;
      delete filter.offset;

      const items = await prisma[name].findMany({
        where: filter,
        skip: offset,
        take: limit,
        ...prismaOpts
      });
      return fetchSuccess(items);
    } catch (e) {
      return serverError(name, "fetch", e);
    }
  }
}

export function createHandler(name: keyof typeof prisma & string, createSchema: z.ZodObject<z.ZodRawShape>, prismaOpts = {}) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const res = createSchema.safeParse(body);
      if (!res.success) {
        return validationError(name, "create", res.error);
      }
      const newItem = await prisma[name].create({
        data: res.data,
        ...prismaOpts
      });
      return createSuccess(newItem);
    } catch (e) {
      return serverError(name, "create", e);
    }
  }
}

export function updateHandler(name: keyof typeof prisma & string, updateSchema: z.ZodObject<z.ZodRawShape>, prismaOpts = {}) {
  return async (req: NextRequest, {params}: { params: Promise<{ id: string }> }) => {
    try {
      const {id} = await params;
      const idParsed = parseInt(id);
      if (Number.isNaN(idParsed)) {
        return idError(name);
      }
      const body = await req.json();
      const res = updateSchema.partial().safeParse(body);
      if (!res.success) {
        return validationError(name, "update", res.error);
      }
      const updatedItem = await prisma[name].update({
        where: {id: idParsed},
        data: res.data,
        ...prismaOpts
      });
      return updateSuccess(updatedItem);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return notFoundError(name);
      }
      return serverError(name, "update", e);
    }
  }
}

export function deleteHandler(name: keyof typeof prisma & string) {
  return async (req: NextRequest, {params}: { params: Promise<{ id: string }> }) => {
    try {
      const {id} = await params;
      const idParsed = parseInt(id);
      if (Number.isNaN(idParsed)) {
        return idError(name);
      }
      await prisma[name].delete({
        where: {id: idParsed}
      });
      return deleteSuccess();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return notFoundError(name);
      }
      return serverError(name, "delete", e);
    }
  }
}

export function withAuthWorker(handler) {
  return async (req: NextRequest, ctx?: Record<string, unknown>) => {
    const payload = await verifySession();
    if (!payload || payload.isGuest) {
      return new Response(null, {status: 401});
    }
    return await handler(req, ctx);
  }
}

export function withAuthAdmin(handler) {
  return async (req: NextRequest, ctx?: Record<string, unknown>) => {
    const payload = await verifySession();
    if (!payload || !payload.isAdmin) {
      return new Response(null, {status: 401});
    }
    return await handler(req, ctx);
  }
}
