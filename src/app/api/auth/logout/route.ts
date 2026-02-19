import { deleteSession } from "@/lib/session";
import {serverError} from "@/utils/responses";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    
    await deleteSession(); // removes cookie
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {

    return serverError('user', 'logout', null)
  }
}