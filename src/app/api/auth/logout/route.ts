import { deleteSession } from "@/lib/session";
import {serverError} from "@/utils/responses";

export async function POST() {
  try {
    await deleteSession(); // removes cookie
  } catch (error) {
    return serverError('user', 'logout', null)
  }
}