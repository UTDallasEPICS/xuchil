import {NextResponse} from "next/server";
import prisma from "@/lib/db";
import {processTemplateSchema} from "@/lib/schemas";
import {idError, notFoundError, serverError, validationError} from "@/utils/responses";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const processTemplateId = parseInt((await context.params).id);
    if (isNaN(processTemplateId)) {
      return idError('process template');
    }
    const tpl = await prisma.processTemplate.findUnique({
      where: {id: processTemplateId},
      include: {templateSteps: {orderBy: {position: "asc"}}},
    });

    if (!tpl) {
      return notFoundError('process template');
    }
    return NextResponse.json(tpl);
  } catch (e) {
    return serverError('process template', 'fetch', e)
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const processTemplateId = parseInt((await context.params).id);
  if (isNaN(processTemplateId)) {
    return idError('process template');
  }
  const body = await req.json();
  const result = processTemplateSchema.safeParse(body);
  if (!result.success) {
    return validationError('process template', result.error)
  }

  try {
    const updated = await prisma.processTemplate.update({
      where: {id: processTemplateId},
      data: result.data
    });
    return NextResponse.json(updated);
  } catch (e) {
    return serverError('process template', 'update', e)
  }
}