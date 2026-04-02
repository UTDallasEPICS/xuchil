import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";
import { serverError } from "@/utils/responses";

export async function POST() {
  try {
    await deleteSession(); // removes cookie
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError('user', 'logout', null)
  }
}