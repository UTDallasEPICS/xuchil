import {NextResponse} from "next/server";
import {z} from "zod";

export function idError(name: string): NextResponse {
  return NextResponse.json({error: `Invalid ${name} id: not an integer`}, {status: 400});
}

export function validationError(name: string, err: z.ZodError): NextResponse {
  return NextResponse.json({error: `Invalid ${name} body format`, details: z.flattenError(err)}, {status: 400})
}

export function notFoundError(name: string): NextResponse {
  return NextResponse.json({error: `${name} not found`}, {status: 404});
}

export function serverError(name: string, verb: string, error) {
  return NextResponse.json({error: `Failed to ${verb} ${name}`, details: error}, {status: 500});
}