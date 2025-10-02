import {NextRequest} from "next/server";

export async function PUT(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
}

export async function DELETE(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
}
