import {NextRequest} from "next/server";
import {verifySession} from "@/lib/session";
import {forbiddenError} from "@/utils/responses";

export function qsToObject(sp: URLSearchParams) {
  const obj: Record<string, string> = {};
  sp.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
}

export function withAuthWorker(handler: any) {
  return async (req: NextRequest, ctx?: Record<string, unknown>) => {
    const payload = await verifySession();
    if (!payload || payload.isGuest) {
      return forbiddenError();
    }
    return await handler(req, ctx);
  }
}

export function withAuthAdmin(handler: any) {
  return async (req: NextRequest, ctx?: Record<string, unknown>) => {
    const payload = await verifySession();
    if (!payload || !payload.isAdmin) {
      return forbiddenError();
    }
    return await handler(req, ctx);
  }
}
