import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/db";
import {inventoryMovementSchema} from "@/lib/schemas";
import {serverError, validationError} from "@/utils/responses";
import {verifySession} from "@/lib/session";

const RESOURCE_NAME = 'adjustment';
const OPERATION_CREATE = 'create';
const UNAUTHORIZED_STATUS = 403;
const CREATED_STATUS = 201;

export async function POST(request: NextRequest) {
  // Dependencia: La validación de sesión debe ocurrir antes de cualquier operación de base de datos
  const sessionPayload = await verifySession();
  if (!sessionPayload?.isAdmin) {
    return new NextResponse(null, { status: UNAUTHORIZED_STATUS });
  }

  // Dependencia: El análisis del cuerpo de la solicitud debe ocurrir antes de la validación del esquema
  let body: unknown;
  try {
    body = await request.json();
  } catch (parseError: unknown) {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  // Dependencia: La validación del esquema debe tener éxito antes de intentar la creación en la base de datos
  const validationResult = inventoryMovementSchema.safeParse(body);
  if (!validationResult.success) {
    return validationError(RESOURCE_NAME, validationResult.error);
  }

  // Dependencia: La operación de base de datos depende de la autorización de sesión exitosa y la validación de datos
  try {
    const adjustment = await prisma.inventoryMovement.create({
      data: validationResult.data
    });
    return NextResponse.json(adjustment, { status: CREATED_STATUS });
  } catch (error: unknown) {
    return serverError(RESOURCE_NAME, OPERATION_CREATE, error);
  }
}

