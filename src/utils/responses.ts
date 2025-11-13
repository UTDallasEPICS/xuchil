import {NextResponse} from "next/server";

export function checkId(name: string, id: string): [number, null] | [null, NextResponse] {
  const x = parseInt(id);
  if (isNaN(x)) {
    return [null, NextResponse.json({error: `${name} id is not an integer`}, {status: 400})];
  } else {
    return [x, null];
  }
}

export function notFoundError(name: string): NextResponse {
  return NextResponse.json({error: `${name} not found`}, {status: 404});
}