import {NextResponse} from "next/server";
import {z} from "zod";

export function fetchSuccess(data: unknown): NextResponse {
  return NextResponse.json(data, {status: 200});
}

export function createSuccess(data: unknown): NextResponse {
  return NextResponse.json(data, {status: 201});
}

export function updateSuccess(data: unknown): NextResponse {
  return NextResponse.json(data, {status: 200});
}

export function deleteSuccess(): NextResponse {
  return new NextResponse(null, {status: 204});
}

export function idError(name: string): NextResponse {
  return NextResponse.json({error: `Invalid ${name} id: not an integer`}, {status: 400});
}

export function validationError(name: string, verb: string, err: z.ZodError): NextResponse {
  return NextResponse.json({error: `Invalid ${name} format for ${verb}`, details: z.flattenError(err)}, {status: 400})
}

export function notFoundError(name: string): NextResponse {
  return NextResponse.json({error: `Could not find ${name}`}, {status: 404});
}

export function serverError(name: string, verb: string, error: unknown) {
  return NextResponse.json({error: `Failed to ${verb} ${name}`, details: error}, {status: 500});
}

export function forbiddenError(): NextResponse {
  return new NextResponse(null, {status:403})
}