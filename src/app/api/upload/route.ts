import {NextRequest, NextResponse} from "next/server";
import path from "node:path";
import {writeFile} from "node:fs/promises";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const file = formData.get("file") as File;
  const buffer = new Uint8Array(await file.arrayBuffer());
  const filePath = path.join('public', 'uploads', name);
  try {
    await writeFile(filePath, buffer);
    return NextResponse.json({data: {path: `/uploads/${name}`}}, {status: 204})
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to write file', details: error}
    }, {status: 500});
  }
}