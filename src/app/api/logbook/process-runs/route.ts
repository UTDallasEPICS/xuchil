import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/db';
import {ProcessStatus} from '@prisma/client';

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const batchCode = searchParams.get('batchCode');
  const workerId = searchParams.get('workerId');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const productVariantId = searchParams.get('productVariantId');

  const where: any = {
    status: {
      in: [ProcessStatus.COMPLETED, ProcessStatus.CANCELLED]
    }
  };

  if (batchCode) {
    where.batchCode = batchCode;
  }

  if (workerId) {
    where.createdByWorkerId = workerId;
  }

  if (dateFrom || dateTo) {
    where.startedAt = {};
    if (dateFrom) {
      where.startedAt.gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setDate(endDate.getDate() + 1);
      where.startedAt.lt = endDate;
    }
  }

  if (productVariantId) {
    const productId = parseInt(productVariantId);
    if (!isNaN(productId)) {
      where.productVariantId = productId;
    }
  }

  try {
    const processRuns = await prisma.processRun.findMany({
      where: where,
      orderBy: {
        startedAt: 'desc'
      },
      include: {
        productVariant: {select: {name: true}},
        outputUnit: {select: {name: true}}
      }
    });
    return NextResponse.json(processRuns, {status: 200});
  } catch (e) {
    console.error('Error fetching Process Runs history.', e);
    return NextResponse.json({message: 'Interval Server Error'}, {status: 500});
  }
}