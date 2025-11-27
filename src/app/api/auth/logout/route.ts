import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export async function POST() {
  try {
    await deleteSession(); // removes cookie

    return NextResponse.json({
      message: "Logged out successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Logout failed", detail: error.message },
      { status: 500 }
    );
  }
}