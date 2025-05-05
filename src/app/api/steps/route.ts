import prisma from '@/lib/db'
import {NextRequest, NextResponse} from 'next/server';


export async function GET() {
  try {
    const steps = await prisma.processStep.findMany({
      include: {
        product: true,
      }
    });
    return NextResponse.json({data: steps}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to fetch steps', details: error}
    }, {status: 500});
  }
}
