import {NextRequest, NextResponse} from "next/server";
import path from "node:path";
import {writeFile} from "node:fs/promises";
import {createId} from "@paralleldrive/cuid2"

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const buffer = new Uint8Array(await file.arrayBuffer());
  const name = createId();
  const filePath = path.join('public', 'images', name);
  try {
    await writeFile(filePath, buffer);
    return NextResponse.json({data: {path: `/images/${name}`}}, {status: 200})
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to write file', details: error}
    }, {status: 500});
  }
}